"use client";
import React, { useEffect, useState } from "react";
import ChatInput from "./chat-input";
import ChatMessages from "./chat-messages";
import { Id } from "@/convex/_generated/dataModel";
import { useInterviewSessionId } from "@/hooks/use-interview-session-id";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAppContext } from "@/context/AppProvider";
import { AppMode, InterviewStatus } from "@/lib/constant";

const ChatComponent = (props: {
  jobId: string;
  userId: string | null;
  userName: string | null;
}) => {
  const { jobId, userId, userName } = props;
  const { setMessages, jobMode } = useAppContext();
  const { sessionId } = useInterviewSessionId();

  const messagesFromJob = useQuery(
    api.jobInsightConversation.getMessagesByJobId,
    jobMode === AppMode.JOB_INSIGHT ? { id: jobId } : "skip"
  );
  const messagesFromSession = useQuery(
    api.interviewSession.getMessagesBySessionId,
    jobMode === AppMode.INTERVIEW_SESSION && sessionId
      ? { id: sessionId }
      : "skip"
  );

  const data =
    jobMode === AppMode.INTERVIEW_SESSION
      ? messagesFromSession
      : messagesFromJob;

  useEffect(() => {
    if (data && data.success) {
      setMessages(data.data || []);
    }
  }, [data, setMessages]);

  const isSessionCompleted =
    messagesFromSession?.session?.status === InterviewStatus.COMPLETED;

  return (
    <div
      className="relative h-full bg-white 
      flex divide-y divide-gray-200 flex-col
      justify-between gap-2"
    >
      <div
        className="flex-1 justify-between 
        flex flex-col"
      >
        <ChatMessages
          jobId={jobId}
          userId={userId}
          userName={userName}
          data={data}
          jobMode={jobMode}
          isSessionCompleted={isSessionCompleted}
        />
      </div>
      <ChatInput
        jobId={jobId}
        userId={userId}
        sessionId={sessionId}
        isDisabled={data === undefined || isSessionCompleted}
      />
    </div>
  );
};

export default ChatComponent;
