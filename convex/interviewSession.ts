import {
  InterviewStatus,
  MessageType,
  QuestionType,
  Role,
} from "@/lib/constant";
import { internalAction, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

export const createInterviewSession = mutation({
  args: {
    userId: v.string(),
    jobId: v.id("jobs"),
  },
  handler: async (ctx, args) => {
    const sessionId = await ctx.db.insert("interviewSessions", {
      userId: args.userId,
      jobId: args.jobId,
      status: InterviewStatus.STARTED,
      currentQuestionIndex: 0,
      totalQuestions: 10,
      startedAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return sessionId;
  },
});

export const createMessage = mutation({
  args: {
    sessionId: v.id("interviewSessions"),
    text: v.string(),
    role: v.union(v.literal(Role.USER), v.literal(Role.AI)),
    type: v.union(
      v.literal(MessageType.QUESTION),
      v.literal(MessageType.ANSWER)
    ),
    questionType: v.optional(
      v.union(
        v.literal(QuestionType.TEXT),
        v.literal(QuestionType.CODE),
        v.literal(QuestionType.MULTIPLE_CHOICE),
        v.literal(QuestionType.ORAL),
        v.literal(QuestionType.SCENARIO),
        v.null()
      )
    ),
    questionNumber: v.optional(v.number()),
    questionId: v.optional(v.id("interviewMessages")),
    timeLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("interviewMessages", {
      sessionId: args.sessionId,
      text: args.text,
      role: args.role,
      type: args.type,
      questionType: args.questionType,
      questionNumber: args.questionNumber,
      questionId: args.questionId,
      timeLimit: args.timeLimit,
      createdAt: Date.now(),
    });
    return messageId;
  },
});

export const askQuestion = internalAction({
  args: {
    sessionId: v.id("interviewSessions"),
    questionNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.runMutation(
      api.interviewSession.createMessage,
      {
        sessionId: args.sessionId,
        text: "",
        role: Role.AI,
        type: MessageType.QUESTION,
        questionType: null,
        questionNumber: args.questionNumber,
        timeLimit: 0,
      }
    );
  },
});

export const answerQuestion = mutation({
  args: {
    sessionId: v.id("interviewSessions"),
    questionId: v.id("interviewMessages"),
    answerText: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");
    // Increment the question number
    const nextQuestionNumber = session.currentQuestionIndex + 1;
    // Group database operations into a single Promise.all
    const [messageId] = await Promise.all([
      // Insert the user's answer
      ctx.db.insert("interviewMessages", {
        sessionId: args.sessionId,
        text: args.answerText,
        role: Role.USER,
        type: MessageType.ANSWER,
        questionId: args.questionId,
        createdAt: Date.now(),
      }),
      // Update the session with the new question index
      ctx.db.patch(args.sessionId, {
        currentQuestionIndex: nextQuestionNumber,
        updatedAt: Date.now(),
      }),
    ]);

    if (nextQuestionNumber < session.totalQuestions) {
      await ctx.scheduler.runAfter(0, internal.interviewSession.askQuestion, {
        sessionId: args.sessionId,
        questionNumber: nextQuestionNumber + 1,
      });
    } else {
      await ctx.db.patch(args.sessionId, {
        status: InterviewStatus.COMPLETED,
        completedAt: Date.now(),
      });
    }
    return messageId;
  },
});
