"use node";
import { ConvexError, v } from "convex/values";
import { internalAction } from "./_generated/server";
import { chatSession, genAI } from "@/lib/gemini-ai";
import { processAndCleanJobDescription } from "@/lib/job-processor";
import {
  getInterviewQuestionPrompt,
  getJobTitleDescPrompt,
} from "@/lib/prompt";
import { api, internal } from "./_generated/api";
import {
  InterviewStatus,
  JobInsightStatus,
  JobStatus,
  MessageType,
  QuestionType,
  Role,
} from "@/lib/constant";
import { storeInVectorDB } from "@/lib/pinecone-vectordb";
//import { generateDefaultTitle } from "@/lib/helper";

export const processJobWithAI = internalAction({
  args: {
    jobId: v.id("jobs"),
    userId: v.string(),
    jobDescription: v.string(),
  },
  handler: async (ctx, args) => {
    const processedDesc = await processAndCleanJobDescription(
      args.jobDescription
    );

    let title = "Untitled";
    let htmlDescription = "<p>No description available.</p>";

    try {
      const prompt = getJobTitleDescPrompt(processedDesc);
      const response = await genAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          maxOutputTokens: 2000,
          temperature: 0.3,
          responseMimeType: "application/json",
        },
      });

      if (response.text) {
        const parsedResponse = JSON.parse(response.text);
        title = parsedResponse.title || title;
        htmlDescription = parsedResponse.htmlDescription || htmlDescription;
      }
    } catch (error) {
      console.error("AI processing failed:", error);
    }
    // Always update the job with the processed description
    await ctx.runMutation(api.job.updateJob, {
      jobId: args.jobId,
      jobTitle: title,
      processedDescription: processedDesc,
      htmlFormatDescription: htmlDescription,
      status: JobStatus.READY,
    });

    // Store the processed description in the vector database
    await storeInVectorDB([
      {
        content: `${title}: ${processedDesc}`,
        metadata: {
          jobId: args.jobId,
          userId: args.userId,
          title: title,
        },
      },
    ]);
    // Send welcome message
    await ctx.runMutation(api.jobInsightConversation.create, {
      userId: args.userId,
      jobId: args.jobId,
      text: welcomeMessage(title),
      role: Role.AI,
      status: JobInsightStatus.COMPLETED,
    });
  },
});
// Helper functions
const welcomeMessage = (title: string) => `
  <h3 style="font-weight: 600; margin-bottom: 1rem;">Welcome to your Job Insight Assistant!</h3>
  <p style="margin-bottom: 1rem;">I've analyzed the <strong style="font-weight: 550;">${title}</strong> position.</p>
  <p style="margin-bottom: 1rem;">Here's what I can help with:</p>
  <ul style="list-style-type: circle; list-style-position: outside; margin-bottom: 1rem;">
    <li style="margin-bottom: 0.5rem;">
      <h5 style="font-weight: 500;">📝 CV Optimization:</h5>
      <p>Tailor your CV to match the job description and highlight relevant skills.</p>
    </li>
    <li style="margin-bottom: 0.5rem;">
      <h5 style="font-weight: 500;">🔍 Skill Analysis:</h5>
      <p>Identify key skills and gaps to focus on.</p>
    </li>
    <li style="margin-bottom: 0.5rem;">
      <h5 style="font-weight: 500;">📊 Job-Specific Insights:</h5>
      <p>Understand the role's requirements, responsibilities, and expectations.</p>
    </li>
  </ul>
  <p>What would you like to focus on first?</p>
`;

export const processWithAI = internalAction({
  args: {
    userId: v.string(),
    interviewId: v.id("interview"),
    jobDescription: v.string(),
  },
  handler: async (ctx, args) => {
    // const title = generateDefaultTitle(args.jobDescription);
    // console.log(title, "generateDefaultTitle");
    // console.log("--------------------------------");
    const processedDesc = await processAndCleanJobDescription(
      args.jobDescription
    );
    const prompt = "";
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        maxOutputTokens: 2000,
        temperature: 0.3,
      },
    });
    const jobTitle = response.text;

    await ctx.runMutation(api.interview.updateInterview, {
      interviewId: args.interviewId,
      jobTitle: jobTitle,
      processedJobDescription: processedDesc,
      status: InterviewStatus.READY,
    });

    // 4. Send welcome message
    await ctx.runMutation(api.messages.createMessage, {
      interviewId: args.interviewId,
      userId: args.userId,
      text: `Welcome to your ${jobTitle} interview! I'll ask you 10 questions. 
      first question coming up`,
      role: Role.AI,
      questionType: QuestionType.TEXT,
      messageType: MessageType.CHAT,
    });

    // 5. Immediately generate first question
    await ctx.scheduler.runAfter(100, internal.actions.askQuestion, {
      interviewId: args.interviewId,
      userId: args.userId,
      processedDescription: processedDesc,
      lastQuestion: undefined, // No previous questions
      questionNumber: 1,
    });
  },
});

export const askQuestion = internalAction({
  args: {
    interviewId: v.id("interview"),
    userId: v.string(),
    processedDescription: v.string(),
    lastQuestion: v.optional(v.string()),
    questionNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const { interviewId, userId, processedDescription, lastQuestion } = args;

    if (args.questionNumber > 10) {
      await ctx.runMutation(api.messages.createMessage, {
        interviewId: args.interviewId,
        userId: args.userId,
        text: "That concludes our 10 questions! Would you like feedback?",
        role: Role.AI,
        messageType: MessageType.SYSTEM,
      });
      return;
    }

    const prompt = getInterviewQuestionPrompt(
      processedDescription,
      lastQuestion
    );
    const result = await chatSession.sendMessage({
      message: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });
    const aiResponse = result.text;
    if (typeof aiResponse !== "string" || aiResponse.trim() === "") {
      throw new ConvexError({
        code: "INVALID_RESPONSE",
        message: "AI response is invalid or empty",
      });
    }

    console.log(aiResponse, "aiResponse");

    // Parse the AI's response (JSON string) into an object
    let questionData;
    try {
      questionData = JSON.parse(aiResponse);
    } catch (error) {
      throw new ConvexError({
        code: "PARSE_ERROR",
        message: "Failed to parse AI response as JSON",
      });
    }

    // Extract fields from the parsed JSON
    const { question, type, context, timeLimit } = questionData;

    // Create the message with the extracted data
    await ctx.runMutation(api.messages.createMessage, {
      interviewId,
      userId,
      text: question || "Your question text here", // Use the extracted question
      role: Role.AI,
      questionType: type, // Use the extracted type
      questionNumber: args.questionNumber,
      messageType: MessageType.QUESTION,
      timeLimit, // Use the extracted timeLimit
      metadata: { context }, // Optionally include context in metadata
    });
  },
});
