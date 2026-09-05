"use client";

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { LatLngTuple } from "leaflet";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import type { PlannedStop } from "@/components/flowtrack/RoutePlanningMap";

const RoutePlanningMap = dynamic(() => import("@/components/flowtrack/RoutePlanningMap"), {
  ssr: false,
});

const drivers = ["Leah Morgan", "Amir Patel", "Jonas Reed", "Nadia Clark"];
const vehicles = ["VH-2041", "VH-1930", "VH-1886", "VH-2102"];
const trailers = ["TRL-778", "TRL-745", "TRL-709", "TRL-801"];

const initialStops: PlannedStop[] = [
  {
    id: "STP-01",
    customer: "FlowTrack Central Warehouse",
    address: "Dock 4, Midlands Superhub, Birmingham",
    status: "Completed",
    loadId: "L-22019",
    driverId: "DRV-014",
    vehicleId: "VH-2041",
    trailerId: "TRL-778",
    coordinates: [52.4862, -1.8904],
  },
  {
    id: "STP-02",
    customer: "Tesco Distribution",
    address: "Crewe Hub, Weston Rd, CW1 6FX",
    status: "Arrived",
    loadId: "L-22019",
    driverId: "DRV-014",
    vehicleId: "VH-2041",
    trailerId: "TRL-778",
    coordinates: [53.0995, -2.4438],
  },
  {
    id: "STP-03",
    customer: "Morrisons North Fulfilment",
    address: "Preston FC, Ribbleton Ln, PR1 5NE",
    status: "Scheduled",
    loadId: "L-22058",
    driverId: "DRV-032",
    vehicleId: "VH-1886",
    trailerId: "TRL-709",
    coordinates: [53.7632, -2.7044],
  },
  {
    id: "STP-04",
    customer: "Glasgow National DC",
    address: "Queenslie Industrial Estate, Glasgow",
    status: "Scheduled",
    loadId: "L-22019",
    driverId: "DRV-014",
    vehicleId: "VH-2041",
    trailerId: "TRL-778",
    coordinates: [55.8642, -4.2518],
  },
];

const incidents = [
  {
    id: "INC-1001",
    title: "M6 J16 Congestion",
    type: "Traffic" as const,
    severity: "Medium" as const,
    coordinates: [53.0948, -2.4401] as [number, number],
  },
  {
    id: "INC-1002",
    title: "A74 Road Closure",
    type: "Road Closure" as const,
    severity: "High" as const,
    coordinates: [55.0054, -3.5916] as [number, number],
  },
];

function haversineKm(from: LatLngTuple, to: LatLngTuple) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const r = 6371;
  const dLat = toRad(to[0] - from[0]);
  const dLng = toRad(to[1] - from[1]);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from[0])) * Math.cos(toRad(to[0])) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return r * c;
}

