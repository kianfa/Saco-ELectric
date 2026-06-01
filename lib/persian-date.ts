const fallback = "—"

function toDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatPersianDate(value: string | null | undefined): string {
  const date = toDate(value)
  if (!date) return fallback
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

export function formatPersianTime(value: string | null | undefined): string {
  const date = toDate(value)
  if (!date) return fallback
  return new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function formatPersianDateTime(value: string | null | undefined): string {
  const date = toDate(value)
  if (!date) return fallback
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}
