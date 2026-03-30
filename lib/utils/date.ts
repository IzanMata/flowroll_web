const DATE_FORMATTER = new Intl.DateTimeFormat('es-ES', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDateTime(iso: string): string {
  return DATE_FORMATTER.format(new Date(iso));
}

export function isUpcoming(scheduledAt: string): boolean {
  return new Date(scheduledAt) > new Date();
}

export function isToday(scheduledAt: string): boolean {
  const d = new Date(scheduledAt);
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 13) return 'Buenos días';
  if (h < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

const LOCAL_DATE_FORMATTER = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

/** Formats an ISO date string as a short local date, e.g. "3 ene 2026" */
export function formatLocalDate(iso: string): string {
  return LOCAL_DATE_FORMATTER.format(new Date(iso));
}
