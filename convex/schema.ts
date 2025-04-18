import {
  InterviewStatus,
  JobInsightStatus,
  JobStatus,
  MessageStatusType,
  PaymentStatus,
  QuestionType,
  Role,
} from "@/lib/constant";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  jobs: defineTable({
    userId: v.string(), // Clerk user ID
    originalDescription: v.string(), // Raw job description from user
    jobTitle: v.optional(v.string()),
    processedDescription: v.optional(v.string()),
    htmlFormatDescription: v.optional(v.string()),
    status: v.union(
      v.literal(JobStatus.PROCESSING),
      v.literal(JobStatus.READY),
      v.literal(JobStatus.FAILED)
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  jobInsightConversations: defineTable({
    userId: v.string(),
    jobId: v.id("jobs"),
    text: v.string(),
    role: v.union(v.literal(Role.USER), v.literal(Role.AI)),
    status: v.union(
      v.literal(JobInsightStatus.PENDING),
      v.literal(JobInsightStatus.COMPLETED),
      v.literal(JobInsightStatus.FAILED)
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_job", ["jobId"])
    .index("by_user", ["userId"]),

  interviewSessions: defineTable({
    userId: v.string(),
    jobId: v.id("jobs"),
    status: v.union(
      v.literal(InterviewStatus.STARTED),
      v.literal(InterviewStatus.COMPLETED)
    ),
    currentQuestionIndex: v.number(),
    totalQuestions: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_job", ["jobId"]),

  interviewMessages: defineTable({
    sessionId: v.id("interviewSessions"),
    text: v.string(),
    role: v.union(v.literal(Role.USER), v.literal(Role.AI)),
    type: v.union(
      v.literal(MessageStatusType.QUESTION),
      v.literal(MessageStatusType.ANSWER),
      v.literal(MessageStatusType.SYSTEM)
    ),
    questionType: v.optional(
      v.union(
        v.literal(QuestionType.ORAL),
        v.literal(QuestionType.TECHNICAL),
        v.literal(QuestionType.SCENARIO),
        v.null()
      )
    ),
    questionNumber: v.optional(v.number()),
    questionId: v.optional(v.id("interviewMessages")),
    timeLimit: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_question_number", ["sessionId", "questionNumber"])
    .index("by_question_id", ["questionId"]),

  interviewFeedback: defineTable({
    sessionId: v.id("interviewSessions"),
    questionId: v.id("interviewMessages"),
    score: v.number(),
    grade: v.string(),
    improvements: v.array(v.string()),
    feedback: v.string(),
    createdAt: v.number(),
  }).index("by_session", ["sessionId"]),

  apiLimits: defineTable({
    userId: v.string(),
    credits: v.number(), // Remaining credits
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  payments: defineTable({
    userId: v.string(),
    paypalOrderId: v.optional(v.string()),
    transactionId: v.optional(v.string()),
    amount: v.number(),
    credits: v.number(),
    status: v.union(
      v.literal(PaymentStatus.PENDING),
      v.literal(PaymentStatus.COMPLETED),
      v.literal(PaymentStatus.FAILED)
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
});
