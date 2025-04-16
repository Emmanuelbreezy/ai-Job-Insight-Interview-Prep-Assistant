"use server";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY!;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

export const genAI = new GoogleGenAI({
  apiKey,
});

export const chatSession = genAI.chats.create({
  model: "gemini-2.0-flash",
  config: {
    maxOutputTokens: 8192,
    temperature: 1,
  },
  history: [],
});
