import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { BedDouble, BedSingle, Building2, Users, Activity, VenusAndMars } from "lucide-react";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { wardOccupancy } from "@/server/services/ward";
import { humanize, cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata = { title: "Wards & Admissions" };

const BED_STYLES: Record<string, string> = {
  AVAILABLE: "border-success/40 bg-success/10 text-success",
  OCCUPIED: "border-info/40 bg-info/10 text-info",
  MAINTENANCE: "border-warning/40 bg-warning/10 text-warning",
};

export default async function WardsPage() {
  await requireRole("NURSE", "DOCTOR");

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [wards, currentAdmissions, admittedToday] = await Promise.all([
    wardOccupancy(),
    db.admission.findMany({
      where: { state: { in: ["ADMITTED", "ON_WARD"] } },
      include: {
        patient: { select: { id: true, name: true, mrn: true, gender: true } },
        ward: { select: { name: true } },
        bed: { select: { label: true } },
        admittedBy: { select: { name: true } },
      },
      orderBy: { admittedAt: "desc" },
    }),
    db.admission.count({ where: { admittedAt: { gte: startOfToday } } }),
  ]);

  const totalBeds = wards.reduce((s, w) => s + w.total, 0);
  const occupied = wards.reduce((s, w) => s + w.occupied, 0);
  const available = wards.reduce((s, w) => s + w.available, 0);
  const occupancyPct = totalBeds > 0 ? Math.round((occupied / totalBeds) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wards & Admissions"
        description="Live bed board and inpatient management across every ward."
        icon={Building2}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total beds" value={totalBeds} icon={BedDouble} tone="brand" />
        <StatCard
          label="Occupied"
          value={occupied}
          hint={`${occupancyPct}% occupancy`}
          icon={Users}
          tone="info"
        />
        <StatCard label="Available" value={available} icon={BedSingle} tone="success" />
        <StatCard label="Admitted today" value={admittedToday} icon={Activity} tone="warning" />
      </div>

      {/* Bed board */}
      {wards.length === 0 ? (
        <EmptyState title="No wards configured" icon={Building2} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {wards.map((ward) => (
            <Card key={ward.id}>
              <CardHeader className="flex-row items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {ward.name}
                    {ward.gender && (
                      <Badge variant="outline" className="gap-1 font-normal">
                        <VenusAndMars className="size-3" /> {humanize(ward.gender)}
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {ward.occupied}/{ward.total} beds occupied
                    {ward.maintenance > 0 ? ` · ${ward.maintenance} in maintenance` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-semibold tracking-tight">{ward.occupancyPct}%</div>
                  <div className="text-xs text-muted-foreground">occupancy</div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Occupancy meter */}
                <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-info transition-all"
                    style={{ width: `${ward.occupancyPct}%` }}
                  />
                </div>
                {ward.beds.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No beds in this ward.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {ward.beds.map((bed) => {
                      const cell = (
                        <div
                          className={cn(
                            "flex h-full flex-col gap-1 rounded-lg border p-3 transition-colors",
                            BED_STYLES[bed.status] ?? "border-border bg-muted",
                            bed.occupant && "hover:brightness-95",
                          )}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-semibold">{bed.label}</span>
                            <BedDouble className="size-3.5 opacity-70" />
                          </div>
                          <span className="truncate text-xs">
                            {bed.occupant ? bed.occupant.patient.name : humanize(bed.status)}
                          </span>
                        </div>
                      );
                      return bed.occupant ? (
                        <Link key={bed.id} href={`/wards/${bed.occupant.id}`} className="block">
                          {cell}
                        </Link>
                      ) : (
                        <div key={bed.id}>{cell}</div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Current admissions */}
      <Card>
        <CardHeader>
          <CardTitle>Current admissions ({currentAdmissions.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {currentAdmissions.length === 0 ? (
            <EmptyState title="No active admissions" icon={BedDouble} className="m-4" />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Ward / Bed</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Admitted</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentAdmissions.map((adm) => (
                    <TableRow key={adm.id} className="cursor-pointer">
                      <TableCell>
                        <Link href={`/wards/${adm.id}`} className="font-medium hover:text-primary">
                          {adm.patient.name}
                        </Link>
                        <div className="font-mono text-xs text-muted-foreground">{adm.patient.mrn}</div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {adm.ward?.name ?? "—"}
                        {adm.bed ? ` · ${adm.bed.label}` : ""}
                      </TableCell>
                      <TableCell className="max-w-[16rem] truncate text-sm text-muted-foreground">
                        {adm.reason || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(adm.admittedAt, { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <StatusBadge state={adm.state} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
