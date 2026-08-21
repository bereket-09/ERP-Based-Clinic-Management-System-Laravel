import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import {
  Activity,
  ArrowLeft,
  Gauge,
  HeartPulse,
  Scale,
  Thermometer,
  Wind,
} from "lucide-react";
import { requireStaff } from "@/server/session";
import { db } from "@/server/db";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BloodPressureChart,
  PulseChart,
  Spo2Chart,
  TemperatureChart,
  WeightChart,
  type VitalsPoint,
} from "./charts";

/** WHO BMI category with a matching badge tone. */
function bmiCategory(bmi: number): {
  label: string;
  variant: "info" | "success" | "warning" | "danger";
} {
  if (bmi < 18.5) return { label: "Underweight", variant: "info" };
  if (bmi < 25) return { label: "Normal", variant: "success" };
  if (bmi < 30) return { label: "Overweight", variant: "warning" };
  return { label: "Obese", variant: "danger" };
}

/** Latest non-null value for a field across the (asc-sorted) series. */
function latestOf<K extends keyof VitalsRow>(
  rows: VitalsRow[],
  key: K,
): VitalsRow[K] | null {
  for (let i = rows.length - 1; i >= 0; i--) {
    const v = rows[i][key];
    if (v !== null && v !== undefined) return v;
  }
  return null;
}

interface VitalsRow {
  temperatureC: number | null;
  pulseBpm: number | null;
  systolic: number | null;
  diastolic: number | null;
  respRate: number | null;
  spo2: number | null;
  weightKg: number | null;
  heightCm: number | null;
  createdAt: Date;
}

export default async function VitalsTrendsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  const { id } = await params;

  const patient = await db.patient.findUnique({
    where: { id },
    select: { id: true, name: true, mrn: true },
  });
  if (!patient) notFound();

  const rows = (await db.vitals.findMany({
    where: { visit: { patientId: id } },
    orderBy: { createdAt: "asc" },
    select: {
      temperatureC: true,
      pulseBpm: true,
      systolic: true,
      diastolic: true,
      respRate: true,
      spo2: true,
      weightKg: true,
      heightCm: true,
      createdAt: true,
    },
  })) as VitalsRow[];

  const backLink = (
    <Link
      href={`/patients/${patient.id}`}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-4" /> Back to patient
    </Link>
  );

  const header = (
    <PageHeader
      title="Vitals & trends"
      description={`${patient.name} · ${patient.mrn}`}
      icon={Activity}
    />
  );

  if (rows.length === 0) {
    return (
      <div className="space-y-6">
        {backLink}
        {header}
        <EmptyState
          title="No vitals recorded"
          description="Vital signs captured during this patient's visits will appear here as trends."
          icon={HeartPulse}
        />
      </div>
    );
  }

  // Serialize to plain arrays for the client charts (short date labels).
  const series: VitalsPoint[] = rows.map((r) => ({
    label: format(r.createdAt, "MMM d"),
    temperatureC: r.temperatureC,
    pulseBpm: r.pulseBpm,
    systolic: r.systolic,
    diastolic: r.diastolic,
    spo2: r.spo2,
    weightKg: r.weightKg,
  }));

  const temp = latestOf(rows, "temperatureC");
  const pulse = latestOf(rows, "pulseBpm");
  const sys = latestOf(rows, "systolic");
  const dia = latestOf(rows, "diastolic");
  const spo2 = latestOf(rows, "spo2");
  const weight = latestOf(rows, "weightKg");
  const height = latestOf(rows, "heightCm");

  const bmi =
    weight !== null && height !== null && height > 0
      ? weight / (height / 100) ** 2
      : null;
  const bmiCat = bmi !== null ? bmiCategory(bmi) : null;

  const lastAt = rows[rows.length - 1].createdAt;

  return (
    <div className="space-y-6">
      {backLink}
      {header}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Temperature"
          value={temp !== null ? `${temp}°C` : "—"}
          icon={Thermometer}
          tone="danger"
        />
        <StatCard
          label="Pulse"
          value={pulse !== null ? `${pulse}` : "—"}
          hint={pulse !== null ? "bpm" : undefined}
          icon={HeartPulse}
          tone="warning"
        />
        <StatCard
          label="Blood pressure"
          value={sys !== null && dia !== null ? `${sys}/${dia}` : "—"}
          hint={sys !== null && dia !== null ? "mmHg" : undefined}
          icon={Gauge}
          tone="brand"
        />
        <StatCard
          label="SpO₂"
          value={spo2 !== null ? `${spo2}%` : "—"}
          icon={Wind}
          tone="info"
        />
        <StatCard
          label="Weight"
          value={weight !== null ? `${weight}` : "—"}
          hint={weight !== null ? "kg" : undefined}
          icon={Scale}
          tone="success"
        />
        {bmi !== null && bmiCat ? (
          <StatCard
            label="BMI"
            value={
              <span className="flex items-center gap-2">
                {bmi.toFixed(1)}
                <Badge variant={bmiCat.variant}>{bmiCat.label}</Badge>
              </span>
            }
            icon={Activity}
            tone="brand"
          />
        ) : (
          <StatCard label="BMI" value="—" hint="height needed" icon={Activity} />
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Latest reading {format(lastAt, "PPp")} · {rows.length} record
        {rows.length === 1 ? "" : "s"}
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Temperature</CardTitle>
          </CardHeader>
          <CardContent>
            <TemperatureChart data={series} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pulse</CardTitle>
          </CardHeader>
          <CardContent>
            <PulseChart data={series} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Blood pressure</CardTitle>
          </CardHeader>
          <CardContent>
            <BloodPressureChart data={series} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Oxygen saturation (SpO₂)</CardTitle>
          </CardHeader>
          <CardContent>
            <Spo2Chart data={series} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Weight</CardTitle>
          </CardHeader>
          <CardContent>
            <WeightChart data={series} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
