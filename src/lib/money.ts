/** Money helpers for ETB (Ethiopian Birr). */

/** Format a number with thousands separators and exactly 2 decimals. */
export function formatETB(n: number | null | undefined): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n ?? 0);
}

/** Format an amount prefixed with the ETB currency label. */
export function birr(n: number | null | undefined): string {
  return `ETB ${formatETB(n)}`;
}
