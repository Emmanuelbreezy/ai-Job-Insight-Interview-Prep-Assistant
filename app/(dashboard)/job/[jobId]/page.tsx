import React from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import ChatView from "../_components/ChatView";
import JobView from "../_components/JobView";

const Page = async ({
  params,
}: {
  params: {
    jobId: string;
  };
}) => {
  const { jobId } = await params;

  return (
    <div
      className="flex-1 bg-white justify-between flex 
      flex-col h-screen 
    overflow-hidden"
    >
      <div className="mx-auto w-full max-w-8xl grow lg:flex">
        <ResizablePanelGroup direction="horizontal" className="w-full h-full">
          {/* Right Panel*/}
          <ResizablePanel defaultSize={55} collapsible collapsedSize={0}>
            <ChatView jobId={jobId} />
          </ResizablePanel>

          {/* Resizable Handle */}
          <ResizableHandle withHandle />

          <ResizablePanel
            defaultSize={45}
            className="pt-2 border-l border-gray-200"
            collapsible
            collapsedSize={0}
          >
            <JobView jobId={jobId} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Page;
