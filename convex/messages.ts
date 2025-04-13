import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { MessageType, QuestionType, Role } from "@/lib/constant";

export const createMessage = mutation({
  args: {
    userId: v.string(),
    interviewId: v.id("interview"),
    text: v.string(),
    role: v.union(v.literal("USER"), v.literal("AI")),
    messageType: v.union(
      v.literal(MessageType.CHAT),
      v.literal(MessageType.QUESTION),
      v.literal(MessageType.ANSWER),
      v.literal(MessageType.SYSTEM)
    ),
    questionType: v.optional(
      v.union(
        v.literal(QuestionType.TEXT),
        v.literal(QuestionType.CODE),
        v.literal(QuestionType.MULTIPLE_CHOICE),
        v.literal(QuestionType.ORAL),
        v.literal(QuestionType.SCENARIO)
      )
    ),
    questionNumber: v.optional(v.number()),
    timeLimit: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const interview = await ctx.db.get(args.interviewId);
    if (!interview) return null;
    return await ctx.db.insert("messages", {
      userId: args.userId,
      interviewId: args.interviewId,
      text: args.text,
      role: args.role,
      messageType: args.messageType,
      questionType: args.questionType,
      questionNumber: args.questionNumber,
      timeLimit: args.timeLimit,
      metadata: args.metadata,
      createdAt: Date.now(),
    });
  },
});

export const updateMessage = mutation({
  args: {
    messageId: v.id("messages"),
    text: v.string(),
  },
  handler: async (ctx, { messageId, text }) => {
    await ctx.db.patch(messageId, { text });
  },
});

export const getMessagesByinterviewId = query({
  args: {
    interviewId: v.string(),
  },
  handler: async (ctx, { interviewId }) => {
    if (!interviewId) {
      return { data: null, success: false, message: "interviewId is required" };
    }
    try {
      const file = await ctx.db.get(interviewId as Id<"interview">);
      if (!file) return { data: null, success: false };
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_interview", (q) =>
          q.eq("interviewId", interviewId as Id<"interview">)
        )
        .order("asc")
        .collect();

      return { data: messages, success: true };
    } catch (error) {
      console.error("Error fetching messages:", error);
      return { data: null, success: false };
    }
  },
});

// export const getAIMessageResponse = action({
//   args: {
//     prompt: v.string(),
//     userId: v.string(),
//     interviewId: v.id("interview"),
//   },
//   handler: async (ctx, { prompt, userId, interviewId }) => {
//     try {
//       const result = await chatSession.sendMessage({ message: prompt });
//       const aiResponse = result.text;
//       if (!aiResponse) return "";
//       // Create a message in the database
//       await ctx.runMutation(api.messages.createMessage, {
//         userId,
//         interviewId,
//         text: aiResponse,
//         role: Role.AI,
//         messageType: MessageType.SYSTEM,
//       });
//       return aiResponse;
//     } catch (error) {
//       console.error("Chat error:", error);
//       throw new Error("Failed to generate chat response");
//     }
//   },
// });
