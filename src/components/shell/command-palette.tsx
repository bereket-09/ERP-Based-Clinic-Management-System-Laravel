"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, CornerDownLeft } from "lucide-react";
import type { Role } from "@prisma/client";
import { NAV } from "@/lib/nav";
import { canAccess } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Item {
  label: string;
  href: string;
  group: string;
}

const QUICK: Item[] = [
  { label: "Register a patient", href: "/reception", group: "Quick actions" },
  { label: "Book an appointment", href: "/appointments/new", group: "Quick actions" },
  { label: "New referral", href: "/referrals/new", group: "Quick actions" },
  { label: "Feature toggles", href: "/settings/features", group: "Quick actions" },
  { label: "Appearance & branding", href: "/settings/appearance", group: "Quick actions" },
];

export function CommandPalette({ role, features }: { role: Role | null; features: string[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [active, setActive] = React.useState(0);
  const featureSet = React.useMemo(() => new Set(features), [features]);

  const items = React.useMemo<Item[]>(() => {
    const nav = NAV.flatMap((g) =>
      g.items
        .filter((i) => canAccess(i.section, role) && (!i.feature || featureSet.has(i.feature)))
        .map((i) => ({ label: i.label, href: i.href, group: g.label })),
    );
    return [...nav, ...QUICK];
  }, [role, featureSet]);

  const filtered = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((i) => i.label.toLowerCase().includes(term));
  }, [q, items]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
    }
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted sm:flex"
      >
        <Search className="size-4" />
        <span>Search…</span>
        <kbd className="ml-3 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium">⌘K</kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl gap-0 p-0">
          <div className="flex items-center gap-2 border-b border-border px-4">
            <Search className="size-4 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setActive(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, filtered.length - 1)); }
                if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
                if (e.key === "Enter" && filtered[active]) go(filtered[active].href);
              }}
              placeholder="Search modules and actions…"
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">No results</p>
            ) : (
              filtered.map((i, idx) => (
                <button
                  key={i.href + i.label}
                  onClick={() => go(i.href)}
                  onMouseEnter={() => setActive(idx)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm",
                    idx === active ? "bg-accent text-accent-foreground" : "hover:bg-muted",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <ArrowRight className="size-3.5 text-muted-foreground" />
                    {i.label}
                  </span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    {i.group}
                    {idx === active && <CornerDownLeft className="size-3.5" />}
                  </span>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
