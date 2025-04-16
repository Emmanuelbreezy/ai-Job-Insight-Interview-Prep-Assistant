"use client";
import React, { useMemo, useState } from "react";
import { Loader, MessageSquareTextIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppMode, AppModeType, Role } from "@/lib/constant";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import useScrollToBottom from "@/hooks/use-scroll-bottom";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useInterviewSessionId } from "@/hooks/use-interview-session-id";
import { Button } from "../ui/button";
import { ConvexError } from "convex/values";
import { toast } from "sonner";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";

const ChatMessages = (props: {
  jobId: Id<"jobs">;
  userId: string | null;
  userName: string | null;
  data: any;
  jobMode: AppModeType | null;
  isSessionCompleted: boolean;
}) => {
  const { data, isSessionCompleted, jobMode, jobId, userId, userName } = props;
  const { sessionId, setSession } = useInterviewSessionId();
  const [isStartingSession, setIsStartingSession] = useState(false);
  const { openModal: openUpgradeModal } = useUpgradeModal();

  const containerEndRef = useScrollToBottom([data]);

  const createInterviewSession = useMutation(
    api.interviewSession.createInterviewSession
  );

  const messages = useMemo(() => {
    if (!data || !data.success) return [];
    return data.data || [];
  }, [data]);

  // Handle loading state
  if (
    (jobMode === AppMode.INTERVIEW_SESSION &&
      sessionId &&
      data === undefined) ||
    (jobMode === AppMode.JOB_INSIGHT && data === undefined)
  ) {
    return (
      <div className="w-full flex justify-center gap-2 p-5">
        <Loader className="h-8 w-8 animate-spin mx-auto" />
      </div>
    );
  }

  const startInterviewSession = async () => {
    if (!userId) return;
    setIsStartingSession(true);
    try {
      const sessionId = await createInterviewSession({
        userId: userId,
        jobId: jobId,
      });
      setSession(sessionId);
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
      setIsStartingSession(false);
    }
  };

  return (
    <>
      <div
        className="flex max-h-[calc(100vh-10.5rem)] flex-1 
      flex-col gap-4 p-3 overflow-y-auto pt-8 pb-20
     "
      >
        {messages && messages?.length > 0 ? (
          <>
            {/* Render Messages */}
            {messages?.map((message: any, index: number) => {
              const isUserMessage = message.role === Role.USER;
              return (
                <div
                  key={`${message._id}-${index}`}
                  className={cn("flex items-end", {
                    "justify-end": isUserMessage,
                  })}
                >
                  <div
                    className={cn(
                      `flex flex-col space-y-2 text-base max-w-lg mx-2`,
                      {
                        "order-1 items-end": isUserMessage,
                        "order-2 items-start !max-w-4xl": !isUserMessage,
                      }
                    )}
                  >
                    <div
                      className={cn("flex gap-2", {
                        "items-end": isUserMessage,
                        "items-start": !isUserMessage,
                      })}
                    >
                      {/* AI Avatar */}
                      {!isUserMessage && (
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="shrink-0 bg-gray-200 text-sm">
                            AI
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn("px-4 py-2 rounded-lg inline-block", {
                          "bg-black/80 text-white": isUserMessage,
                          "bg-gray-50 text-gray-900": !isUserMessage,
                        })}
                      >
                        <div
                          key={message._id}
                          dangerouslySetInnerHTML={{ __html: message.text }}
                        />
                      </div>
                      {isUserMessage && (
                        <Avatar className="w-8 h-8">
                          <AvatarFallback
                            className="shrink-0 
                           bg-black/80 text-white text-sm"
                          >
                            {userName?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isSessionCompleted && (
              <div className="flex flex-col items-center justify-center">
                <Button
                  onClick={startInterviewSession}
                  className="!bg-black text-white px-6 py-2"
                >
                  {isStartingSession && (
                    <Loader className="w-4 h-4 animate-spin" />
                  )}
                  🚀 Start a New Session
                </Button>
              </div>
            )}
          </>
        ) : jobMode === AppMode.JOB_INSIGHT ? (
          <div
            className="flex-1 flex flex-col items-center justify-center 
          gap-2"
          >
            <MessageSquareTextIcon className="h-8 w-8" />
            <h3 className="font-semibold text-lg">
              Your Job Insight Assistant is Ready!
            </h3>
            <p className="text-zinc-500 text-sm">
              Get tailored advice and insights to ace your job search.
            </p>
          </div>
        ) : (
          !sessionId && (
            <InterviewSessionWel
              isStartingSession={isStartingSession}
              onStartSession={startInterviewSession}
            />
          )
        )}
        <br />
        <br />
        <br />
        <div ref={containerEndRef} />
      </div>
    </>
  );
};

const InterviewSessionWel = ({
  isStartingSession,
  onStartSession,
}: {
  isStartingSession: boolean;
  onStartSession: () => void;
}) => {
  return (
    <div className="text-center">
      <MessageSquareTextIcon className="h-8 w-8 mx-auto" />
      <h3 className="font-semibold text-lg mt-2">
        Your Interview Coach is Ready!
      </h3>
      <p className="text-gray-500 text-sm mt-1">
        (10) questions to practice and refine your skills for the position.
      </p>
      <Button
        onClick={onStartSession}
        className="mt-4 px-6 py-2 !bg-black !text-white"
      >
        {isStartingSession && <Loader className="w-4 h-4 animate-spin" />}
        Start Interview Session
      </Button>
    </div>
  );
};
export default ChatMessages;
