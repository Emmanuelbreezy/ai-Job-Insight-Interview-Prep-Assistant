"use client";
import { Send } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useCallback, useRef, useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Role } from "@/lib/constant";
import { useAppContext } from "@/context/AppProvider";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

interface ChatInputProps {
  fileId: Id<"files">;
  userId: string | null;
  isDisabled?: boolean;
}

const ChatInput = ({ fileId, userId, isDisabled }: ChatInputProps) => {
  const { updateMessages } = useAppContext();
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const createMessage = useMutation(api.messages.createMessage);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessage(event.target.value);
    },
    []
  );

  const handleMessage = useCallback(async () => {
    if (!message.trim() || isDisabled || !userId) return;
    setIsLoading(true);
    try {
      const newMsg = {
        userId,
        fileId,
        text: message,
        role: Role.USER,
      };
      const messageId = await createMessage(newMsg);
      if (!messageId) {
        toast.error("Failed to send message");
        return;
      }
      updateMessages({
        ...newMsg,
        _id: messageId,
        createdAt: Date.now(),
      });
      setMessage("");
      textareaRef.current?.focus();
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to send message."
      );
    } finally {
      setIsLoading(false);
    }
  }, [message, fileId, userId]);

  return (
    <div className="absolute bottom-0 left-0 w-full">
      <div className="mx-2 flex flex-row gap-3 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
        <div className="relative flex h-full flex-1 items-stretch md:flex-col">
          <div className="relative flex flex-col w-full flex-grow p-4">
            <div className="relative">
              <Textarea
                rows={1}
                ref={textareaRef}
                autoFocus
                maxRows={5}
                onChange={handleInputChange}
                value={message}
                onKeyDown={(e) => {
                  if (isLoading) return;
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleMessage();

                    textareaRef.current?.focus();
                  }
                }}
                placeholder="Ask for modification..."
                className="resize-none pr-12 text-base py-3 scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
              />

              <Button
                disabled={!message.trim() || isLoading}
                className="absolute bottom-1.5 right-[8px] disabled:pointer-events-none"
                aria-label="send message"
                onClick={() => {
                  handleMessage();
                  textareaRef.current?.focus();
                }}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
