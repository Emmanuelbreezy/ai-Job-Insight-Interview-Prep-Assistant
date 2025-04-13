"use client";
import React from "react";
import ChatComponent from "@/components/ChatView";
import { useUser } from "@clerk/nextjs";
import { Id } from "@/convex/_generated/dataModel";
import { useAppContext } from "@/context/AppProvider";
import { AppMode } from "@/lib/constant";

const ChatView = (props: { jobId: Id<"jobs"> }) => {
  const { user } = useUser();
  const { jobMode } = useAppContext();

  const userId = user?.id || null;

  return (
    <div className="w-full h-screen flex flex-col">
      <div
        className="h-10 shrink-0 w-full border-b
       border-gray-200 pt-1 flex items-center justify-between
       px-2"
      >
        <h1 className="font-semibold">
          {jobMode === AppMode.JOB_INSIGHT
            ? "Job Insight Mode"
            : "Interview Session"}
        </h1>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatComponent jobId={props.jobId} userId={userId} />
      </div>
    </div>
  );
};

export default ChatView;
