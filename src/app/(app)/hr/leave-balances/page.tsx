import { Scale } from "lucide-react";
import { LeaveType } from "@prisma/client";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { roleLabel } from "@/lib/rbac";
import { humanize } from "@/lib/utils";
import { leaveBalancesFor } from "@/server/services/hr-ops";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { YearNav, BalanceCell } from "./balances-client";

export const metadata = { title: "Leave balances" };

const LEAVE_TYPES = Object.values(LeaveType);

export default async function LeaveBalancesPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  await requireRole("HR", "MANAGER");
  const { year: yearParam } = await searchParams;

  const parsed = Number(yearParam);
  const year =
    Number.isInteger(parsed) && parsed >= 2000 && parsed <= 2100
      ? parsed
      : new Date().getUTCFullYear();

  const [staff, balances] = await Promise.all([
    db.user.findMany({
      where: { isActive: true },
      select: { id: true, name: true, role: true, title: true },
      orderBy: { name: "asc" },
    }),
    leaveBalancesFor(year),
  ]);

  // Map keyed by `${userId}|${type}` → { entitled, used }.
  const byCell = new Map<string, { entitled: number; used: number }>();
  for (const b of balances) {
    byCell.set(`${b.userId}|${b.type}`, { entitled: b.entitled, used: b.used });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave balances"
        description={`Entitlement, usage and remaining days · ${year}`}
        icon={Scale}
        actions={<YearNav year={year} />}
      />

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="sticky left-0 z-10 bg-card px-4 py-3 text-left font-medium text-muted-foreground">
                  Staff
                </th>
                {LEAVE_TYPES.map((t) => (
                  <th key={t} className="px-2 py-3 text-center font-medium text-muted-foreground">
                    {humanize(t)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => {
                const displayName = `${s.title ? `${s.title} ` : ""}${s.name}`;
                return (
                  <tr key={s.id} className="border-b border-border last:border-0">
                    <td className="sticky left-0 z-10 bg-card px-4 py-2 align-middle">
                      <div className="font-medium">{displayName}</div>
                      <Badge variant="outline" className="mt-1">
                        {roleLabel(s.role)}
                      </Badge>
                    </td>
                    {LEAVE_TYPES.map((t) => {
                      const cell = byCell.get(`${s.id}|${t}`);
                      return (
                        <td key={t} className="px-1.5 py-1.5 align-middle">
                          <BalanceCell
                            userId={s.id}
                            userName={displayName}
                            type={t}
                            typeLabel={humanize(t)}
                            year={year}
                            entitled={cell?.entitled ?? 0}
                            used={cell?.used ?? 0}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Each cell shows remaining / entitled days, with days used below. Click any cell to adjust the
        entitlement.
      </p>
    </div>
  );
}
