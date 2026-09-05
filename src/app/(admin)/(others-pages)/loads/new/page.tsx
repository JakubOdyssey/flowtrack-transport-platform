import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import LoadCreationWizard from "@/components/flowtrack/loads/LoadCreationWizard";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "FlowTrack Create Load",
  description: "Enterprise load creation wizard",
};

export default function CreateLoadPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Create Load" />
      <LoadCreationWizard />
    </div>
  );
}
