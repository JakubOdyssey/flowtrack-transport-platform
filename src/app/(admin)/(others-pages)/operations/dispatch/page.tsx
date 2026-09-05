import DispatchBoard from "@/components/flowtrack/DispatchBoard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "FlowTrack Dispatch",
  description: "Dispatch management and driver updates",
};

export default function DispatchPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Operations Dispatch" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">Dispatch Control Board</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Assign new jobs, adjust route order, and send live updates to drivers.
        </p>
        <div className="mt-5">
          <DispatchBoard />
        </div>
      </div>
    </div>
  );
}
