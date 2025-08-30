"use client";
import FileUploader from "@/components/FileUploader";
import { usePdf } from "@/contexts/PdfContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const { selectedFile } = usePdf();
  const router = useRouter();

  const handlePdfUpload = async () => {
    setIsLoading(true);
    if (!selectedFile) {
      console.error("No file selected");
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/upload-pdf`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response) {
        console.error("Failed to upload PDF");
        return;
      }

      const { file_id } = await response.json();
      router.push(`/analyze/${file_id}`); // Navigate to analysis page with file_id
    } catch (error) {
      console.error("Error uploading PDF:", error);
      setIsLoading(false);
    }
  };
  return (
    <div className="w-full h-screen flex items-center justify-center">
      {!isLoading ? (
        <div className="flex flex-col gap-3 items-center justify-center">
          <FileUploader />
          <button
            onClick={handlePdfUpload}
            disabled={!selectedFile}
            className="primary-button"
          >
            Upload
          </button>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
