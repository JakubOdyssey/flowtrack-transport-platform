import React from "react";
import { TrailerPreviewPallet } from "@/data/load-management";

interface LoadTrailerMiniPreviewProps {
  pallets: TrailerPreviewPallet[];
}

const COLS = 14;
const ROWS = 6;

export default function LoadTrailerMiniPreview({ pallets }: LoadTrailerMiniPreviewProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-white/[0.02]">
      <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-900/85 dark:border-gray-700" style={{ aspectRatio: "16 / 5" }}>
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)]"
          style={{ backgroundSize: `${100 / COLS}% ${100 / ROWS}%`, opacity: 0.3 }}
        />

        {pallets.map((pallet) => (
          <div
            key={pallet.id}
            className={`absolute rounded-md border border-white/40 ${pallet.colorClass}`}
            style={{
              left: `${(pallet.col / COLS) * 100}%`,
              top: `${(pallet.row / ROWS) * 100}%`,
              width: `${(pallet.len / COLS) * 100}%`,
              height: `${(pallet.wid / ROWS) * 100}%`,
              padding: "2px",
            }}
          >
            <span className="flex h-full w-full items-center justify-center rounded bg-black/15 px-1 text-[9px] font-medium text-white">
              {pallet.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
