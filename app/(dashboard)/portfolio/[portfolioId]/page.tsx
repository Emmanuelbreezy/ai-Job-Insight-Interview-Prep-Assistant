import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import PdfRenderer from "../../_components/PdfRenderer";

const Page = () => {
  return (
    <div className="flex-1 bg-white justify-between flex flex-col h-screen">
      <div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-2">
        {/* Left sidebar & main wrapper */}
        <div className="flex-1 xl:flex px-2 py-2">
          <div>
            <SidebarTrigger />
          </div>
          {/* Main area */}
          {/* <PortfolioWrapper isSubscribed={plan.isSubscribed} fileId={file.id} /> */}
        </div>

        <div className="shrink-1 flex-[0.65] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
          <PdfRenderer url="/EmmanuelUResume.pdf" />
        </div>
      </div>
    </div>
  );
};

export default Page;
