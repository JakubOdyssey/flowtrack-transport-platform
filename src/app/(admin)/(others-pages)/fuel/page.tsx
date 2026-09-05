import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Badge from "@/components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fuelLogs } from "@/data/flowtrack";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "FlowTrack Fuel",
  description: "Fuel monitoring and efficiency analytics",
};

export default function FuelPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Fuel" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">Fuel Transactions and Efficiency</h3>
        <div className="mt-4 max-w-full overflow-x-auto">
          <div className="min-w-[920px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  {[
                    "Date",
                    "Vehicle",
                    "Liters",
                    "Cost",
                    "Distance",
                    "L/100km",
                    "Signal",
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
                {fuelLogs.map((log) => (
                  <TableRow key={`${log.date}-${log.vehicle}`}>
                    <TableCell className="px-4 py-3 text-theme-sm text-gray-700 dark:text-gray-300">{log.date}</TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm text-gray-700 dark:text-gray-300">{log.vehicle}</TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm text-gray-700 dark:text-gray-300">{log.liters} L</TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm text-gray-700 dark:text-gray-300">${log.cost.toFixed(2)}</TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm text-gray-700 dark:text-gray-300">{log.km} km</TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm text-gray-700 dark:text-gray-300">{log.lPer100.toFixed(1)}</TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge color={log.lPer100 > 54 ? "warning" : "success"}>
                        {log.lPer100 > 54 ? "Review" : "Normal"}
                      </Badge>
                    </TableCell>
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
