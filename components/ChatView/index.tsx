"use client";
import React, { useEffect, useRef, useState } from "react";
import ChatInput from "./chat-input";
import ChatMessages from "./chat-messages";
import { useAppContext } from "@/context/AppProvider";
import { Id } from "@/convex/_generated/dataModel";
import { Role } from "@/lib/constant";
import { getChatPrompt } from "@/lib/prompt";
import { useMutation } from "convex/react";
import { chatSession } from "@/lib/ai-config";
import { api } from "@/convex/_generated/api";

const ChatView = (props: { fileId: Id<"files">; userId: string | null }) => {
  const { fileId, userId } = props;
  const { isLoading, messages, updateMessages } = useAppContext();
  const [responseLoading, setResonseLoading] = useState<boolean>(false);
  const lastMessageIdRef = useRef<string | null>(null);

  const createMessage = useMutation(api.messages.createMessage);

  console.log(messages, "msgs");

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (
        !lastMessage ||
        lastMessage.role !== Role.USER ||
        lastMessage._id === lastMessageIdRef.current ||
        lastMessage._id === undefined
      )
        return;
      lastMessageIdRef.current = lastMessage._id;
      getChatAiResponse();
    }
  }, [messages]);

  const getChatAiResponse = async () => {
    if (!userId) return;
    setResonseLoading(true);
    try {
      const prompt = getChatPrompt(messages);
      const aiResponse = await chatSession.sendMessage({ message: prompt });
      const newMsg = {
        userId,
        fileId,
        text: aiResponse.text || "",
        role: Role.AI,
      };
      const messageId = await createMessage(newMsg);
      updateMessages({
        ...newMsg,
        _id: messageId,
        createdAt: Date.now(),
      });
    } catch (error) {
      console.error("Error triggering Gemini:", error);
      return null;
    } finally {
      setResonseLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-full bg-white 
      flex divide-y divide-gray-200 flex-col
      justify-between gap-2"
    >
      <div
        className="flex-1 justify-between 
        flex flex-col mb-28"
      >
        <ChatMessages
          fileId={fileId}
          messages={messages}
          responseLoading={responseLoading}
        />
      </div>

      <ChatInput
        fileId={fileId}
        userId={userId}
        isDisabled={responseLoading || isLoading}
      />
    </div>
  );
};

export default ChatView;
