import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import LineChartOne from "@/components/charts/line/LineChartOne";
import Badge from "@/components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { monthlyAnalytics } from "@/data/flowtrack";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "FlowTrack Analytics",
  description: "Fleet, driver, and maintenance analytics",
};

export default function AnalyticsPage() {
  const latest = monthlyAnalytics[monthlyAnalytics.length - 1];

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Analytics" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 md:gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500">Fleet Utilization</p>
          <p className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white/90">{latest.utilization}%</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500">Vehicle Uptime</p>
          <p className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white/90">{latest.uptime}%</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500">Fuel Efficiency</p>
          <p className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white/90">{latest.fuelEfficiency} km/L</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500">Trailer Utilization</p>
          <p className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white/90">{latest.trailerUtilization}%</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">Monthly Performance</h3>
          <Badge color="info">Monthly reports</Badge>
        </div>
        <LineChartOne />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">KPI Breakdown</h3>
        <div className="mt-4 max-w-full overflow-x-auto">
          <div className="min-w-[980px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  {[
                    "Month",
                    "Fleet Utilization",
                    "Vehicle Uptime",
                    "Fuel Efficiency",
                    "Trailer Utilization",
                    "Maintenance Cost",
                  ].map((header) => (
                    <TableCell
                      key={header}
                      isHeader
                      className="px-4 py-3 text-theme-xs font-medium text-gray-500 text-start dark:text-gray-400"
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {monthlyAnalytics.map((item) => (
                  <TableRow key={item.month}>
                    <TableCell className="px-4 py-3 text-theme-sm font-medium text-gray-800 dark:text-white/90">{item.month}</TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-300">{item.utilization}%</TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-300">{item.uptime}%</TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-300">{item.fuelEfficiency} km/L</TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-300">{item.trailerUtilization}%</TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-300">${item.maintenanceCost.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
