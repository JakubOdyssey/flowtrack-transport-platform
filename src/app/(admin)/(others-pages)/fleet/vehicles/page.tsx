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
import { drivers, loads, vehicles } from "@/data/flowtrack";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "FlowTrack Vehicles",
  description: "Fleet vehicles and profile metrics",
};

const statusColor = (status: string) => {
  if (status === "In Transit") {
    return "success" as const;
  }
  if (status === "Loading") {
    return "warning" as const;
  }
  if (status === "Maintenance") {
    return "error" as const;
  }
  return "light" as const;
};

interface VehiclesPageProps {
  searchParams?: Promise<{ vehicle?: string }>;
}

export default async function VehiclesPage({ searchParams }: VehiclesPageProps) {
  const params = (await searchParams) ?? {};
  const driversMap: Record<string, string> = Object.fromEntries(
    drivers.map((driver) => [driver.name, driver.id])
  );
  const featured = vehicles.find((vehicle) => vehicle.id === params.vehicle) ?? vehicles[0];
  const activeLoad =
    loads.find((load) => load.assignedVehicle === featured.id && load.status !== "Delivered") ??
    loads.find((load) => load.assignedVehicle === featured.id) ??
    null;

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Fleet Vehicles" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">Vehicle Registry</h3>
          <Badge color="info">Live telemetry enabled</Badge>
        </div>
        <div className="mt-4 max-w-full overflow-x-auto">
          <div className="min-w-[1220px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  {[
                    "Vehicle",
                    "Status",
                    "Live Location",
                    "Assigned Trailer",
                    "Assigned Driver",
                    "Mileage",
                    "Fuel",
                    "Insurance",
                    "Last Inspection",
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
                {vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="px-4 py-3 text-theme-sm text-gray-800 dark:text-white/90">
                      <Link href={`/fleet/vehicles?vehicle=${vehicle.id}`} className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
                        {vehicle.id}
                      </Link>
                      <p className="text-theme-xs text-gray-500">{vehicle.model}</p>
                      <p className="text-theme-xs text-gray-500">{vehicle.plate}</p>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge color={statusColor(vehicle.status)}>{vehicle.status}</Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-300">{vehicle.location}</TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-300">
                      <Link href={`/fleet/trailers?trailer=${vehicle.assignedTrailer}`} className="text-brand-600 hover:text-brand-700 dark:text-brand-400">
                        {vehicle.assignedTrailer}
                      </Link>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-300">
                      <Link href={`/fleet/drivers?driver=${driversMap[vehicle.assignedDriver] ?? ""}`} className="text-brand-600 hover:text-brand-700 dark:text-brand-400">
                        {vehicle.assignedDriver}
                      </Link>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-300">{vehicle.mileageKm.toLocaleString()} km</TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-300">{vehicle.fuelPercent}%</TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-300">{vehicle.insuranceExpiry}</TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-300">{vehicle.lastInspection}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 md:gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">Vehicle Profile: {featured.id}</h3>
          <div className="grid grid-cols-1 gap-3 mt-4 sm:grid-cols-2">
            <p className="text-sm text-gray-600 dark:text-gray-300">Assigned trailer: <Link href={`/fleet/trailers?trailer=${featured.assignedTrailer}`} className="text-brand-600 hover:text-brand-700 dark:text-brand-400">{featured.assignedTrailer}</Link></p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Assigned driver: <Link href={`/fleet/drivers?driver=${driversMap[featured.assignedDriver] ?? ""}`} className="text-brand-600 hover:text-brand-700 dark:text-brand-400">{featured.assignedDriver}</Link></p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Current live location: {featured.location}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Fuel level: {featured.fuelPercent}%</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Next service: {featured.nextServiceKm.toLocaleString()} km</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Insurance expiry: {featured.insuranceExpiry}</p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Link href={`/fleet/drivers?driver=${driversMap[featured.assignedDriver] ?? ""}`}>
              <Button size="sm" variant="outline">Open Assigned Driver</Button>
            </Link>
            <Link href={`/fleet/trailers?trailer=${featured.assignedTrailer}`}>
              <Button size="sm" variant="outline">Open Assigned Trailer</Button>
            </Link>
            <Link href="/maintenance">
              <Button size="sm" variant="outline">Open Maintenance History</Button>
            </Link>
            <Link href={`/operations/route-planning?vehicle=${featured.id}${activeLoad ? `&loadId=${activeLoad.id}` : ""}`}>
              <Button size="sm" variant="outline">Open Active Route</Button>
            </Link>
            {activeLoad && (
              <Link href={`/loads/${activeLoad.id}`} className="sm:col-span-2">
                <Button size="sm">Open Active Load</Button>
              </Link>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">Timeline</h3>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
              <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">14:22 - Geofence exit</p>
              <p className="mt-1 text-theme-xs text-gray-500">M6 corridor - Northbound</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
              <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">13:45 - Cargo checkpoint</p>
              <p className="mt-1 text-theme-xs text-gray-500">Trailer seal verified and temperature normal</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
              <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">11:10 - Fuel transaction</p>
              <p className="mt-1 text-theme-xs text-gray-500">312 liters diesel recorded</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
