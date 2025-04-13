import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export const cleanJobDescription = (rawText: string): string => {
  return rawText
    .replace(/<[^>]*>/g, " ") // Remove HTML tags
    .replace(/\s+/g, " ") // Collapse whitespace
    .replace(/[^\w\s.,;:!?\-/]/g, "") // Remove special chars
    .trim() // Trim edges
    .substring(0, 10000); // Safe length limit
};

export const processAndCleanJobDescription = async (jobDesc: string) => {
  // Clean first
  const cleaned = cleanJobDescription(jobDesc);
  // Chunk if needed (for large descriptions)
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 2000,
    chunkOverlap: 200,
  });
  const chunks = await splitter.splitText(cleaned);
  return chunks.length > 1 ? chunks.join("\n\n---\n\n") : cleaned;
};
