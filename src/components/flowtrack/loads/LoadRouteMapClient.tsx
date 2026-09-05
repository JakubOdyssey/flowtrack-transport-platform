"use client";

import dynamic from "next/dynamic";

const LoadRouteMap = dynamic(() => import("@/components/flowtrack/loads/LoadRouteMap"), {
  ssr: false,
});

interface LoadRouteMapClientProps {
  coordinates: [number, number][];
  pickupLabel: string;
  deliveryLabel: string;
}

export default function LoadRouteMapClient(props: LoadRouteMapClientProps) {
  return <LoadRouteMap {...props} />;
}
