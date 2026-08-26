"use client";
import * as React from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { humanize } from "@/lib/utils";
import { toggleFeatureAction } from "../actions";

export interface FlagRow {
  key: string;
  name: string;
  description: string;
  category: string;
  group: string;
  enabled: boolean;
}

const CAT_VARIANT: Record<string, "brand" | "info" | "warning" | "success" | "default"> = {
  TENANT: "brand",
  RELEASE: "info",
  OPS: "warning",
  PERMISSION: "success",
  EXPERIMENT: "default",
};

export function FeatureToggles({ flags }: { flags: FlagRow[] }) {
  const [state, setState] = React.useState(() => Object.fromEntries(flags.map((f) => [f.key, f.enabled])));
  const [pending, startTransition] = React.useTransition();

  const groups = React.useMemo(() => {
    const map = new Map<string, FlagRow[]>();
    for (const f of flags) {
      if (!map.has(f.group)) map.set(f.group, []);
      map.get(f.group)!.push(f);
    }
    return [...map.entries()];
  }, [flags]);

  const toggle = (key: string, next: boolean) => {
    setState((s) => ({ ...s, [key]: next }));
    startTransition(async () => {
      const r = await toggleFeatureAction(key, next);
      if (r.ok) toast.success(`${next ? "Enabled" : "Disabled"} · ${humanize(key.split(".")[1] ?? key)}`);
      else {
        toast.error("Could not update");
        setState((s) => ({ ...s, [key]: !next }));
      }
    });
  };

  return (
    <div className="space-y-6">
      {groups.map(([group, items]) => (
        <Card key={group}>
          <CardHeader>
            <CardTitle>{group}</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {items.map((f) => (
              <div key={f.key} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{f.name}</span>
                    <Badge variant={CAT_VARIANT[f.category] ?? "default"}>{humanize(f.category)}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{f.description}</p>
                  <code className="text-[11px] text-muted-foreground/70">{f.key}</code>
                </div>
                <Switch checked={state[f.key]} onCheckedChange={(v) => toggle(f.key, v)} disabled={pending} />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
