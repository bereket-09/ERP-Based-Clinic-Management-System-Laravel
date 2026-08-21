"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, RotateCcw, Save } from "lucide-react";
import type { Branding } from "@/server/services/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { saveBrandingAction } from "../actions";

const DDU: Branding = {
  appName: "DDU Clinic",
  orgName: "Dire Dawa University Student Clinic Center",
  primary: "#1a56b0",
  primaryHover: "#14468f",
  gold: "#e0a112",
  sidebar: "#0c1f3d",
};

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-12 cursor-pointer rounded-lg border border-input bg-card p-1" />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="font-mono" />
      </div>
    </div>
  );
}

export function BrandingForm({ initial }: { initial: Branding }) {
  const router = useRouter();
  const [b, setB] = React.useState<Branding>(initial);
  const [pending, start] = React.useTransition();
  const set = (patch: Partial<Branding>) => setB((s) => ({ ...s, ...patch }));

  const save = () =>
    start(async () => {
      const r = await saveBrandingAction(b);
      if (r.ok) {
        toast.success("Branding saved");
        router.refresh();
      } else toast.error("Save failed");
    });

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Identity & colours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Product name</Label>
              <Input value={b.appName} onChange={(e) => set({ appName: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Organisation</Label>
              <Input value={b.orgName} onChange={(e) => set({ orgName: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField label="Primary" value={b.primary} onChange={(v) => set({ primary: v })} />
            <ColorField label="Primary (hover)" value={b.primaryHover} onChange={(v) => set({ primaryHover: v })} />
            <ColorField label="Accent / gold" value={b.gold} onChange={(v) => set({ gold: v })} />
            <ColorField label="Sidebar" value={b.sidebar} onChange={(v) => set({ sidebar: v })} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="primary" onClick={save} disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <Save className="size-4" />} Save branding
            </Button>
            <Button variant="ghost" onClick={() => setB(DDU)}>
              <RotateCcw className="size-4" /> Reset to DDU
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Saved colours apply platform-wide after refresh. Great for white-labelling to other institutions.</p>
        </CardContent>
      </Card>

      {/* Live preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="flex h-24 items-end p-3 text-white" style={{ background: b.sidebar }}>
              <span className="font-semibold">{b.appName}</span>
            </div>
            <div className="space-y-2 p-3">
              <div className="h-8 rounded-lg text-sm font-medium text-white" style={{ background: b.primary }}>
                <span className="flex h-full items-center justify-center">Primary button</span>
              </div>
              <div className="h-8 rounded-lg text-sm font-medium" style={{ background: b.gold, color: "#241a02" }}>
                <span className="flex h-full items-center justify-center">Accent</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
