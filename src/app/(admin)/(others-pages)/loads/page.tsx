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
import { enterpriseLoads } from "@/data/load-management";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "FlowTrack Loads",
  description: "Enterprise freight lifecycle and load operations",
};

const statusColor = (status: (typeof enterpriseLoads)[number]["status"]) => {
  if (status === "Delivered" || status === "In Transit") {
    return "success" as const;
  }
  if (status === "Loading" || status === "Assigned") {
    return "warning" as const;
  }
  if (status === "Delayed") {
    return "error" as const;
  }
  return "light" as const;
};

const priorityColor = (priority: (typeof enterpriseLoads)[number]["priority"]) => {
  if (priority === "Critical") {
    return "error" as const;
  }
  if (priority === "High") {
    return "warning" as const;
  }
  if (priority === "Medium") {
    return "primary" as const;
  }
  return "light" as const;
};

interface LoadsPageProps {
  searchParams?: Promise<{ customer?: string }>;
}

export default async function LoadsPage({ searchParams }: LoadsPageProps) {
  const params = (await searchParams) ?? {};
  const filteredLoads = params.customer
    ? enterpriseLoads.filter((load) => load.customer.toLowerCase() === params.customer?.toLowerCase())
    : enterpriseLoads;

  const totalWeight = filteredLoads.reduce((sum, load) => sum + load.weightKg, 0);
  const criticalCount = filteredLoads.filter((load) => load.priority === "Critical").length;
  const inTransitCount = filteredLoads.filter((load) => load.status === "In Transit").length;

  return (
    <div className="min-w-0 space-y-6">
      <PageBreadcrumb pageTitle="Loads" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Open Loads</p>
          <p className="mt-3 text-title-sm font-semibold text-gray-800 dark:text-white/90">{enterpriseLoads.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">In Transit</p>
          <p className="mt-3 text-title-sm font-semibold text-gray-800 dark:text-white/90">{inTransitCount}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Critical Priority</p>
          <p className="mt-3 text-title-sm font-semibold text-gray-800 dark:text-white/90">{criticalCount}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Weight</p>
          <p className="mt-3 text-title-sm font-semibold text-gray-800 dark:text-white/90">{Math.round(totalWeight).toLocaleString()} kg</p>
        </div>
      </div>

      <div className="hidden min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 xl:block">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">Load Management</h3>
          <div className="flex flex-wrap items-center gap-2">
            {params.customer && (
              <Link href="/loads">
                <Button size="sm" variant="outline">Clear Customer Filter</Button>
              </Link>
            )}
            <Link href="/loads/new">
              <Button size="sm">Create Load</Button>
            </Link>
          </div>
        </div>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Central business object linking customer, cargo, route, and assigned resources.
        </p>
        {params.customer && (
          <p className="mt-1 text-theme-xs text-brand-600 dark:text-brand-400">Filtered by customer: {params.customer}</p>
        )}

        <div className="mt-4 w-full overflow-x-auto">
          <div className="w-full">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  {[
                    "Load ID",
                    "Customer",
                    "Pickup",
                    "Delivery",
                    "Driver",
                    "Vehicle",
                    "Trailer",
                    "Pallet Count",
                    "Weight",
                    "Status",
                    "Priority",
                    "ETA",
                    "Actions",
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
                {filteredLoads.map((load) => (
                  <TableRow key={load.id}>
                    <TableCell className="px-4 py-3 text-theme-sm font-medium text-gray-800 dark:text-white/90">{load.id}</TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{load.customer}</TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{load.pickup}</TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{load.delivery}</TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{load.driver}</TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{load.vehicle}</TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{load.trailer}</TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{load.palletCount}</TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{load.weightKg.toLocaleString()} kg</TableCell>
                    <TableCell className="px-4 py-3"><Badge color={statusColor(load.status)}>{load.status}</Badge></TableCell>
                    <TableCell className="px-4 py-3"><Badge color={priorityColor(load.priority)}>{load.priority}</Badge></TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{load.eta}</TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/loads/${load.id}`}>
                          <Button size="sm" variant="outline">Open</Button>
                        </Link>
                        <Link href="/loads/new">
                          <Button size="sm" variant="outline">Clone</Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:hidden md:gap-6">
        {filteredLoads.map((load) => (
          <div key={`card-${load.id}`} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{load.id}</p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge color={statusColor(load.status)}>{load.status}</Badge>
                <Badge color={priorityColor(load.priority)}>{load.priority}</Badge>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <p className="text-theme-xs text-gray-600 dark:text-gray-300"><span className="text-gray-500">Customer:</span> {load.customer}</p>
              <p className="text-theme-xs text-gray-600 dark:text-gray-300"><span className="text-gray-500">Driver:</span> {load.driver}</p>
              <p className="text-theme-xs text-gray-600 dark:text-gray-300"><span className="text-gray-500">Vehicle:</span> {load.vehicle}</p>
              <p className="text-theme-xs text-gray-600 dark:text-gray-300"><span className="text-gray-500">Trailer:</span> {load.trailer}</p>
              <p className="text-theme-xs text-gray-600 dark:text-gray-300"><span className="text-gray-500">Pickup:</span> {load.pickup}</p>
              <p className="text-theme-xs text-gray-600 dark:text-gray-300"><span className="text-gray-500">Delivery:</span> {load.delivery}</p>
              <p className="text-theme-xs text-gray-600 dark:text-gray-300"><span className="text-gray-500">Pallets:</span> {load.palletCount}</p>
              <p className="text-theme-xs text-gray-600 dark:text-gray-300"><span className="text-gray-500">Weight:</span> {load.weightKg.toLocaleString()} kg</p>
              <p className="text-theme-xs text-gray-600 dark:text-gray-300"><span className="text-gray-500">ETA:</span> {load.eta}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={`/loads/${load.id}`}>
                <Button size="sm" variant="outline">Open</Button>
              </Link>
              <Link href="/loads/new">
                <Button size="sm" variant="outline">Clone</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
