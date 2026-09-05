import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RoutePlannerBoard from "@/components/flowtrack/RoutePlannerBoard";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "FlowTrack Route Planning",
  description: "Interactive route planning and optimization",
};

interface RoutePlanningPageProps {
  searchParams?: Promise<{ driver?: string; vehicle?: string; trailer?: string; loadId?: string }>;
}

export default async function RoutePlanningPage({ searchParams }: RoutePlanningPageProps) {
  const params = (await searchParams) ?? {};

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Operations Route Planning" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">Interactive Route Planner</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Add stops, optimize order, calculate ETA, estimate fuel, and assign driver and trailer.
        </p>
        <div className="mt-5">
          <RoutePlannerBoard
            initialDriverId={params.driver}
            initialVehicleId={params.vehicle}
            initialTrailerId={params.trailer}
            initialLoadId={params.loadId}
          />
        </div>
      </div>
    </div>
  );
}
