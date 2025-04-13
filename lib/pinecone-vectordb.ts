"use server";
import { Pinecone } from "@pinecone-database/pinecone";
import { hfEmbeddingsClient } from "./embeddings";
import { ConvexError } from "convex/values";

export const pineconeClient = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
  maxRetries: 5,
});

export async function storeInVectorDB(chunks: any[]) {
  const index = pineconeClient.Index("ai-job-assistant");
  const vectors = await Promise.all(
    chunks.map(async (chunk, i) => {
      try {
        return {
          id: `${chunk.metadata.jobId}-${i}`, // Use jobId from metadata
          values: await hfEmbeddingsClient.embedQuery(chunk.content),
          metadata: chunk.metadata, // Use metadata directly
        };
      } catch (error) {
        console.error(`Failed to embed chunk ${i}:`, error);
        return null;
      }
    })
  );

  const validVectors = vectors.filter((v) => v !== null);
  if (validVectors.length === 0)
    throw new ConvexError("No valid vectors to upsert");

  await index.upsert(validVectors);
}

export async function retrieveVectorsByFileId(fileId: string) {
  const index = pineconeClient.Index("ai-portfolio");

  try {
    // Query with a dummy vector and filter by fileId
    const embeddingDimension = 384; // For "sentence-transformers/all-MiniLM-L6-v2"
    const dummyVector = new Array(embeddingDimension).fill(0);

    const queryResponse = await index.query({
      vector: dummyVector, // Dummy vector (adjust size to match your embeddings)
      topK: 1000, // Adjust based on expected number of chunks per file
      includeMetadata: true,
      filter: { fileId },
    });

    // Extract and return the relevant data
    return queryResponse.matches.map((match) => ({
      id: match.id,
      content: match.metadata?.content as string,
      metadata: match.metadata,
      score: match.score,
    }));
  } catch (error) {
    console.error("Failed to retrieve vectors:", error);
    throw new Error(
      `Vector retrieval failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
