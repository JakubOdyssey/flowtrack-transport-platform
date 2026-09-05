"use client";

import React, { useEffect, useMemo, useState } from "react";
import L, { DivIcon, LatLngTuple } from "leaflet";
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { getRoadRoute } from "@/components/flowtrack/roadRouting";

type TruckStatus = "On Time" | "Delayed" | "Stopped" | "Loading";
type Mode = "dashboard" | "operations";

interface Truck {
  id: string;
  vehicle: string;
  driver: string;
  trailer: string;
  status: TruckStatus;
  online: boolean;
  speedKph: number;
  eta: string;
  loadRef: string;
  loadWeightKg: number;
  routeName: string;
  route: LatLngTuple[];
}

interface SimTruck extends Truck {
  segmentIndex: number;
  progress: number;
  position: LatLngTuple;
  heading: number;
}

interface RoadIssue {
  id: string;
  title: string;
  detail: string;
  severity: "Low" | "Medium" | "High";
  location: LatLngTuple;
}

const initialTrucks: Truck[] = [
  {
    id: "VH-2041",
    vehicle: "Volvo FH 500",
    driver: "Leah Morgan",
    trailer: "TRL-778",
    status: "On Time",
    online: true,
    speedKph: 78,
    eta: "15:40",
    loadRef: "L-22019",
    loadWeightKg: 18240,
    routeName: "Birmingham -> Manchester -> Glasgow",
    route: [
      [52.4862, -1.8904],
      [53.4808, -2.2426],
      [55.8642, -4.2518],
    ],
  },
  {
    id: "VH-1930",
    vehicle: "Mercedes Actros 2545",
    driver: "Amir Patel",
    trailer: "TRL-745",
    status: "Loading",
    online: true,
    speedKph: 24,
    eta: "18:10",
    loadRef: "L-22042",
    loadWeightKg: 14300,
    routeName: "Coventry -> London East",
    route: [
      [52.4068, -1.5197],
      [51.5074, -0.1278],
      [51.5416, 0.1487],
    ],
  },
  {
    id: "VH-1886",
    vehicle: "Scania R450",
    driver: "Jonas Reed",
    trailer: "TRL-709",
    status: "Delayed",
    online: true,
    speedKph: 43,
    eta: "20:05",
    loadRef: "L-22058",
    loadWeightKg: 10980,
    routeName: "Leeds -> Sheffield -> Leicester",
    route: [
      [53.8008, -1.5491],
      [53.3811, -1.4701],
      [52.6369, -1.1398],
    ],
  },
  {
    id: "VH-2102",
    vehicle: "DAF XF 530",
    driver: "Nadia Clark",
    trailer: "TRL-801",
    status: "Stopped",
    online: false,
    speedKph: 0,
    eta: "--",
    loadRef: "SV-WORKSHOP",
    loadWeightKg: 0,
    routeName: "Bristol -> Birmingham",
    route: [
      [51.4545, -2.5879],
      [52.4862, -1.8904],
    ],
  },
];

const roadIssues: RoadIssue[] = [
  {
    id: "RI-1001",
    title: "M1 J24-J25",
    detail: "Lane closure after collision, +22 min average delay",
    severity: "High",
    location: [52.8707, -1.2816],
  },
  {
    id: "RI-1002",
    title: "M6 Toll North",
    detail: "Heavy congestion from peak freight window",
    severity: "Medium",
    location: [52.7396, -2.0665],
  },
  {
    id: "RI-1003",
    title: "A1(M) South",
    detail: "Night roadworks with narrowed lanes",
    severity: "Low",
    location: [53.5923, -0.3185],
  },
];

function bearing(from: LatLngTuple, to: LatLngTuple) {
  const dy = to[0] - from[0];
  const dx = to[1] - from[1];
  const angle = (Math.atan2(dx, dy) * 180) / Math.PI;
  return (angle + 360) % 360;
}

