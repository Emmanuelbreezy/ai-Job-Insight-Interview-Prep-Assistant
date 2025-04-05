import { SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";
import PdfRenderer from "../../_components/PdfRenderer";

const Page = () => {
  return (
    <div className="flex-1 bg-white justify-between flex flex-col h-screen">
      <div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-2">
        {/* Left sidebar & main wrapper */}
        <div className="flex-1 xl:flex">
          <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
            <div>
              <SidebarTrigger />
            </div>
            {/* Main area */}
            {/* <PortfolioWrapper isSubscribed={plan.isSubscribed} fileId={file.id} /> */}
          </div>
        </div>

        <div className="shrink-1 flex-[0.65] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
          <PdfRenderer url="/EmmanuelUResume.pdf" />
        </div>
      </div>
    </div>
  );
};

export default Page;
