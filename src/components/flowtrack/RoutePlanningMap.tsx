"use client";

import React, { useEffect, useMemo, useState } from "react";
import L, { DivIcon, LatLngTuple } from "leaflet";
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getRoadRoute } from "@/components/flowtrack/roadRouting";

export interface PlannedStop {
  id: string;
  customer: string;
  address: string;
  status: "Scheduled" | "Arrived" | "Completed" | "Delayed";
  loadId: string;
  driverId: string;
  vehicleId: string;
  trailerId: string;
  coordinates: LatLngTuple;
}

interface IncidentPoint {
  id: string;
  title: string;
  type: "Traffic" | "Road Closure";
  severity: "Low" | "Medium" | "High";
  coordinates: LatLngTuple;
}

interface RoutePlanningMapProps {
  stops: PlannedStop[];
  driverId: string;
  driver: string;
  vehicle: string;
  trailer: string;
  incidents: IncidentPoint[];
}

function severityColor(severity: IncidentPoint["severity"]) {
  if (severity === "High") {
    return "#ef4444";
  }
  if (severity === "Medium") {
    return "#f59e0b";
  }
  return "#22c55e";
}

function truckIcon(): DivIcon {
  return L.divIcon({
    className: "flowtrack-route-truck-marker",
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -16],
    html: `
      <img src="/images/flowtrack/truck-icon.png" alt="truck" class="flowtrack-truck-icon" style="width:40px;height:40px;object-fit:contain;"/>
    `,
  });
}

function pinIcon(color: string): DivIcon {
  return L.divIcon({
    className: "flowtrack-route-pin",
    iconSize: [24, 24],
    iconAnchor: [12, 20],
    html: `
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="pin">
        <path d="M12 2C8.1 2 5 5.1 5 9c0 5.5 7 13 7 13s7-7.5 7-13c0-3.9-3.1-7-7-7Z" fill="${color}"/>
        <circle cx="12" cy="9" r="3" fill="#ffffff"/>
      </svg>
    `,
  });
}

export default function RoutePlanningMap({ stops, driverId, driver, vehicle, trailer, incidents }: RoutePlanningMapProps) {
  const routeCoordinates = useMemo(() => stops.map((stop) => stop.coordinates), [stops]);
  const [roadRoute, setRoadRoute] = useState<LatLngTuple[]>(routeCoordinates);

  useEffect(() => {
    let mounted = true;
    getRoadRoute(routeCoordinates).then((snappedRoute) => {
      if (mounted) {
        setRoadRoute(snappedRoute);
      }
    });

    return () => {
      mounted = false;
    };
  }, [routeCoordinates]);

  const center = useMemo<LatLngTuple>(() => {
    if (stops.length === 0) {
      return [53.0, -1.8];
    }
    const lat = stops.reduce((sum, stop) => sum + stop.coordinates[0], 0) / stops.length;
    const lng = stops.reduce((sum, stop) => sum + stop.coordinates[1], 0) / stops.length;
    return [lat, lng];
  }, [stops]);

  const warehouse = stops[0];
  const pickup = stops[1] ?? stops[0];
  const delivery = stops[stops.length - 1];
  const destination: LatLngTuple = [delivery.coordinates[0] + 0.035, delivery.coordinates[1] + 0.03];
  const truckPosition = roadRoute[Math.floor((roadRoute.length - 1) * 0.35)] ?? center;

  return (
    <div className="relative h-[520px] overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
      <MapContainer center={center} zoom={6.8} scrollWheelZoom className="h-full w-full" attributionControl>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Polyline positions={roadRoute} pathOptions={{ color: "#465fff", weight: 4, opacity: 0.84 }} />

        <Marker position={truckPosition} icon={truckIcon()}>
          <Popup>
            <div className="space-y-1 text-xs">
              <p className="font-semibold text-gray-900">Active Truck</p>
              <p>{driver}</p>
              <p>{vehicle}</p>
              <p>{trailer}</p>
              <div className="pt-1 space-x-2">
                <a href={`/fleet/vehicles?vehicle=${vehicle}`} className="text-brand-600 hover:text-brand-700">
                  Open Vehicle
                </a>
                <a href={`/fleet/drivers?driver=${driverId}`} className="text-brand-600 hover:text-brand-700">
                  Open Driver
                </a>
                <a href={`/fleet/trailers?trailer=${trailer}`} className="text-brand-600 hover:text-brand-700">
                  Open Trailer
                </a>
              </div>
            </div>
          </Popup>
        </Marker>

        <Marker position={warehouse.coordinates} icon={pinIcon("#06b6d4")}>
          <Popup>
            <p className="text-xs font-semibold text-gray-900">Warehouse</p>
            <p className="text-xs">{warehouse.address}</p>
          </Popup>
        </Marker>

        <Marker position={pickup.coordinates} icon={pinIcon("#22c55e")}>
          <Popup>
            <p className="text-xs font-semibold text-gray-900">Pickup Marker</p>
            <p className="text-xs">{pickup.customer}</p>
          </Popup>
        </Marker>

        <Marker position={delivery.coordinates} icon={pinIcon("#ef4444")}>
          <Popup>
            <p className="text-xs font-semibold text-gray-900">Delivery Marker</p>
            <p className="text-xs">{delivery.customer}</p>
          </Popup>
        </Marker>

        <Marker position={destination} icon={pinIcon("#a855f7")}>
          <Popup>
            <p className="text-xs font-semibold text-gray-900">Destination Marker</p>
            <p className="text-xs">Final access gate</p>
          </Popup>
        </Marker>

        {stops.map((stop, index) => (
          <CircleMarker
            key={stop.id}
            center={stop.coordinates}
            radius={6}
            pathOptions={{ color: "#465fff", fillColor: "#465fff", fillOpacity: 0.72 }}
          >
            <Popup>
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-gray-900">Stop {index + 1}</p>
                <p>{stop.customer}</p>
                <p>{stop.address}</p>
                <div className="pt-1">
                  <a href={`/loads/${stop.loadId}`} className="text-brand-600 hover:text-brand-700">
                    Open Related Load
                  </a>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {incidents.map((incident) => (
          <CircleMarker
            key={incident.id}
            center={incident.coordinates}
            radius={8}
            pathOptions={{
              color: severityColor(incident.severity),
              fillColor: severityColor(incident.severity),
              fillOpacity: 0.8,
            }}
          >
            <Popup>
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-gray-900">{incident.title}</p>
                <p>{incident.type}</p>
                <p>Severity: {incident.severity}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
