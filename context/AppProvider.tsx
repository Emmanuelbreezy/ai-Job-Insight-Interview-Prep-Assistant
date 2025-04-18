"use client";
import {
  createContext,
  ReactNode,
  useState,
  useCallback,
  useContext,
  SetStateAction,
} from "react";
import { Id } from "@/convex/_generated/dataModel";
import {
  AppMode,
  AppModeType,
  JobInsightStatusType,
  JobInsightsType,
  MessageStatusType,
  QuestionType,
} from "@/lib/constant";

export type JobInsightMessage = {
  _id?: string;
  userId: string;
  jobId: Id<"jobs">;
  text: string;
  role: "USER" | "AI";
  type?: JobInsightsType | null;
  status?: JobInsightStatusType;
  createdAt?: number;
  updatedAt?: number;
};

export type InterviewMessage = {
  _id?: string;
  sessionId: Id<"interviewSessions">;
  text: string;
  role: "USER" | "AI";
  type?: MessageStatusType;
  questionType?: QuestionType | null;
  questionNumber?: number;
  questionId?: Id<"interviewMessages">;
  timeLimit?: number;
  createdAt?: number;
};

export type MessageType = JobInsightMessage | InterviewMessage;

type AppContextType = {
  messages: MessageType[];
  jobMode: AppModeType | null;
  handleSwitchMode: (newMode: AppModeType) => void;
  setMessages: (messages: MessageType[]) => void;
};

export const AppContext = createContext<AppContextType>({
  messages: [],
  jobMode: null,
  handleSwitchMode: () => {},
  setMessages: () => {},
});

interface Props {
  children: ReactNode;
}

export const AppProvider = ({ children }: Props) => {
  const [jobMode, setJobMode] = useState<AppModeType>(AppMode.JOB_INSIGHT);
  const [messages, _setMessages] = useState<MessageType[]>([]);

  const handleSwitchMode = (newMode: AppModeType) => {
    setJobMode(newMode);
    switch (newMode) {
      case AppMode.JOB_INSIGHT:
        setMessages([]);
        break;
      case AppMode.INTERVIEW_SESSION:
        setMessages([]);
        break;
      default:
        console.warn(`Unknown mode: ${newMode}`);
        break;
    }
  };

  const setMessages = useCallback((messages: MessageType[]) => {
    _setMessages(messages);
  }, []);

  return (
    <AppContext.Provider
      value={{
        jobMode,
        messages,
        handleSwitchMode,
        setMessages,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }

  return context;
};
