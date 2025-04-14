import React, { useEffect, useMemo, useState } from "react";
import { Loader, MessageSquareTextIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/context/AppProvider";
import { AppMode, Role } from "@/lib/constant";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import useScrollToBottom from "@/hooks/use-scroll-bottom";
import { Avatar, AvatarFallback } from "../ui/avatar";

const ChatMessages = (props: {
  jobId: Id<"jobs">;
  userId: string | null;
  userName: string | null;
}) => {
  const { jobId, userId, userName } = props;
  const { setMessages, jobMode } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isStartingSession, setIsStartingSession] = useState(false);

  const data = useQuery(api.job.getByJobId, {
    jobId,
    jobMode: jobMode || AppMode.JOB_INSIGHT,
  });

  const createInterviewSession = useMutation(
    api.interviewSession.createInterviewSession
  );

  const containerEndRef = useScrollToBottom([data, isLoading]);

  useEffect(() => {
    if (!data) {
      setIsLoading(true);
      return;
    }
    if (data.success) {
      setMessages(data.data || []);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [data, setMessages]);

  const messages = useMemo(() => {
    if (!data || !data.success) return [];
    return data.data || [];
  }, [data]);

  const startInterviewSession = async () => {
    if (!userId) return;
    setIsStartingSession(true);
    try {
      await createInterviewSession({
        userId: userId,
        jobId: jobId,
      });
    } catch (error) {
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
        {isLoading ? (
          <div className="w-full flex flex-col justify-center gap-2">
            <Loader className="h-8 w-8 animate-spin mx-auto" />
          </div>
        ) : messages && messages?.length > 0 ? (
          <>
            {/* Render Messages */}
            {messages?.map((message, index) => {
              const isUserMessage = message.role === Role.USER;
              return (
                <div
                  key={`${message._id}-index`}
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
                          <AvatarFallback className="shrink-0  bg-black/80 text-white text-sm">
                            {userName?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        ) : jobMode === AppMode.JOB_INSIGHT ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <MessageSquareTextIcon className="h-8 w-8" />
            <h3 className="font-semibold text-lg">
              Your Job Insight Assistant is Ready!
            </h3>
            <p className="text-zinc-500 text-sm">
              Get tailored advice and insights to ace your job search.
            </p>
          </div>
        ) : (
          <InterviewSessionWel
            isStartingSession={isStartingSession}
            onStartSession={startInterviewSession}
          />
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
        Practice and refine your skills for the position.
      </p>
      <button
        onClick={onStartSession}
        className="mt-4 px-6 py-2 bg-black text-white rounded-lg
         hover:bg-black/80 transition-colors"
      >
        {isStartingSession && <Loader className="w-4 h-4 animate-spin" />}
        Start Interview Session
      </button>
    </div>
  );
};
export default ChatMessages;
