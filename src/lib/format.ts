/** Parses a decimal amount string (e.g. "12.5") into the token's smallest
 * unit as a bigint, given its decimal places. Throws on invalid input -
 * callers should validate the string is a plausible number first. */
export function toStroops(amount: string, decimals: number): bigint {
  const [whole, frac = ""] = amount.trim().split(".");
  const paddedFrac = frac.padEnd(decimals, "0").slice(0, decimals);
  const digits = `${whole || "0"}${paddedFrac}`;
  return BigInt(digits);
}

export function fromStroops(amount: bigint, decimals: number): string {
  const negative = amount < BigInt(0);
  const abs = negative ? -amount : amount;
  const digits = abs.toString().padStart(decimals + 1, "0");
  const whole = digits.slice(0, -decimals || undefined) || "0";
  const frac = digits.slice(-decimals).replace(/0+$/, "");
  return `${negative ? "-" : ""}${whole}${frac ? `.${frac}` : ""}`;
}

export function formatBps(bps: number): string {
  return `${(bps / 100).toFixed(2)}%`;
}

export function formatSignedBps(bps: number): string {
  const sign = bps > 0 ? "+" : "";
  return `${sign}${formatBps(bps)}`;
}
