export type LoadStatus = "Planned" | "Assigned" | "Loading" | "In Transit" | "Delivered" | "Delayed";
export type LoadPriority = "Critical" | "High" | "Medium" | "Normal";

export interface LoadTimelineEvent {
  time: string;
  title: string;
  detail: string;
}

export interface LoadDocument {
  name: string;
  reference: string;
  status: "Available" | "Pending" | "Missing";
  updatedAt: string;
}

export interface TrailerPreviewPallet {
  id: string;
  label: string;
  col: number;
  row: number;
  len: number;
  wid: number;
  colorClass: string;
}

export interface EnterpriseLoad {
  id: string;
  customer: string;
  pickup: string;
  delivery: string;
  driver: string;
  vehicle: string;
  trailer: string;
  palletCount: number;
  weightKg: number;
  status: LoadStatus;
  priority: LoadPriority;
  eta: string;
  createdDate: string;
  dispatcher: string;

  customerContact: {
    company: string;
    person: string;
    phone: string;
    email: string;
    notes: string;
  };

  cargo: {
    description: string;
    palletCount: number;
    weightKg: number;
    volumeM3: number;
    specialRequirements: string;
    dangerousGoods: boolean;
    temperatureControlled: boolean;
    fragile: boolean;
  };

  route: {
    pickup: string;
    delivery: string;
    intermediateStops: string[];
    eta: string;
    distanceKm: number;
    estimatedFuelLiters: number;
    coordinates: [number, number][];
  };

  trailerPlan: {
    palletPositions: TrailerPreviewPallet[];
  };

  timeline: LoadTimelineEvent[];
  documents: LoadDocument[];

  internalNotes: {
    dispatcher: string;
    driver: string;
    customer: string;
  };
}

