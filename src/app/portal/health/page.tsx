import { format } from "date-fns";
import {
  HeartPulse,
  Activity,
  Thermometer,
  Weight,
  Wind,
  Droplets,
  ShieldAlert,
  ClipboardList,
  Syringe,
} from "lucide-react";
import { requireStudent } from "@/server/session";
import { db } from "@/server/db";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkline, type SparkPoint } from "@/components/portal/sparkline";

export const metadata = { title: "My Health" };

export default async function PortalHealthPage() {
  const actor = await requireStudent();

  const patient = await db.patient.findUnique({
    where: { id: actor.id },
    include: {
      allergies: { orderBy: { createdAt: "desc" } },
      problems: { orderBy: { createdAt: "desc" } },
      immunizations: { orderBy: { givenAt: "desc" } },
    },
  });
  if (!patient) return null;

  // All vitals across this patient's visits, oldest → newest for trends.
  const vitalsRows = await db.vitals.findMany({
    where: { visit: { patientId: patient.id } },
    orderBy: { createdAt: "asc" },
  });

  const latest = vitalsRows.length ? vitalsRows[vitalsRows.length - 1] : null;

  const bmi =
    latest?.weightKg && latest?.heightCm
      ? latest.weightKg / (latest.heightCm / 100) ** 2
      : null;

  // Build trend series (only points that have a value).
  const series = (pick: (v: (typeof vitalsRows)[number]) => number | null): SparkPoint[] =>
    vitalsRows.flatMap((v) => {
      const value = pick(v);
      return value == null ? [] : [{ value, label: format(v.createdAt, "PP") }];
    });

  const trends = [
    { key: "sys", label: "Systolic BP", unit: "mmHg", data: series((v) => v.systolic) },
    { key: "pulse", label: "Pulse", unit: "bpm", data: series((v) => v.pulseBpm) },
    { key: "temp", label: "Temperature", unit: "°C", data: series((v) => v.temperatureC) },
    { key: "weight", label: "Weight", unit: "kg", data: series((v) => v.weightKg) },
  ].filter((t) => t.data.length >= 2);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={HeartPulse}
        title="My health"
        description="Your latest vitals, trends over time, and the conditions on your record."
      />

      {/* Latest vitals */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Latest vitals</CardTitle>
          {latest && (
            <span className="text-xs text-muted-foreground">
              Taken {format(latest.createdAt, "PPP")}
            </span>
          )}
        </CardHeader>
        <CardContent>
          {latest ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <VitalTile
                icon={Activity}
                label="Blood pressure"
                value={
                  latest.systolic && latest.diastolic
                    ? `${latest.systolic}/${latest.diastolic}`
                    : null
                }
                unit="mmHg"
              />
              <VitalTile icon={HeartPulse} label="Pulse" value={latest.pulseBpm} unit="bpm" />
              <VitalTile
                icon={Thermometer}
                label="Temperature"
                value={latest.temperatureC}
                unit="°C"
              />
              <VitalTile icon={Droplets} label="SpO₂" value={latest.spo2} unit="%" />
              <VitalTile icon={Wind} label="Resp. rate" value={latest.respRate} unit="/min" />
              <VitalTile icon={Weight} label="Weight" value={latest.weightKg} unit="kg" />
              <VitalTile icon={Weight} label="Height" value={latest.heightCm} unit="cm" />
              <VitalTile
                icon={Activity}
                label="BMI"
                value={bmi ? bmi.toFixed(1) : null}
                unit="kg/m²"
              />
            </div>
          ) : (
            <EmptyState
              icon={HeartPulse}
              title="No vitals recorded yet"
              description="When a nurse records your vitals during a visit, they'll show here."
            />
          )}
        </CardContent>
      </Card>

      {/* Trends */}
      {trends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Trends over time</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            {trends.map((t) => {
              const first = t.data[0].value;
              const last = t.data[t.data.length - 1].value;
              return (
                <div key={t.key} className="space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-medium text-foreground">{t.label}</span>
                    <span className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">{last}</span> {t.unit}
                    </span>
                  </div>
                  <Sparkline points={t.data} width={320} height={52} className="w-full text-primary" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{t.data[0].label} · {first}</span>
                    <span>{t.data.length} readings</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Allergies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="size-4 text-primary" /> Allergies
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patient.allergies.length === 0 ? (
            <p className="text-sm text-muted-foreground">No known allergies on your record.</p>
          ) : (
            <ul className="divide-y divide-border">
              {patient.allergies.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div>
                    <span className="text-sm font-medium text-foreground">{a.substance}</span>
                    {a.reaction && (
                      <span className="ml-2 text-sm text-muted-foreground">— {a.reaction}</span>
                    )}
                  </div>
                  <StatusBadge state={a.severity} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Problem list / known conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="size-4 text-primary" /> Known conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patient.problems.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No ongoing conditions recorded on your file.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {patient.problems.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div>
                    <span className="text-sm font-medium text-foreground">{p.problem}</span>
                    {p.onsetDate && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        since {format(p.onsetDate, "MMM yyyy")}
                      </span>
                    )}
                  </div>
                  <StatusBadge state={p.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Immunizations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Syringe className="size-4 text-primary" /> Immunizations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patient.immunizations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No immunizations recorded.</p>
          ) : (
            <ul className="divide-y divide-border">
              {patient.immunizations.map((im) => (
                <li
                  key={im.id}
                  className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2.5"
                >
                  <div>
                    <span className="text-sm font-medium text-foreground">{im.vaccine}</span>
                    {im.dose && (
                      <span className="ml-2 text-xs text-muted-foreground">{im.dose}</span>
                    )}
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>Given {format(im.givenAt, "PP")}</div>
                    {im.nextDueAt && (
                      <div className="text-warning">Next due {format(im.nextDueAt, "PP")}</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function VitalTile({
  icon: Icon,
  label,
  value,
  unit,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: number | string | null;
  unit?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-3.5">
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </div>
      <div className="mt-1.5 text-xl font-semibold tracking-tight text-foreground">
        {value != null && value !== "" ? (
          <>
            {value}
            {unit && <span className="ml-1 text-xs font-normal text-muted-foreground">{unit}</span>}
          </>
        ) : (
          "—"
        )}
      </div>
    </div>
  );
}
