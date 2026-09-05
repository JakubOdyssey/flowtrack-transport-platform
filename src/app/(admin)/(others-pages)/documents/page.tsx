import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Badge from "@/components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { documentRegistry } from "@/data/flowtrack";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "FlowTrack Documents",
  description: "Compliance document management",
};

const statusColor = (status: string) => {
  if (status === "Valid") {
    return "success" as const;
  }
  if (status === "Renewal Soon") {
    return "warning" as const;
  }
  return "error" as const;
};

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Documents" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">Compliance Registry</h3>
        <div className="mt-4 max-w-full overflow-x-auto">
          <div className="min-w-[860px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  {[
                    "Document ID",
                    "Type",
                    "Entity",
                    "Expiry",
                    "Status",
                  ].map((header) => (
                    <TableCell
                      key={header}
                      isHeader
                      className="px-4 py-3 text-theme-xs font-medium text-gray-500 text-start dark:text-gray-400"
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {documentRegistry.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="px-4 py-3 text-theme-sm font-medium text-gray-800 dark:text-white/90">{doc.id}</TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-300">{doc.type}</TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-300">{doc.target}</TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-300">{doc.expiry}</TableCell>
                    <TableCell className="px-4 py-3"><Badge color={statusColor(doc.status)}>{doc.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
