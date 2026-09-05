import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { loads, trailers, vehicles } from "@/data/flowtrack";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "FlowTrack Trailers",
  description: "Trailer registry and utilization",
};

const statusColor = (status: string) => {
  if (status === "Loaded") {
    return "success" as const;
  }
  if (status === "Service") {
    return "error" as const;
  }
  return "light" as const;
};

interface TrailersPageProps {
  searchParams?: Promise<{ trailer?: string }>;
}

export default async function TrailersPage({ searchParams }: TrailersPageProps) {
  const params = (await searchParams) ?? {};
  const featured = trailers.find((trailer) => trailer.id === params.trailer) ?? trailers[0];
  const assignedVehicle = vehicles.find((vehicle) => vehicle.assignedTrailer === featured.id) ?? null;
  const currentLoad =
    loads.find((load) => load.assignedTrailer === featured.id && load.status !== "Delivered") ??
    loads.find((load) => load.assignedTrailer === featured.id) ??
    null;

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Fleet Trailers" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">Trailer Inventory</h3>
        <div className="mt-4 max-w-full overflow-x-auto">
          <div className="min-w-[920px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  {[
                    "Trailer",
                    "Type",
                    "Status",
                    "Current Load",
                    "Utilization",
                    "Inspection Due",
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
                {trailers.map((trailer) => (
                  <TableRow key={trailer.id}>
                    <TableCell className="px-4 py-3 text-theme-sm font-medium text-gray-800 dark:text-white/90">
                      <Link href={`/fleet/trailers?trailer=${trailer.id}`} className="text-brand-600 hover:text-brand-700 dark:text-brand-400">
                        {trailer.id}
                      </Link>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-300">{trailer.type}</TableCell>
                    <TableCell className="px-4 py-3"><Badge color={statusColor(trailer.status)}>{trailer.status}</Badge></TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-300">
                      {trailer.currentLoad !== "-" ? (
                        <Link href={`/loads/${trailer.currentLoad}`} className="text-brand-600 hover:text-brand-700 dark:text-brand-400">
                          {trailer.currentLoad}
                        </Link>
                      ) : (
                        trailer.currentLoad
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-300">{trailer.utilizationPercent}%</TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-300">{trailer.inspectionDue}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">Trailer Profile: {featured.id}</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <p className="text-sm text-gray-600 dark:text-gray-300">Type: {featured.type}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">Status: {featured.status}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">Utilization: {featured.utilizationPercent}%</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">Inspection due: {featured.inspectionDue}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Assigned vehicle: {assignedVehicle ? (
              <Link href={`/fleet/vehicles?vehicle=${assignedVehicle.id}`} className="text-brand-600 hover:text-brand-700 dark:text-brand-400">{assignedVehicle.id}</Link>
            ) : "Unassigned"}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Current load: {currentLoad ? (
              <Link href={`/loads/${currentLoad.id}`} className="text-brand-600 hover:text-brand-700 dark:text-brand-400">{currentLoad.id}</Link>
            ) : "Unassigned"}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Link href="/trailer-planner">
            <Button size="sm" variant="outline">Open Trailer Planner</Button>
          </Link>
          <Link href={assignedVehicle ? `/fleet/vehicles?vehicle=${assignedVehicle.id}` : "/fleet/vehicles"}>
            <Button size="sm" variant="outline">Open Assigned Vehicle</Button>
          </Link>
          <Link href={currentLoad ? `/loads/${currentLoad.id}` : "/loads"}>
            <Button size="sm">Open Current Load</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
