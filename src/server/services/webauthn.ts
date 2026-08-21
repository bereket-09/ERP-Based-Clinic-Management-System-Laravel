import "server-only";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
} from "@simplewebauthn/types";
import { headers } from "next/headers";

/**
 * WebAuthn (passkey) helpers for @simplewebauthn/server v9. rpID/origin are
 * derived from the incoming request so this works on any host/port in dev and
 * on the campus domain in prod.
 */

const RP_NAME = "DDU Clinic";

export async function getRp(): Promise<{ rpID: string; origin: string }> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const rpID = host.split(":")[0]; // strip port — rpID is a bare domain
  return { rpID, origin: `${proto}://${host}` };
}

const b64 = {
  encode: (u: Uint8Array) => Buffer.from(u).toString("base64url"),
  decode: (s: string) => new Uint8Array(Buffer.from(s, "base64url")),
};

function transportsOf(csv?: string | null): AuthenticatorTransportFuture[] | undefined {
  const list = csv?.split(",").map((t) => t.trim()).filter(Boolean);
  return list && list.length ? (list as AuthenticatorTransportFuture[]) : undefined;
}

export interface StoredCredential {
  credentialId: string;
  publicKey: string;
  counter: bigint;
  transports?: string | null;
}

export async function buildRegistrationOptions(opts: {
  userId: string;
  userName: string;
  displayName: string;
  existing: StoredCredential[];
}) {
  const { rpID } = await getRp();
  return generateRegistrationOptions({
    rpName: RP_NAME,
    rpID,
    userID: opts.userId,
    userName: opts.userName,
    userDisplayName: opts.displayName,
    attestationType: "none",
    excludeCredentials: opts.existing.map((c) => ({
      id: b64.decode(c.credentialId),
      type: "public-key" as const,
      transports: transportsOf(c.transports),
    })),
    authenticatorSelection: { residentKey: "preferred", userVerification: "preferred" },
  });
}

export async function verifyRegistration(response: RegistrationResponseJSON, expectedChallenge: string) {
  const { rpID, origin } = await getRp();
  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    requireUserVerification: false,
  });
  if (!verification.verified || !verification.registrationInfo) return null;
  const { credentialID, credentialPublicKey, counter, credentialDeviceType, credentialBackedUp } =
    verification.registrationInfo;
  return {
    credentialId: b64.encode(credentialID),
    publicKey: b64.encode(credentialPublicKey),
    counter: BigInt(counter),
    transports: response.response.transports?.join(",") ?? null,
    deviceType: credentialDeviceType,
    backedUp: credentialBackedUp,
  };
}

export async function buildAuthenticationOptions(allow: StoredCredential[]) {
  const { rpID } = await getRp();
  return generateAuthenticationOptions({
    rpID,
    allowCredentials: allow.map((c) => ({
      id: b64.decode(c.credentialId),
      type: "public-key" as const,
      transports: transportsOf(c.transports),
    })),
    userVerification: "preferred",
  });
}

export async function verifyAuthentication(
  response: AuthenticationResponseJSON,
  expectedChallenge: string,
  stored: StoredCredential,
) {
  const { rpID, origin } = await getRp();
  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    requireUserVerification: false,
    authenticator: {
      credentialID: b64.decode(stored.credentialId),
      credentialPublicKey: b64.decode(stored.publicKey),
      counter: Number(stored.counter),
      transports: transportsOf(stored.transports),
    },
  });
  if (!verification.verified) return null;
  return { newCounter: BigInt(verification.authenticationInfo.newCounter) };
}

export type { RegistrationResponseJSON, AuthenticationResponseJSON };
