import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { InterviewStatus, MessageType, Role } from "@/lib/constant";
import { internal } from "./_generated/api";

export const createInterview = mutation({
  args: {
    userId: v.string(),
    jobDescription: v.string(),
  },
  handler: async (ctx, args) => {
    const interviewId = await ctx.db.insert("interview", {
      userId: args.userId,
      jobTitle: "Untitled",
      jobDescription: args.jobDescription,
      status: InterviewStatus.PROCESSING,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    // Call internal function to process with AI
    await ctx.scheduler.runAfter(0, internal.actions.processWithAI, {
      interviewId,
      userId: args.userId,
      jobDescription: args.jobDescription,
    });

    return interviewId;
  },
});

export const updateInterview = mutation({
  args: {
    interviewId: v.id("interview"),
    jobTitle: v.optional(v.string()),
    processedJobDescription: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal(InterviewStatus.PROCESSING),
        v.literal(InterviewStatus.READY),
        v.literal(InterviewStatus.FAILED),
        v.literal(InterviewStatus.COMPLETED)
      )
    ),
  },
  handler: async (ctx, args) => {
    const { interviewId, ...rest } = args;
    await ctx.db.patch(interviewId, {
      ...rest,
      updatedAt: Date.now(),
    });
  },
});

export const getInterviewsByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("interview")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const sendAnswer = mutation({
  args: {
    interviewId: v.id("interview"),
    userId: v.string(),
    answer: v.string(),
  },
  handler: async (ctx, args) => {
    const { interviewId, userId, answer } = args;

    // 1. Save user's answer
    await ctx.db.insert("messages", {
      interviewId,
      userId,
      text: answer,
      role: Role.USER, // Use Role enum
      messageType: MessageType.ANSWER, // Use MessageType enum
      createdAt: Date.now(),
    });

    // 2. Get context for next question
    const interview = await ctx.db.get(interviewId);
    if (!interview) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Interview not found",
      });
    }

    const lastQuestion = await ctx.db
      .query("messages")
      .withIndex("by_interview", (q) => q.eq("interviewId", interviewId))
      .filter((q) => q.eq(q.field("messageType"), MessageType.QUESTION))
      .order("desc")
      .first();

    if (lastQuestion?.questionNumber! < 10) {
      // 3. Generate next question
      await ctx.scheduler.runAfter(100, internal.actions.askQuestion, {
        interviewId,
        userId,
        processedDescription: interview.processedJobDescription || "",
        lastQuestion: lastQuestion?.text,
        questionNumber: lastQuestion?.questionNumber! + 1,
      });
    } else {
      await ctx.db.insert("messages", {
        interviewId,
        userId,
        text: "That concludes our 10 questions! Would you like feedback?",
        role: Role.AI,
        messageType: MessageType.SYSTEM,
        createdAt: Date.now(),
      });
      await ctx.db.patch(args.interviewId, {
        status: InterviewStatus.COMPLETED,
      });
    }
  },
});
