import {
  InterviewStatus,
  MessageStatusType,
  QuestionType,
  Role,
} from "@/lib/constant";
import { internalAction, mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { api, internal } from "./_generated/api";
import { chatSession, genAI } from "@/lib/gemini-ai";
import {
  getInterviewFeedbackPrompt,
  getInterviewQuestionPrompt,
} from "@/lib/prompt";
import { Id } from "./_generated/dataModel";
import { CREDIT_COST } from "@/lib/api-limit";

export const createInterviewSession = mutation({
  args: {
    userId: v.string(),
    jobId: v.string(),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId as Id<"jobs">);
    if (!job) throw new ConvexError({ message: "Job not found" });
    const apiLimits = await ctx.db
      .query("apiLimits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (
      !apiLimits ||
      apiLimits.credits < CREDIT_COST.INTERVIEW_SESSION_CREATION
    ) {
      throw new ConvexError({
        type: "INSUFFICIENT_CREDITS",
        message: "You have run out of credits",
        required: CREDIT_COST.INTERVIEW_SESSION_CREATION,
        available: apiLimits?.credits ?? 0,
      });
    }

    await ctx.runMutation(api.apiLimits.deductCredit, {
      userId: args.userId,
      amount: CREDIT_COST.INTERVIEW_SESSION_CREATION,
    });

    const sessionId = await ctx.db.insert("interviewSessions", {
      userId: args.userId,
      jobId: job._id,
      status: InterviewStatus.STARTED,
      currentQuestionIndex: 0,
      totalQuestions: 10,
      startedAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Schedule AI response after 1 second
    await ctx.scheduler.runAfter(0, internal.interviewSession.askQuestion, {
      userId: args.userId,
      sessionId,
      processedDescription: job.processedDescription || "",
      questionNumber: 1,
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

export const insertFeedback = mutation({
  args: {
    sessionId: v.id("interviewSessions"),
    questionId: v.id("interviewMessages"),
    score: v.number(),
    grade: v.string(),
    improvements: v.array(v.string()),
    feedback: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("interviewFeedback", {
      sessionId: args.sessionId,
      questionId: args.questionId,
      score: args.score,
      grade: args.grade,
      improvements: args.improvements,
      feedback: args.feedback,
      createdAt: Date.now(),
    });
  },
});

export const askQuestion = internalAction({
  args: {
    userId: v.string(),
    sessionId: v.id("interviewSessions"),
    processedDescription: v.string(),
    questionNumber: v.number(),
  },
  handler: async (ctx, { sessionId, questionNumber, processedDescription }) => {
    const lastQuestion = await ctx.runQuery(
      api.interviewSession.getLastAIQuestion,
      { sessionId }
    );
    const prompt = getInterviewQuestionPrompt(
      processedDescription,
      lastQuestion
    );
    // Send the prompt to the AI and get the response
    const result = await chatSession.sendMessage({
      message: prompt,
      config: { responseMimeType: "application/json" },
    });
    // Validate the AI response
    const aiResponse = result.text;
    if (typeof aiResponse !== "string" || aiResponse.trim() === "") {
      throw new ConvexError({ message: "AI response is invalid or empty" });
    }
    // Parse the AI's response (JSON string) into an object
    let questionData;
    try {
      questionData = JSON.parse(aiResponse);
    } catch (error) {
      throw new ConvexError({ message: "Failed to parse AI response as JSON" });
    }
    // Extract fields from the parsed JSON
    const { question, type, timeLimit } = questionData;
    await ctx.runMutation(api.interviewSession.createMessage, {
      sessionId,
      text: question,
      role: Role.AI,
      type: MessageStatusType.QUESTION,
      questionType: type,
      questionNumber,
      timeLimit: parseInt(timeLimit) || 2,
    });
  },
});

export const answerQuestion = mutation({
  args: {
    sessionId: v.string(),
    questionId: v.string(),
    answerText: v.string(),
  },
  handler: async (ctx, args) => {
    // Fetch the session
    const sessionId = args.sessionId as Id<"interviewSessions">;
    const questionId = args.questionId as Id<"interviewMessages">;
    const session = await ctx.db.get(sessionId);
    if (!session) throw new ConvexError({ message: "Session not found" });

    if (session.status === InterviewStatus.COMPLETED) {
      throw new ConvexError({
        message:
          "The interview session is already completed. You cannot send further answers.",
      });
    }

    const job = await ctx.db.get(session.jobId);
    if (!job) throw new ConvexError({ message: "Job not found" });
    const nextQuestionNumber = session.currentQuestionIndex + 1;
    // Insert the user's answer and update the session in parallel
    const [messageId] = await Promise.all([
      ctx.db.insert("interviewMessages", {
        sessionId,
        text: args.answerText,
        role: Role.USER,
        type: MessageStatusType.ANSWER,
        questionId,
        createdAt: Date.now(),
      }),
      ctx.db.patch(sessionId, {
        currentQuestionIndex: nextQuestionNumber,
        updatedAt: Date.now(),
      }),
    ]);
    // Check if the interview is completed
    if (nextQuestionNumber >= 5) {
      await Promise.all([
        ctx.db.patch(sessionId, {
          status: InterviewStatus.COMPLETED,
          completedAt: Date.now(),
        }),
        ctx.db.insert("interviewMessages", {
          sessionId,
          text: `🎉 The interview has been completed! 🎉 Generating feedback... 📝`,
          role: Role.AI,
          type: MessageStatusType.SYSTEM,
          createdAt: Date.now(),
        }),
        ctx.scheduler.runAfter(
          0,
          api.interviewSession.generateInterviewFeedback,
          {
            sessionId,
            userId: session.userId,
          }
        ),
      ]);
    } else {
      // Schedule the next question
      await ctx.scheduler.runAfter(0, internal.interviewSession.askQuestion, {
        userId: session.userId,
        sessionId,
        processedDescription: job.processedDescription || "",
        questionNumber: nextQuestionNumber + 1,
      });
    }

    return messageId;
  },
});

export const getLastAIQuestion = query({
  args: {
    sessionId: v.id("interviewSessions"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("interviewMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .filter((q) =>
        q.and(
          q.eq(q.field("role"), Role.AI),
          q.eq(q.field("type"), MessageStatusType.QUESTION)
        )
      )
      .order("desc")
      .first();
    return messages?.text || "";
  },
});

export const getMessagesBySessionId = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    if (!args.id)
      return { data: null, success: false, message: "sessionId is required" };

    const session = await ctx.db.get(args.id as Id<"interviewSessions">);
    if (!session)
      return { data: null, success: false, message: "Session not found" };

    const messages = await ctx.db
      .query("interviewMessages")
      .withIndex("by_session", (q) =>
        q.eq("sessionId", args.id as Id<"interviewSessions">)
      )
      .collect();

    return {
      data: messages,
      session: session,
      success: true,
    };
  },
});

export const getInterviewSessionsByJobId = query({
  args: { jobId: v.string() },
  handler: async (ctx, args) => {
    if (!args.jobId) throw new ConvexError({ message: "JobId not found" });
    // Fetch all sessions for the given jobId
    const sessions = await ctx.db
      .query("interviewSessions")
      .withIndex("by_job", (q) => q.eq("jobId", args.jobId as Id<"jobs">))
      .order("desc")
      .collect();

    // For each session, fetch and group messages
    const sessionsWithMessages = await Promise.all(
      sessions.map(async (session) => {
        const messages = await ctx.db
          .query("interviewMessages")
          .withIndex("by_session", (q) => q.eq("sessionId", session._id))
          .order("asc")
          .collect();
        // Group questions and answers using questionId
        const groupedMessages = messages?.reduce(
          (acc, message) => {
            if (message.type === MessageStatusType.QUESTION) {
              acc.push({ question: message, answer: null });
            } else if (
              message.type === MessageStatusType.ANSWER &&
              message.questionId
            ) {
              const question = acc.find(
                (group) => group.question._id === message.questionId
              );
              if (question) question.answer = message;
            }
            return acc;
          },
          [] as { question: any; answer: any | null }[]
        );

        return { ...session, messages: groupedMessages };
      })
    );

    return { data: sessionsWithMessages, success: true };
  },
});

export const generateInterviewFeedback = mutation({
  args: { sessionId: v.id("interviewSessions"), userId: v.string() },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("interviewMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();
    const questions = messages.filter(
      (msg) => msg.type === MessageStatusType.QUESTION
    );
    const answers = messages.filter(
      (msg) => msg.type === MessageStatusType.ANSWER
    );
    // Prepare the questions and answers for the prompt
    const questionsAndAnswers = questions.map((question) => {
      const answer = answers.find((ans) => ans.questionId === question._id);
      return {
        question: question.text,
        answer: answer?.text || "No answer provided",
        questionType: question.questionType,
        questionNumber: question.questionNumber,
        questionId: question._id,
      };
    });
    console.log(questionsAndAnswers, "questionsAndAnswers");

    await ctx.scheduler.runAfter(
      0,
      internal.interviewSession.generateAIFeedback,
      {
        sessionId: args.sessionId,
        userId: args.userId,
        questionsAndAnswers,
      }
    );
  },
});

export const generateAIFeedback = internalAction({
  args: {
    userId: v.string(),
    sessionId: v.id("interviewSessions"),
    questionsAndAnswers: v.any(),
  },
  handler: async (ctx, args) => {
    try {
      const prompt = getInterviewFeedbackPrompt(args.questionsAndAnswers);
      const response = await genAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          maxOutputTokens: 2000,
          temperature: 0.3,
          responseMimeType: "application/json",
        },
      });
      if (!response.text) throw new ConvexError("Failed to generate feedback");
      const feedbackList = JSON.parse(response.text);
      console.log(feedbackList, "feedbackList");

      for (const feedback of feedbackList) {
        await ctx.runMutation(api.interviewSession.insertFeedback, {
          sessionId: args.sessionId,
          questionId: feedback.questionId,
          score: feedback.score,
          grade: feedback.grade,
          improvements: feedback.improvements,
          feedback: feedback.feedback,
        });
      }
      // Deduct credits for feedback
      await ctx.runMutation(api.apiLimits.deductCredit, {
        userId: args.userId,
        amount: CREDIT_COST.INTERVIEW_FEEDBACK,
      });
      // Notify the user that feedback is ready
      await ctx.runMutation(api.interviewSession.createMessage, {
        sessionId: args.sessionId,
        text: "🎉 Your feedback is ready! 🎉 Please check it now! 📝",
        role: Role.AI,
        type: MessageStatusType.SYSTEM,
      });
    } catch (error) {
      console.error(error);
      throw new ConvexError("Failed to generate feedback");
    }
  },
});

export const getInterviewFeedback = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const feedbackList = await ctx.db
      .query("interviewFeedback")
      .withIndex("by_session", (q) =>
        q.eq("sessionId", args.sessionId as Id<"interviewSessions">)
      )
      .collect();
    const totalScore = feedbackList.reduce(
      (acc, feedback) => acc + feedback.score,
      0
    );
    const totalPercentage = (totalScore / (feedbackList.length * 100)) * 100;
    return {
      feedbackList,
      totalScore,
      totalPercentage,
    };
  },
});
