"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, FlaskConical, Pill } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export type LabResult = {
  id: string;
  name: string;
  resultValue: string | null;
  resultFlag: string | null;
};

export type DrugResult = {
  id: string;
  name: string;
  dose: string | null;
  frequency: string | null;
  duration: string | null;
};

export type VisitView = {
  id: string;
  visitNo: string;
  state: string;
  date: string;
  doctor: string | null;
  chiefComplaint: string | null;
  diagnosis: string | null;
  disease: string | null;
  labs: LabResult[];
  drugs: DrugResult[];
};

export function VisitCard({ visit }: { visit: VisitView }) {
  const [open, setOpen] = useState(false);
  const hasDetails = visit.labs.length > 0 || visit.drugs.length > 0;

  return (
    <Card>
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge state={visit.state} />
          <span className="font-mono text-xs text-muted-foreground">{visit.visitNo}</span>
          <span className="text-sm text-muted-foreground">{visit.date}</span>
          <span className="ml-auto text-sm text-muted-foreground">
            {visit.doctor ?? "Unassigned"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Chief complaint
            </dt>
            <dd className="mt-0.5 text-sm text-foreground">{visit.chiefComplaint ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Diagnosis
            </dt>
            <dd className="mt-0.5 text-sm text-foreground">
              {visit.diagnosis ?? visit.disease ?? "—"}
            </dd>
          </div>
        </dl>

        {hasDetails ? (
          <>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              aria-expanded={open}
            >
              <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
              {open ? "Hide details" : "View lab tests & medications"}
            </button>

            {open && (
              <div className="space-y-4 pt-1">
                {visit.labs.length > 0 && (
                  <section>
                    <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <FlaskConical className="size-3.5" /> Lab tests
                    </h4>
                    <Separator className="my-2" />
                    <ul className="space-y-1.5">
                      {visit.labs.map((l) => (
                        <li key={l.id} className="flex items-center justify-between gap-3 text-sm">
                          <span className="text-foreground">{l.name}</span>
                          <span className="flex items-center gap-2">
                            <span className="font-mono text-muted-foreground">
                              {l.resultValue ?? "pending"}
                            </span>
                            {l.resultFlag && <StatusBadge state={l.resultFlag} />}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {visit.drugs.length > 0 && (
                  <section>
                    <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <Pill className="size-3.5" /> Medications
                    </h4>
                    <Separator className="my-2" />
                    <ul className="space-y-1.5">
                      {visit.drugs.map((d) => (
                        <li key={d.id} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                          <span className="text-foreground">{d.name}</span>
                          {d.dose && <Badge variant="outline">{d.dose}</Badge>}
                          {d.frequency && <Badge variant="outline">{d.frequency}</Badge>}
                          {d.duration && (
                            <span className="text-muted-foreground">for {d.duration}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            )}
          </>
        ) : (
          <p className="text-xs text-muted-foreground">No lab tests or medications recorded.</p>
        )}

        <div className="pt-1">
          <Link
            href={`/portal/history/${visit.id}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View full visit <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
