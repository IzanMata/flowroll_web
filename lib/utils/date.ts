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
