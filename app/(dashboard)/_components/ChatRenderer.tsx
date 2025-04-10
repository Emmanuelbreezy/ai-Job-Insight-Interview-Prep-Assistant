"use client";
import React from "react";
import ChatView from "@/components/ChatView";
import { useUser } from "@clerk/nextjs";
import { Id } from "@/convex/_generated/dataModel";

const ChatRenderer = (props: { fileId: Id<"files"> }) => {
  const { user } = useUser();

  const userId = user?.id || null;

  return (
    <div className="w-full h-screen flex flex-col">
      <div
        className="h-10 shrink-0 w-full border-b
       border-gray-200 pt-2 flex items-center justify-between
       px-2"
      >
        <h1 className="font-semibold">Chat</h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ChatView fileId={props.fileId} userId={userId} />
      </div>
    </div>
  );
};

export default ChatRenderer;
