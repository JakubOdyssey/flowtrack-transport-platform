import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TrailerPlannerBoard from "@/components/flowtrack/TrailerPlannerBoard";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "FlowTrack Trailer Planner",
  description: "Semi trailer pallet loading and axle planning",
};

export default function TrailerPlannerPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Trailer Planner" />
      <TrailerPlannerBoard />
    </div>
  );
}
