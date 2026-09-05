import DriverProfileView from "@/components/flowtrack/DriverProfileView";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "FlowTrack Drivers",
  description: "Premium driver profile with live route operations",
};

interface DriversPageProps {
  searchParams?: Promise<{ driver?: string }>;
}

export default async function DriversPage({ searchParams }: DriversPageProps) {
  const params = (await searchParams) ?? {};
  return <DriverProfileView initialDriverId={params.driver} />;
}
