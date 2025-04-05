"use client";
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  MinusIcon,
  PlusIcon,
  RotateCcwIcon,
} from "lucide-react";
import { toast } from "sonner";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;
const INITIAL_SCALE = 0.57;

interface PdfRendererProps {
  url: string;
}

const PdfRenderer = ({ url }: PdfRendererProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(INITIAL_SCALE);

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
        className="h-14 w-full border-b border-zinc-200 flex items-center
       justify-between px-2"
      >
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousPage}
            disabled={pageNumber <= 1}
            className="py-1.5 px-2 flex items-center justify-center
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
            className="py-1.5 px-2 flex items-center justify-center
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

      {/* PDF Viewer */}
      <div
        className="flex-1 w-full max-w-[97%] mx-auto
      shadow-lg scrollbar max-h-screen overflow-y-auto"
      >
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex justify-center">
              <Loader2 className="my-24 h-6 w-6 animate-spin" />
            </div>
          }
          onLoadError={() => {
            toast.error("Error loading PDF");
          }}
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            width={800} // Adjust width for responsiveness
            renderTextLayer={true} // Enable text layer
            renderAnnotationLayer={true} // Enable annotation layer
            loading={
              <div className="flex justify-center">
                <Loader2 className="my-24 h-6 w-6 animate-spin" />
              </div>
            }
          />
        </Document>
      </div>
    </div>
  );
};

export default PdfRenderer;