function smoothHeading(current: number, target: number, maxStepDeg: number) {
  const normalizedCurrent = ((current % 360) + 360) % 360;
  const normalizedTarget = ((target % 360) + 360) % 360;
  const delta = ((normalizedTarget - normalizedCurrent + 540) % 360) - 180;

  if (Math.abs(delta) <= maxStepDeg) {
    return normalizedTarget;
  }

  const stepped = normalizedCurrent + Math.sign(delta) * maxStepDeg;
  return ((stepped % 360) + 360) % 360;
}

function interpolate(from: LatLngTuple, to: LatLngTuple, t: number): LatLngTuple {
  return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t];
}

function segmentDistanceMeters(from: LatLngTuple, to: LatLngTuple) {
  const radius = 6371000;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const lat1 = toRad(from[0]);
  const lat2 = toRad(to[0]);
  const dLat = toRad(to[0] - from[0]);
  const dLng = toRad(to[1] - from[1]);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return radius * c;
}

function routeColor(status: TruckStatus) {
  if (status === "On Time") {
    return "#22c55e";
  }
  if (status === "Delayed") {
    return "#f59e0b";
  }
  if (status === "Loading") {
    return "#465fff";
  }
  return "#ef4444";
}

function badgeColor(status: TruckStatus) {
  if (status === "On Time") {
    return "success" as const;
  }
  if (status === "Delayed") {
    return "warning" as const;
  }
  if (status === "Loading") {
    return "primary" as const;
  }
  return "error" as const;
}

function truckIcon(truck: SimTruck): DivIcon {
  const onlineColor = truck.online ? "#22c55e" : "#ef4444";

  return L.divIcon({
    className: "flowtrack-truck-marker",
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -18],
    html: `
      <div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;">
        <span style="position:absolute;right:1px;top:1px;width:8px;height:8px;border-radius:999px;background:${onlineColor};border:1.5px solid #fff;"></span>
        <img src="/images/flowtrack/truck-icon.png" alt="truck" class="flowtrack-truck-icon" style="width:40px;height:40px;object-fit:contain;transform:rotate(${truck.heading}deg);transform-origin:center;"/>
      </div>
    `,
  });
}

