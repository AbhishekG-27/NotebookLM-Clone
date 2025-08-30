"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type PdfContextType = {
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  scrollToPage: (pageNumber: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
};

const PdfContext = createContext<PdfContextType | undefined>(undefined);

export const PdfProvider = ({ children }: { children: ReactNode }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const scrollToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    const pageElement = document.getElementById(`page-${pageNumber}`);
    pageElement?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const value = {
    selectedFile,
    setSelectedFile,
    scrollToPage,
    currentPage,
    setCurrentPage,
  };

  return <PdfContext.Provider value={value}>{children}</PdfContext.Provider>;
};

export const usePdf = () => {
  const context = useContext(PdfContext);
  if (context === undefined) {
    throw new Error("usePdf must be used within a PdfProvider");
  }
  return context;
};
