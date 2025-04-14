"use server";
import { Pinecone } from "@pinecone-database/pinecone";
import { hfEmbeddingsClient } from "./embeddings";
import { ConvexError } from "convex/values";

let pinecone: Pinecone | null = null;

export const getPinconeClient = async () => {
  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
      maxRetries: 5,
    });
  }
  return pinecone;
};

export async function storeInVectorDB(jobId: string, chunks: any[]) {
  const pineconeClient = await getPinconeClient();
  const pineconeIndex = pineconeClient.Index("ai-job-assistant");
  const namespaceIndex = pineconeIndex.namespace(jobId);
  const vectors = await Promise.all(
    chunks.map(async (chunk, i) => {
      try {
        return {
          id: `${chunk.metadata.jobId}-${i}`, // Use jobId from metadata
          values: await hfEmbeddingsClient.embedQuery(chunk.content),
          metadata: {
            ...chunk.metadata, // Include existing metadata
            chunkIndex: i + 1, // Add chunkIndex (starting from 1)
          },
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

  await namespaceIndex.upsert(validVectors); // Upsert to the namespace
}

export async function getContext(jobId: string, query: string) {
  const pineconeClient = await getPinconeClient();
  const index = pineconeClient.Index("ai-job-assistant");

  try {
    // Embed the query for semantic search
    const queryVector = await hfEmbeddingsClient.embedQuery(query);

    const queryResponse = await index.query({
      vector: queryVector, // Use the embedded query vector
      topK: 5,
      includeMetadata: true,
      filter: { jobId },
    });

    console.log(".......", queryResponse, "queryResponse");
    // Filter out matches with low scores (optional)
    const filteredMatches = queryResponse.matches.filter(
      (match) => match.score && match.score > 0.7
    );

    console.log(".......", filteredMatches, "filteredMatches");

    // Step 4: Extract the content from the matches
    const docs = filteredMatches.map(
      (match) => match.metadata?.content as string
    );
    //Join the content and limit to 2000 characters
    return docs.join("\n").substring(0, 2000);
  } catch (error) {
    console.error("Failed to retrieve vectors:", error);
    throw new Error(
      `Vector retrieval failed for fileId ${jobId}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
