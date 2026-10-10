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
  closesAtHour?: number,
): boolean {
  const openingMinute = (((opensAtHour % 24) + 24) % 24) * 60;
  const elapsedSinceOpening = (minuteOfDay - openingMinute + 1440) % 1440;

  let openingWindowMinutes: number;
  if (closesAtHour !== undefined) {
    const closingMinute = (((closesAtHour % 24) + 24) % 24) * 60;
    openingWindowMinutes = (closingMinute - openingMinute + 1440) % 1440;
    if (openingWindowMinutes === 0) openingWindowMinutes = 1440;
  } else {
    openingWindowMinutes = Math.max(shiftHours, 8) * 60;
  }

  return (
    elapsedSinceOpening < openingWindowMinutes &&
    elapsedSinceOpening + shiftHours * 60 <= openingWindowMinutes
  );
}

/** Smooth lighting transition for dawn and dusk while gameplay rules use the discrete day/night boundary. */
export function getNightFactor(minuteOfDay: number): number {
  const minute = ((Math.floor(minuteOfDay) % 1440) + 1440) % 1440;
  if (minute >= 19 * 60 || minute < 5 * 60) return 1;
  if (minute >= 17 * 60) return (minute - 17 * 60) / (2 * 60);
  if (minute >= 5 * 60 && minute < 7 * 60) return 1 - (minute - 5 * 60) / (2 * 60);
  return 0;
}

/** Blend two six-digit hex colors, with factor 0 returning dayColor and 1 returning nightColor. */
export function mixHexColor(dayColor: string, nightColor: string, factor: number): string {
  const parse = (color: string) => {
    const hex = color.startsWith("#") ? color.slice(1) : color;
    if (!/^[0-9a-fA-F]{6}$/.test(hex)) throw new Error("Expected a six-digit hex color.");
    return [0, 2, 4].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
  };
  const day = parse(dayColor);
  const night = parse(nightColor);
  const amount = Math.max(0, Math.min(1, factor));
  const channels = day.map((value, index) => Math.round(value + (night[index] - value) * amount));
  return "#" + channels.map((value) => value.toString(16).padStart(2, "0")).join("");
}
