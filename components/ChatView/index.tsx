"use client";
import React from "react";
import ChatInput from "./chat-input";
import ChatMessages from "./chat-messages";
import { Id } from "@/convex/_generated/dataModel";

const ChatComponent = (props: {
  jobId: Id<"jobs">;
  userId: string | null;
  userName: string | null;
}) => {
  const { jobId, userId, userName } = props;

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
        <ChatMessages jobId={jobId} userId={userId} userName={userName} />
      </div>
      <ChatInput jobId={jobId} userId={userId} isDisabled={false} />
    </div>
  );
};

export default ChatComponent;
