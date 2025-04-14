"use client";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Binoculars,
  Lightbulb,
  Loader,
  MessageSquare,
  Send,
} from "lucide-react";
import { Button } from "../ui/button";
import { Id } from "@/convex/_generated/dataModel";
import { AppMode, Role } from "@/lib/constant";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AutosizeTextarea, AutosizeTextAreaRef } from "../ui/autosize-textarea";
import { useAppContext } from "@/context/AppProvider";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  jobId: Id<"jobs">;
  userId: string | null;
  isDisabled?: boolean;
}

const ChatInput = ({ jobId, userId, isDisabled }: ChatInputProps) => {
  const { jobMode, handleSwitchMode, updateMessages, messages } =
    useAppContext();
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<AutosizeTextAreaRef>(null);

  const sendAnswer = useMutation(api.interview.sendAnswer);
  const sendMessage = useMutation(api.jobInsightConversation.sendUserMessage);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(event.target.value);
    },
    []
  );

  const handleInput = useCallback(async () => {
    if (!input.trim() || isDisabled || !userId) return;
    setIsLoading(true);
    try {
      // const tempId = `temp-${Date.now()}`;
      // const newMsg = {
      //   userId,
      //   jobId,
      //   text: input,
      //   role: Role.USER,
      //   createdAt: Date.now(),
      //   _id: tempId, // Use temporary ID
      // };
      // updateMessages(newMsg);

      if (jobMode === AppMode.JOB_INSIGHT) {
        const messageId = await sendMessage({
          jobId,
          userId,
          message: input,
        });
      } else {
        // Handle other modes (e.g., interview session)
        // await sendAnswer({
        //   interviewId,
        //   userId: userId,
        //   answer: answer,
        // });
      }
      setInput("");
    } catch (error) {
      console.error("Failed to send answer:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to send answer."
      );
    } finally {
      setIsLoading(false);
    }
  }, [input, jobId, userId]);

  return (
    <div className="sticky bottom-0 left-0 w-full">
      <div
        className="mx-2 flex flex-row gap-3 md:mx-4 md:last:mb-6 
      lg:mx-auto lg:max-w-2xl xl:max-w-3xl bg-white"
      >
        <div
          className="relative flex h-full flex-1 items-stretch 
        md:flex-col px-4 pt-3 -mb-3"
        >
          <div
            className="relative flex flex-col w-full flex-grow
        border-zinc-300 mx-2 md:mx-0 items-stretch transition-all
          border-[0.5px] 
        duration-200 shadow-md 
         hover:border-border-200
         rounded-2xl p-3 !bg-[rgba(243,244,246,.3)]
          "
          >
            <AutosizeTextarea
              ref={textareaRef}
              rows={1}
              maxHeight={200}
              minHeight={20}
              enterKeyHint="send"
              onChange={handleInputChange}
              value={input}
              disabled={isDisabled}
              onKeyUp={(e) => {
                if (isLoading) return;
                if (e.key === "Enter" && !e.shiftKey) {
                  handleInput();
                  textareaRef.current?.textArea?.focus();
                }
              }}
              placeholder={
                jobMode === AppMode.JOB_INSIGHT
                  ? "Ask about the job..."
                  : "Answer question..."
              }
              className="resize-none pr-12 !text-[15px] border-0 !bg-transparent
                  !shadow-none !ring-0 focus-visible:!ring-offset-0 
                  focus-visible:!ring-0"
            />
            {/* <Textarea /> */}
            <div className="flex w-full items-center justify-between pt-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    `rounded-full font-normal !text-[13px]`,
                    jobMode === AppMode.JOB_INSIGHT &&
                      "!bg-primary/5 !text-primary !border-primary"
                  )}
                  onClick={() => handleSwitchMode(AppMode.JOB_INSIGHT)}
                >
                  <Lightbulb />
                  Job Insights
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    `rounded-full font-normal !text-[13px]`,
                    jobMode === AppMode.INTERVIEW_SESSION &&
                      "!bg-primary/5 !text-primary !border-primary"
                  )}
                  onClick={() => handleSwitchMode(AppMode.INTERVIEW_SESSION)}
                >
                  <MessageSquare />
                  Interview Session
                </Button>
              </div>

              <Button
                disabled={!input.trim() || isLoading || isDisabled}
                className="right-[8px] !bg-black 
                disabled:pointer-events-none disabled:!bg-gray-500"
                aria-label="send message"
                onClick={() => {
                  handleInput();
                  textareaRef.current?.textArea?.focus();
                }}
              >
                {isLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
