"use client";
import { useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { usePdf } from "@/contexts/PdfContext";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

const PDFViewer = ({ pdfUrl }: { pdfUrl: string }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollToPage, currentPage } = usePdf();

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      scrollToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < numPages) {
      scrollToPage(currentPage + 1);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Navigation Controls */}
      <div className="flex justify-between items-center p-4 bg-gray-100 border-b">
        <button
          onClick={goToPreviousPage}
          disabled={currentPage <= 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Previous
        </button>

        <div className="flex items-center space-x-4">
          <span>
            Page {currentPage} of {numPages}
          </span>
        </div>

        <button
          onClick={goToNextPage}
          disabled={currentPage >= numPages}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Next
        </button>
      </div>

      {/* PDF Container with Scroll */}
      <div ref={containerRef} className="flex-1 overflow-auto bg-gray-50 p-4">
        <div className="flex items-center justify-center">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div className="text-center py-8">Loading PDF...</div>}
          >
            {Array.from(new Array(numPages), (el, index) => (
              <div
                key={`page_${index + 1}`}
                id={`page-${index + 1}`}
                className="mb-4 shadow-lg"
              >
                <Page
                  pageNumber={index + 1}
                  scale={1.3}
                  loading={
                    <div className="text-center py-4">Loading page...</div>
                  }
                />
              </div>
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