export default function LeafletFleetMapInner({ mode = "dashboard" }: { mode?: Mode }) {
  const [selectedTruckId, setSelectedTruckId] = useState<string>(initialTrucks[0].id);
  const [showRoadIssues, setShowRoadIssues] = useState(true);
  const [statusFilter, setStatusFilter] = useState<TruckStatus | "All">("All");

  const [simTrucks, setSimTrucks] = useState<SimTruck[]>(
    initialTrucks.map((truck) => ({
      ...truck,
      segmentIndex: 0,
      progress: 0,
      position: truck.route[0],
      heading: truck.route.length > 1 ? bearing(truck.route[0], truck.route[1]) : 0,
    }))
  );

  const [roadRoutesByTruckId, setRoadRoutesByTruckId] = useState<Record<string, LatLngTuple[]>>({});

  useEffect(() => {
    let mounted = true;

    Promise.all(
      initialTrucks.map(async (truck) => {
        const roadRoute = await getRoadRoute(truck.route);
        return [truck.id, roadRoute] as const;
      })
    ).then((entries) => {
      if (!mounted) {
        return;
      }
      setRoadRoutesByTruckId(Object.fromEntries(entries));
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const tickMs = 800;
    const simulationTimeScale = mode === "operations" ? 4 : 12;
    const maxHeadingStepDeg = mode === "operations" ? 3 : 15;
    const timer = window.setInterval(() => {
      setSimTrucks((prev) =>
        prev.map((truck) => {
          const activeRoute = roadRoutesByTruckId[truck.id] ?? truck.route;
          if (!truck.online || activeRoute.length < 2) {
            return truck;
          }

          let nextSegmentIndex = truck.segmentIndex;
          let nextProgress = truck.progress;
          let remainingDistanceMeters =
            (Math.max(truck.speedKph, 12) * 1000 * (tickMs / 1000) * simulationTimeScale) / 3600;

          let iterations = 0;
          while (remainingDistanceMeters > 0 && iterations < activeRoute.length + 2) {
            const from = activeRoute[nextSegmentIndex];
            const to = activeRoute[nextSegmentIndex + 1];
            const segmentMeters = Math.max(1, segmentDistanceMeters(from, to));
            const leftOnSegment = (1 - nextProgress) * segmentMeters;

            if (remainingDistanceMeters < leftOnSegment) {
              nextProgress += remainingDistanceMeters / segmentMeters;
              remainingDistanceMeters = 0;
            } else {
              remainingDistanceMeters -= leftOnSegment;
              nextProgress = 0;
              nextSegmentIndex += 1;
              if (nextSegmentIndex >= activeRoute.length - 1) {
                nextSegmentIndex = 0;
              }
            }
            iterations += 1;
          }

          const from = activeRoute[nextSegmentIndex];
          const to = activeRoute[nextSegmentIndex + 1];
          const nextPosition = interpolate(from, to, nextProgress);
          const lookAheadIndex = Math.min(nextSegmentIndex + 3, activeRoute.length - 1);
          const headingTarget = bearing(activeRoute[nextSegmentIndex], activeRoute[lookAheadIndex]);
          const nextHeading = smoothHeading(truck.heading, headingTarget, maxHeadingStepDeg);

          return {
            ...truck,
            segmentIndex: nextSegmentIndex,
            progress: nextProgress,
            position: nextPosition,
            heading: nextHeading,
          };
        })
      );
    }, tickMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [roadRoutesByTruckId, mode]);

  const visibleTrucks = useMemo(
    () => simTrucks.filter((truck) => statusFilter === "All" || truck.status === statusFilter),
    [simTrucks, statusFilter]
  );

  const selectedTruck = useMemo(
    () => visibleTrucks.find((truck) => truck.id === selectedTruckId) ?? visibleTrucks[0] ?? null,
    [visibleTrucks, selectedTruckId]
  );
  const driverIdByName: Record<string, string> = {
    "Leah Morgan": "DRV-014",
    "Amir Patel": "DRV-021",
    "Jonas Reed": "DRV-032",
    "Nadia Clark": "DRV-014",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TruckStatus | "All")}
          className="h-11 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
        >
          <option value="All">All trucks</option>
          <option value="On Time">On Time</option>
          <option value="Delayed">Delayed</option>
          <option value="Loading">Loading</option>
          <option value="Stopped">Stopped</option>
        </select>
        <Button size="sm" variant="outline" onClick={() => setShowRoadIssues((prev) => !prev)}>
          {showRoadIssues ? "Hide" : "Show"} Road Disruptions
        </Button>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60">
        <MapContainer
          center={[54.2, -2.6]}
          zoom={mode === "dashboard" ? 6 : 6.3}
          minZoom={5}
          maxZoom={11}
          maxBounds={[
            [49.7, -8.7],
            [59.1, 2.2],
          ]}
          className="h-[460px] w-full"
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {visibleTrucks.map((truck) => (
            <Polyline
              key={`${truck.id}-route`}
              positions={roadRoutesByTruckId[truck.id] ?? truck.route}
              pathOptions={{
                color: routeColor(truck.status),
                weight: 4,
                opacity: 0.95,
                dashArray: truck.status === "Delayed" ? "10 8" : undefined,
              }}
            />
          ))}

          {showRoadIssues &&
            roadIssues.map((issue) => (
              <CircleMarker
                key={issue.id}
                center={issue.location}
                radius={issue.severity === "High" ? 8 : issue.severity === "Medium" ? 6 : 5}
                pathOptions={{
                  color: "#ffffff",
                  weight: 2,
                  fillOpacity: 0.9,
                  fillColor:
                    issue.severity === "High"
                      ? "#ef4444"
                      : issue.severity === "Medium"
                      ? "#f59e0b"
                      : "#22c55e",
                }}
              >
                <Popup>
                  <div className="min-w-[220px]">
                    <p className="font-medium">{issue.title}</p>
                    <p className="text-xs mt-1">{issue.detail}</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

          {visibleTrucks.map((truck) => (
            <Marker
              key={truck.id}
              position={truck.position}
              icon={truckIcon(truck)}
              eventHandlers={{
                click: () => setSelectedTruckId(truck.id),
              }}
            >
              <Popup>
                <div className="min-w-[260px]">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{truck.id}</p>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        truck.online ? "bg-success-50 text-success-600" : "bg-error-50 text-error-600"
                      }`}
                    >
                      {truck.online ? "Online" : "Offline"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{truck.vehicle}</p>
                  <div className="mt-3 space-y-1 text-xs text-gray-700">
                    <p>Driver: {truck.driver}</p>
                    <p>Trailer: {truck.trailer}</p>
                    <p>Route: {truck.routeName}</p>
                    <p>ETA: {truck.eta}</p>
                    <p>Speed: {truck.speedKph} km/h</p>
                    <p>Heading: {Math.round(truck.heading)}°</p>
                    <p>Load: {truck.loadRef}</p>
                    <div className="pt-1 space-x-2">
                      <a href={`/fleet/vehicles?vehicle=${truck.id}`} className="text-brand-600 hover:text-brand-700">Vehicle</a>
                      <a href={`/fleet/trailers?trailer=${truck.trailer}`} className="text-brand-600 hover:text-brand-700">Trailer</a>
                      <a href={`/fleet/drivers?driver=${driverIdByName[truck.driver] ?? "DRV-014"}`} className="text-brand-600 hover:text-brand-700">Driver</a>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {selectedTruck && (
          <aside className="pointer-events-auto absolute right-3 top-3 bottom-3 w-[320px] rounded-xl border border-gray-200 bg-white/95 p-4 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900/95">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">{selectedTruck.id}</p>
                <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">{selectedTruck.vehicle}</p>
              </div>
              <Badge color={badgeColor(selectedTruck.status)}>{selectedTruck.status}</Badge>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                  selectedTruck.online ? "bg-success-50 text-success-600" : "bg-error-50 text-error-600"
                }`}
              >
                {selectedTruck.online ? "Online" : "Offline"}
              </span>
              <span className="text-theme-xs text-gray-500 dark:text-gray-400">Live telemetry status</span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">Driver</p>
                <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">{selectedTruck.driver}</p>
                <a href={`/fleet/drivers?driver=${driverIdByName[selectedTruck.driver] ?? "DRV-014"}`} className="mt-1 inline-block text-theme-xs text-brand-600 hover:text-brand-700">
                  Open Driver Profile
                </a>
              </div>
              <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">Assigned Trailer</p>
                <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">{selectedTruck.trailer}</p>
                <a href={`/fleet/trailers?trailer=${selectedTruck.trailer}`} className="mt-1 inline-block text-theme-xs text-brand-600 hover:text-brand-700">
                  Open Trailer Details
                </a>
              </div>
              <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">Route</p>
                <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">{selectedTruck.routeName}</p>
                <a href={`/operations/route-planning?driver=${driverIdByName[selectedTruck.driver] ?? "DRV-014"}&vehicle=${selectedTruck.id}&trailer=${selectedTruck.trailer}&loadId=${selectedTruck.loadRef}`} className="mt-1 inline-block text-theme-xs text-brand-600 hover:text-brand-700">
                  Open Active Route
                </a>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  <p className="text-theme-xs text-gray-500 dark:text-gray-400">Speed</p>
                  <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">{selectedTruck.speedKph} km/h</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  <p className="text-theme-xs text-gray-500 dark:text-gray-400">Heading</p>
                  <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">{Math.round(selectedTruck.heading)}°</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <a href={`/fleet/vehicles?vehicle=${selectedTruck.id}`} className="rounded-lg border border-gray-200 px-3 py-2 text-center text-theme-xs font-medium text-brand-600 hover:text-brand-700 dark:border-gray-700 dark:text-brand-400">
                  Open Vehicle Details
                </a>
                <a href={`/loads/${selectedTruck.loadRef}`} className="rounded-lg border border-gray-200 px-3 py-2 text-center text-theme-xs font-medium text-brand-600 hover:text-brand-700 dark:border-gray-700 dark:text-brand-400">
                  Open Assigned Load
                </a>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
