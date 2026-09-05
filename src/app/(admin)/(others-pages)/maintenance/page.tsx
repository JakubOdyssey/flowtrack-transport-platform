import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Badge from "@/components/ui/badge/Badge";
import { maintenanceAlerts, vehicles } from "@/data/flowtrack";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "FlowTrack Maintenance",
  description: "Service planning, repairs, and inspection reporting",
};

const upcoming = [
  { id: "SV-401", item: "VH-2041", service: "Oil and filters", date: "2026-08-09" },
  { id: "SV-408", item: "TRL-745", service: "Brake check", date: "2026-08-11" },
  { id: "SV-415", item: "VH-1886", service: "Tachograph calibration", date: "2026-08-14" },
];

const completed = [
  { id: "SV-392", item: "VH-1930", service: "Cooling system repair", completedOn: "2026-07-29" },
  { id: "SV-389", item: "TRL-709", service: "Door lock replacement", completedOn: "2026-07-24" },
];

export default function MaintenancePage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Maintenance" />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12 md:gap-6">
        <div className="xl:col-span-7 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">Upcoming Services</h3>
          <div className="mt-4 space-y-3">
            {upcoming.map((item) => (
              <div key={item.id} className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-theme-sm text-gray-800 dark:text-white/90">{item.id} • {item.item}</p>
                  <Badge color="warning">Scheduled {item.date}</Badge>
                </div>
                <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">{item.service}</p>
              </div>
            ))}
          </div>

          <h3 className="mt-6 text-base font-medium text-gray-800 dark:text-white/90">Completed Services</h3>
          <div className="mt-4 space-y-3">
            {completed.map((item) => (
              <div key={item.id} className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-theme-sm text-gray-800 dark:text-white/90">{item.id} • {item.item}</p>
                  <Badge color="success">Completed {item.completedOn}</Badge>
                </div>
                <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">{item.service}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-5 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">Inspection Reports</h3>
            <div className="mt-4 space-y-2">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-2 dark:border-gray-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{vehicle.id}</p>
                  <p className="text-theme-xs text-gray-500 dark:text-gray-400">{vehicle.lastInspection}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">Alerts</h3>
            <div className="mt-4 space-y-3">
              {maintenanceAlerts.map((alert) => (
                <div key={alert.item} className="rounded-xl border border-error-200 bg-error-50 p-3 dark:border-error-500/20 dark:bg-error-500/10">
                  <p className="text-sm font-medium text-error-700 dark:text-error-300">{alert.item}</p>
                  <p className="mt-1 text-theme-xs text-error-600 dark:text-error-200">{alert.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
