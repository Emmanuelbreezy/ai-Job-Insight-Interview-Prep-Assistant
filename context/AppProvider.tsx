"use client";

import { Id } from "@/convex/_generated/dataModel";
import {
  createContext,
  ReactNode,
  useState,
  useCallback,
  useContext,
} from "react";

export type MessageType = {
  _id?: string;
  userId: string;
  fileId: Id<"files">;
  text: string;
  role: "USER" | "AI";
  createdAt: number;
};

type AppContextType = {
  messages: MessageType[];
  isLoading: boolean;
  setMessages: (messages: MessageType[]) => void;
  updateMessages: (newMessage: MessageType) => void;
};

export const AppContext = createContext<AppContextType>({
  messages: [],
  isLoading: false,
  setMessages: () => {},
  updateMessages: () => {},
});

interface Props {
  children: ReactNode;
}

export const AppProvider = ({ children }: Props) => {
  const [messages, _setMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const setMessages = useCallback((messages: MessageType[]) => {
    _setMessages(messages);
  }, []);

  const updateMessages = useCallback((newMessage: MessageType) => {
    _setMessages((prev) => [...prev, newMessage]);
  }, []);

  return (
    <AppContext.Provider
      value={{
        messages,
        isLoading,
        setMessages,
        updateMessages,
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
