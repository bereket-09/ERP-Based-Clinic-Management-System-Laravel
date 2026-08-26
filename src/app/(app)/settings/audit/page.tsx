import { format } from "date-fns";
import { ScrollText, ArrowRight } from "lucide-react";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { humanize } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";

export const metadata = { title: "Audit log" };

interface Entry {
  id: string;
  when: Date;
  actor: string;
  kind: "transition" | "action";
  entity: string;
  summary: React.ReactNode;
}

export default async function AuditPage() {
  await requireRole("MANAGER");

  const [transitions, actions] = await Promise.all([
    db.stateTransition.findMany({ include: { actor: true }, orderBy: { createdAt: "desc" }, take: 120 }),
    db.auditLog.findMany({ include: { actor: true }, orderBy: { createdAt: "desc" }, take: 120 }),
  ]);

  const entries: Entry[] = [
    ...transitions.map((t) => ({
      id: `t-${t.id}`,
      when: t.createdAt,
      actor: t.actor?.name ?? "System",
      kind: "transition" as const,
      entity: t.entityType,
      summary: (
        <span className="flex items-center gap-1.5 text-sm">
          <span className="text-muted-foreground">{t.entityType}</span>
          <StatusBadge state={t.fromState} />
          <ArrowRight className="size-3 text-muted-foreground" />
          <StatusBadge state={t.toState} />
        </span>
      ),
    })),
    ...actions.map((a) => ({
      id: `a-${a.id}`,
      when: a.createdAt,
      actor: a.actor?.name ?? "System",
      kind: "action" as const,
      entity: a.entityType ?? "—",
      summary: <span className="text-sm">{humanize(a.action)}</span>,
    })),
  ]
    .sort((x, y) => y.when.getTime() - x.when.getTime())
    .slice(0, 150);

  return (
    <div className="space-y-6">
      <PageHeader title="Audit log" description="Every state transition and administrative action across the platform." icon={ScrollText} />
      <Card>
        <CardContent className="p-0">
          {entries.length === 0 ? (
            <EmptyState title="No activity yet" icon={ScrollText} className="m-5" />
          ) : (
            <div className="divide-y divide-border">
              {entries.map((e) => (
                <div key={e.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <Badge variant={e.kind === "transition" ? "info" : "brand"}>{e.kind === "transition" ? "FSM" : "Admin"}</Badge>
                    {e.summary}
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>{e.actor}</div>
                    <div>{format(e.when, "PP p")}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
