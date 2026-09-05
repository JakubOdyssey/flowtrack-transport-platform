"use client";

import React, { useEffect, useMemo, useState } from "react";
import L, { DivIcon, LatLngTuple } from "leaflet";
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getRoadRoute } from "@/components/flowtrack/roadRouting";

interface LoadRouteMapProps {
  coordinates: [number, number][];
  pickupLabel: string;
  deliveryLabel: string;
}

function truckIcon(): DivIcon {
  return L.divIcon({
    className: "flowtrack-load-route-truck",
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -16],
    html: `
      <img src="/images/flowtrack/truck-icon.png" alt="truck" class="flowtrack-truck-icon" style="width:40px;height:40px;object-fit:contain;"/>
    `,
  });
}

function terminalIcon(color: string): DivIcon {
  return L.divIcon({
    className: "flowtrack-load-route-terminal",
    iconSize: [24, 24],
    iconAnchor: [12, 20],
    html: `
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="terminal">
        <path d="M12 2C8.1 2 5 5.1 5 9c0 5.5 7 13 7 13s7-7.5 7-13c0-3.9-3.1-7-7-7Z" fill="${color}"/>
        <circle cx="12" cy="9" r="3" fill="#ffffff"/>
      </svg>
    `,
  });
}

export default function LoadRouteMap({ coordinates, pickupLabel, deliveryLabel }: LoadRouteMapProps) {
  const pickup = coordinates[0];
  const delivery = coordinates[coordinates.length - 1];
  const [roadRoute, setRoadRoute] = useState<LatLngTuple[]>(coordinates);

  useEffect(() => {
    let mounted = true;
    getRoadRoute(coordinates).then((snappedRoute) => {
      if (mounted) {
        setRoadRoute(snappedRoute);
      }
    });

    return () => {
      mounted = false;
    };
  }, [coordinates]);

  const center = useMemo<[number, number]>(() => {
    const lat = (pickup[0] + delivery[0]) / 2;
    const lng = (pickup[1] + delivery[1]) / 2;
    return [lat, lng];
  }, [pickup, delivery]);

  return (
    <div className="h-[220px] overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
      <MapContainer center={center} zoom={6.7} scrollWheelZoom className="h-full w-full" attributionControl>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Polyline positions={roadRoute} pathOptions={{ color: "#465fff", weight: 4, opacity: 0.82 }} />

        <Marker position={pickup} icon={terminalIcon("#22c55e")}>
          <Popup>
            <p className="text-xs font-medium text-gray-900">Pickup: {pickupLabel}</p>
          </Popup>
        </Marker>

        <Marker position={delivery} icon={terminalIcon("#ef4444")}>
          <Popup>
            <p className="text-xs font-medium text-gray-900">Delivery: {deliveryLabel}</p>
          </Popup>
        </Marker>

        <Marker position={roadRoute[Math.floor((roadRoute.length - 1) * 0.35)] ?? pickup} icon={truckIcon()}>
          <Popup>
            <p className="text-xs font-medium text-gray-900">Current truck position</p>
          </Popup>
        </Marker>

        {coordinates.slice(1, -1).map((position, index) => (
          <CircleMarker
            key={`stop-${index}`}
            center={position}
            radius={5}
            pathOptions={{ color: "#f59e0b", fillColor: "#f59e0b", fillOpacity: 0.7 }}
          >
            <Popup>
              <p className="text-xs font-medium text-gray-900">Intermediate stop {index + 1}</p>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
