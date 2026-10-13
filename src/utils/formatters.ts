const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
};

const DATETIME_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
};

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, DATE_OPTIONS);
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, DATETIME_OPTIONS);
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString()} ETB`;
}

function compactUnit(value: number): string {
  const rounded = value >= 100 ? Math.round(value) : Number(value.toFixed(1));
  return `${rounded}`.replace(/\.0$/, "");
}

/**
 * Compact money display for large totals: 9500 -> "9,500 ETB",
 * 1250000 -> "1.3M ETB". Keeps small amounts exact.
 */
export function formatCompactCurrency(amount: number): string {
  if (!Number.isFinite(amount)) return "0 ETB";
  const abs = Math.abs(amount);
  if (abs >= 1_000_000_000)
    return `${compactUnit(amount / 1_000_000_000)}B ETB`;
  if (abs >= 1_000_000) return `${compactUnit(amount / 1_000_000)}M ETB`;
  if (abs >= 10_000) return `${compactUnit(amount / 1_000)}K ETB`;
  return `${amount.toLocaleString()} ETB`;
}

export function isOverdue(deadlineIso: string): boolean {
  return Date.parse(deadlineIso) < Date.now();
}
