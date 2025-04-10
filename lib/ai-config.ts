import { MessageType } from "@/context/AppProvider";
import { GoogleGenAI } from "@google/genai";
import { getChatPrompt } from "./prompt";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;

export const ai = new GoogleGenAI({
  apiKey,
});

export const chatSession = ai.chats.create({
  model: "gemini-2.0-flash",
  config: {
    maxOutputTokens: 8192,
    temperature: 1,
    responseMimeType: "text/plain",
  },
  history: [],
});

export const potfoiloSession = ai.chats.create({
  model: "gemini-2.0-flash",
  config: {
    maxOutputTokens: 8192,
    temperature: 1,
    responseMimeType: "text/plain",
  },
  history: [],
});
