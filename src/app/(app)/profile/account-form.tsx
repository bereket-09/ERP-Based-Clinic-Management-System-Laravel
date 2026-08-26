"use client";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Save, Mail, Lock } from "lucide-react";
import { updateAccount, changePassword, type FormState } from "./actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function useToastOnResult(state: FormState) {
  useEffect(() => {
    if (state.ok && state.message) toast.success(state.message);
    else if (state.error) toast.error(state.error);
  }, [state]);
}

export function AccountForm({
  name,
  username,
  email,
}: {
  name: string;
  username: string | null;
  email: string;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateAccount, {});
  useToastOnResult(state);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account details</CardTitle>
        <CardDescription>Update your display name and username. Your email can’t be changed here.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" defaultValue={name} required maxLength={80} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" defaultValue={username ?? ""} placeholder="e.g. m.assefa" autoCapitalize="none" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email-readonly">Work email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email-readonly" value={email} readOnly disabled className="pl-9" />
            </div>
            <p className="text-xs text-muted-foreground">Contact HR to change your work email.</p>
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <Save />} Save changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(changePassword, {});
  useToastOnResult(state);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Lock className="size-4 text-muted-foreground" /> Change password</CardTitle>
        <CardDescription>Use a strong password of at least 8 characters.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          action={action}
          className="space-y-4"
          key={state.ok ? "reset" : "form"} // clear fields after a successful change
        >
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New password</Label>
              <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" required minLength={8} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <Save />} Update password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
