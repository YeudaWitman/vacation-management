// Vacation dates travel as plain "YYYY-MM-DD" strings (same as the database "date" columns).
// That format sorts correctly as text, so "a < b" works for comparing two dates.

export function isValidIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  // Rejects dates like 2026-02-31 that JavaScript would silently roll over to March.
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

// Today in the server's local time zone, as YYYY-MM-DD.
export function todayIso(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
