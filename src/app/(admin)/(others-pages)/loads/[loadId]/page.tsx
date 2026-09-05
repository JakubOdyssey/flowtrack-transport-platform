import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  enterpriseLoads,
  getEnterpriseLoadById,
  type EnterpriseLoad,
  type LoadDocument,
} from "@/data/load-management";
import { drivers } from "@/data/flowtrack";
import LoadRouteMapClient from "@/components/flowtrack/loads/LoadRouteMapClient";
import LoadTrailerMiniPreview from "@/components/flowtrack/loads/LoadTrailerMiniPreview";
import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ loadId: string }>;
}

export async function generateStaticParams() {
  return enterpriseLoads.map((load) => ({ loadId: load.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await params;
  const load = getEnterpriseLoadById(resolved.loadId);
  if (!load) {
    return {
      title: "Load Not Found",
    };
  }

  return {
    title: `FlowTrack Load ${load.id}`,
    description: `Detailed load management view for ${load.customer}`,
  };
}

function statusBadgeColor(status: EnterpriseLoad["status"]) {
  if (status === "Delivered" || status === "In Transit") {
    return "success" as const;
  }
  if (status === "Loading" || status === "Assigned") {
    return "warning" as const;
  }
  if (status === "Delayed") {
    return "error" as const;
  }
  return "light" as const;
}

function priorityBadgeColor(priority: EnterpriseLoad["priority"]) {
  if (priority === "Critical") {
    return "error" as const;
  }
  if (priority === "High") {
    return "warning" as const;
  }
  if (priority === "Medium") {
    return "primary" as const;
  }
  return "light" as const;
}

function boolBadgeColor(value: boolean) {
  return value ? ("success" as const) : ("light" as const);
}

function documentBadgeColor(status: LoadDocument["status"]) {
  if (status === "Available") {
    return "success" as const;
  }
  if (status === "Pending") {
    return "warning" as const;
  }
  return "error" as const;
}

export default async function LoadDetailPage({ params }: PageProps) {
  const resolved = await params;
  const load = getEnterpriseLoadById(resolved.loadId);
  const driverIdByName: Record<string, string> = Object.fromEntries(
    drivers.map((driver) => [driver.name, driver.id])
  );

  if (!load) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle={`Load ${load.id}`} />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-theme-xs text-gray-500 dark:text-gray-400">Load ID</p>
            <h3 className="mt-1 text-base font-medium text-gray-800 dark:text-white/90">{load.id}</h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge color={statusBadgeColor(load.status)}>{load.status}</Badge>
            <Badge color={priorityBadgeColor(load.priority)}>{load.priority} Priority</Badge>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
            <p className="text-theme-xs text-gray-500 dark:text-gray-400">Customer</p>
            <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{load.customer}</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
            <p className="text-theme-xs text-gray-500 dark:text-gray-400">Created Date</p>
            <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{load.createdDate}</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
            <p className="text-theme-xs text-gray-500 dark:text-gray-400">Assigned Dispatcher</p>
            <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{load.dispatcher}</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
            <p className="text-theme-xs text-gray-500 dark:text-gray-400">Pickup</p>
            <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{load.pickup}</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
            <p className="text-theme-xs text-gray-500 dark:text-gray-400">Delivery</p>
            <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{load.delivery}</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
            <p className="text-theme-xs text-gray-500 dark:text-gray-400">ETA</p>
            <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{load.eta}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <Link href={`/loads?customer=${encodeURIComponent(load.customer)}`}>
            <Button size="sm" variant="outline">Open Customer</Button>
          </Link>
          <Link href={`/fleet/drivers?driver=${driverIdByName[load.driver] ?? ""}`}>
            <Button size="sm" variant="outline">Open Driver</Button>
          </Link>
          <Link href={`/fleet/vehicles?vehicle=${load.vehicle}`}>
            <Button size="sm" variant="outline">Open Vehicle</Button>
          </Link>
          <Link href={`/fleet/trailers?trailer=${load.trailer}`}>
            <Button size="sm" variant="outline">Open Trailer</Button>
          </Link>
          <Link href={`/operations/route-planning?loadId=${load.id}&driver=${driverIdByName[load.driver] ?? ""}&vehicle=${load.vehicle}&trailer=${load.trailer}`}>
            <Button size="sm">Open Route</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12 md:gap-6">
        <div className="space-y-4 xl:col-span-7">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
            <h4 className="text-base font-medium text-gray-800 dark:text-white/90">1. Customer</h4>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">Company</p>
                <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{load.customerContact.company}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">Contact Person</p>
                <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{load.customerContact.person}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">Phone</p>
                <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{load.customerContact.phone}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">Email</p>
                <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{load.customerContact.email}</p>
              </div>
            </div>
            <div className="mt-3 rounded-xl border border-gray-200 p-3 dark:border-gray-700">
              <p className="text-theme-xs text-gray-500 dark:text-gray-400">Notes</p>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{load.customerContact.notes}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
            <h4 className="text-base font-medium text-gray-800 dark:text-white/90">2. Cargo</h4>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700 sm:col-span-2">
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">Cargo Description</p>
                <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{load.cargo.description}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">Pallet Count</p>
                <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{load.cargo.palletCount}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">Weight</p>
                <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{load.cargo.weightKg.toLocaleString()} kg</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">Volume</p>
                <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{load.cargo.volumeM3} m3</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">Special Requirements</p>
                <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{load.cargo.specialRequirements}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">Dangerous Goods</p>
                <Badge color={boolBadgeColor(load.cargo.dangerousGoods)}>
                  {load.cargo.dangerousGoods ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">Temperature Controlled</p>
                <Badge color={boolBadgeColor(load.cargo.temperatureControlled)}>
                  {load.cargo.temperatureControlled ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">Fragile</p>
                <Badge color={boolBadgeColor(load.cargo.fragile)}>
                  {load.cargo.fragile ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
            <h4 className="text-base font-medium text-gray-800 dark:text-white/90">3. Assigned Resources</h4>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">Driver</p>
                <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{load.driver}</p>
                <Link href={`/fleet/drivers?driver=${driverIdByName[load.driver] ?? ""}`} className="mt-2 inline-block">
                  <Button size="sm" variant="outline">Open Driver</Button>
                </Link>
              </div>
              <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">Vehicle</p>
                <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{load.vehicle}</p>
                <Link href={`/fleet/vehicles?vehicle=${load.vehicle}`} className="mt-2 inline-block">
                  <Button size="sm" variant="outline">Open Vehicle</Button>
                </Link>
              </div>
              <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">Trailer</p>
                <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{load.trailer}</p>
                <Link href={`/fleet/trailers?trailer=${load.trailer}`} className="mt-2 inline-block">
                  <Button size="sm" variant="outline">Open Trailer</Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
            <h4 className="text-base font-medium text-gray-800 dark:text-white/90">4. Route</h4>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">Pickup</p>
                <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{load.route.pickup}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">Delivery</p>
                <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{load.route.delivery}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700 sm:col-span-2">
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">Intermediate Stops</p>
                <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{load.route.intermediateStops.join(" | ")}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">ETA</p>
                <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{load.route.eta}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">Distance</p>
                <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{load.route.distanceKm} km</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700 sm:col-span-2">
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">Estimated Fuel</p>
                <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{load.route.estimatedFuelLiters} L</p>
              </div>
            </div>
            <div className="mt-4">
              <LoadRouteMapClient
                coordinates={load.route.coordinates}
                pickupLabel={load.route.pickup}
                deliveryLabel={load.route.delivery}
              />
            </div>
            <Link href={`/operations/route-planning?loadId=${load.id}&driver=${driverIdByName[load.driver] ?? ""}&vehicle=${load.vehicle}&trailer=${load.trailer}`} className="mt-3 inline-block">
              <Button size="sm" variant="outline">Open Route Planning</Button>
            </Link>
          </div>
        </div>

        <div className="space-y-4 xl:col-span-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
            <h4 className="text-base font-medium text-gray-800 dark:text-white/90">5. Trailer Plan</h4>
            <div className="mt-4">
              <LoadTrailerMiniPreview pallets={load.trailerPlan.palletPositions} />
            </div>
            <Link href="/trailer-planner" className="mt-4 inline-block">
              <Button size="sm">Open Trailer Planner</Button>
            </Link>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
            <h4 className="text-base font-medium text-gray-800 dark:text-white/90">6. Delivery Timeline</h4>
            <div className="mt-4 space-y-4">
              {load.timeline.map((event, index) => (
                <div key={`${event.time}-${event.title}`} className="relative pl-8">
                  <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-brand-500" />
                  {index < load.timeline.length - 1 && (
                    <span className="absolute left-[5px] top-5 h-[calc(100%+10px)] w-px bg-gray-200 dark:bg-gray-700" />
                  )}
                  <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge color="light">{event.time}</Badge>
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">{event.title}</p>
                    </div>
                    <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">{event.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
            <h4 className="text-base font-medium text-gray-800 dark:text-white/90">7. Documents</h4>
            <div className="mt-4 w-full overflow-x-auto">
              <div className="w-full">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      {[
                        "Type",
                        "Reference",
                        "Status",
                        "Updated",
                      ].map((header) => (
                        <TableCell
                          key={header}
                          isHeader
                          className="px-3 py-2 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                        >
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {load.documents.map((doc) => (
                      <TableRow key={`${doc.name}-${doc.reference}`}>
                        <TableCell className="px-3 py-2 text-theme-sm text-gray-700 dark:text-gray-300">{doc.name}</TableCell>
                        <TableCell className="px-3 py-2 text-theme-sm text-gray-700 dark:text-gray-300">{doc.reference}</TableCell>
                        <TableCell className="px-3 py-2"><Badge color={documentBadgeColor(doc.status)}>{doc.status}</Badge></TableCell>
                        <TableCell className="px-3 py-2 text-theme-sm text-gray-700 dark:text-gray-300">{doc.updatedAt}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
            <h4 className="text-base font-medium text-gray-800 dark:text-white/90">8. Internal Notes</h4>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">Dispatcher notes</p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{load.internalNotes.dispatcher}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">Driver notes</p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{load.internalNotes.driver}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">Customer notes</p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{load.internalNotes.customer}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
