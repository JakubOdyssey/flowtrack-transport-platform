import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "FlowTrack Settings",
  description: "Platform and operations settings",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Settings" />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12 md:gap-6">
        <div className="xl:col-span-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">Company and Fleet Rules</h3>
          <div className="grid grid-cols-1 gap-4 mt-4">
            <input className="h-11 rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700" defaultValue="FlowTrack Logistics UK" />
            <input className="h-11 rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700" defaultValue="London Operations Center" />
            <input className="h-11 rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700" defaultValue="Max route hours: 9" />
            <input className="h-11 rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700" defaultValue="Default trailer payload limit: 28,000kg" />
          </div>
        </div>

        <div className="xl:col-span-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">Alerts and Geofence Policies</h3>
          <div className="grid grid-cols-1 gap-4 mt-4">
            <input className="h-11 rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700" defaultValue="Geofence breach threshold: 5 min" />
            <input className="h-11 rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700" defaultValue="Maintenance alert lead time: 7 days" />
            <input className="h-11 rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700" defaultValue="Driver violation escalation: immediate" />
            <input className="h-11 rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700" defaultValue="Fuel anomaly deviation: 9%" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">System Integrations</h3>
        <div className="grid grid-cols-1 gap-3 mt-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">Telematics API: Connected</div>
          <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">Fuel Card API: Connected</div>
          <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">Warehouse WMS API: Pending sync</div>
        </div>
        <div className="flex gap-3 mt-5">
          <Button>Save Settings</Button>
          <Button variant="outline">Run Compliance Validation</Button>
        </div>
      </div>
    </div>
  );
}
