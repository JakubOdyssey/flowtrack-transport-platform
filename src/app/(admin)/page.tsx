import type { Metadata } from "next";
import React from "react";
import Badge from "@/components/ui/badge/Badge";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DashboardEnglandMap from "@/components/flowtrack/DashboardEnglandMap";
import {
  dashboardKpis,
  loads,
  maintenanceAlerts,
  vehicles,
} from "@/data/flowtrack";

export const metadata: Metadata = {
  title: "FlowTrack Dashboard",
  description: "FlowTrack enterprise transportation management dashboard",
};

const statusColor = (status: string) => {
  if (status === "In Transit" || status === "Delivered") {
    return "success" as const;
  }
  if (status === "Dispatched" || status === "Loading") {
    return "warning" as const;
  }
  if (status === "Delayed" || status === "Maintenance") {
    return "error" as const;
  }
  return "light" as const;
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="FlowTrack Dashboard" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
        {dashboardKpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">{kpi.label}</p>
            <div className="flex items-end justify-between mt-3">
              <h4 className="font-bold text-gray-800 text-title-sm dark:text-white/90">{kpi.value}</h4>
              <Badge color={kpi.trend === "up" ? "success" : "warning"}>{kpi.delta}</Badge>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 xl:col-span-8 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">Live Fleet Map - England</h3>
            <Badge color="info">Road disruptions and truck positions</Badge>
          </div>
          <DashboardEnglandMap />
        </div>

        <div className="col-span-12 xl:col-span-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">Maintenance Alerts</h3>
          <div className="mt-4 space-y-3">
            {maintenanceAlerts.map((alert) => (
              <div key={alert.item} className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-theme-sm text-gray-800 dark:text-white/90">{alert.item}</p>
                  <Badge color={alert.severity === "High" ? "error" : "warning"}>{alert.severity}</Badge>
                </div>
                <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">{alert.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 xl:col-span-7 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">Dispatch Board</h3>
            <Badge color="primary">Live</Badge>
          </div>
          <div className="space-y-3">
            {loads.map((load) => (
              <div key={load.id} className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-theme-sm text-gray-800 dark:text-white/90">
                    {load.id} • {load.customer}
                  </p>
                  <Badge color={statusColor(load.status)}>{load.status}</Badge>
                </div>
                <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">
                  {load.pickup} to {load.delivery} • ETA {load.eta}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">Vehicle Status</h3>
          <div className="mt-4 space-y-3">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-theme-sm text-gray-800 dark:text-white/90">{vehicle.id}</p>
                  <Badge color={statusColor(vehicle.status)}>{vehicle.status}</Badge>
                </div>
                <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">
                  {vehicle.location} • Fuel {vehicle.fuelPercent}%
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
