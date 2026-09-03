function localIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function startOfWeekDate(date: Date): Date {
  const day = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() + ((day === 0 ? -6 : 1) - day));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function weekStartIso(date: Date): string {
  return localIsoDate(startOfWeekDate(date));
}

export function weekStartIsoForDate(date: string, fallback = new Date()): string {
  const parsed = new Date(`${date}T12:00:00`);
  return weekStartIso(Number.isNaN(parsed.getTime()) ? fallback : parsed);
}