export const enterpriseLoads: EnterpriseLoad[] = [
  {
    id: "L-22019",
    customer: "Tesco Distribution",
    pickup: "Birmingham DC",
    delivery: "Glasgow NDC",
    driver: "Leah Morgan",
    vehicle: "VH-2041",
    trailer: "TRL-778",
    palletCount: 26,
    weightKg: 18240,
    status: "In Transit",
    priority: "High",
    eta: "15:40",
    createdDate: "2026-08-03 19:12",
    dispatcher: "Daniel Kowalski",
    customerContact: {
      company: "Tesco Distribution UK",
      person: "Sophie Bennett",
      phone: "+44 7700 552140",
      email: "s.bennett@tesco-distribution.co.uk",
      notes: "Dock booking reference TDC-44812. Arrival window +/- 15 minutes.",
    },
    cargo: {
      description: "Ambient grocery pallets for north region replenishment",
      palletCount: 26,
      weightKg: 18240,
      volumeM3: 68,
      specialRequirements: "No stack above 1.8m, rear unload sequence",
      dangerousGoods: false,
      temperatureControlled: false,
      fragile: true,
    },
    route: {
      pickup: "Birmingham DC",
      delivery: "Glasgow NDC",
      intermediateStops: ["Crewe Hub", "Preston FC", "Lockerbie Crossdock"],
      eta: "15:40",
      distanceKm: 476,
      estimatedFuelLiters: 208,
      coordinates: [
        [52.4862, -1.8904],
        [53.0995, -2.4438],
        [53.7632, -2.7044],
        [55.1104, -3.351],
        [55.8642, -4.2518],
      ],
    },
    trailerPlan: {
      palletPositions: [
        { id: "P1", label: "Euro", col: 2, row: 1, len: 3, wid: 2, colorClass: "bg-brand-500/80" },
        { id: "P2", label: "Euro", col: 5, row: 1, len: 3, wid: 2, colorClass: "bg-brand-500/80" },
        { id: "P3", label: "UK", col: 8, row: 1, len: 3, wid: 2, colorClass: "bg-success-500/80" },
        { id: "P4", label: "Industrial", col: 2, row: 3, len: 3, wid: 3, colorClass: "bg-warning-500/80" },
        { id: "P5", label: "Half", col: 6, row: 3, len: 2, wid: 2, colorClass: "bg-blue-light-500/80" },
        { id: "P6", label: "Quarter", col: 8, row: 3, len: 2, wid: 1, colorClass: "bg-gray-500/80" },
      ],
    },
    timeline: [
      { time: "2026-08-03 19:12", title: "Load Created", detail: "Order imported from TMS integration queue." },
      { time: "2026-08-03 19:25", title: "Driver Assigned", detail: "Leah Morgan assigned by dispatcher." },
      { time: "2026-08-03 19:31", title: "Trailer Assigned", detail: "TRL-778 attached to vehicle VH-2041." },
      { time: "2026-08-04 07:54", title: "Loading Started", detail: "Birmingham bay 04 loading process started." },
      { time: "2026-08-04 08:33", title: "Loading Finished", detail: "26 pallets scanned and seal ID logged." },
      { time: "2026-08-04 08:40", title: "Vehicle Departed", detail: "Vehicle departed geofence with legal driving window active." },
      { time: "2026-08-04 11:18", title: "Checkpoint Passed", detail: "Preston FC checkpoint complete, ETA recalculated." },
    ],
    documents: [
      { name: "CMR", reference: "CMR-22019-UK", status: "Available", updatedAt: "2026-08-04 08:36" },
      { name: "Invoice", reference: "INV-22019-TD", status: "Pending", updatedAt: "2026-08-04 07:22" },
      { name: "Delivery Note", reference: "DN-22019", status: "Available", updatedAt: "2026-08-04 08:35" },
      { name: "Proof of Delivery", reference: "POD-22019", status: "Pending", updatedAt: "-" },
      { name: "Attachments", reference: "5 files", status: "Available", updatedAt: "2026-08-04 08:38" },
    ],
    internalNotes: {
      dispatcher: "Customer requested priority unload first at Glasgow dock 3.",
      driver: "Heavy crosswind reported near A66 corridor.",
      customer: "Store replenishment linked to promotional campaign.",
    },
  },
  {
    id: "L-22042",
    customer: "DHL Supply Chain",
    pickup: "Coventry Hub",
    delivery: "Dagenham",
    driver: "Amir Patel",
    vehicle: "VH-1930",
    trailer: "TRL-745",
    palletCount: 19,
    weightKg: 14300,
    status: "Loading",
    priority: "Critical",
    eta: "18:10",
    createdDate: "2026-08-03 17:44",
    dispatcher: "Monika Novak",
    customerContact: {
      company: "DHL Supply Chain UK",
      person: "Oliver Wade",
      phone: "+44 7700 441900",
      email: "oliver.wade@dhl-supplychain.com",
      notes: "Line stop risk if delayed over 30 minutes.",
    },
    cargo: {
      description: "Automotive components for assembly line replenishment",
      palletCount: 19,
      weightKg: 14300,
      volumeM3: 53,
      specialRequirements: "No tilt, dock door sequence 2 then 5",
      dangerousGoods: false,
      temperatureControlled: false,
      fragile: true,
    },
    route: {
      pickup: "Coventry Hub",
      delivery: "Dagenham",
      intermediateStops: ["M1 Service Transfer Point"],
      eta: "18:10",
      distanceKm: 205,
      estimatedFuelLiters: 92,
      coordinates: [
        [52.4068, -1.5197],
        [52.8555, -1.3152],
        [52.0127, -0.7482],
        [51.5416, 0.1487],
      ],
    },
    trailerPlan: {
      palletPositions: [
        { id: "P1", label: "UK", col: 2, row: 1, len: 3, wid: 2, colorClass: "bg-success-500/80" },
        { id: "P2", label: "UK", col: 5, row: 1, len: 3, wid: 2, colorClass: "bg-success-500/80" },
        { id: "P3", label: "Euro", col: 8, row: 1, len: 3, wid: 2, colorClass: "bg-brand-500/80" },
        { id: "P4", label: "Half", col: 2, row: 3, len: 2, wid: 2, colorClass: "bg-blue-light-500/80" },
      ],
    },
    timeline: [
      { time: "2026-08-03 17:44", title: "Load Created", detail: "Order entered from customer portal." },
      { time: "2026-08-03 18:02", title: "Driver Assigned", detail: "Amir Patel accepted assignment." },
      { time: "2026-08-03 18:12", title: "Trailer Assigned", detail: "Trailer TRL-745 pre-staged at bay 02." },
      { time: "2026-08-04 09:10", title: "Loading Started", detail: "Automotive cargo loading in progress." },
    ],
    documents: [
      { name: "CMR", reference: "CMR-22042-UK", status: "Available", updatedAt: "2026-08-04 09:05" },
      { name: "Invoice", reference: "INV-22042-DHL", status: "Available", updatedAt: "2026-08-03 19:00" },
      { name: "Delivery Note", reference: "DN-22042", status: "Pending", updatedAt: "-" },
      { name: "Proof of Delivery", reference: "POD-22042", status: "Pending", updatedAt: "-" },
      { name: "Attachments", reference: "3 files", status: "Available", updatedAt: "2026-08-04 08:58" },
    ],
    internalNotes: {
      dispatcher: "Critical SLA. Keep proactive ETA updates every 30 min.",
      driver: "Waiting for final pallet scan confirmation.",
      customer: "Receiver will provide priority gate access code at ETA-20 min.",
    },
  },
  {
    id: "L-22058",
    customer: "Aldi Logistics",
    pickup: "Leeds Crossdock",
    delivery: "Leicester RDC",
    driver: "Jonas Reed",
    vehicle: "VH-1886",
    trailer: "TRL-709",
    palletCount: 17,
    weightKg: 10980,
    status: "Delayed",
    priority: "Medium",
    eta: "20:05",
    createdDate: "2026-08-03 12:08",
    dispatcher: "Sarah Nguyen",
    customerContact: {
      company: "Aldi Logistics UK",
      person: "Grace Carter",
      phone: "+44 7700 731220",
      email: "grace.carter@aldi-logistics.co.uk",
      notes: "Gate 11 requires 15-minute pre-alert.",
    },
    cargo: {
      description: "Dry pallet retail products",
      palletCount: 17,
      weightKg: 10980,
      volumeM3: 49,
      specialRequirements: "Maintain unload order by store zone",
      dangerousGoods: false,
      temperatureControlled: false,
      fragile: false,
    },
    route: {
      pickup: "Leeds Crossdock",
      delivery: "Leicester RDC",
      intermediateStops: ["Sheffield Relay"],
      eta: "20:05",
      distanceKm: 170,
      estimatedFuelLiters: 74,
      coordinates: [
        [53.8008, -1.5491],
        [53.3811, -1.4701],
        [52.9548, -1.1581],
        [52.6369, -1.1398],
      ],
    },
    trailerPlan: {
      palletPositions: [
        { id: "P1", label: "Euro", col: 2, row: 1, len: 3, wid: 2, colorClass: "bg-brand-500/80" },
        { id: "P2", label: "Euro", col: 5, row: 1, len: 3, wid: 2, colorClass: "bg-brand-500/80" },
        { id: "P3", label: "Half", col: 8, row: 1, len: 2, wid: 2, colorClass: "bg-blue-light-500/80" },
      ],
    },
    timeline: [
      { time: "2026-08-03 12:08", title: "Load Created", detail: "Load created by planning team." },
      { time: "2026-08-03 12:41", title: "Driver Assigned", detail: "Jonas Reed assigned." },
      { time: "2026-08-03 13:05", title: "Vehicle Departed", detail: "Vehicle departed Leeds depot." },
      { time: "2026-08-04 10:54", title: "Checkpoint Passed", detail: "Sheffield relay completed with delay due to congestion." },
    ],
    documents: [
      { name: "CMR", reference: "CMR-22058-UK", status: "Available", updatedAt: "2026-08-03 13:00" },
      { name: "Invoice", reference: "INV-22058-ALDI", status: "Available", updatedAt: "2026-08-03 12:15" },
      { name: "Delivery Note", reference: "DN-22058", status: "Available", updatedAt: "2026-08-03 13:02" },
      { name: "Proof of Delivery", reference: "POD-22058", status: "Missing", updatedAt: "-" },
      { name: "Attachments", reference: "2 files", status: "Available", updatedAt: "2026-08-03 13:03" },
    ],
    internalNotes: {
      dispatcher: "Traffic disruption around M1 segment; keep customer informed.",
      driver: "Reported average speed drop below plan between Sheffield and Derby.",
      customer: "Accept delivery up to 45 minutes late without penalty.",
    },
  },
];

export const loadWizardSteps = [
  "Customer",
  "Pickup & Delivery",
  "Cargo",
  "Assign Driver",
  "Assign Vehicle",
  "Assign Trailer",
  "Trailer Planner",
  "Review",
] as const;

export function getEnterpriseLoadById(loadId: string) {
  return enterpriseLoads.find((load) => load.id === loadId);
}
