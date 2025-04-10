"use client";
import Portfoilo from "@/components/Portfoilo";
import { Button } from "@/components/ui/button";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Monitor, Smartphone, Link2Icon } from "lucide-react";
import { useState } from "react";

const PortfolioPreview = () => {
  const { open, isMobile } = useSidebar();
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Browser-like header */}
      <div
        className="h-8 mb-4 w-full border-b border-gray-200 flex items-center justify-between px-4
       bg-white"
      >
        <div className="flex items-center gap-2">
          {/* Browser control buttons */}
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <div className="w-3 h-3 bg-green-500 rounded-full" />
          </div>
          {(!open || isMobile) && <SidebarTrigger />}
          <h1 className="text-sm font-medium text-zinc-700">
            Portfolio Preview
          </h1>
        </div>

        <div
          className="flex items-center border
         border-[rgb(232,232,232)] rounded-[6px] divide-x-[1px]"
        >
          <button
            onClick={() => setViewMode("mobile")}
            title="Mobile View"
            className="py-1.5 px-2 flex items-center justify-center
             hover:bg-gray-100
            disabled:opacity-50"
          >
            <Smartphone className="h-4 w-4 !stroke-[1px]" />
          </button>
          <button
            onClick={() => setViewMode("desktop")}
            title="Desktop View"
            className="py-1.5 px-2 flex items-center justify-center hover:bg-gray-100
            disabled:opacity-50"
          >
            <Monitor className="h-4 w-4 !stroke-[1px]" />
          </button>
          <button
            className="py-1.5 px-2 flex items-center justify-center hover:bg-gray-100
            disabled:opacity-50"
          >
            <Link2Icon className="h-4 w-4 !stroke-[1px]" />
          </button>
        </div>
      </div>

      {/* Portfolio container with responsive sizing */}
      <div
        className={cn(
          `w-full`,
          viewMode === "mobile" &&
            "max-w-[375px] mx-auto border rounded-lg shadow-lg"
        )}
      >
        <div className={viewMode === "mobile" ? "p-4" : ""}>
          <Portfoilo />
        </div>
      </div>
    </div>
  );
};

export default PortfolioPreview;
