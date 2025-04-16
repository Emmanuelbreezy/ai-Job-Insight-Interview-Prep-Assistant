import {
  InterviewStatus,
  JobInsightStatus,
  JobStatus,
  MessageStatusType,
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

  //   userId: v.string(), // Clerk user ID
  //   jobTitle: v.optional(v.string()),
  //   jobDescription: v.string(),
  //   processedJobDescription: v.optional(v.string()),
  //   status: v.union(
  //     v.literal(InterviewStatus.PROCESSING),
  //     v.literal(InterviewStatus.READY),
  //     v.literal(InterviewStatus.FAILED),
  //     v.literal(InterviewStatus.COMPLETED)
  //   ),
  //   createdAt: v.number(),
  //   updatedAt: v.number(),
  // })
  //   .index("by_user", ["userId"])
  //   .index("by_status", ["status"]),
  // messages: defineTable({
  //   userId: v.string(),
  //   interviewId: v.id("interview"),
  //   text: v.string(),
  //   role: v.union(v.literal(Role.USER), v.literal(Role.AI)),
  //   // questionType: v.optional(
  //   //   v.union(
  //   //     v.literal(QuestionType.TEXT),
  //   //     v.literal(QuestionType.CODE),
  //   //     v.literal(QuestionType.MULTIPLE_CHOICE),
  //   //     v.literal(QuestionType.ORAL),
  //   //     v.literal(QuestionType.SCENARIO),
  //   //     v.null()
  //   //   )
  //   // ),
  //   questionNumber: v.optional(v.number()),
  //   messageType: v.union(
  //     v.literal(MessageType.CHAT),
  //     v.literal(MessageType.SYSTEM),
  //     v.literal(MessageType.QUESTION),
  //     v.literal(MessageType.ANSWER)
  //   ),
  //   timeLimit: v.optional(v.string()),
  //   metadata: v.optional(v.any()),
  //   createdAt: v.number(),
  // }).index("by_interview", ["interviewId"]),

  // apiLimits: defineTable({
  //   userId: v.string(),
  //   plan: v.union(v.literal("FREE"), v.literal("PRO")),
  //   jobCount: v.number(),
  //   messageCount: v.number(),
  //   createdAt: v.number(),
  //   updatedAt: v.number(),
  // }).index("by_user", ["userId"]),
  apiLimits: defineTable({
    userId: v.string(),
    plan: v.union(v.literal("FREE"), v.literal("PRO")),
    credits: v.number(), // Remaining credits
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
});
