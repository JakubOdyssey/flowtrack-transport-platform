"use client";

import React from "react";
import dynamic from "next/dynamic";

type Mode = "dashboard" | "operations";

const LeafletFleetMapInner = dynamic(() => import("@/components/flowtrack/LeafletFleetMapInner"), {
  ssr: false,
});

export default function MapboxFleetMap({ mode = "dashboard" }: { mode?: Mode }) {
  return <LeafletFleetMapInner mode={mode} />;
}
