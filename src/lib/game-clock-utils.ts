export const GAME_MINUTES_PER_REAL_MINUTE = 60;
export const REAL_MS_PER_GAME_MINUTE = 1_000;
export const DEFAULT_GAME_MINUTE_OF_DAY = 8 * 60;

export type ClockSnapshot = {
  minuteOfDay: number;
  dayNumber: number;
};

export function parseClockSnapshot(value: unknown): ClockSnapshot {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { minuteOfDay: DEFAULT_GAME_MINUTE_OF_DAY, dayNumber: 1 };
  }

  const record = value as Record<string, unknown>;
  const minuteOfDay = Number(record.minuteOfDay);
  const dayNumber = Number(record.dayNumber);

  if (!Number.isInteger(minuteOfDay) || minuteOfDay < 0 || minuteOfDay >= 1440) {
    return { minuteOfDay: DEFAULT_GAME_MINUTE_OF_DAY, dayNumber: 1 };
  }

  return {
    minuteOfDay,
    dayNumber: Number.isInteger(dayNumber) && dayNumber > 0 ? dayNumber : 1,
  };
}

export function advanceClock(clock: ClockSnapshot, minutes: number): ClockSnapshot {
  const totalMinutes = clock.minuteOfDay + Math.max(0, Math.floor(minutes));
  return {
    minuteOfDay: totalMinutes % 1440,
    dayNumber: clock.dayNumber + Math.floor(totalMinutes / 1440),
  };
}

export function currentClockFromAnchor(
  snapshot: ClockSnapshot,
  anchorAt: Date,
  now: Date = new Date(),
): ClockSnapshot {
  const elapsedMinutes = Math.floor(
    Math.max(0, now.getTime() - anchorAt.getTime()) / REAL_MS_PER_GAME_MINUTE,
  );
  return advanceClock(snapshot, elapsedMinutes);
}

export function formatGameTime(minuteOfDay: number): string {
  const hour = Math.floor(minuteOfDay / 60);
  const minute = minuteOfDay % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function getDayPeriod(minuteOfDay: number): string {
  if (minuteOfDay < 5 * 60) return "Late night";
  if (minuteOfDay < 12 * 60) return "Morning";
  if (minuteOfDay < 17 * 60) return "Afternoon";
  if (minuteOfDay < 20 * 60) return "Evening";
  return "Night";
}

export function isNightTime(minuteOfDay: number): boolean {
  return minuteOfDay < 6 * 60 || minuteOfDay >= 19 * 60;
}

export function isWithinOpeningWindow(
  minuteOfDay: number,
  opensAtHour: number,
  shiftHours: number,
): boolean {
  const openingMinute = (((opensAtHour % 24) + 24) % 24) * 60;
  const elapsedSinceOpening = (minuteOfDay - openingMinute + 1440) % 1440;
  const openingWindowMinutes = Math.max(shiftHours, 8) * 60;
  return elapsedSinceOpening + shiftHours * 60 <= openingWindowMinutes;
}
