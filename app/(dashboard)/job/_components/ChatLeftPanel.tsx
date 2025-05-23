"use client";
import React from "react";
import ChatComponent from "@/components/ChatComponent";
import { useUser } from "@clerk/nextjs";
import { useAppContext } from "@/context/AppProvider";
import { AppMode } from "@/lib/constant";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

const ChatLeftPanel = (props: { jobId: string }) => {
  const { user } = useUser();
  const { jobMode } = useAppContext();
  const { open, isMobile } = useSidebar();

  const userId = user?.id || null;
  const userName = user?.firstName || null;

  return (
    <div className="w-full h-screen flex flex-col">
      <div
        className="h-10 w-full border-b
       border-gray-200 pt-1 flex items-center justify-between
       px-2"
      >
        <div className="flex items-center gap-2">
          {(!open || isMobile) && <SidebarTrigger />}
          <h1 className="font-semibold pt-1">
            {jobMode === AppMode.JOB_INSIGHT
              ? "Job Insight Mode"
              : "Interview Session"}
          </h1>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatComponent
          jobId={props.jobId}
          userId={userId}
          userName={userName}
        />
      </div>
    </div>
  );
};

export default ChatLeftPanel;
