"use client";

import React, { useMemo, useState } from "react";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { loads } from "@/data/flowtrack";
import Link from "next/link";

type DispatchLoad = {
  id: string;
  customer: string;
  pickup: string;
  delivery: string;
  priority: "High" | "Medium" | "Normal";
  driver: string;
  vehicle: string;
  trailer: string;
  sequence: number;
};

const initialLoads: DispatchLoad[] = loads.map((load, index) => ({
  id: load.id,
  customer: load.customer,
  pickup: load.pickup,
  delivery: load.delivery,
  priority: index === 0 ? "High" : index === 1 ? "Medium" : "Normal",
  driver: load.assignedDriver === "Unassigned" ? "" : load.assignedDriver,
  vehicle: load.assignedVehicle === "Unassigned" ? "" : load.assignedVehicle,
  trailer: load.assignedTrailer === "Unassigned" ? "" : load.assignedTrailer,
  sequence: index + 1,
}));

const drivers = ["Leah Morgan", "Amir Patel", "Jonas Reed", "Nadia Clark"];
const vehicles = ["VH-2041", "VH-1930", "VH-1886", "VH-2102"];
const trailers = ["TRL-778", "TRL-745", "TRL-709", "TRL-801"];

export default function DispatchBoard() {
  const [dispatchLoads, setDispatchLoads] = useState<DispatchLoad[]>(initialLoads);

  const sortedLoads = useMemo(
    () => [...dispatchLoads].sort((a, b) => a.sequence - b.sequence),
    [dispatchLoads]
  );

  const updateField = (
    id: string,
    field: "driver" | "vehicle" | "trailer",
    value: string
  ) => {
    setDispatchLoads((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const moveSequence = (id: string, direction: "up" | "down") => {
    setDispatchLoads((prev) => {
      const list = [...prev].sort((a, b) => a.sequence - b.sequence);
      const idx = list.findIndex((item) => item.id === id);
      if (idx === -1) {
        return prev;
      }
      const target = direction === "up" ? idx - 1 : idx + 1;
      if (target < 0 || target >= list.length) {
        return prev;
      }
      const currentSeq = list[idx].sequence;
      list[idx].sequence = list[target].sequence;
      list[target].sequence = currentSeq;
      return list;
    });
  };

  const sendUpdate = (id: string) => {
    setDispatchLoads((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              priority:
                item.priority === "High"
                  ? "Medium"
                  : item.priority === "Medium"
                  ? "Normal"
                  : "Normal",
            }
          : item
      )
    );
  };

  return (
    <div className="space-y-4">
      {sortedLoads.map((load) => (
        <div
          key={load.id}
          className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.02]"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                {load.id} • {load.customer}
              </p>
              <p className="mt-1 text-gray-500 text-theme-xs dark:text-gray-400">
                {load.pickup} to {load.delivery}
              </p>
            </div>
            <Badge
              color={
                load.priority === "High"
                  ? "error"
                  : load.priority === "Medium"
                  ? "warning"
                  : "success"
              }
            >
              {load.priority} Priority
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-3 mt-4 md:grid-cols-3">
            <select
              className="h-11 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
              value={load.driver}
              onChange={(e) => updateField(load.id, "driver", e.target.value)}
            >
              <option value="">Assign Driver</option>
              {drivers.map((driver) => (
                <option key={driver} value={driver}>
                  {driver}
                </option>
              ))}
            </select>
            <select
              className="h-11 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
              value={load.vehicle}
              onChange={(e) => updateField(load.id, "vehicle", e.target.value)}
            >
              <option value="">Assign Vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle} value={vehicle}>
                  {vehicle}
                </option>
              ))}
            </select>
            <select
              className="h-11 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
              value={load.trailer}
              onChange={(e) => updateField(load.id, "trailer", e.target.value)}
            >
              <option value="">Assign Trailer</option>
              {trailers.map((trailer) => (
                <option key={trailer} value={trailer}>
                  {trailer}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <Link href={`/loads/${load.id}`}>
              <Button size="sm" variant="outline">Open Load Details</Button>
            </Link>
            <Button size="sm" variant="outline" onClick={() => moveSequence(load.id, "up")}>Move Up</Button>
            <Button size="sm" variant="outline" onClick={() => moveSequence(load.id, "down")}>Move Down</Button>
            <Button size="sm" onClick={() => sendUpdate(load.id)}>
              Send Driver Update
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
