import React from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import ChatRenderer from "../../job/_components/ChatView";
import { Id } from "@/convex/_generated/dataModel";

interface PageProps {
  params: {
    interviewId: Id<"interview">;
  };
}

const Page = async ({ params }: PageProps) => {
  const { interviewId } = await params;

  return (
    <div
      className="flex-1 bg-white justify-between flex 
      flex-col h-screen 
    overflow-hidden"
    >
      <div className="mx-auto w-full max-w-8xl grow lg:flex">
        <ResizablePanelGroup direction="horizontal" className="w-full h-full">
          {/* Right Panel*/}
          <ResizablePanel
            defaultSize={60}
            className=""
            collapsible
            collapsedSize={0}
          >
            <ChatRenderer interviewId={interviewId} />
          </ResizablePanel>

          {/* Resizable Handle */}
          <ResizableHandle withHandle />

          <ResizablePanel
            defaultSize={40}
            className="pt-2 border-l border-gray-200"
            collapsible
            collapsedSize={0}
          ></ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Page;