function formatClock(date: Date) {
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function driverNameToId(name: string) {
  if (name === "Amir Patel") {
    return "DRV-021";
  }
  if (name === "Jonas Reed") {
    return "DRV-032";
  }
  return "DRV-014";
}

interface RoutePlannerBoardProps {
  initialDriverId?: string;
  initialVehicleId?: string;
  initialTrailerId?: string;
  initialLoadId?: string;
}

export default function RoutePlannerBoard({
  initialDriverId,
  initialVehicleId,
  initialTrailerId,
  initialLoadId,
}: RoutePlannerBoardProps) {
  const [stops, setStops] = useState<PlannedStop[]>(initialStops);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [driver, setDriver] = useState(
    initialDriverId === "DRV-021"
      ? drivers[1]
      : initialDriverId === "DRV-032"
      ? drivers[2]
      : initialDriverId === "DRV-040"
      ? drivers[3]
      : drivers[0]
  );
  const [vehicle, setVehicle] = useState(initialVehicleId ?? vehicles[0]);
  const [trailer, setTrailer] = useState(initialTrailerId ?? trailers[0]);

  const legs = useMemo(
    () =>
      stops.map((stop, index) => {
        if (index === 0) {
          return 0;
        }
        return haversineKm(stops[index - 1].coordinates, stop.coordinates);
      }),
    [stops]
  );

  const totals = useMemo(() => {
    const distance = legs.reduce((sum, item) => sum + item, 0);
    const drivingHours = distance / 64;
    const breakHours = Math.floor(drivingHours / 4.5) * 0.75;
    const waitingHours = Math.max(0.5, stops.length * 0.18);
    const loadingHours = 0.85;
    const unloadingHours = 0.75;
    const totalHours = drivingHours + breakHours + waitingHours + loadingHours + unloadingHours;
    const fuelLiters = distance * 0.33;
    const departure = new Date("2026-08-04T08:10:00");
    const expectedArrivalDate = new Date(departure.getTime() + totalHours * 60 * 60 * 1000);

    return {
      distanceKm: distance,
      drivingHours,
      breakHours,
      waitingHours,
      loadingHours,
      unloadingHours,
      totalHours,
      fuelLiters,
      departure,
      expectedArrivalDate,
    };
  }, [legs, stops.length]);

  const stopTimings = useMemo(() => {
    const output: { arrivalWindow: string; departureWindow: string }[] = [];
    let rolling = new Date(totals.departure);

    for (let i = 0; i < stops.length; i += 1) {
      if (i > 0) {
        const travelMinutes = Math.round((legs[i] / 64) * 60);
        rolling = new Date(rolling.getTime() + travelMinutes * 60000);
      }

      const arrivalStart = formatClock(rolling);
      const arrivalEnd = formatClock(new Date(rolling.getTime() + 30 * 60000));
      const departureStartDate = new Date(rolling.getTime() + 30 * 60000);
      const departureEndDate = new Date(rolling.getTime() + 55 * 60000);

      output.push({
        arrivalWindow: `${arrivalStart}-${arrivalEnd}`,
        departureWindow: `${formatClock(departureStartDate)}-${formatClock(departureEndDate)}`,
      });

      rolling = departureEndDate;
    }

    return output;
  }, [legs, stops, totals.departure]);

  const handleDragStart = (id: string) => {
    setDraggingId(id);
  };

  const handleDrop = (targetId: string) => {
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      setOverId(null);
      return;
    }

    setStops((prev) => {
      const fromIndex = prev.findIndex((stop) => stop.id === draggingId);
      const toIndex = prev.findIndex((stop) => stop.id === targetId);
      if (fromIndex === -1 || toIndex === -1) {
        return prev;
      }
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });

    setDraggingId(null);
    setOverId(null);
  };

  const statusColor = (status: PlannedStop["status"]) => {
    if (status === "Completed") {
      return "success" as const;
    }
    if (status === "Arrived") {
      return "primary" as const;
    }
    if (status === "Delayed") {
      return "error" as const;
    }
    return "light" as const;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12 md:gap-6">
        <div className="space-y-4 xl:col-span-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h4 className="text-base font-medium text-gray-800 dark:text-white/90">Route Stops</h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Drag and drop to reorder stops.</p>

            <div className="mt-4 space-y-3">
              {stops.map((stop, index) => (
                <div
                  key={stop.id}
                  draggable
                  onDragStart={() => handleDragStart(stop.id)}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setOverId(stop.id);
                  }}
                  onDrop={() => handleDrop(stop.id)}
                  onDragEnd={() => {
                    setDraggingId(null);
                    setOverId(null);
                  }}
                  className={`rounded-xl border p-3 dark:border-gray-700 ${
                    overId === stop.id
                      ? "border-brand-300 bg-brand-50/40 dark:border-brand-500/40 dark:bg-brand-500/10"
                      : initialLoadId && stop.loadId === initialLoadId
                      ? "border-success-300 bg-success-50/30 dark:border-success-500/40 dark:bg-success-500/10"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge color="light">Stop {index + 1}</Badge>
                    <Badge color={statusColor(stop.status)}>{stop.status}</Badge>
                  </div>

                  <Link href={`/loads/${stop.loadId}`} className="mt-2 inline-block text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
                    {stop.customer}
                  </Link>
                  <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">{stop.address}</p>

                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="rounded-lg border border-gray-200 px-2 py-1.5 dark:border-gray-700">
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">Arrival window</p>
                      <p className="text-theme-xs font-medium text-gray-700 dark:text-gray-300">{stopTimings[index]?.arrivalWindow}</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 px-2 py-1.5 dark:border-gray-700">
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">Departure window</p>
                      <p className="text-theme-xs font-medium text-gray-700 dark:text-gray-300">{stopTimings[index]?.departureWindow}</p>
                    </div>
                  </div>

                  <div className="mt-2">
                    <Link href={`/loads/${stop.loadId}`} className="text-theme-xs text-brand-600 hover:text-brand-700 dark:text-brand-400">
                      Open Related Load
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 xl:col-span-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-base font-medium text-gray-800 dark:text-white/90">Live Route Map</h4>
              <Badge color="info">Leaflet + OpenStreetMap</Badge>
            </div>

            <div className="mt-4">
              <RoutePlanningMap
                stops={stops}
                driverId={driverNameToId(driver)}
                driver={driver}
                vehicle={vehicle}
                trailer={trailer}
                incidents={incidents}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 xl:col-span-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h4 className="text-base font-medium text-gray-800 dark:text-white/90">Route Summary</h4>

            <div className="mt-4 space-y-3">
              <div>
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">Driver</p>
                <select
                  value={driver}
                  onChange={(event) => setDriver(event.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
                >
                  {drivers.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">Vehicle</p>
                <select
                  value={vehicle}
                  onChange={(event) => setVehicle(event.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
                >
                  {vehicles.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">Trailer</p>
                <select
                  value={trailer}
                  onChange={(event) => setTrailer(event.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
                >
                  {trailers.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <div className="rounded-xl border border-gray-200 px-3 py-2 dark:border-gray-700">
                  <p className="text-theme-xs text-gray-500 dark:text-gray-400">Distance</p>
                  <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{totals.distanceKm.toFixed(1)} km</p>
                </div>
                <div className="rounded-xl border border-gray-200 px-3 py-2 dark:border-gray-700">
                  <p className="text-theme-xs text-gray-500 dark:text-gray-400">Estimated driving time</p>
                  <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{totals.drivingHours.toFixed(1)} h</p>
                </div>
                <div className="rounded-xl border border-gray-200 px-3 py-2 dark:border-gray-700">
                  <p className="text-theme-xs text-gray-500 dark:text-gray-400">Fuel estimate</p>
                  <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{totals.fuelLiters.toFixed(1)} L</p>
                </div>
                <div className="rounded-xl border border-gray-200 px-3 py-2 dark:border-gray-700">
                  <p className="text-theme-xs text-gray-500 dark:text-gray-400">Total cargo weight</p>
                  <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">18,240 kg</p>
                </div>
                <div className="rounded-xl border border-gray-200 px-3 py-2 dark:border-gray-700">
                  <p className="text-theme-xs text-gray-500 dark:text-gray-400">Trailer utilisation</p>
                  <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">87%</p>
                </div>
                <div className="rounded-xl border border-gray-200 px-3 py-2 dark:border-gray-700">
                  <p className="text-theme-xs text-gray-500 dark:text-gray-400">Number of stops</p>
                  <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{stops.length}</p>
                </div>
                <div className="rounded-xl border border-gray-200 px-3 py-2 dark:border-gray-700">
                  <p className="text-theme-xs text-gray-500 dark:text-gray-400">Expected arrival</p>
                  <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{formatClock(totals.expectedArrivalDate)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Button size="sm">Save Route</Button>
                <Button size="sm" variant="outline">Dispatch Route</Button>
                <Button size="sm" variant="outline">Duplicate Route</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h4 className="text-base font-medium text-gray-800 dark:text-white/90">Timeline</h4>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
            <p className="text-theme-xs text-gray-500 dark:text-gray-400">Departure</p>
            <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{formatClock(totals.departure)}</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
            <p className="text-theme-xs text-gray-500 dark:text-gray-400">Arrival</p>
            <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{formatClock(totals.expectedArrivalDate)}</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
            <p className="text-theme-xs text-gray-500 dark:text-gray-400">Breaks</p>
            <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{totals.breakHours.toFixed(2)} h</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
            <p className="text-theme-xs text-gray-500 dark:text-gray-400">Driving time</p>
            <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{totals.drivingHours.toFixed(2)} h</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
            <p className="text-theme-xs text-gray-500 dark:text-gray-400">Waiting time</p>
            <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{totals.waitingHours.toFixed(2)} h</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
            <p className="text-theme-xs text-gray-500 dark:text-gray-400">Loading</p>
            <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{totals.loadingHours.toFixed(2)} h</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
            <p className="text-theme-xs text-gray-500 dark:text-gray-400">Unloading</p>
            <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{totals.unloadingHours.toFixed(2)} h</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
            <p className="text-theme-xs text-gray-500 dark:text-gray-400">Total Operation Time</p>
            <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{totals.totalHours.toFixed(2)} h</p>
          </div>
        </div>
      </div>
    </div>
  );
}
