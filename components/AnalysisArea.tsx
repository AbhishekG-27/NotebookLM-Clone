"use client";
import { usePdf } from "@/contexts/PdfContext";
import React, { useEffect, useState } from "react";
import PDFViewer from "./PdfViewer";
import ChatArea from "./ChatArea";

const AnalysisArea = ({ fileId }: { fileId: string }) => {
  const { selectedFile } = usePdf();
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  // Create preview URL when file is selected
  useEffect(() => {
    if (selectedFile && selectedFile.type === "application/pdf") {
      const url = URL.createObjectURL(selectedFile);
      setPdfPreviewUrl(url);

      // Clean up previous URL
      return () => {
        if (pdfPreviewUrl) {
          URL.revokeObjectURL(pdfPreviewUrl);
        }
      };
    } else {
      setPdfPreviewUrl(null);
    }
  }, []);

  return (
    <div className="flex w-full h-screen overflow-y-hidden">
      {fileId ? (
        <div className="flex w-full h-screen">
          <div className="w-1/2">
            <ChatArea file_id={fileId} />
          </div>
          <div className="w-1/2">
            <div className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
              <div className="p-4 h-screen">
                {pdfPreviewUrl && <PDFViewer pdfUrl={pdfPreviewUrl} />}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>No file uploaded</div>
      )}
    </div>
  );
};

export default AnalysisArea;
