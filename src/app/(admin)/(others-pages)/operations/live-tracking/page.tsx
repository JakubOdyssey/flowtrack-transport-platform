import LiveTrackingMap from "@/components/flowtrack/LiveTrackingMap";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "FlowTrack Live Tracking",
  description: "Real-time fleet map with filters and popups",
};

export default function LiveTrackingPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Operations Live Tracking" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">Fleet Tracking Map</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Vehicle markers, trailer markers, driver status, ETA, route lines, clustering, and geofence alerts.
        </p>
        <div className="mt-5">
          <LiveTrackingMap />
        </div>
      </div>
    </div>
  );
}
