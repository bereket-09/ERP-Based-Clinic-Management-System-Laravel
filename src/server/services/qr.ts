import "server-only";
import QRCode from "qrcode";
import { headers } from "next/headers";

/** Absolute origin of the current request (works on any host/port). */
export async function requestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Render any text/URL to a PNG data URL for embedding in printouts. */
export async function qrDataUrl(text: string, width = 120): Promise<string> {
  return QRCode.toDataURL(text, { margin: 0, width });
}

/** Build the public verification URL for a document code. */
export async function verifyUrlFor(code: string): Promise<string> {
  return `${await requestOrigin()}/verify/${code}`;
}
