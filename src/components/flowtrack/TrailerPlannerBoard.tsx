"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";

type PalletTypeId = "euro" | "uk" | "industrial" | "half" | "quarter" | "custom";

interface PalletType {
  id: PalletTypeId;
  label: string;
  lengthMm: number;
  widthMm: number;
  defaultWeightKg: number;
  colorClass: string;
}

interface PlacedPallet {
  id: string;
  typeId: PalletTypeId;
  col: number;
  row: number;
  rotated: boolean;
  weightKg?: number;
  name: string;
  customer: string;
  deliveryStop: string;
  notes: string;
}

interface DragCandidate {
  id: string;
  typeId: PalletTypeId;
  col: number;
  row: number;
  rotated: boolean;
}

interface FloorPolygonPoint {
  xPct: number;
  yPct: number;
}

interface DragStateNew {
  kind: "new";
  pointerId: number;
  typeId: PalletTypeId;
  rotated: boolean;
  candidate: DragCandidate;
  valid: boolean;
}

interface DragStateMove {
  kind: "move";
  pointerId: number;
  movingIds: string[];
  baseById: Record<string, Pick<PlacedPallet, "col" | "row">>;
  startCell: { col: number; row: number };
  startCandidates: DragCandidate[];
  candidates: DragCandidate[];
  valid: boolean;
}

type DragState = DragStateNew | DragStateMove;

const TRAILER = {
  lengthMm: 13600,
  widthMm: 2480,
  heightMm: 2700,
  maxWeightKg: 28000,
};

const CELL_MM = 100;
const COLS = Math.floor(TRAILER.lengthMm / CELL_MM);
const ROWS = Math.floor(TRAILER.widthMm / CELL_MM);

const FLOOR_BOUNDS = {
  leftPct: 8.2,
  topPct: 12.5,
  widthPct: 84.3,
  heightPct: 74,
};

const FLOOR_POLYGON: FloorPolygonPoint[] = [
  { xPct: 1.2, yPct: 11.8 },
  { xPct: 98.6, yPct: 4.9 },
  { xPct: 99.0, yPct: 95.4 },
  { xPct: 0.9, yPct: 99.0 },
];

const basePalletTypes: PalletType[] = [
  { id: "euro", label: "Euro pallet", lengthMm: 1200, widthMm: 800, defaultWeightKg: 650, colorClass: "bg-brand-500/75" },
  { id: "uk", label: "UK pallet", lengthMm: 1200, widthMm: 1000, defaultWeightKg: 760, colorClass: "bg-success-500/75" },
  { id: "industrial", label: "Industrial pallet", lengthMm: 1200, widthMm: 1200, defaultWeightKg: 900, colorClass: "bg-warning-500/75" },
  { id: "half", label: "Half pallet", lengthMm: 800, widthMm: 600, defaultWeightKg: 380, colorClass: "bg-blue-light-500/75" },
  { id: "quarter", label: "Quarter pallet", lengthMm: 600, widthMm: 400, defaultWeightKg: 220, colorClass: "bg-gray-500/75" },
];

function dimsInCells(type: PalletType, rotated: boolean) {
  const lengthMm = rotated ? type.widthMm : type.lengthMm;
  const widthMm = rotated ? type.lengthMm : type.widthMm;
  return {
    lenCells: Math.max(1, Math.ceil(lengthMm / CELL_MM)),
    widCells: Math.max(1, Math.ceil(widthMm / CELL_MM)),
  };
}

interface TrailerPalletItemProps {
  id: string;
  label: string;
  colorClass: string;
  selected: boolean;
  isDragging: boolean;
  invalidMovePreview: boolean;
  left: string;
  top: string;
  width: string;
  height: string;
  onStartMove: (id: string, event: React.PointerEvent<HTMLButtonElement>) => void;
  onSelect: (id: string, event: React.MouseEvent<HTMLButtonElement>) => void;
}

const TrailerPalletItem = React.memo(function TrailerPalletItem({
  id,
  label,
  colorClass,
  selected,
  isDragging,
  invalidMovePreview,
  left,
  top,
  width,
  height,
  onStartMove,
  onSelect,
}: TrailerPalletItemProps) {
  return (
    <button
      type="button"
      data-planner-pallet={id}
      onPointerDown={(event) => onStartMove(id, event)}
      onClick={(event) => onSelect(id, event)}
      className={`absolute touch-none select-none rounded-md border text-[10px] font-medium text-white shadow-theme-xs transition-all duration-150 ${
        colorClass
      } ${
        invalidMovePreview
          ? "border-error-300 ring-2 ring-error-300"
          : selected
          ? "border-brand-200 ring-2 ring-brand-300"
          : "border-white/60"
      }`}
      style={{
        left,
        top,
        width,
        height,
        transform: isDragging ? "scale(1.04)" : "scale(1)",
        padding: "2px",
      }}
    >
      <span className="flex h-full w-full items-center justify-center rounded bg-black/15 px-1 text-center leading-tight">
        {label}
      </span>
    </button>
  );
});

function areCandidatesEqual(a: DragCandidate[], b: DragCandidate[]) {
  if (a.length !== b.length) {
    return false;
  }

  const byId = new Map(a.map((item) => [item.id, item]));
  for (const next of b) {
    const prev = byId.get(next.id);
    if (!prev) {
      return false;
    }
    if (
      prev.col !== next.col ||
      prev.row !== next.row ||
      prev.rotated !== next.rotated ||
      prev.typeId !== next.typeId
    ) {
      return false;
    }
  }
  return true;
}

