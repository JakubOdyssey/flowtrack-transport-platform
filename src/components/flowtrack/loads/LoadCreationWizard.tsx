"use client";

import React, { useMemo, useState } from "react";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { drivers, trailers, vehicles } from "@/data/flowtrack";
import { loadWizardSteps } from "@/data/load-management";
import Link from "next/link";

const customerOptions = [
  "Tesco Distribution",
  "DHL Supply Chain",
  "Aldi Logistics",
  "Unilever UK",
  "Amazon Logistics",
];

const cargoOptions = [
  "Ambient Grocery",
  "Automotive Components",
  "Dry Retail Pallets",
  "Household Goods",
  "Mixed FMCG",
];

export default function LoadCreationWizard() {
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState({
    customer: customerOptions[0],
    pickup: "Birmingham DC",
    delivery: "Glasgow NDC",
    cargo: cargoOptions[0],
    palletCount: 24,
    weightKg: 16800,
    volumeM3: 64,
    driver: drivers[0]?.name ?? "",
    vehicle: vehicles[0]?.id ?? "",
    trailer: trailers[0]?.id ?? "",
    priority: "High",
    dangerousGoods: "No",
    temperatureControlled: "No",
    fragile: "Yes",
    notes: "Priority unload required at destination dock.",
  });

  const isLastStep = stepIndex === loadWizardSteps.length - 1;

  const completion = useMemo(() => ((stepIndex + 1) / loadWizardSteps.length) * 100, [stepIndex]);

  const trailerPlannerHref = useMemo(
    () => ({
      pathname: "/trailer-planner",
      query: {
        source: "load-wizard",
        customer: form.customer,
        cargo: form.cargo,
        palletCount: String(form.palletCount),
        weightKg: String(form.weightKg),
        delivery: form.delivery,
      },
    }),
    [form]
  );

  const persistTrailerPlannerContext = () => {
    try {
      window.localStorage.setItem(
        "flowtrack:last-load-wizard",
        JSON.stringify({
          source: "load-wizard",
          customer: form.customer,
          cargo: form.cargo,
          palletCount: String(form.palletCount),
          weightKg: String(form.weightKg),
          delivery: form.delivery,
          savedAt: new Date().toISOString(),
        })
      );
    } catch {
      // Ignore storage failures and continue navigation.
    }
  };

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (isLastStep) {
      return;
    }
    setStepIndex((prev) => prev + 1);
  };

  const prevStep = () => {
    if (stepIndex === 0) {
      return;
    }
    setStepIndex((prev) => prev - 1);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">Load Creation Wizard</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Step {stepIndex + 1} of {loadWizardSteps.length}: {loadWizardSteps[stepIndex]}
            </p>
          </div>
          <Badge color="primary">Fast Dispatch Workflow</Badge>
        </div>

        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
          <div className="h-full rounded-full bg-brand-500" style={{ width: `${completion}%` }} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8">
          {loadWizardSteps.map((step, index) => (
            <div
              key={step}
              className={`rounded-lg border px-3 py-2 text-theme-xs font-medium ${
                index <= stepIndex
                  ? "border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-500/40 dark:bg-brand-500/10 dark:text-brand-300"
                  : "border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-400"
              }`}
            >
              {index + 1}. {step}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        {stepIndex === 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-theme-xs text-gray-500 dark:text-gray-400">Customer</span>
              <select
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
                value={form.customer}
                onChange={(event) => updateField("customer", event.target.value)}
              >
                {customerOptions.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-theme-xs text-gray-500 dark:text-gray-400">Priority</span>
              <select
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
                value={form.priority}
                onChange={(event) => updateField("priority", event.target.value)}
              >
                {[
                  "Critical",
                  "High",
                  "Medium",
                  "Normal",
                ].map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>
        )}

        {stepIndex === 1 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-theme-xs text-gray-500 dark:text-gray-400">Pickup</span>
              <input
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
                value={form.pickup}
                onChange={(event) => updateField("pickup", event.target.value)}
              />
            </label>
            <label className="space-y-1">
              <span className="text-theme-xs text-gray-500 dark:text-gray-400">Delivery</span>
              <input
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
                value={form.delivery}
                onChange={(event) => updateField("delivery", event.target.value)}
              />
            </label>
          </div>
        )}

        {stepIndex === 2 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="space-y-1 sm:col-span-2">
              <span className="text-theme-xs text-gray-500 dark:text-gray-400">Cargo</span>
              <select
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
                value={form.cargo}
                onChange={(event) => updateField("cargo", event.target.value)}
              >
                {cargoOptions.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-theme-xs text-gray-500 dark:text-gray-400">Pallet Count</span>
              <input
                type="number"
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
                value={form.palletCount}
                onChange={(event) => updateField("palletCount", event.target.value)}
              />
            </label>
            <label className="space-y-1">
              <span className="text-theme-xs text-gray-500 dark:text-gray-400">Weight (kg)</span>
              <input
                type="number"
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
                value={form.weightKg}
                onChange={(event) => updateField("weightKg", event.target.value)}
              />
            </label>
            <label className="space-y-1">
              <span className="text-theme-xs text-gray-500 dark:text-gray-400">Volume (m3)</span>
              <input
                type="number"
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
                value={form.volumeM3}
                onChange={(event) => updateField("volumeM3", event.target.value)}
              />
            </label>
            <label className="space-y-1">
              <span className="text-theme-xs text-gray-500 dark:text-gray-400">Dangerous Goods</span>
              <select
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
                value={form.dangerousGoods}
                onChange={(event) => updateField("dangerousGoods", event.target.value)}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-theme-xs text-gray-500 dark:text-gray-400">Temperature Controlled</span>
              <select
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
                value={form.temperatureControlled}
                onChange={(event) => updateField("temperatureControlled", event.target.value)}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-theme-xs text-gray-500 dark:text-gray-400">Fragile</span>
              <select
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
                value={form.fragile}
                onChange={(event) => updateField("fragile", event.target.value)}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </label>
          </div>
        )}

        {stepIndex === 3 && (
          <label className="space-y-1 block">
            <span className="text-theme-xs text-gray-500 dark:text-gray-400">Assign Driver</span>
            <select
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
              value={form.driver}
              onChange={(event) => updateField("driver", event.target.value)}
            >
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.name}>{driver.name}</option>
              ))}
            </select>
          </label>
        )}

        {stepIndex === 4 && (
          <label className="space-y-1 block">
            <span className="text-theme-xs text-gray-500 dark:text-gray-400">Assign Vehicle</span>
            <select
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
              value={form.vehicle}
              onChange={(event) => updateField("vehicle", event.target.value)}
            >
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>{vehicle.id} ({vehicle.model})</option>
              ))}
            </select>
          </label>
        )}

        {stepIndex === 5 && (
          <label className="space-y-1 block">
            <span className="text-theme-xs text-gray-500 dark:text-gray-400">Assign Trailer</span>
            <select
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
              value={form.trailer}
              onChange={(event) => updateField("trailer", event.target.value)}
            >
              {trailers.map((trailer) => (
                <option key={trailer.id} value={trailer.id}>{trailer.id} ({trailer.type})</option>
              ))}
            </select>
          </label>
        )}

        {stepIndex === 6 && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-white/[0.02]">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Trailer Planner integration ready. Based on this load, pallets will be auto-suggested and pre-positioned in the trailer.
            </p>
            <Link href={trailerPlannerHref} onClick={persistTrailerPlannerContext} className="mt-3 inline-block">
              <Button size="sm" variant="outline">Open Trailer Planner</Button>
            </Link>
          </div>
        )}

        {stepIndex === 7 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
              <p className="text-theme-xs text-gray-500 dark:text-gray-400">Customer</p>
              <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{form.customer}</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
              <p className="text-theme-xs text-gray-500 dark:text-gray-400">Route</p>
              <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{form.pickup} to {form.delivery}</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
              <p className="text-theme-xs text-gray-500 dark:text-gray-400">Cargo</p>
              <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{form.cargo}</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
              <p className="text-theme-xs text-gray-500 dark:text-gray-400">Resources</p>
              <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{form.driver}, {form.vehicle}, {form.trailer}</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700 sm:col-span-2">
              <p className="text-theme-xs text-gray-500 dark:text-gray-400">Notes</p>
              <textarea
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                className="mt-2 min-h-[90px] w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button size="sm" variant="outline" onClick={prevStep} disabled={stepIndex === 0}>
          Back
        </Button>

        <div className="flex items-center gap-2">
          {!isLastStep && (
            <Button size="sm" onClick={nextStep}>
              Next Step
            </Button>
          )}
          {isLastStep && (
            <Link href="/loads">
              <Button size="sm">Dispatch</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
