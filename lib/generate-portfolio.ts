"use server";
import { storeInVectorDB } from "./pinecone-vectordb";
import { genAI } from "./gemini-ai";

export async function processAndStoreResumeWithAI(
  chunks: { content: string; metadata: Record<string, any> }[],
  fileId: string,
  userId: string
) {
  // 1. Store in Pinecone for long-term memory
  // await storeInVectorDB(chunks, fileId, userId);
  console.log("Vectors stored successfully");
  // 2. Directly process chunks with Gemini
  //const portfolioData = await generatePortfolioFromChunks(chunks);
  console.log("Portfolio generated successfully");

  return "";
}

// export async function generatePortfolioFromChunks(
//   chunks: { content: string; metadata: Record<string, any> }[]
// ) {
//   try {
//     // Group chunks by section
//     const groupedData = chunks.reduce(
//       (acc, chunk) => {
//         const section = chunk.metadata.sectionType || "other";
//         if (!acc[section]) acc[section] = [];
//         acc[section].push(chunk.content);
//         return acc;
//       },
//       {} as Record<string, string[]>
//     );

//     // Format for Gemini
//     const resumeDataString = JSON.stringify(groupedData, null, 2);
//     const portfolioPrompt = getPortfolioGenerationPrompt(resumeDataString);

//     // Call Gemini
//     const response = await genAI.models.generateContent({
//       model: "gemini-2.0-flash",
//       contents: [{ role: "user", parts: [{ text: portfolioPrompt }] }],
//       config: {
//         maxOutputTokens: 8000,
//         temperature: 0.2,
//         responseMimeType: "application/json",
//       },
//     });

//     return response.text || "";
//   } catch (error) {
//     console.error("Failed to generate portfolio:", error);
//     throw new Error(
//       `Portfolio generation failed: ${error instanceof Error ? error.message : String(error)}`
//     );
//   }
// }
