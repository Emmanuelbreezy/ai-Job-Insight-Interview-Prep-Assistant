import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { JobInsightStatus, Role } from "@/lib/constant";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

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

export const sendUserMessage = mutation({
  args: {
    jobId: v.id("jobs"),
    userId: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new ConvexError("Job not found");

    const conversationId = await ctx.db.insert("jobInsightConversations", {
      userId: args.userId,
      jobId: args.jobId,
      text: args.message,
      role: Role.USER,
      status: JobInsightStatus.COMPLETED,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Schedule AI response after 1 second
    await ctx.scheduler.runAfter(
      0,
      internal.actions.generateAIJobInsightResponse,
      {
        conversationId,
        jobId: args.jobId,
        userId: args.userId,
        userMessage: args.message,
        job: job,
      }
    );

    return conversationId;
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
