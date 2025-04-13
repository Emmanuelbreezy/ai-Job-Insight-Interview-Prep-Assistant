"use client";

import { Id } from "@/convex/_generated/dataModel";
import {
  AppMode,
  AppModeType,
  InterviewStatus,
  InterviewStatusType,
  JobInsightStatusType,
  JobInsightsType,
} from "@/lib/constant";
import {
  createContext,
  ReactNode,
  useState,
  useCallback,
  useContext,
  SetStateAction,
} from "react";

export type MessageType = {
  _id?: string;
  userId: string;
  jobId: Id<"jobs">; // Changed from interviewId to jobId
  text: string;
  role: "USER" | "AI";
  type?: JobInsightsType | null; // Added type
  status?: JobInsightStatusType;
  createdAt?: number;
  updatedAt?: number; // Added updatedAt
};

type AppContextType = {
  messages: MessageType[];
  isGenerating: boolean;
  interviewStatus: InterviewStatusType | null;
  jobMode: AppModeType | null;
  handleSwitchMode: (newMode: AppModeType) => void;
  setMessages: (messages: MessageType[]) => void;
  updateMessages: (newMessage: MessageType) => void;
  setInterviewStatus: (status: InterviewStatusType) => void;
  setIsGenerating: React.Dispatch<SetStateAction<boolean>>;
};

export const AppContext = createContext<AppContextType>({
  messages: [],
  isGenerating: false,
  interviewStatus: null,
  jobMode: null,
  handleSwitchMode: () => {},
  setMessages: () => {},
  updateMessages: () => {},
  setInterviewStatus: () => {},
  setIsGenerating: () => {},
});

interface Props {
  children: ReactNode;
}

export const AppProvider = ({ children }: Props) => {
  const [jobMode, setJobMode] = useState<AppModeType>(AppMode.JOB_INSIGHT);

  const [messages, _setMessages] = useState<MessageType[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const [interviewStatus, setInterviewStatus] = useState<InterviewStatusType>(
    InterviewStatus.PROCESSING
  );

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

  const updateMessages = useCallback((newMessage: MessageType) => {
    _setMessages((prev) => [...prev, newMessage]);
  }, []);

  return (
    <AppContext.Provider
      value={{
        jobMode,
        messages,
        isGenerating,
        setIsGenerating,
        handleSwitchMode,
        setMessages,
        updateMessages,
        interviewStatus,
        setInterviewStatus,
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