function overlaps(
  a: { col: number; row: number; len: number; wid: number },
  b: { col: number; row: number; len: number; wid: number }
) {
  return !(
    a.col + a.len <= b.col ||
    b.col + b.len <= a.col ||
    a.row + a.wid <= b.row ||
    b.row + b.wid <= a.row
  );
}

function pointInPolygon(xPct: number, yPct: number, polygon: FloorPolygonPoint[]) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].xPct;
    const yi = polygon[i].yPct;
    const xj = polygon[j].xPct;
    const yj = polygon[j].yPct;

    const intersect =
      yi > yPct !== yj > yPct &&
      xPct < ((xj - xi) * (yPct - yi)) / (yj - yi + Number.EPSILON) + xi;

    if (intersect) {
      inside = !inside;
    }
  }
  return inside;
}

function cellFullyInsidePolygon(col: number, row: number, polygon: FloorPolygonPoint[]) {
  const left = (col / COLS) * 100;
  const right = ((col + 1) / COLS) * 100;
  const top = (row / ROWS) * 100;
  const bottom = ((row + 1) / ROWS) * 100;
  const inset = 0.05;

  return (
    pointInPolygon(left + inset, top + inset, polygon) &&
    pointInPolygon(right - inset, top + inset, polygon) &&
    pointInPolygon(right - inset, bottom - inset, polygon) &&
    pointInPolygon(left + inset, bottom - inset, polygon)
  );
}

function cellFromPointer(
  container: HTMLDivElement | null,
  clientX: number,
  clientY: number,
  floorPolygon: FloorPolygonPoint[]
) {
  if (!container) {
    return null;
  }

  const rect = container.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  const col = Math.floor((x / rect.width) * COLS);
  const row = Math.floor((y / rect.height) * ROWS);
  const xPct = (x / rect.width) * 100;
  const yPct = (y / rect.height) * 100;

  return {
    col,
    row,
    inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height,
    insideFloor: pointInPolygon(xPct, yPct, floorPolygon),
  };
}

