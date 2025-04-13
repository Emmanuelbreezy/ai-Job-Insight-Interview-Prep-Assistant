export function generateDefaultTitle(description: string): string {
  // Extract first few meaningful words from the description
  const words = description
    .split(/[\s,]+/) // Split by whitespace
    .filter((word) => word.length > 3) // Filter out short words
    .slice(0, 3); // Take first 3 words

  return words.length > 0 ? `${words.join(" ")} Position` : "New Job Position";
}
