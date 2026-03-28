/** Civil calendar YYYY-MM-DD in the user's local timezone (avoids UTC shifts from toISOString()). */
export function localDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Parses API/store `YYYY-MM-DD` as that calendar day in local time (avoids UTC midnight shift in display). */
export function dateFromCivilString(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00`);
}
