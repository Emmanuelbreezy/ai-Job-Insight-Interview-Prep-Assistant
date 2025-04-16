"use client";
import { parseAsString, useQueryState } from "nuqs";

export const useInterviewSessionId = () => {
  const [sessionId, setSessionId] = useQueryState(
    "sessionId",
    parseAsString.withDefault("")
  );

  const setSession = (newSessionId: string) => setSessionId(newSessionId);
  const clearSession = () => setSessionId(null);

  return { sessionId, setSession, clearSession };
};
