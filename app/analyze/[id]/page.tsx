"use client";
import AnalysisArea from "@/components/AnalysisArea";
import React from "react";
import { useParams } from "next/navigation";

const Analysis = () => {
  const { id } = useParams();
  if (!id) {
    return <div>No file ID provided</div>;
  }
  return <AnalysisArea fileId={id?.toString()} />;
};

export default Analysis;
