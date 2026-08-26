"use client";
import Image from "next/image";
import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { startRegistration } from "@simplewebauthn/browser";
import {
  ShieldCheck,
  ShieldOff,
  KeyRound,
  Fingerprint,
  Loader2,
  Plus,
  Trash2,
  Pencil,
  Copy,
  Download,
  Check,
} from "lucide-react";
import { format } from "date-fns";
import {
  startTotpEnrollment,
  confirmTotpEnrollment,
  disableMfa,
  regenerateRecoveryCodes,
  startPasskeyRegistration,
  finishPasskeyRegistration,
  renamePasskey,
  deletePasskey,
} from "./actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export interface PasskeyView {
  id: string;
  label: string | null;
  deviceType: string | null;
  backedUp: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

function defaultPasskeyLabel(): string {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  if (/iPhone|iPad/.test(ua)) return "iPhone / iPad";
  if (/Android/.test(ua)) return "Android device";
  if (/Mac/.test(ua)) return "Mac (Touch ID)";
  if (/Windows/.test(ua)) return "Windows Hello";
  return "Passkey";
}

// ── Recovery codes dialog ────────────────────────────────────────────────────
function RecoveryCodesDialog({
  codes,
  onClose,
}: {
  codes: string[] | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const text = codes?.join("\n") ?? "";

  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  function download() {
    const blob = new Blob([`DDU Clinic — recovery codes\n\n${text}\n`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ddu-clinic-recovery-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog open={!!codes} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save your recovery codes</DialogTitle>
          <DialogDescription>
            Each code works once if you lose your authenticator. Store them somewhere safe — you
            won’t see them again.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/40 p-3 font-mono text-sm">
          {codes?.map((c) => (
            <span key={c} className="tracking-wider">{c}</span>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={copy}>
            {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy"}
          </Button>
          <Button variant="outline" onClick={download}><Download /> Download</Button>
          <DialogClose asChild><Button variant="primary">Done</Button></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── TOTP enrolment dialog ────────────────────────────────────────────────────
function EnrollDialog({
  open,
  onOpenChange,
  onEnrolled,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onEnrolled: (codes: string[]) => void;
}) {
  const [pending, start] = useTransition();
  const [data, setData] = useState<{ qr: string; secret: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false); // guard against StrictMode double-invoke

  // Fetch a fresh secret + QR once per open; reset when it closes.
  useEffect(() => {
    if (open && !startedRef.current) {
      startedRef.current = true;
      start(async () => {
        const res = await startTotpEnrollment();
        setData({ qr: res.qr, secret: res.secret });
      });
    }
    if (!open) {
      startedRef.current = false;
      setData(null);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function confirm(formData: FormData) {
    setError(null);
    start(async () => {
      const res = await confirmTotpEnrollment({}, formData);
      if (res.error) setError(res.error);
      else if (res.codes) {
        toast.success("Two-factor authentication enabled");
        onOpenChange(false);
        setData(null);
        onEnrolled(res.codes);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set up authenticator app</DialogTitle>
          <DialogDescription>
            Scan the QR code with Google Authenticator, Authy, 1Password or similar, then enter the
            6-digit code to confirm.
          </DialogDescription>
        </DialogHeader>

        {!data ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="mr-2 animate-spin" /> Preparing…
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3">
              <Image src={data.qr} alt="Authenticator QR code" width={200} height={200} unoptimized className="rounded-lg border border-border bg-white p-2" />
              <div className="text-center text-xs text-muted-foreground">
                Can’t scan? Enter this key manually:
                <div className="mt-1 select-all break-all font-mono text-[11px] text-foreground">{data.secret}</div>
              </div>
            </div>
            <form action={confirm} className="space-y-2">
              <Label htmlFor="code">6-digit code</Label>
              <Input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" placeholder="123456" required autoFocus />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" variant="primary" className="w-full" disabled={pending}>
                {pending ? <Loader2 className="animate-spin" /> : <ShieldCheck />} Verify & enable
              </Button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Disable MFA dialog ───────────────────────────────────────────────────────
function DisableDialog({ open, onOpenChange, onDone }: { open: boolean; onOpenChange: (o: boolean) => void; onDone: () => void }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit(formData: FormData) {
    setError(null);
    start(async () => {
      const res = await disableMfa({}, formData);
      if (res.error) setError(res.error);
      else {
        toast.success("Two-factor authentication disabled");
        onOpenChange(false);
        onDone();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Disable two-factor authentication</DialogTitle>
          <DialogDescription>Confirm your password to turn off MFA. This also deletes your recovery codes.</DialogDescription>
        </DialogHeader>
        <form action={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required autoFocus />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <ShieldOff />} Disable
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Main section ─────────────────────────────────────────────────────────────
export function SecuritySection({ mfaEnabled, passkeys }: { mfaEnabled: boolean; passkeys: PasskeyView[] }) {
  const router = useRouter();
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [codes, setCodes] = useState<string[] | null>(null);
  const [pending, start] = useTransition();

  function regen() {
    start(async () => {
      const res = await regenerateRecoveryCodes();
      if ("error" in res) toast.error(res.error);
      else setCodes(res.codes);
    });
  }

  function addPasskey() {
    start(async () => {
      try {
        const options = await startPasskeyRegistration();
        const attResp = await startRegistration(options);
        const fd = new FormData();
        fd.set("response", JSON.stringify(attResp));
        fd.set("label", defaultPasskeyLabel());
        const res = await finishPasskeyRegistration({}, fd);
        if (res.error) toast.error(res.error);
        else {
          toast.success("Passkey added");
          router.refresh();
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Passkey setup was cancelled.";
        if (!/cancel|abort|NotAllowed/i.test(msg)) toast.error("Could not register passkey.");
      }
    });
  }

  function rename(id: string, current: string | null) {
    const label = window.prompt("Rename passkey", current ?? "Passkey");
    if (label == null) return;
    start(async () => {
      await renamePasskey(id, label);
      router.refresh();
    });
  }

  function remove(id: string) {
    if (!window.confirm("Remove this passkey? You won’t be able to sign in with it anymore.")) return;
    start(async () => {
      await deletePasskey(id);
      toast.success("Passkey removed");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Two-factor */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Fingerprint className="size-4 text-muted-foreground" /> Two-factor authentication
              </CardTitle>
              <CardDescription>Require a one-time code from an authenticator app at sign-in.</CardDescription>
            </div>
            <Badge variant={mfaEnabled ? "success" : "default"}>{mfaEnabled ? "On" : "Off"}</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {mfaEnabled ? (
            <>
              <Button variant="outline" onClick={regen} disabled={pending}>
                {pending ? <Loader2 className="animate-spin" /> : <KeyRound />} Regenerate recovery codes
              </Button>
              <Button variant="destructive" onClick={() => setDisableOpen(true)}>
                <ShieldOff /> Disable
              </Button>
            </>
          ) : (
            <Button variant="primary" onClick={() => setEnrollOpen(true)}>
              <ShieldCheck /> Enable authenticator app
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Passkeys */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="size-4 text-muted-foreground" /> Passkeys
              </CardTitle>
              <CardDescription>Sign in without a password using Touch ID, Windows Hello or a security key.</CardDescription>
            </div>
            <Button variant="primary" size="sm" onClick={addPasskey} disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <Plus />} Add passkey
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {passkeys.length === 0 ? (
            <p className="text-sm text-muted-foreground">No passkeys yet. Add one for faster, phishing-resistant sign-in.</p>
          ) : (
            <ul className="divide-y divide-border">
              {passkeys.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      <Fingerprint className="size-4" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        {p.label ?? "Passkey"}
                        {p.backedUp && <Badge variant="default" className="text-[10px]">Synced</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Added {format(new Date(p.createdAt), "PP")}
                        {p.lastUsedAt && ` · last used ${format(new Date(p.lastUsedAt), "PP")}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => rename(p.id, p.label)} aria-label="Rename">
                      <Pencil />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => remove(p.id)} aria-label="Remove">
                      <Trash2 className="text-destructive" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <EnrollDialog open={enrollOpen} onOpenChange={setEnrollOpen} onEnrolled={(c) => setCodes(c)} />
      <DisableDialog open={disableOpen} onOpenChange={setDisableOpen} onDone={() => router.refresh()} />
      <RecoveryCodesDialog codes={codes} onClose={() => { setCodes(null); router.refresh(); }} />
    </div>
  );
}
