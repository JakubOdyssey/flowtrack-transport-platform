"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
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
import { drivers, loads, trailers, vehicles } from "@/data/flowtrack";

const DriverProfileLiveMap = dynamic(() => import("@/components/flowtrack/DriverProfileLiveMap"), {
  ssr: false,
});

type LatLngTuple = [number, number];

type DriverOperationalStatus = "Driving" | "Break" | "Offline";
type DriverTab = "Overview" | "Trips" | "Documents" | "Performance" | "Timeline";

interface DriverTrip {
  date: string;
  pickup: string;
  delivery: string;
  distanceKm: number;
  duration: string;
  fuelLiters: number;
  status: "Delivered" | "In Transit" | "Delayed";
}

interface DriverDocument {
  name: string;
  expiry: string;
  status: "Valid" | "Renewal Soon" | "Expired";
}

interface TimelineEvent {
  time: string;
  title: string;
  detail: string;
}

const TABS: DriverTab[] = ["Overview", "Trips", "Documents", "Performance", "Timeline"];

function statusBadgeColor(status: DriverOperationalStatus) {
  if (status === "Driving") {
    return "success" as const;
  }
  if (status === "Break") {
    return "warning" as const;
  }
  return "light" as const;
}

function documentBadgeColor(status: DriverDocument["status"]) {
  if (status === "Valid") {
    return "success" as const;
  }
  if (status === "Renewal Soon") {
    return "warning" as const;
  }
  return "error" as const;
}

function tripBadgeColor(status: DriverTrip["status"]) {
  if (status === "Delivered") {
    return "success" as const;
  }
  if (status === "In Transit") {
    return "primary" as const;
  }
  return "error" as const;
}

interface DriverProfileViewProps {
  initialDriverId?: string;
}

