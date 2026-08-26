import "server-only";

/** Build a human-friendly reference like V-2026-00042. */
export function makeCode(prefix: string, seq: number): string {
  return `${prefix}-${new Date().getFullYear()}-${String(seq).padStart(5, "0")}`;
}
