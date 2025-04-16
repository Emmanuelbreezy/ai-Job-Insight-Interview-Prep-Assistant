import { ConvexError, v } from "convex/values";
import { internalAction, mutation, query } from "./_generated/server";
import { JobInsightStatus, Role } from "@/lib/constant";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { getJobInsightConversationPrompt } from "@/lib/prompt";
import { chatSession } from "@/lib/gemini-ai";
import { CREDIT_COST } from "@/lib/api-limit";

export const create = mutation({
  args: {
    userId: v.string(),
    jobId: v.id("jobs"),
    text: v.string(),
    role: v.union(v.literal(Role.USER), v.literal(Role.AI)),
    status: v.optional(
      v.union(
        v.literal(JobInsightStatus.PENDING),
        v.literal(JobInsightStatus.COMPLETED),
        v.literal(JobInsightStatus.FAILED)
      )
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("jobInsightConversations", {
      userId: args.userId,
      jobId: args.jobId,
      text: args.text,
      role: args.role,
      status: args.status || JobInsightStatus.COMPLETED,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getByJobId = query({
  args: {
    jobId: v.string(),
  },
  handler: async (ctx, { jobId }) => {
    if (!jobId) {
      return {
        data: null,
        success: false,
        message: "jobId is required",
      };
    }
    try {
      const jobConversions = await ctx.db
        .query("jobInsightConversations")
        .withIndex("by_job", (q) => q.eq("jobId", jobId as Id<"jobs">))
        .collect();
      if (!jobConversions) return { data: null, success: false };
      return { data: jobConversions, success: true };
    } catch (error) {
      console.error("Error fetching messages:");
      return { data: null, success: false };
    }
  },
});

export const update = mutation({
  args: {
    id: v.id("jobInsightConversations"),
    text: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal(JobInsightStatus.PENDING),
        v.literal(JobInsightStatus.COMPLETED),
        v.literal(JobInsightStatus.FAILED)
      )
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const getMessagesByJobId = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    if (!args.id) {
      return {
        data: null,
        success: false,
        message: "jobId is required",
      };
    }
    const messages = await ctx.db
      .query("jobInsightConversations")
      .withIndex("by_job", (q) => q.eq("jobId", args.id as Id<"jobs">))
      .collect();

    return { data: messages, success: true };
  },
});

export const sendUserMessage = mutation({
  args: {
    jobId: v.string(),
    userId: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const apiLimits = await ctx.db
      .query("apiLimits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!apiLimits || apiLimits.credits < CREDIT_COST.JOB_CHAT_MESSAGE) {
      throw new ConvexError({
        type: "INSUFFICIENT_CREDITS",
        message: "You have run out of credits",
        required: CREDIT_COST.JOB_CHAT_MESSAGE,
        available: apiLimits?.credits ?? 0,
      });
    }

    const job = await ctx.db.get(args.jobId as Id<"jobs">);
    if (!job) throw new ConvexError("Job not found");
    const conversationId = await ctx.db.insert("jobInsightConversations", {
      userId: args.userId,
      jobId: args.jobId as Id<"jobs">,
      text: args.message,
      role: Role.USER,
      status: JobInsightStatus.COMPLETED,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    // Schedule AI response after 1 second
    await ctx.scheduler.runAfter(
      0,
      internal.jobInsightConversation.generateAIJobInsightResponse,
      {
        conversationId,
        jobId: args.jobId as Id<"jobs">,
        userId: args.userId,
        userMessage: args.message,
        job: job,
      }
    );
    return conversationId;
  },
});

export const generateAIJobInsightResponse = internalAction({
  args: {
    conversationId: v.id("jobInsightConversations"),
    jobId: v.id("jobs"),
    userId: v.string(),
    userMessage: v.string(),
    job: v.any(),
  },
  handler: async (ctx, args) => {
    const jobData = {
      jobTitle: args.job.jobTitle,
      processedDescription: args.job.processedDescription,
    };

    const [history, responseId] = await Promise.all([
      ctx.runMutation(api.jobInsightConversation.getConversationHistory, {
        jobId: args.jobId,
        limit: 6,
      }),
      ctx.runMutation(api.jobInsightConversation.create, {
        userId: args.userId,
        jobId: args.jobId,
        text: "...",
        role: Role.AI,
        status: JobInsightStatus.PENDING,
      }),
    ]);
    const prompt = getJobInsightConversationPrompt(
      jobData.jobTitle || "",
      jobData.processedDescription || "",
      args.userMessage,
      history.map((item) => ({
        content: item.text,
        role: item.role === Role.USER ? "user" : "model",
        timestamp: new Date(item.createdAt).toISOString(),
      }))
    );

    const stream = await chatSession.sendMessageStream({ message: prompt });
    let fullResponse = "";
    let lastUpdateTime = Date.now();
    for await (const chunk of stream) {
      fullResponse += chunk.text;

      // Only update every 500ms or when there's a sentence break
      const currentTime = Date.now();
      if (currentTime - lastUpdateTime > 5 || chunk?.text?.includes(".")) {
        await ctx.runMutation(api.jobInsightConversation.update, {
          id: responseId,
          text: fullResponse + " ...",
        });
        lastUpdateTime = currentTime;
      }
    }
    await ctx.runMutation(api.jobInsightConversation.update, {
      id: responseId,
      text: fullResponse,
      status: JobInsightStatus.COMPLETED,
    });

    await ctx.runMutation(api.apiLimits.deductCredit, {
      userId: args.userId,
      amount: CREDIT_COST.JOB_CHAT_MESSAGE,
    });
    return;
  },
});

export const getJob = query({
  args: {
    jobId: v.id("jobs"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.jobId);
  },
});

export const getConversationHistory = mutation({
  args: {
    jobId: v.id("jobs"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const query = ctx.db
      .query("jobInsightConversations")
      .filter((q) => q.eq(q.field("jobId"), args.jobId))
      .order("desc");

    if (args.limit) {
      return await query.take(args.limit);
    }
    return await query.collect();
  },
});
