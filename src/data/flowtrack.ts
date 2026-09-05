export type FleetStatus = "In Transit" | "Idle" | "Loading" | "Maintenance";

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  status: FleetStatus;
  location: string;
  assignedTrailer: string;
  assignedDriver: string;
  mileageKm: number;
  fuelPercent: number;
  insuranceExpiry: string;
  lastInspection: string;
  nextServiceKm: number;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseClass: string;
  certifications: string[];
  assignedVehicle: string;
  currentPosition: string;
  todaysRoute: string[];
  completedDeliveries: number;
  drivingHours: number;
  performanceScore: number;
  violations: number;
}

export interface Trailer {
  id: string;
  type: string;
  status: "Loaded" | "Available" | "Service";
  currentLoad: string;
  utilizationPercent: number;
  inspectionDue: string;
}

export interface Load {
  id: string;
  customer: string;
  pickup: string;
  delivery: string;
  cargo: string;
  weightKg: number;
  volumeM3: number;
  assignedVehicle: string;
  assignedTrailer: string;
  assignedDriver: string;
  status: "Planned" | "Dispatched" | "In Transit" | "Delivered" | "Delayed";
  eta: string;
}

export const dashboardKpis = [
  { label: "Active Vehicles", value: "186", delta: "+4.2%", trend: "up" as const },
  { label: "Loads In Transit", value: "74", delta: "+8.9%", trend: "up" as const },
  { label: "On-Time Delivery", value: "96.4%", delta: "+1.1%", trend: "up" as const },
  { label: "Fuel Spend Today", value: "$52,840", delta: "-2.6%", trend: "down" as const },
];

export const vehicles: Vehicle[] = [
  {
    id: "VH-2041",
    plate: "YJ24 FTR",
    model: "Volvo FH 500",
    status: "In Transit",
    location: "M6 J14 - Stafford",
    assignedTrailer: "TRL-778",
    assignedDriver: "Leah Morgan",
    mileageKm: 428912,
    fuelPercent: 61,
    insuranceExpiry: "2027-02-11",
    lastInspection: "2026-07-18",
    nextServiceKm: 435000,
  },
  {
    id: "VH-1930",
    plate: "GX21 WPM",
    model: "Mercedes Actros 2545",
    status: "Loading",
    location: "DC Birmingham - Bay 04",
    assignedTrailer: "TRL-745",
    assignedDriver: "Amir Patel",
    mileageKm: 377340,
    fuelPercent: 83,
    insuranceExpiry: "2026-12-04",
    lastInspection: "2026-06-27",
    nextServiceKm: 380000,
  },
  {
    id: "VH-1886",
    plate: "LK20 DJR",
    model: "Scania R450",
    status: "Idle",
    location: "Leeds Depot",
    assignedTrailer: "TRL-709",
    assignedDriver: "Jonas Reed",
    mileageKm: 512004,
    fuelPercent: 37,
    insuranceExpiry: "2026-11-19",
    lastInspection: "2026-07-02",
    nextServiceKm: 518000,
  },
  {
    id: "VH-2102",
    plate: "MT25 HSL",
    model: "DAF XF 530",
    status: "Maintenance",
    location: "Manchester Workshop",
    assignedTrailer: "TRL-801",
    assignedDriver: "Nadia Clark",
    mileageKm: 291186,
    fuelPercent: 18,
    insuranceExpiry: "2027-04-10",
    lastInspection: "2026-08-01",
    nextServiceKm: 292000,
  },
];

export const drivers: Driver[] = [
  {
    id: "DRV-014",
    name: "Leah Morgan",
    phone: "+44 7700 210441",
    licenseClass: "CE",
    certifications: ["ADR", "Hiab", "First Aid"],
    assignedVehicle: "VH-2041",
    currentPosition: "M6 J14 - Stafford",
    todaysRoute: ["Birmingham DC", "Crewe Hub", "Preston FC", "Glasgow NDC"],
    completedDeliveries: 3,
    drivingHours: 6.4,
    performanceScore: 92,
    violations: 0,
  },
  {
    id: "DRV-021",
    name: "Amir Patel",
    phone: "+44 7700 210872",
    licenseClass: "CE",
    certifications: ["ADR", "Tachograph Advanced"],
    assignedVehicle: "VH-1930",
    currentPosition: "DC Birmingham - Bay 04",
    todaysRoute: ["Birmingham DC", "Coventry", "Milton Keynes", "Dagenham"],
    completedDeliveries: 1,
    drivingHours: 4.1,
    performanceScore: 89,
    violations: 1,
  },
  {
    id: "DRV-032",
    name: "Jonas Reed",
    phone: "+44 7700 210389",
    licenseClass: "CE",
    certifications: ["Reefer Handling"],
    assignedVehicle: "VH-1886",
    currentPosition: "Leeds Depot",
    todaysRoute: ["Leeds Depot", "Sheffield", "Nottingham", "Leicester"],
    completedDeliveries: 2,
    drivingHours: 5.3,
    performanceScore: 86,
    violations: 0,
  },
];

