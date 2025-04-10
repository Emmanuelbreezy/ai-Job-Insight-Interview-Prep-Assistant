"use client";
import "promise.withresolvers";
import { useState } from "react";
import { Document, Page } from "react-pdf";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  MinusIcon,
  PlusIcon,
  RotateCcwIcon,
  FileText,
  MessageSquare,
  MessagesSquare,
} from "lucide-react";
import { toast } from "sonner";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import PdfRenderer from "@/components/PdfRenderer";
import { cn } from "@/lib/utils";

const INITIAL_SCALE = 0.57;

interface PdfRendererProps {
  url: string;
}

const PdfChatRenderer = ({ url }: PdfRendererProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(INITIAL_SCALE);
  const [activeTab, setActiveTab] = useState<"PDF" | "CHAT">("PDF");

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const goToPreviousPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3)); // Max zoom 3x
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5)); // Min zoom 0.5x
  };

  const resetZoom = () => {
    setScale(INITIAL_SCALE); // Reset to the initial scale
  };

  return (
    <div
      className="w-full rounded-md h-screen flex flex-col items-center 
    overflow-hidden"
    >
      {/* Controls */}
      <div
        className="h-10 w-full border-b border-zinc-200 flex items-center
       justify-between px-2"
      >
        {/* <h1>Kara_Resume(2).pdf</h1> */}
        <div
          className="tab--list flex items-center gap-1 bg-gray-200
        rounded-full
        "
        >
          <button
            onClick={() => setActiveTab("PDF")}
            className={`flex items-center gap-1 p-1.5 px-2 rounded-full 
              transition-colors text-xs ${
                activeTab === "PDF" && "bg-black/80 text-white"
              }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Resume</span>
          </button>
          <button
            onClick={() => setActiveTab("CHAT")}
            className={`flex items-center gap-1 p-1.5 px-2 rounded-full 
              transition-colors text-xs ${
                activeTab === "CHAT" && "bg-black/80 text-white"
              }`}
          >
            <MessagesSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>
        </div>

        <div
          className={cn(
            `flex items-center pdf-control transition-opacity duration-300`,
            activeTab === "CHAT"
              ? "opacity-0 h-0 overflow-hidden"
              : "opacity-100 h-auto"
          )}
        >
          <div className="flex items-center gap-1.5 mr-1">
            <button
              onClick={goToPreviousPage}
              disabled={pageNumber <= 1}
              className="py-1.5 px-px flex items-center justify-center
             hover:bg-gray-100 rounded-sm
            disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 !stroke-[1px]" />
            </button>
            <span className="text-sm">
              {pageNumber} of {numPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              className="py-1.5 px-px flex items-center justify-center
             hover:bg-gray-100 rounded-sm

            disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4 !stroke-[1px]" />
            </button>
          </div>
          {/* {Zoom Tools} */}
          <div
            className="flex items-center border
         border-[rgb(232,232,232)] rounded-[6px] divide-x-[1px]"
          >
            <button
              onClick={zoomOut}
              title="Zoom Out"
              disabled={scale <= 0.5}
              className="py-1.5 px-2 flex items-center justify-center hover:bg-gray-100
            disabled:opacity-50"
            >
              <MinusIcon className="h-4 w-4 !stroke-[1px]" />
            </button>
            <button
              onClick={resetZoom}
              title="Reset Zoom"
              className="py-1.5 px-2 flex items-center justify-center hover:bg-gray-100
            disabled:opacity-50"
            >
              <RotateCcwIcon className="h-4 w-4 !stroke-[1px]" />
            </button>
            <button
              onClick={zoomIn}
              title="Zoom In"
              disabled={scale >= 3}
              className="py-1.5 px-2 flex items-center justify-center hover:bg-gray-100
            disabled:opacity-50"
            >
              <PlusIcon className="h-4 w-4 !stroke-[1px]" />
            </button>
          </div>
        </div>
      </div>

      {activeTab === "CHAT" ? (
        <>Chat</>
      ) : (
        <PdfRenderer
          url={url}
          pageNumber={pageNumber}
          scale={scale}
          onDocumentLoadSuccess={onDocumentLoadSuccess}
        />
      )}
    </div>
  );
};

export default PdfChatRenderer;
