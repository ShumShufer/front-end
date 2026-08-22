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

export function isOverdue(deadlineIso: string): boolean {
  return Date.parse(deadlineIso) < Date.now();
}
