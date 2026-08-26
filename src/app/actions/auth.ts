"use server";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";

export type LoginState = { error?: string; mfaRequired?: boolean };

export async function staffLogin(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const token = String(formData.get("token") ?? "").trim();
  try {
    await signIn("staff", {
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
      token,
      redirectTo: "/dashboard",
    });
    return {};
  } catch (err) {
    if (err instanceof AuthError) {
      const code = (err as AuthError & { code?: string }).code;
      if (err.type === "CredentialsSignin") {
        if (code === "mfa_required") return { mfaRequired: true };
        if (code === "mfa_invalid")
          return { mfaRequired: true, error: "That authentication code didn't match. Try again." };
        return {
          error:
            code === "blocked"
              ? "This account is on leave or inactive — sign-in is disabled. Please contact HR."
              : "Invalid email or password.",
        };
      }
      return { error: "Could not sign in. Please try again." };
    }
    throw err; // re-throw redirect
  }
}

export async function studentLogin(_prev: LoginState, formData: FormData): Promise<LoginState> {
  try {
    await signIn("student", {
      studentId: String(formData.get("studentId") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/portal",
    });
    return {};
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Invalid student ID or password, or portal access is not enabled." };
    }
    throw err;
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
