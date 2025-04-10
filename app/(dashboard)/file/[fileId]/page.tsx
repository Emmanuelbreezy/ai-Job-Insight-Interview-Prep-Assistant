import React from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import PortfolioPreview from "../../_components/PortfolioPreview";
import ChatRenderer from "../../_components/ChatRenderer";
import { Id } from "@/convex/_generated/dataModel";

interface PageProps {
  params: {
    fileId: Id<"files">;
  };
}

const Page = async ({ params }: PageProps) => {
  const { fileId } = await params;

  return (
    <div
      className="flex-1 bg-white justify-between flex 
      flex-col h-screen 
    overflow-hidden"
    >
      <div className="mx-auto w-full max-w-8xl grow lg:flex">
        {/* Left sidebar & main wrapper */}
        {/* <PortfolioPreview isSubscribed={plan.isSubscribed} fileId={file.id} /> */}
        {/* <div className="flex-1 xl:flex px-2 py-2">
          <PortfolioPreview />
        </div> */}

        {/* <div className="shrink-1 flex-[0.65] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
          <PdfRenderer url="/EmmanuelUResume.pdf" />
        </div> */}

        <ResizablePanelGroup direction="horizontal" className="w-full h-full">
          {/* Right Panel (PDF Renderer) */}
          <ResizablePanel
            defaultSize={30}
            className=""
            collapsible
            collapsedSize={0}
          >
            {/* <PdfRenderer url="/EmmanuelUResume.pdf" /> */}
            <ChatRenderer fileId={fileId} />
          </ResizablePanel>

          {/* Resizable Handle */}
          <ResizableHandle withHandle />

          {/* Left Panel (Portfolio Preview) */}
          <ResizablePanel
            defaultSize={70}
            className="pt-2 border-l border-gray-200"
            collapsible
            collapsedSize={0}
          >
            <PortfolioPreview />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Page;
