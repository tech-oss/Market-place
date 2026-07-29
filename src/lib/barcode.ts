/**
 * Code128 (our default label format) encodes the full printable ASCII
 * range (0x20–0x7E: digits, upper/lower case letters, and standard
 * symbols) — anything outside that (curly quotes, em dashes, emoji,
 * accented characters) will print blank or garbled on a real barcode
 * scanner, per the barcode-type reference table.
 */
export const CODE128_SAFE = /^[\x20-\x7E]*$/;

/** Strip characters Code128 can't encode, so labels never render invalid SKUs. */
export function sanitizeForCode128(value: string): string {
  return value.replace(/[^\x20-\x7E]/g, "");
}

export function isCode128Safe(value: string): boolean {
  return CODE128_SAFE.test(value);
}