export const trailers: Trailer[] = [
  {
    id: "TRL-778",
    type: "Curtainsider 13.6m",
    status: "Loaded",
    currentLoad: "L-22019",
    utilizationPercent: 87,
    inspectionDue: "2026-09-12",
  },
  {
    id: "TRL-745",
    type: "Box Trailer 13.6m",
    status: "Loaded",
    currentLoad: "L-22042",
    utilizationPercent: 72,
    inspectionDue: "2026-08-29",
  },
  {
    id: "TRL-709",
    type: "Reefer Trailer",
    status: "Available",
    currentLoad: "-",
    utilizationPercent: 0,
    inspectionDue: "2026-10-03",
  },
  {
    id: "TRL-801",
    type: "Mega Trailer",
    status: "Service",
    currentLoad: "-",
    utilizationPercent: 0,
    inspectionDue: "2026-08-08",
  },
];

export const loads: Load[] = [
  {
    id: "L-22019",
    customer: "Tesco Distribution",
    pickup: "Birmingham DC",
    delivery: "Glasgow NDC",
    cargo: "Ambient Grocery",
    weightKg: 18240,
    volumeM3: 68,
    assignedVehicle: "VH-2041",
    assignedTrailer: "TRL-778",
    assignedDriver: "Leah Morgan",
    status: "In Transit",
    eta: "15:40",
  },
  {
    id: "L-22042",
    customer: "DHL Supply Chain",
    pickup: "Coventry Hub",
    delivery: "Dagenham",
    cargo: "Automotive Components",
    weightKg: 14300,
    volumeM3: 53,
    assignedVehicle: "VH-1930",
    assignedTrailer: "TRL-745",
    assignedDriver: "Amir Patel",
    status: "Dispatched",
    eta: "18:10",
  },
  {
    id: "L-22058",
    customer: "Aldi Logistics",
    pickup: "Leeds Crossdock",
    delivery: "Leicester RDC",
    cargo: "Dry Pallets",
    weightKg: 10980,
    volumeM3: 49,
    assignedVehicle: "VH-1886",
    assignedTrailer: "TRL-709",
    assignedDriver: "Jonas Reed",
    status: "Delayed",
    eta: "20:05",
  },
  {
    id: "L-22073",
    customer: "Unilever UK",
    pickup: "Portbury",
    delivery: "Warrington",
    cargo: "Household Goods",
    weightKg: 16510,
    volumeM3: 61,
    assignedVehicle: "Unassigned",
    assignedTrailer: "Unassigned",
    assignedDriver: "Unassigned",
    status: "Planned",
    eta: "-",
  },
];

export const maintenanceAlerts = [
  { item: "VH-2102", detail: "Brake inspection overdue by 2 days", severity: "High" },
  { item: "TRL-801", detail: "MOT due in 4 days", severity: "Medium" },
  { item: "VH-1886", detail: "Tire wear threshold reached", severity: "Medium" },
];

export const fuelLogs = [
  { date: "2026-08-04", vehicle: "VH-2041", liters: 410, cost: 628.55, km: 812, lPer100: 50.5 },
  { date: "2026-08-04", vehicle: "VH-1930", liters: 362, cost: 553.14, km: 744, lPer100: 48.6 },
  { date: "2026-08-03", vehicle: "VH-1886", liters: 398, cost: 607.32, km: 786, lPer100: 50.6 },
  { date: "2026-08-03", vehicle: "VH-2102", liters: 285, cost: 435.76, km: 511, lPer100: 55.7 },
];

export const documentRegistry = [
  { id: "DOC-1021", type: "Vehicle Insurance", target: "VH-2041", expiry: "2027-02-11", status: "Valid" },
  { id: "DOC-1022", type: "Driver CPC", target: "DRV-021", expiry: "2026-11-09", status: "Renewal Soon" },
  { id: "DOC-1023", type: "Trailer Inspection", target: "TRL-801", expiry: "2026-08-08", status: "Expired" },
  { id: "DOC-1024", type: "ADR Certificate", target: "DRV-014", expiry: "2027-05-19", status: "Valid" },
];

export const monthlyAnalytics = [
  { month: "Jan", utilization: 86, uptime: 94, fuelEfficiency: 3.2, trailerUtilization: 77, maintenanceCost: 18200 },
  { month: "Feb", utilization: 84, uptime: 93, fuelEfficiency: 3.3, trailerUtilization: 75, maintenanceCost: 17550 },
  { month: "Mar", utilization: 87, uptime: 95, fuelEfficiency: 3.4, trailerUtilization: 79, maintenanceCost: 16840 },
  { month: "Apr", utilization: 88, uptime: 95, fuelEfficiency: 3.5, trailerUtilization: 80, maintenanceCost: 17120 },
  { month: "May", utilization: 89, uptime: 96, fuelEfficiency: 3.5, trailerUtilization: 82, maintenanceCost: 16510 },
  { month: "Jun", utilization: 90, uptime: 96, fuelEfficiency: 3.6, trailerUtilization: 84, maintenanceCost: 15990 },
];