export default function DriverProfileView({ initialDriverId }: DriverProfileViewProps) {
  const [activeTab, setActiveTab] = useState<DriverTab>("Overview");

  const driver = drivers.find((item) => item.id === initialDriverId) ?? drivers[0];
  const assignedVehicle = vehicles.find((vehicle) => vehicle.id === driver.assignedVehicle) ?? vehicles[0];
  const assignedTrailer = trailers.find((trailer) => trailer.id === assignedVehicle.assignedTrailer) ?? trailers[0];
  const activeLoad =
    loads.find((load) => load.assignedDriver === driver.name && load.status !== "Delivered") ?? loads[0];

  const operationalStatus: DriverOperationalStatus = "Driving";

  const profile = {
    employeeId: driver.id,
    company: "FlowTrack Logistics Europe",
    email: "leah.morgan@flowtrack-logistics.eu",
    phone: driver.phone,
    emergencyContact: "+44 7700 410015",
    licenseExpiry: "2029-04-18",
    yearsExperience: 12,
    driverScore: 96,
  };

  const assignment = {
    pickup: activeLoad.pickup,
    destination: activeLoad.delivery,
    eta: activeLoad.eta,
    speedKph: 78,
    drivingHoursToday: 6.4,
    legalTimeRemaining: 2.6,
    cargo: `${activeLoad.cargo} (${activeLoad.customer})`,
    trailerUtilisation: 87,
    distanceRemainingKm: 162,
  };

  const route: LatLngTuple[] = [
    [52.8044, -1.6379],
    [53.1785, -2.2406],
    [53.8008, -1.5491],
    [55.8642, -4.2518],
  ];

  const trafficMarkers: LatLngTuple[] = [
    [53.228, -2.48],
    [53.5601, -1.43],
  ];

  const incidents = [
    {
      id: "INC-771",
      title: "M6 Junction 16",
      detail: "Two-lane restriction due to heavy freight collision clearance.",
      severity: "High" as const,
      location: [53.0948, -2.4401] as LatLngTuple,
    },
    {
      id: "INC-774",
      title: "A66 Pennines",
      detail: "Strong wind advisory for high trailers.",
      severity: "Medium" as const,
      location: [54.4966, -2.2445] as LatLngTuple,
    },
  ];

  const trips: DriverTrip[] = [
    {
      date: "2026-08-04",
      pickup: "Birmingham DC",
      delivery: "Glasgow NDC",
      distanceKm: 476,
      duration: "7h 20m",
      fuelLiters: 209,
      status: "In Transit",
    },
    {
      date: "2026-08-03",
      pickup: "Manchester Crossdock",
      delivery: "Leeds RDC",
      distanceKm: 114,
      duration: "2h 08m",
      fuelLiters: 48,
      status: "Delivered",
    },
    {
      date: "2026-08-02",
      pickup: "Coventry Hub",
      delivery: "Cardiff FC",
      distanceKm: 206,
      duration: "3h 34m",
      fuelLiters: 86,
      status: "Delivered",
    },
    {
      date: "2026-08-01",
      pickup: "Sheffield Depot",
      delivery: "Bristol DC",
      distanceKm: 277,
      duration: "4h 41m",
      fuelLiters: 122,
      status: "Delayed",
    },
  ];

  const documents: DriverDocument[] = [
    { name: "Driving licence", expiry: "2029-04-18", status: "Valid" },
    { name: "CPC", expiry: "2026-11-09", status: "Renewal Soon" },
    { name: "Medical", expiry: "2027-06-20", status: "Valid" },
    { name: "Passport", expiry: "2030-02-14", status: "Valid" },
    { name: "ADR Certificate", expiry: "2026-08-29", status: "Renewal Soon" },
  ];

  const performanceCards = [
    { label: "Deliveries completed", value: "182", helper: "Last 90 days" },
    { label: "Average delay", value: "8 min", helper: "Per delivery" },
    { label: "Fuel efficiency", value: "3.58 km/L", helper: "Fleet top quartile" },
    { label: "Safety score", value: "96/100", helper: "No major incidents" },
    { label: "Incidents", value: "1", helper: "Minor route event" },
    { label: "Driving hours", value: "42.6 h", helper: "This week" },
  ];

  const timeline: TimelineEvent[] = [
    {
      time: "08:10",
      title: "Started shift",
      detail: "Vehicle check completed and tachograph session started.",
    },
    {
      time: "08:40",
      title: "Pickup completed",
      detail: "Birmingham DC bay 04, 22 pallets scanned and sealed.",
    },
    {
      time: "10:20",
      title: "Rest break",
      detail: "Mandatory break logged at Sandbach Services.",
    },
    {
      time: "11:05",
      title: "Route updated",
      detail: "Dispatcher rerouted around M6 incident with +12 min ETA impact.",
    },
    {
      time: "13:15",
      title: "Delivery completed",
      detail: "Leeds stop signed by receiver and POD synced.",
    },
  ];

  const summaryPairs = useMemo(
    () => [
      { label: "Status", value: operationalStatus },
      { label: "Current vehicle", value: `${assignedVehicle.id} (${assignedVehicle.model})` },
      { label: "Assigned trailer", value: assignedTrailer.id },
      { label: "Company", value: profile.company },
      { label: "Driver score", value: `${profile.driverScore}/100` },
      { label: "Contact", value: profile.phone },
      { label: "Email", value: profile.email },
      { label: "Emergency contact", value: profile.emergencyContact },
      { label: "License expiry", value: profile.licenseExpiry },
      { label: "Experience", value: `${profile.yearsExperience} years` },
    ],
    [assignedTrailer.id, assignedVehicle.id, assignedVehicle.model, operationalStatus, profile]
  );

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Fleet Drivers" />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12 md:gap-6">
        <div className="xl:col-span-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">Driver Summary</h3>

          <div className="mt-4 flex items-center gap-3">
            <div className="h-16 w-16 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
              <Image src="/images/user/user-21.jpg" alt={driver.name} width={64} height={64} className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-theme-sm font-semibold text-gray-800 dark:text-white/90">{driver.name}</p>
              <p className="text-theme-xs text-gray-500 dark:text-gray-400">Employee ID: {profile.employeeId}</p>
            </div>
          </div>

          <div className="mt-4">
            <Badge color={statusBadgeColor(operationalStatus)}>{operationalStatus}</Badge>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2">
            <Link href={`/fleet/vehicles?vehicle=${assignedVehicle.id}`}>
              <Button size="sm" variant="outline">Open Assigned Vehicle</Button>
            </Link>
            <Link href={`/fleet/trailers?trailer=${assignedTrailer.id}`}>
              <Button size="sm" variant="outline">Open Assigned Trailer</Button>
            </Link>
            <Link href={`/loads/${activeLoad.id}`}>
              <Button size="sm" variant="outline">Open Current Load</Button>
            </Link>
            <Link href={`/operations/route-planning?driver=${driver.id}&loadId=${activeLoad.id}`}>
              <Button size="sm">Open Current Route</Button>
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {summaryPairs.map((item) => (
              <div key={item.label} className="rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700">
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-5 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">Current Assignment</h3>
            <Badge color="primary">Live Dispatch</Badge>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
              <p className="text-theme-xs text-gray-500 dark:text-gray-400">Pickup</p>
              <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{assignment.pickup}</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
              <p className="text-theme-xs text-gray-500 dark:text-gray-400">Destination</p>
              <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{assignment.destination}</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
              <p className="text-theme-xs text-gray-500 dark:text-gray-400">ETA</p>
              <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{assignment.eta}</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
              <p className="text-theme-xs text-gray-500 dark:text-gray-400">Current speed</p>
              <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{assignment.speedKph} km/h</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
              <p className="text-theme-xs text-gray-500 dark:text-gray-400">Driving hours today</p>
              <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{assignment.drivingHoursToday.toFixed(1)} h</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
              <p className="text-theme-xs text-gray-500 dark:text-gray-400">Remaining legal driving time</p>
              <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{assignment.legalTimeRemaining.toFixed(1)} h</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
              <p className="text-theme-xs text-gray-500 dark:text-gray-400">Current cargo</p>
              <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{assignment.cargo}</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
              <p className="text-theme-xs text-gray-500 dark:text-gray-400">Trailer utilisation</p>
              <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{assignment.trailerUtilisation}%</p>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-gray-200 p-3 dark:border-gray-700">
            <p className="text-theme-xs text-gray-500 dark:text-gray-400">Distance remaining</p>
            <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{assignment.distanceRemainingKm} km</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline">Edit Route</Button>
            <Button size="sm" variant="outline">Message Driver</Button>
            <Button size="sm" variant="outline">Call Driver</Button>
            <Button size="sm">Assign New Job</Button>
          </div>
        </div>

        <div className="xl:col-span-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">Live Route Map</h3>
            <Badge color="info">Leaflet + OSM</Badge>
          </div>

          <div className="mt-4">
            <DriverProfileLiveMap
              truckId={assignedVehicle.id}
              heading={32}
              currentSpeedKph={assignment.speedKph}
              route={route}
              destinationLabel={assignment.destination}
              trafficMarkers={trafficMarkers}
              incidents={incidents}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-900">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-md px-3 py-2 text-theme-sm font-medium transition ${
                activeTab === tab
                  ? "bg-white text-gray-900 shadow-theme-xs dark:bg-gray-800 dark:text-white"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {activeTab === "Overview" && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">Primary Route</p>
                <p className="mt-2 text-sm font-semibold text-gray-800 dark:text-white/90">Birmingham to Leeds to Glasgow</p>
                <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">Night corridor with controlled handover windows.</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">Compliance</p>
                <p className="mt-2 text-sm font-semibold text-gray-800 dark:text-white/90">EU 561/2006 compliant</p>
                <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">Breaks and duty-time checks synced with tachograph.</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">Dispatcher Note</p>
                <p className="mt-2 text-sm font-semibold text-gray-800 dark:text-white/90">Priority customer SLA</p>
                <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">Arrival tolerance +/- 15 minutes for Glasgow unload slot.</p>
              </div>
            </div>
          )}

          {activeTab === "Trips" && (
            <div className="max-w-full overflow-x-auto">
              <div className="min-w-[980px]">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      {[
                        "Date",
                        "Pickup",
                        "Delivery",
                        "Distance",
                        "Duration",
                        "Fuel",
                        "Status",
                      ].map((header) => (
                        <TableCell
                          key={header}
                          isHeader
                          className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                        >
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {trips.map((trip) => (
                      <TableRow key={`${trip.date}-${trip.pickup}-${trip.delivery}`}>
                        <TableCell className="px-4 py-3 text-theme-sm text-gray-700 dark:text-gray-300">{trip.date}</TableCell>
                        <TableCell className="px-4 py-3 text-theme-sm text-gray-700 dark:text-gray-300">{trip.pickup}</TableCell>
                        <TableCell className="px-4 py-3 text-theme-sm text-gray-700 dark:text-gray-300">{trip.delivery}</TableCell>
                        <TableCell className="px-4 py-3 text-theme-sm text-gray-700 dark:text-gray-300">{trip.distanceKm} km</TableCell>
                        <TableCell className="px-4 py-3 text-theme-sm text-gray-700 dark:text-gray-300">{trip.duration}</TableCell>
                        <TableCell className="px-4 py-3 text-theme-sm text-gray-700 dark:text-gray-300">{trip.fuelLiters} L</TableCell>
                        <TableCell className="px-4 py-3"><Badge color={tripBadgeColor(trip.status)}>{trip.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {activeTab === "Documents" && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {documents.map((document) => (
                <div key={document.name} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{document.name}</p>
                  <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">Expiry: {document.expiry}</p>
                  <div className="mt-3">
                    <Badge color={documentBadgeColor(document.status)}>{document.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "Performance" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {performanceCards.map((card) => (
                <div key={card.label} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <p className="text-theme-xs text-gray-500 dark:text-gray-400">{card.label}</p>
                  <p className="mt-2 text-base font-semibold text-gray-800 dark:text-white/90">{card.value}</p>
                  <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">{card.helper}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "Timeline" && (
            <div className="space-y-4">
              {timeline.map((event, index) => (
                <div key={`${event.time}-${event.title}`} className="relative pl-8">
                  <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-brand-500" />
                  {index < timeline.length - 1 && (
                    <span className="absolute left-[5px] top-5 h-[calc(100%+10px)] w-px bg-gray-200 dark:bg-gray-700" />
                  )}
                  <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge color="light">{event.time}</Badge>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{event.title}</p>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{event.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
