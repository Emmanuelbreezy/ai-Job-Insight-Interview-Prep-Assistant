"use server";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

export const hfEmbeddingsClient = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HUGGINGFACE_API_KEY, // Free tier available
  model: "sentence-transformers/all-MiniLM-L6-v2", // 90% as good as OpenAI
});
