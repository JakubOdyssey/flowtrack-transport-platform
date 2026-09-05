"use client";

import React, { useEffect, useMemo, useState } from "react";
import L, { DivIcon, LatLngTuple } from "leaflet";
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getRoadRoute } from "@/components/flowtrack/roadRouting";

interface IncidentMarker {
  id: string;
  title: string;
  detail: string;
  severity: "Low" | "Medium" | "High";
  location: LatLngTuple;
}

interface DriverProfileLiveMapProps {
  truckId: string;
  heading: number;
  currentSpeedKph: number;
  route: LatLngTuple[];
  destinationLabel: string;
  trafficMarkers: LatLngTuple[];
  incidents: IncidentMarker[];
}

function headingToCardinal(heading: number) {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(((heading % 360) / 45)) % 8;
  return directions[index];
}

function incidentColor(severity: IncidentMarker["severity"]) {
  if (severity === "High") {
    return "#ef4444";
  }
  if (severity === "Medium") {
    return "#f59e0b";
  }
  return "#22c55e";
}

function truckIcon(heading: number): DivIcon {
  return L.divIcon({
    className: "flowtrack-driver-map-truck",
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -18],
    html: `
      <div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;">
        <img src="/images/flowtrack/truck-icon.png" alt="truck" class="flowtrack-truck-icon" style="width:40px;height:40px;object-fit:contain;transform:rotate(${heading}deg);transform-origin:center;"/>
      </div>
    `,
  });
}

function destinationIcon(): DivIcon {
  return L.divIcon({
    className: "flowtrack-driver-map-destination",
    iconSize: [24, 24],
    iconAnchor: [12, 20],
    html: `
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="destination">
        <path d="M12 2C8.1 2 5 5.1 5 9c0 5.5 7 13 7 13s7-7.5 7-13c0-3.9-3.1-7-7-7Z" fill="#22c55e"/>
        <circle cx="12" cy="9" r="3" fill="#ffffff"/>
      </svg>
    `,
  });
}

export default function DriverProfileLiveMap({
  truckId,
  heading,
  currentSpeedKph,
  route,
  destinationLabel,
  trafficMarkers,
  incidents,
}: DriverProfileLiveMapProps) {
  const currentLocation = route[0];
  const destination = route[route.length - 1];
  const [roadRoute, setRoadRoute] = useState<LatLngTuple[]>(route);

  useEffect(() => {
    let mounted = true;
    getRoadRoute(route).then((snappedRoute) => {
      if (mounted) {
        setRoadRoute(snappedRoute);
      }
    });

    return () => {
      mounted = false;
    };
  }, [route]);

  const center = useMemo<LatLngTuple>(() => {
    const lat = (currentLocation[0] + destination[0]) / 2;
    const lng = (currentLocation[1] + destination[1]) / 2;
    return [lat, lng];
  }, [currentLocation, destination]);

  return (
    <div className="space-y-3">
      <div className="relative h-[360px] overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
        <MapContainer center={center} zoom={7} scrollWheelZoom className="h-full w-full" attributionControl>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Polyline positions={roadRoute} pathOptions={{ color: "#465fff", weight: 4, opacity: 0.8 }} />

          <Marker position={currentLocation} icon={truckIcon(heading)}>
            <Popup>
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-gray-900">{truckId}</p>
                <p>Speed: {currentSpeedKph} km/h</p>
                <p>
                  Heading: {heading.toFixed(0)} deg {headingToCardinal(heading)}
                </p>
              </div>
            </Popup>
          </Marker>

          <Marker position={destination} icon={destinationIcon()}>
            <Popup>
              <div className="text-xs">
                <p className="font-semibold text-gray-900">Destination</p>
                <p>{destinationLabel}</p>
              </div>
            </Popup>
          </Marker>

          {trafficMarkers.map((position, index) => (
            <CircleMarker
              key={`traffic-${index}`}
              center={position}
              radius={7}
              pathOptions={{ color: "#f59e0b", fillColor: "#f59e0b", fillOpacity: 0.65 }}
            >
              <Popup>
                <p className="text-xs font-medium text-gray-900">Traffic slowdown reported</p>
              </Popup>
            </CircleMarker>
          ))}

          {incidents.map((incident) => (
            <CircleMarker
              key={incident.id}
              center={incident.location}
              radius={8}
              pathOptions={{
                color: incidentColor(incident.severity),
                fillColor: incidentColor(incident.severity),
                fillOpacity: 0.78,
              }}
            >
              <Popup>
                <div className="space-y-1 text-xs">
                  <p className="font-semibold text-gray-900">{incident.title}</p>
                  <p>{incident.detail}</p>
                  <p>Severity: {incident.severity}</p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-white/[0.02]">
        <div className="flex flex-wrap items-center justify-between gap-2 text-theme-xs text-gray-500 dark:text-gray-400">
          <span>Live heading: {heading.toFixed(0)} deg {headingToCardinal(heading)}</span>
          <span>OSM live operations layer</span>
        </div>
      </div>
    </div>
  );
}
