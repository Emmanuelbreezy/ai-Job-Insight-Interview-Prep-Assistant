"use client";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Lightbulb, Loader, MessageSquare, Send } from "lucide-react";
import { Button } from "../ui/button";
import { AppMode, MessageStatusType, Role } from "@/lib/constant";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AutosizeTextarea, AutosizeTextAreaRef } from "../ui/autosize-textarea";
import { MessageType, useAppContext } from "@/context/AppProvider";
import { cn } from "@/lib/utils";
import { ConvexError } from "convex/values";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { JobInsightPrompts } from "./Job-insight-prompt";

interface ChatInputProps {
  jobId: string;
  userId: string | null;
  sessionId: string;
  isDisabled: boolean;
}

const ChatInput = ({
  jobId,
  userId,
  isDisabled,
  sessionId,
}: ChatInputProps) => {
  const { jobMode, handleSwitchMode, messages } = useAppContext();
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<AutosizeTextAreaRef>(null);
  const { openModal: openUpgradeModal } = useUpgradeModal();

  const answerQuestion = useMutation(api.interviewSession.answerQuestion);
  const sendMessage = useMutation(api.jobInsightConversation.sendUserMessage);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(event.target.value);
    },
    []
  );

  const handleInput = async (input: string) => {
    if (!input.trim() || isDisabled || !userId) return;
    setIsLoading(true);
    try {
      if (jobMode === AppMode.JOB_INSIGHT) {
        await sendMessage({
          jobId,
          userId,
          message: input,
        });
      } else if (jobMode === AppMode.INTERVIEW_SESSION) {
        const questionId = getLastAIQuestionId(messages);
        await answerQuestion({
          sessionId,
          questionId,
          answerText: input,
        });
      }
      setInput("");
    } catch (error) {
      const errorMessage =
        error instanceof ConvexError && error.data?.message
          ? error.data.message
          : "Failed to send message.";
      if (
        error instanceof ConvexError &&
        error.data.type === "INSUFFICIENT_CREDITS"
      )
        openUpgradeModal();
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getLastAIQuestionId = (messages: MessageType[]) => {
    const lastAIQuestion = messages
      .filter(
        (message) =>
          message.role === Role.AI &&
          message.type === MessageStatusType.QUESTION
      )
      .pop(); // Get the last item in the filtered array
    return lastAIQuestion?._id || "";
  };

  return (
    <div className="sticky bottom-0 left-0 w-full">
      <div
        className="mx-2 flex flex-row gap-3 md:mx-4 md:last:mb-6 
      lg:mx-auto lg:max-w-2xl xl:max-w-3xl bg-white"
      >
        <div
          className="relative flex h-full flex-1 items-stretch 
        md:flex-col px-4 pt-3 -mb-3 w-full"
        >
          {/* Suggested Prompts */}
          {jobMode === AppMode.JOB_INSIGHT && (
            <JobInsightPrompts isDisabled={isDisabled} onSubmit={handleInput} />
          )}
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
              onChange={handleInputChange}
              value={input}
              disabled={isDisabled}
              onKeyUp={(e) => {
                if (isLoading) return;
                if (e.key === "Enter" && !e.shiftKey) {
                  handleInput(input);
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
                  handleInput(input);
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
