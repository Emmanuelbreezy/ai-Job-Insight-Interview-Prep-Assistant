import React from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import ChatView from "../_components/ChatLeftPanel";
import JobView from "../_components/RightSidePanel";
import { JobResizablePanel } from "../_components/JobResizablePanel";

const Page = async ({
  params,
}: {
  params: {
    jobId: string;
  };
}) => {
  const { jobId } = params;

  return (
    <div
      className="flex-1 bg-white justify-between flex 
      flex-col h-screen 
    overflow-hidden"
    >
      <div className="mx-auto w-full max-w-8xl grow lg:flex">
        <JobResizablePanel jobId={jobId} />
      </div>
    </div>
  );
};

export default Page;