export default function TrailerPlannerBoard() {
  const interiorRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const placedRef = useRef<PlacedPallet[]>([]);
  const selectedIdsRef = useRef<string[]>([]);
  const pointerCacheRef = useRef<{ x: number; y: number } | null>(null);
  const moveRafRef = useRef<number | null>(null);

  const [placed, setPlaced] = useState<PlacedPallet[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [customPallet, setCustomPallet] = useState({
    lengthMm: 1200,
    widthMm: 800,
    defaultWeightKg: 650,
  });
  const [bulkAddTypeId, setBulkAddTypeId] = useState<PalletTypeId>("euro");
  const [bulkAddCount, setBulkAddCount] = useState(5);
  const [bulkSelectedWeight, setBulkSelectedWeight] = useState("");

  useEffect(() => {
    placedRef.current = placed;
  }, [placed]);

  useEffect(() => {
    selectedIdsRef.current = selectedIds;
  }, [selectedIds]);

  const palletTypes = useMemo<PalletType[]>(
    () => [
      ...basePalletTypes,
      {
        id: "custom",
        label: "Custom pallet",
        lengthMm: customPallet.lengthMm,
        widthMm: customPallet.widthMm,
        defaultWeightKg: customPallet.defaultWeightKg,
        colorClass: "bg-indigo-500/75",
      },
    ],
    [customPallet]
  );

  const typeMap = useMemo(() => {
    const map = new Map<PalletTypeId, PalletType>();
    palletTypes.forEach((item) => map.set(item.id, item));
    return map;
  }, [palletTypes]);

  const floorClipPath = useMemo(
    () => `polygon(${FLOOR_POLYGON.map((point) => `${point.xPct}% ${point.yPct}%`).join(", ")})`,
    []
  );

  const validCellMap = useMemo(
    () =>
      Array.from({ length: ROWS }, (_, row) =>
        Array.from({ length: COLS }, (_, col) => cellFullyInsidePolygon(col, row, FLOOR_POLYGON))
      ),
    []
  );

  const selectedPallets = useMemo(
    () => placed.filter((item) => selectedIds.includes(item.id)),
    [placed, selectedIds]
  );
  const selectedPrimary = selectedPallets[0] ?? null;

  const setDragState = (next: DragState | null) => {
    dragRef.current = next;
    setDrag(next);
  };

  const validateCandidates = (
    candidates: DragCandidate[],
    currentPlaced: PlacedPallet[],
    ignoreIds: string[] = []
  ) => {
    const staticPlaced = currentPlaced.filter((item) => !ignoreIds.includes(item.id));
    const staticRects = staticPlaced
      .map((item) => {
        const fixedType = typeMap.get(item.typeId);
        if (!fixedType) {
          return null;
        }
        const fixedDims = dimsInCells(fixedType, item.rotated);
        return {
          col: item.col,
          row: item.row,
          len: fixedDims.lenCells,
          wid: fixedDims.widCells,
        };
      })
      .filter((item): item is { col: number; row: number; len: number; wid: number } => item !== null);

    for (const candidate of candidates) {
      const type = typeMap.get(candidate.typeId);
      if (!type) {
        return false;
      }

      const dims = dimsInCells(type, candidate.rotated);
      if (
        candidate.col < 0 ||
        candidate.row < 0 ||
        candidate.col + dims.lenCells > COLS ||
        candidate.row + dims.widCells > ROWS
      ) {
        return false;
      }

      for (let row = candidate.row; row < candidate.row + dims.widCells; row += 1) {
        for (let col = candidate.col; col < candidate.col + dims.lenCells; col += 1) {
          if (!validCellMap[row]?.[col]) {
            return false;
          }
        }
      }

      const candidateRect = {
        col: candidate.col,
        row: candidate.row,
        len: dims.lenCells,
        wid: dims.widCells,
      };

      for (const fixedRect of staticRects) {
        if (overlaps(candidateRect, fixedRect)) {
          return false;
        }
      }
    }

    for (let i = 0; i < candidates.length; i += 1) {
      const aType = typeMap.get(candidates[i].typeId);
      if (!aType) {
        return false;
      }
      const aDims = dimsInCells(aType, candidates[i].rotated);
      const aRect = {
        col: candidates[i].col,
        row: candidates[i].row,
        len: aDims.lenCells,
        wid: aDims.widCells,
      };

      for (let j = i + 1; j < candidates.length; j += 1) {
        const bType = typeMap.get(candidates[j].typeId);
        if (!bType) {
          return false;
        }
        const bDims = dimsInCells(bType, candidates[j].rotated);
        const bRect = {
          col: candidates[j].col,
          row: candidates[j].row,
          len: bDims.lenCells,
          wid: bDims.widCells,
        };

        if (overlaps(aRect, bRect)) {
          return false;
        }
      }
    }

    return true;
  };

  const nearestSingleCandidate = (
    base: DragCandidate,
    currentPlaced: PlacedPallet[],
    ignoreIds: string[] = []
  ) => {
    let best: DragCandidate | null = null;
    let bestDist = Number.POSITIVE_INFINITY;
    const SEARCH_RADIUS = 22;

    for (let radius = 0; radius <= SEARCH_RADIUS; radius += 1) {
      for (let dRow = -radius; dRow <= radius; dRow += 1) {
        for (let dCol = -radius; dCol <= radius; dCol += 1) {
          if (Math.max(Math.abs(dRow), Math.abs(dCol)) !== radius) {
            continue;
          }

          const candidate: DragCandidate = {
            ...base,
            col: base.col + dCol,
            row: base.row + dRow,
          };

          if (!validateCandidates([candidate], currentPlaced, ignoreIds)) {
            continue;
          }

          const dist = dCol * dCol + dRow * dRow;
          if (dist < bestDist) {
            best = candidate;
            bestDist = dist;
          }
        }
      }

      if (best) {
        return best;
      }
    }

    return null;
  };

  const firstFitCandidate = (typeId: PalletTypeId, currentPlaced: PlacedPallet[]) => {
    const type = typeMap.get(typeId);
    if (!type) {
      return null;
    }

    for (const rotated of [false, true]) {
      const dims = dimsInCells(type, rotated);
      for (let row = 0; row <= ROWS - dims.widCells; row += 1) {
        for (let col = 0; col <= COLS - dims.lenCells; col += 1) {
          const candidate: DragCandidate = {
            id: "BATCH",
            typeId,
            col,
            row,
            rotated,
          };

          if (validateCandidates([candidate], currentPlaced)) {
            return candidate;
          }
        }
      }
    }

    return null;
  };

  const nearestMultiCandidates = (
    baseCandidates: DragCandidate[],
    currentPlaced: PlacedPallet[],
    ignoreIds: string[] = []
  ) => {
    let best: DragCandidate[] | null = null;
    let bestDist = Number.POSITIVE_INFINITY;
    const SEARCH_RADIUS = 16;

    for (let radius = 0; radius <= SEARCH_RADIUS; radius += 1) {
      for (let dRow = -radius; dRow <= radius; dRow += 1) {
        for (let dCol = -radius; dCol <= radius; dCol += 1) {
          if (Math.max(Math.abs(dRow), Math.abs(dCol)) !== radius) {
            continue;
          }

          const shifted = baseCandidates.map((candidate) => ({
            ...candidate,
            col: candidate.col + dCol,
            row: candidate.row + dRow,
          }));

          if (!validateCandidates(shifted, currentPlaced, ignoreIds)) {
            continue;
          }

          const dist = dCol * dCol + dRow * dRow;
          if (dist < bestDist) {
            best = shifted;
            bestDist = dist;
          }
        }
      }

      if (best) {
        return best;
      }
    }

    return null;
  };

  const beginNewDrag = (typeId: PalletTypeId, event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const type = typeMap.get(typeId);
    if (!type) {
      return;
    }

    const pointerCell = cellFromPointer(interiorRef.current, event.clientX, event.clientY, FLOOR_POLYGON);
    const dims = dimsInCells(type, false);

    const baseCandidate: DragCandidate = {
      id: "preview",
      typeId,
      col: (pointerCell?.col ?? 0) - Math.floor(dims.lenCells / 2),
      row: (pointerCell?.row ?? 0) - Math.floor(dims.widCells / 2),
      rotated: false,
    };

    const snapped = nearestSingleCandidate(baseCandidate, placed);
    setDragState({
      kind: "new",
      pointerId: event.pointerId,
      typeId,
      rotated: false,
      candidate: snapped ?? baseCandidate,
      valid: !!snapped,
    });
  };

  const beginMoveDrag = (id: string, event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.ctrlKey || event.metaKey) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    const pointerCell = cellFromPointer(interiorRef.current, event.clientX, event.clientY, FLOOR_POLYGON);
    if (!pointerCell) {
      return;
    }

    const isMulti = selectedIdsRef.current.includes(id);
    const movingIds = isMulti ? [...selectedIdsRef.current] : [id];
    if (!isMulti) {
      setSelectedIds([id]);
    }

    const baseById: Record<string, Pick<PlacedPallet, "col" | "row">> = {};
    placedRef.current.forEach((item) => {
      if (movingIds.includes(item.id)) {
        baseById[item.id] = { col: item.col, row: item.row };
      }
    });

    const candidates = placedRef.current
      .filter((item) => movingIds.includes(item.id))
      .map((item) => ({
        id: item.id,
        typeId: item.typeId,
        col: item.col,
        row: item.row,
        rotated: item.rotated,
      }));

    setDragState({
      kind: "move",
      pointerId: event.pointerId,
      movingIds,
      baseById,
      startCell: { col: pointerCell.col, row: pointerCell.row },
      startCandidates: candidates,
      candidates,
      valid: true,
    });
  };

  const onSelectPallet = (id: string, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (event.ctrlKey || event.metaKey) {
      setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
      return;
    }
    setSelectedIds([id]);
  };

  const updateCustomPalletField = (
    field: "lengthMm" | "widthMm" | "defaultWeightKg",
    value: string
  ) => {
      const parsed = Number(value);
      if (Number.isNaN(parsed)) {
        return;
      }
      setCustomPallet((prev) => {
        if (field === "defaultWeightKg") {
          return { ...prev, defaultWeightKg: Math.max(0, Math.round(parsed)) };
        }
        if (field === "lengthMm") {
          return { ...prev, lengthMm: Math.max(400, Math.min(2400, Math.round(parsed))) };
        }
        return { ...prev, widthMm: Math.max(400, Math.min(2400, Math.round(parsed))) };
      });
  };

  useEffect(() => {
    const processMove = () => {
      moveRafRef.current = null;
      const activeDrag = dragRef.current;
      const pointer = pointerCacheRef.current;

      if (!activeDrag || !pointer) {
        return;
      }

      const pointerCell = cellFromPointer(interiorRef.current, pointer.x, pointer.y, FLOOR_POLYGON);
      if (!pointerCell) {
        return;
      }

      if (activeDrag.kind === "new") {
        const type = typeMap.get(activeDrag.typeId);
        if (!type) {
          return;
        }

        const dims = dimsInCells(type, activeDrag.rotated);
        const baseCandidate: DragCandidate = {
          id: "preview",
          typeId: activeDrag.typeId,
          col: pointerCell.col - Math.floor(dims.lenCells / 2),
          row: pointerCell.row - Math.floor(dims.widCells / 2),
          rotated: activeDrag.rotated,
        };

        const snapped = nearestSingleCandidate(baseCandidate, placedRef.current);
        const nextCandidate = snapped ?? baseCandidate;
        const nextValid = !!snapped;

        if (
          activeDrag.valid === nextValid &&
          activeDrag.candidate.col === nextCandidate.col &&
          activeDrag.candidate.row === nextCandidate.row &&
          activeDrag.candidate.rotated === nextCandidate.rotated
        ) {
          return;
        }

        setDragState({
          ...activeDrag,
          candidate: nextCandidate,
          valid: nextValid,
        });
      }

      if (activeDrag.kind === "move") {
        const deltaCol = pointerCell.col - activeDrag.startCell.col;
        const deltaRow = pointerCell.row - activeDrag.startCell.row;

        const baseCandidates = activeDrag.startCandidates.map((item) => ({
          ...item,
          col: activeDrag.baseById[item.id].col + deltaCol,
          row: activeDrag.baseById[item.id].row + deltaRow,
        }));

        const snapped = nearestMultiCandidates(baseCandidates, placedRef.current, activeDrag.movingIds);
        const nextCandidates = snapped ?? baseCandidates;
        const nextValid = !!snapped;

        if (activeDrag.valid === nextValid && areCandidatesEqual(activeDrag.candidates, nextCandidates)) {
          return;
        }

        setDragState({
          ...activeDrag,
          candidates: nextCandidates,
          valid: nextValid,
        });
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      const activeDrag = dragRef.current;
      if (activeDrag && event.pointerId !== activeDrag.pointerId) {
        return;
      }
      pointerCacheRef.current = { x: event.clientX, y: event.clientY };
      if (moveRafRef.current !== null) {
        return;
      }
      moveRafRef.current = window.requestAnimationFrame(processMove);
    };

    const onPointerUp = (event: PointerEvent) => {
      let activeDrag = dragRef.current;
      if (!activeDrag) {
        return;
      }
      if (event.pointerId !== activeDrag.pointerId) {
        return;
      }

      // Process the release coordinates synchronously. A quick drag and drop can
      // otherwise finish before the last requestAnimationFrame callback runs.
      pointerCacheRef.current = { x: event.clientX, y: event.clientY };
      if (moveRafRef.current !== null) {
        window.cancelAnimationFrame(moveRafRef.current);
        moveRafRef.current = null;
      }
      processMove();
      activeDrag = dragRef.current;
      if (!activeDrag) {
        return;
      }

      if (activeDrag.kind === "new" && activeDrag.valid) {
        const id = `PLT-${Math.random().toString(36).slice(2, 9)}`;
        const type = typeMap.get(activeDrag.candidate.typeId);
        setPlaced((prev) => [
          ...prev,
          {
            id,
            typeId: activeDrag.candidate.typeId,
            col: activeDrag.candidate.col,
            row: activeDrag.candidate.row,
            rotated: activeDrag.candidate.rotated,
            name: type ? `${type.label} ${id.slice(-3).toUpperCase()}` : id,
            customer: "",
            deliveryStop: "",
            notes: "",
          },
        ]);
        setSelectedIds([id]);
      }

      if (activeDrag.kind === "move") {
        if (activeDrag.valid) {
          const byId = new Map(activeDrag.candidates.map((item) => [item.id, item]));
          setPlaced((prev) =>
            prev.map((item) => {
              const moved = byId.get(item.id);
              if (!moved) {
                return item;
              }
              return {
                ...item,
                col: moved.col,
                row: moved.row,
                rotated: moved.rotated,
              };
            })
          );
        }
      }

      pointerCacheRef.current = null;
      setDragState(null);
    };

    const endDrag = () => {
      pointerCacheRef.current = null;
      setDragState(null);
    };

    const onPointerCancel = (event: PointerEvent) => {
      const activeDrag = dragRef.current;
      if (!activeDrag) {
        return;
      }
      if (event.pointerId !== activeDrag.pointerId) {
        return;
      }
      endDrag();
    };

    const onWindowBlur = () => {
      if (!dragRef.current) {
        return;
      }
      endDrag();
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerCancel);
    window.addEventListener("blur", onWindowBlur);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerCancel);
      window.removeEventListener("blur", onWindowBlur);
      if (moveRafRef.current !== null) {
        window.cancelAnimationFrame(moveRafRef.current);
      }
    };
  }, [nearestMultiCandidates, nearestSingleCandidate, typeMap]);

  const rotateSelected = () => {
    if (selectedIds.length === 0) {
      return;
    }

    setPlaced((prev) => {
      const next = prev.map((item) => {
        if (!selectedIds.includes(item.id)) {
          return item;
        }
        return { ...item, rotated: !item.rotated };
      });

      const candidates = next
        .filter((item) => selectedIds.includes(item.id))
        .map((item) => ({
          id: item.id,
          typeId: item.typeId,
          col: item.col,
          row: item.row,
          rotated: item.rotated,
        }));

      if (!validateCandidates(candidates, next, selectedIds)) {
        return prev;
      }
      return next;
    });
  };

  const deleteSelected = () => {
    if (selectedIds.length === 0) {
      return;
    }
    setPlaced((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
    setSelectedIds([]);
  };

  const addPalletBatch = () => {
    const count = Math.max(1, Math.min(80, Number.isFinite(bulkAddCount) ? Math.floor(bulkAddCount) : 1));
    const type = typeMap.get(bulkAddTypeId);
    if (!type) {
      return;
    }

    const addedIds: string[] = [];

    setPlaced((prev) => {
      const next = [...prev];

      for (let i = 0; i < count; i += 1) {
        const candidate = firstFitCandidate(bulkAddTypeId, next);
        if (!candidate) {
          break;
        }

        const id = `PLT-${Math.random().toString(36).slice(2, 9)}`;
        next.push({
          id,
          typeId: candidate.typeId,
          col: candidate.col,
          row: candidate.row,
          rotated: candidate.rotated,
          name: `${type.label} ${id.slice(-3).toUpperCase()}`,
          customer: "",
          deliveryStop: "",
          notes: "",
        });
        addedIds.push(id);
      }

      return next;
    });

    if (addedIds.length > 0) {
      setSelectedIds(addedIds);
    }
  };

  const applyWeightToSelected = () => {
    if (selectedIds.length === 0) {
      return;
    }

    const trimmed = bulkSelectedWeight.trim();

    if (!trimmed) {
      setPlaced((prev) =>
        prev.map((item) => (selectedIds.includes(item.id) ? { ...item, weightKg: undefined } : item))
      );
      return;
    }

    const parsed = Number(trimmed);
    if (Number.isNaN(parsed) || parsed < 0) {
      return;
    }

    setPlaced((prev) =>
      prev.map((item) => (selectedIds.includes(item.id) ? { ...item, weightKg: parsed } : item))
    );
  };

  const updateWeight = (id: string, value: string) => {
    setPlaced((prev) =>
      prev.map((item) => {
        if (item.id !== id) {
          return item;
        }

        const trimmed = value.trim();
        if (!trimmed) {
          return { ...item, weightKg: undefined };
        }

        const parsed = Number(trimmed);
        if (Number.isNaN(parsed) || parsed < 0) {
          return item;
        }

        return { ...item, weightKg: parsed };
      })
    );
  };

  const updatePalletField = (
    id: string,
    field: "name" | "customer" | "deliveryStop" | "notes",
    value: string
  ) => {
    setPlaced((prev) =>
      prev.map((item) => {
        if (item.id !== id) {
          return item;
        }
        return { ...item, [field]: value };
      })
    );
  };

  const placementForRender = useMemo(() => {
    const movedById =
      drag?.kind === "move" ? new Map(drag.candidates.map((item) => [item.id, item])) : null;

    return placed.map((item) => {
      if (!movedById) {
        return item;
      }
      const moved = movedById.get(item.id);
      if (!moved) {
        return item;
      }
      return {
        ...item,
        col: moved.col,
        row: moved.row,
        rotated: moved.rotated,
      };
    });
  }, [drag, placed]);

  const effectivePlaced = useMemo(() => {
    const base = placementForRender;
    if (!drag || drag.kind !== "new" || !drag.valid) {
      return base;
    }

    const previewId = "PREVIEW-CALC";
    return [
      ...base,
      {
        id: previewId,
        typeId: drag.candidate.typeId,
        col: drag.candidate.col,
        row: drag.candidate.row,
        rotated: drag.candidate.rotated,
        name: previewId,
        customer: "",
        deliveryStop: "",
        notes: "",
      },
    ];
  }, [drag, placementForRender]);

  const stats = useMemo(() => {
    const trailerAreaMm2 = TRAILER.lengthMm * TRAILER.widthMm;

    const usedAreaMm2 = effectivePlaced.reduce((sum, item) => {
      const type = typeMap.get(item.typeId);
      if (!type) {
        return sum;
      }
      const dims = dimsInCells(type, item.rotated);
      return sum + dims.lenCells * CELL_MM * (dims.widCells * CELL_MM);
    }, 0);

    const knownWeightPallets = effectivePlaced.filter((item) => typeof item.weightKg === "number");
    const knownWeight = knownWeightPallets.reduce((sum, item) => sum + (item.weightKg ?? 0), 0);
    const estimatedWeight = effectivePlaced.reduce((sum, item) => {
      const type = typeMap.get(item.typeId);
      return sum + (item.weightKg ?? type?.defaultWeightKg ?? 0);
    }, 0);

    const frontCol = COLS / 3;
    const middleCol = (COLS / 3) * 2;

    const axleKnown = knownWeightPallets.reduce(
      (acc, item) => {
        const type = typeMap.get(item.typeId);
        if (!type) {
          return acc;
        }
        const dims = dimsInCells(type, item.rotated);
        const centerCol = item.col + dims.lenCells / 2;
        const weight = item.weightKg ?? 0;

        if (centerCol < frontCol) {
          acc.rear += weight;
        } else if (centerCol < middleCol) {
          acc.middle += weight;
        } else {
          acc.front += weight;
        }

        return acc;
      },
      { front: 0, middle: 0, rear: 0 }
    );

    return {
      usedAreaMm2,
      trailerAreaMm2,
      remainingAreaMm2: trailerAreaMm2 - usedAreaMm2,
      occupancyPct: trailerAreaMm2 > 0 ? (usedAreaMm2 / trailerAreaMm2) * 100 : 0,
      palletCount: effectivePlaced.length,
      estimatedWeight,
      knownWeight,
      knownCount: knownWeightPallets.length,
      totalCount: effectivePlaced.length,
      axleKnown,
    };
  }, [effectivePlaced, typeMap]);

  const axleStatus = useMemo(() => {
    if (stats.knownCount === 0) {
      return { label: "Unavailable", color: "warning" as const };
    }

    if (
      stats.axleKnown.front > 9500 ||
      stats.axleKnown.middle > 10500 ||
      stats.axleKnown.rear > 10500 ||
      stats.estimatedWeight > TRAILER.maxWeightKg
    ) {
      return { label: "Overloaded", color: "error" as const };
    }

    const frontRearDelta = stats.axleKnown.rear - stats.axleKnown.front;
    if (frontRearDelta > 1800) {
      return { label: "Rear Heavy", color: "warning" as const };
    }
    if (frontRearDelta < -1800) {
      return { label: "Front Heavy", color: "warning" as const };
    }

    return { label: "Balanced", color: "success" as const };
  }, [stats]);

  const warnings = useMemo(() => {
    const output: string[] = [];
    if (stats.occupancyPct > 94) {
      output.push("Loading area is above 94% occupancy. Maneuvering tolerance is reduced.");
    }
    if (stats.estimatedWeight > TRAILER.maxWeightKg) {
      output.push("Estimated cargo weight exceeds legal trailer payload.");
    }
    if (stats.knownCount > 0) {
      if (stats.axleKnown.front > 9500 || stats.axleKnown.middle > 10500 || stats.axleKnown.rear > 10500) {
        output.push("Known axle loads indicate potential overload. Rebalance pallet positions.");
      }
    }
    return output;
  }, [stats]);

  const previewRect = useMemo(() => {
    if (!drag || drag.kind !== "new") {
      return null;
    }

    const type = typeMap.get(drag.candidate.typeId);
    if (!type) {
      return null;
    }

    const dims = dimsInCells(type, drag.candidate.rotated);
    return {
      left: `${(drag.candidate.col / COLS) * 100}%`,
      top: `${(drag.candidate.row / ROWS) * 100}%`,
      width: `${(dims.lenCells / COLS) * 100}%`,
      height: `${(dims.widCells / ROWS) * 100}%`,
      valid: drag.valid,
    };
  }, [drag, typeMap]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="space-y-4 lg:col-span-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h4 className="text-base font-medium text-gray-800 dark:text-white/90">Pallet Catalog</h4>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Drag pallets into the trailer loading floor. Drop is valid only inside the interior zone.
          </p>

          <div className="mt-4 space-y-3">
            {palletTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                data-pallet-type={type.id}
                onPointerDown={(event) => beginNewDrag(type.id, event)}
                className="w-full touch-none select-none cursor-grab rounded-xl border border-gray-200 p-3 text-left transition hover:border-brand-300 active:cursor-grabbing dark:border-gray-700 dark:hover:border-brand-500/40"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-theme-sm text-gray-800 dark:text-white/90">{type.label}</p>
                  <span className={`h-3 w-3 rounded-full ${type.colorClass}`} />
                </div>
                <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">
                  {type.lengthMm} x {type.widthMm} mm
                </p>
                <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">
                  Typical weight {type.defaultWeightKg} kg
                </p>

                {type.id === "custom" && (
                  <div
                    className="mt-2 grid grid-cols-3 gap-2"
                    onClick={(event) => event.stopPropagation()}
                    onPointerDown={(event) => event.stopPropagation()}
                  >
                    <input
                      type="number"
                      value={customPallet.lengthMm}
                      min={400}
                      max={2400}
                      onChange={(event) => updateCustomPalletField("lengthMm", event.target.value)}
                      className="h-8 rounded-md border border-gray-300 bg-transparent px-2 text-theme-xs text-gray-700 dark:border-gray-700 dark:text-gray-300"
                      placeholder="Length"
                    />
                    <input
                      type="number"
                      value={customPallet.widthMm}
                      min={400}
                      max={2400}
                      onChange={(event) => updateCustomPalletField("widthMm", event.target.value)}
                      className="h-8 rounded-md border border-gray-300 bg-transparent px-2 text-theme-xs text-gray-700 dark:border-gray-700 dark:text-gray-300"
                      placeholder="Width"
                    />
                    <input
                      type="number"
                      value={customPallet.defaultWeightKg}
                      min={0}
                      onChange={(event) => updateCustomPalletField("defaultWeightKg", event.target.value)}
                      className="h-8 rounded-md border border-gray-300 bg-transparent px-2 text-theme-xs text-gray-700 dark:border-gray-700 dark:text-gray-300"
                      placeholder="Weight"
                    />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={rotateSelected}>
              Rotate Selected 90 deg
            </Button>
            <Button size="sm" variant="outline" onClick={deleteSelected}>
              Delete Selected
            </Button>
          </div>

          <div className="mt-4 rounded-xl border border-gray-200 p-3 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">Add Multiple Pallets</p>
            <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">
              Add many pallets at once. Planner auto-fits them to the first available valid cells.
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <select
                value={bulkAddTypeId}
                onChange={(event) => setBulkAddTypeId(event.target.value as PalletTypeId)}
                className="h-10 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
              >
                {palletTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                max={80}
                value={bulkAddCount}
                onChange={(event) => setBulkAddCount(Number(event.target.value))}
                className="h-10 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
                placeholder="Count"
              />
              <Button size="sm" variant="outline" onClick={addPalletBatch}>
                Add Batch
              </Button>
            </div>
          </div>

          <p className="mt-3 text-theme-xs text-gray-500 dark:text-gray-400">Multi-select: hold Ctrl/Cmd and click pallets.</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h4 className="text-base font-medium text-gray-800 dark:text-white/90">Pallet Details</h4>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Weight is optional. Empty value keeps pallet valid but marks axle estimate as partial.
          </p>

          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                Bulk Edit Selected ({selectedIds.length})
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={bulkSelectedWeight}
                  onChange={(event) => setBulkSelectedWeight(event.target.value)}
                  className="h-10 w-[220px] rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
                  placeholder="Weight for all selected"
                />
                <Button size="sm" variant="outline" onClick={applyWeightToSelected}>
                  Apply Weight
                </Button>
              </div>
              <p className="mt-2 text-theme-xs text-gray-500 dark:text-gray-400">
                Leave empty and click Apply Weight to clear weight for all selected pallets.
              </p>
            </div>

            {selectedPrimary === null && <p className="text-sm text-gray-500 dark:text-gray-400">No pallets selected.</p>}

            {selectedPrimary !== null && (
              <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">{selectedPrimary.id}</p>
                <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">
                  {typeMap.get(selectedPrimary.typeId)?.label} - Cell {selectedPrimary.col},{selectedPrimary.row}
                </p>

                <div className="mt-3 space-y-2">
                  <input
                    type="text"
                    value={selectedPrimary.name}
                    onChange={(event) => updatePalletField(selectedPrimary.id, "name", event.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
                    placeholder="Name"
                  />
                  <input
                    type="text"
                    value={typeMap.get(selectedPrimary.typeId)?.label ?? ""}
                    readOnly
                    className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-500 dark:border-gray-700 dark:bg-white/[0.02] dark:text-gray-400"
                    placeholder="Pallet Type"
                  />
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={selectedPrimary.weightKg ?? ""}
                    onChange={(event) => updateWeight(selectedPrimary.id, event.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
                    placeholder="Weight (optional)"
                  />
                  <input
                    type="text"
                    value={selectedPrimary.customer}
                    onChange={(event) => updatePalletField(selectedPrimary.id, "customer", event.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
                    placeholder="Customer"
                  />
                  <input
                    type="text"
                    value={selectedPrimary.deliveryStop}
                    onChange={(event) => updatePalletField(selectedPrimary.id, "deliveryStop", event.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
                    placeholder="Delivery Stop"
                  />
                  <textarea
                    value={selectedPrimary.notes}
                    onChange={(event) => updatePalletField(selectedPrimary.id, "notes", event.target.value)}
                    className="min-h-[76px] w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
                    placeholder="Notes"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4 lg:col-span-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="text-base font-medium text-gray-800 dark:text-white/90">Trailer Load Planner</h4>
            <Badge color="info">Grid constrained loading engine</Badge>
          </div>

          <div className="relative mt-5 overflow-hidden rounded-xl border border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-900/50">
            <div
              className="relative w-full"
              style={{
                aspectRatio: "16 / 5",
                backgroundImage: "url('/images/trailer/trailer-placeholder.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="pointer-events-none absolute inset-x-[8.2%] top-[4.8%] z-10 flex items-center justify-between text-[11px] font-medium uppercase tracking-wide text-white/85">
                <span>Rear / doors</span>
                <span>Front / kingpin</span>
              </div>
              <div
                ref={interiorRef}
                data-testid="trailer-floor"
                className="absolute"
                style={{
                  left: `${FLOOR_BOUNDS.leftPct}%`,
                  top: `${FLOOR_BOUNDS.topPct}%`,
                  width: `${FLOOR_BOUNDS.widthPct}%`,
                  height: `${FLOOR_BOUNDS.heightPct}%`,
                }}
                onClick={() => setSelectedIds([])}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    clipPath: floorClipPath,
                    WebkitClipPath: floorClipPath,
                  }}
                >
                  <div
                    className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] transition-opacity duration-150"
                    style={{
                      backgroundSize: `${100 / COLS}% ${100 / ROWS}%`,
                      opacity: drag ? 0.22 : 0.11,
                    }}
                  />

                  {placementForRender.map((item) => {
                    const type = typeMap.get(item.typeId);
                    if (!type) {
                      return null;
                    }

                    const dims = dimsInCells(type, item.rotated);
                    const selected = selectedIds.includes(item.id);
                    const isDragging = drag?.kind === "move" && drag.movingIds.includes(item.id);
                    const invalidMovePreview = isDragging && drag?.kind === "move" && !drag.valid;

                    return (
                      <TrailerPalletItem
                        key={item.id}
                        id={item.id}
                        label={type.label}
                        colorClass={type.colorClass}
                        selected={selected}
                        isDragging={isDragging}
                        invalidMovePreview={invalidMovePreview}
                        left={`${(item.col / COLS) * 100}%`}
                        top={`${(item.row / ROWS) * 100}%`}
                        width={`${(dims.lenCells / COLS) * 100}%`}
                        height={`${(dims.widCells / ROWS) * 100}%`}
                        onStartMove={beginMoveDrag}
                        onSelect={onSelectPallet}
                      />
                    );
                  })}

                  {previewRect && (
                    <div
                      className={`absolute rounded-md border-2 transition-all duration-100 ${
                        previewRect.valid
                          ? "border-success-400 bg-success-500/20"
                          : "border-error-400 bg-error-500/25"
                      }`}
                      style={{
                        left: previewRect.left,
                        top: previewRect.top,
                        width: previewRect.width,
                        height: previewRect.height,
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <p className="mt-3 text-theme-xs text-gray-500 dark:text-gray-400">
            Top-down 13.6 m x 2.48 m loading model. Statistics and occupancy use the same snapped grid geometry shown on screen.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.02]">
            <p className="text-theme-xs text-gray-500">Used Floor Space</p>
            <p className="mt-2 text-base font-semibold text-gray-800 dark:text-white/90">{(stats.usedAreaMm2 / 1000000).toFixed(2)} m2</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.02]">
            <p className="text-theme-xs text-gray-500">Remaining Floor Space</p>
            <p className="mt-2 text-base font-semibold text-gray-800 dark:text-white/90">{(stats.remainingAreaMm2 / 1000000).toFixed(2)} m2</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.02]">
            <p className="text-theme-xs text-gray-500">Occupancy</p>
            <p className="mt-2 text-base font-semibold text-gray-800 dark:text-white/90">{stats.occupancyPct.toFixed(1)}%</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.02]">
            <p className="text-theme-xs text-gray-500">Pallet Count</p>
            <p className="mt-2 text-base font-semibold text-gray-800 dark:text-white/90">{stats.palletCount}</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.02]">
            <p className="text-theme-xs text-gray-500">Estimated Cargo Weight</p>
            <p className="mt-2 text-base font-semibold text-gray-800 dark:text-white/90">{Math.round(stats.estimatedWeight).toLocaleString()} kg</p>
            {stats.knownCount < stats.totalCount && (
              <p className="mt-1 text-theme-xs text-warning-600 dark:text-warning-400">Partial weight information</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-base font-medium text-gray-800 dark:text-white/90">Axle Load Estimation</h4>
            <Badge color={axleStatus.color}>{axleStatus.label}</Badge>
          </div>

          {stats.knownCount === 0 ? (
            <div className="mt-4 rounded-lg border border-warning-200 bg-warning-50 px-3 py-2 text-sm text-warning-700 dark:border-warning-500/20 dark:bg-warning-500/10 dark:text-warning-300">
              Unavailable: no pallet weight values provided yet.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Badge color={stats.axleKnown.front > 9500 ? "error" : "success"}>Front axle: {Math.round(stats.axleKnown.front).toLocaleString()} kg</Badge>
                <Badge color={stats.axleKnown.middle > 10500 ? "error" : "success"}>Middle axle: {Math.round(stats.axleKnown.middle).toLocaleString()} kg</Badge>
                <Badge color={stats.axleKnown.rear > 10500 ? "error" : "success"}>Rear axle: {Math.round(stats.axleKnown.rear).toLocaleString()} kg</Badge>
              </div>

              {stats.knownCount < stats.totalCount && (
                <div className="rounded-lg border border-warning-200 bg-warning-50 px-3 py-2 text-sm text-warning-700 dark:border-warning-500/20 dark:bg-warning-500/10 dark:text-warning-300">
                  Partial estimate: {stats.knownCount} of {stats.totalCount} pallets have weight data.
                </div>
              )}
            </div>
          )}

          <div className="mt-4 space-y-2">
            {warnings.length === 0 ? (
              <Badge color="success">No loading warnings</Badge>
            ) : (
              warnings.map((warning) => (
                <div
                  key={warning}
                  className="rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700 dark:border-error-500/20 dark:bg-error-500/10 dark:text-error-300"
                >
                  {warning}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
