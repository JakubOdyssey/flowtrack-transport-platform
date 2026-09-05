"use client";

import React, { useState } from "react";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";

const initialStops = [
  "Birmingham DC",
  "Crewe Hub",
  "Preston FC",
  "Lockerbie Crossdock",
  "Glasgow NDC",
];

export default function DriverRouteEditor() {
  const [stops, setStops] = useState<string[]>(initialStops);
  const [newStop, setNewStop] = useState("");

  const swapStops = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= stops.length) {
      return;
    }
    setStops((prev) => {
      const next = [...prev];
      const current = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = current;
      return next;
    });
  };

  const addStop = () => {
    if (!newStop.trim()) {
      return;
    }
    setStops((prev) => [...prev, newStop.trim()]);
    setNewStop("");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={newStop}
          onChange={(e) => setNewStop(e.target.value)}
          placeholder="Add route stop"
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 md:max-w-sm dark:border-gray-700 dark:text-gray-300"
        />
        <Button size="sm" onClick={addStop}>
          Add Stop
        </Button>
      </div>

      <div className="space-y-3">
        {stops.map((stop, index) => (
          <div
            key={`${stop}-${index}`}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.02]"
          >
            <Badge color="light">Stop {index + 1}</Badge>
            <p className="text-sm text-gray-700 dark:text-gray-300">{stop}</p>
            <div className="flex gap-2 ml-auto">
              <Button
                size="sm"
                variant="outline"
                onClick={() => swapStops(index, "up")}
              >
                Up
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => swapStops(index, "down")}
              >
                Down
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
