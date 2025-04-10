import React, { useCallback, useEffect, useRef, useState } from "react";
import { Loader, MessageSquareTextIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { MessageType, useAppContext } from "@/context/AppProvider";
import { Role } from "@/lib/constant";
import { Id } from "@/convex/_generated/dataModel";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";

const ChatMessages = (props: {
  fileId: Id<"files">;
  messages: MessageType[];
  responseLoading: boolean;
}) => {
  const { fileId, messages, responseLoading } = props;
  const { setMessages } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const convex = useConvex();

  useEffect(() => {
    fileId && getMessagesByFileId(fileId);
  }, [fileId]);

  useEffect(() => {
    messagesEndRef?.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [messages, responseLoading]);

  const getMessagesByFileId = useCallback(async (fileId: Id<"files">) => {
    setIsLoading(true);
    try {
      const messages = await convex.query(api.messages.getMessagesByFileId, {
        fileId,
      });
      setMessages(messages);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div
      className="flex max-h-[calc(100vh-10.5rem)] flex-1 
      flex-col gap-4 p-3 overflow-y-auto
     "
    >
      {isLoading ? (
        <div className="w-full flex flex-col justify-center gap-2">
          <Loader className="h-8 w-8 animate-spin mx-auto" />
        </div>
      ) : messages && messages.length > 0 ? (
        <>
          {/* Render Messages */}
          {messages.map((message, index) => {
            const isUserMessage = message.role === Role.USER;
            return (
              <>
                <div
                  key={index}
                  className={cn("flex items-end", {
                    "justify-end": isUserMessage,
                  })}
                >
                  <div
                    className={cn(
                      `flex flex-col space-y-2 
                  text-sm max-w-xs mx-2`,
                      {
                        "order-1 items-end": isUserMessage,
                        "order-2 items-start": !isUserMessage,
                      }
                    )}
                  >
                    <div className="flex items-end gap-2">
                      {/* AI Avatar */}
                      {!isUserMessage && (
                        <div
                          className="w-8 h-8 shrink-0 rounded-full
                     bg-gray-200 flex items-center justify-center"
                        >
                          <span className="text-gray-900 text-sm">AI</span>
                        </div>
                      )}
                      <div
                        className={cn("px-4 py-2 rounded-lg inline-block", {
                          "bg-black text-white": isUserMessage,
                          "bg-gray-100 text-gray-900": !isUserMessage,
                        })}
                      >
                        {message.text}
                      </div>
                      {isUserMessage && (
                        <div className="w-8 h-8 shrink-0 rounded-full bg-black flex items-center justify-center">
                          <span className="text-white text-sm">U</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            );
          })}

          {responseLoading && (
            <div className="flex items-end">
              <div
                className="flex flex-col space-y-2 text-sm max-w-xs mx-2
               order-2 items-start"
              >
                <div className="flex items-end gap-2">
                  <div
                    className="w-8 h-8 shrink-0 rounded-full
                     bg-gray-200 flex items-center justify-center"
                  >
                    <span className="text-gray-900 text-sm">AI</span>
                  </div>
                  <div
                    className="px-4 py-2 rounded-lg inline-block
                   bg-gray-100 text-gray-900"
                  >
                    <div className="flex space-x-1">
                      <div
                        className="h-2 w-2 bg-gray-500 rounded-full
                       animate-bounce delay-100"
                      />
                      <div
                        className="h-2 w-2 bg-gray-500 rounded-full 
                      animate-bounce delay-200"
                      />
                      <div
                        className="h-2 w-2 bg-gray-500 rounded-full
                       animate-bounce delay-300"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div
          className="flex-1 flex flex-col items-center 
        justify-center gap-2"
        >
          <MessageSquareTextIcon className="h-8 w-8" />
          <h3 className="font-semibold text-lg">Your Portfolio is Ready!</h3>
          <p className="text-zinc-500 text-sm">
            Ask for modifications to your portfolio.
          </p>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
