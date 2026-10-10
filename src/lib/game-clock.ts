import { db } from "@/lib/db";
import {
  DEFAULT_GAME_MINUTE_OF_DAY,
  advanceClock,
  currentClockFromAnchor,
  getDayPeriod,
  isNightTime,
  parseClockSnapshot,
  type ClockSnapshot,
} from "@/lib/game-clock-utils";

export {
  advanceClock,
  formatGameTime,
  getDayPeriod,
  isNightTime,
  isWithinOpeningWindow,
  parseClockSnapshot,
  currentClockFromAnchor,
} from "@/lib/game-clock-utils";

type GameClockClient = Pick<typeof db, "gameActivity">;

export type CurrentGameClock = ClockSnapshot & {
  serverNow: string;
  period: string;
  isNight: boolean;
};

export async function getGameClock(
  client: GameClockClient,
  playerId: string,
  now: Date = new Date(),
): Promise<CurrentGameClock> {
  let anchor = await client.gameActivity.findFirst({
    where: { playerId, activityType: "world_clock" },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true, statChanges: true },
  });

  if (!anchor) {
    anchor = await client.gameActivity.create({
      data: {
        playerId,
        activityType: "world_clock",
        reward: 0,
        statChanges: {
          minuteOfDay: DEFAULT_GAME_MINUTE_OF_DAY,
          dayNumber: 1,
          reason: "world_started",
        },
      },
      select: { createdAt: true, statChanges: true },
    });
  }

  const snapshot = currentClockFromAnchor(parseClockSnapshot(anchor.statChanges), anchor.createdAt, now);
  return {
    ...snapshot,
    serverNow: now.toISOString(),
    period: getDayPeriod(snapshot.minuteOfDay),
    isNight: isNightTime(snapshot.minuteOfDay),
  };
}

export async function advanceGameClock(
  client: GameClockClient,
  playerId: string,
  minutes: number,
  reason: string,
  now: Date = new Date(),
): Promise<ClockSnapshot> {
  const current = await getGameClock(client, playerId, now);
  const next = advanceClock(current, minutes);
  await client.gameActivity.create({
    data: {
      playerId,
      activityType: "world_clock",
      reward: 0,
      statChanges: {
        minuteOfDay: next.minuteOfDay,
        dayNumber: next.dayNumber,
        reason,
      },
      // Ensure a new anchor sorts after the initial anchor even within one transaction.
      createdAt: new Date(now.getTime() + 1),
    },
  });
  return next;
}
