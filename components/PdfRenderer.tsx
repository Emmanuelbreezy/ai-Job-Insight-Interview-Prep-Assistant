"use client";

import { Document, Page, pdfjs } from "react-pdf";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

interface PdfRendererProps {
  url: string;
  pageNumber: number;
  scale: number;
  onDocumentLoadSuccess: ({ numPages }: { numPages: number }) => void;
}

const PdfRenderer = ({
  url,
  pageNumber,
  scale,
  onDocumentLoadSuccess,
}: PdfRendererProps) => {
  return (
    <div
      className="flex-1 w-full max-w-[97%] mx-auto shadow-lg scrollbar 
    max-h-screen overflow-y-auto"
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
  );
};

export default PdfRenderer;
