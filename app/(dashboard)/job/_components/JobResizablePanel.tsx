"use client";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useSidebar } from "@/components/ui/sidebar";
import ChatLeftPanel from "./ChatLeftPanel";
import RightSidePanel from "./RightSidePanel";

interface JobResizablePanelProps {
  jobId: string;
}

export const JobResizablePanel = ({ jobId }: JobResizablePanelProps) => {
  const { isMobile } = useSidebar();

  return (
    <ResizablePanelGroup
      direction={isMobile ? "vertical" : "horizontal"}
      className="w-full h-full"
    >
      <ResizablePanel
        defaultSize={isMobile ? 55 : 55}
        collapsible
        collapsedSize={0}
      >
        <ChatLeftPanel jobId={jobId} />
      </ResizablePanel>

      {/* Resizable Handle */}
      <ResizableHandle withHandle />

      <ResizablePanel
        defaultSize={isMobile ? 45 : 45}
        className={
          isMobile
            ? "pt-2 border-t border-gray-200"
            : "pt-2 border-l border-gray-200"
        }
        collapsible
        collapsedSize={0}
      >
        <RightSidePanel jobId={jobId} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
