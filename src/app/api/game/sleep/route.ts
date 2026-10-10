import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { advanceGameClock, getGameClock, isNightTime } from "@/lib/game-clock";

const WAKE_MINUTE = 6 * 60;

function clampStat(value: number) {
  return Math.max(0, Math.min(100, value));
}

export async function POST() {
  const session = await getServerSession(authOptions);
  const playerId = session?.user?.id;
  if (!playerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const result = await db.$transaction(async (tx) => {
      await tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "players" WHERE "id" = ${playerId} FOR UPDATE`;

      const player = await tx.player.findUnique({
        where: { id: playerId },
        select: {
          id: true,
          currentArea: true,
          homeArea: true,
          health: true,
          happiness: true,
        },
      });
      if (!player) throw new Error("PLAYER_NOT_FOUND");
      if (player.currentArea !== player.homeArea) throw new Error("NOT_AT_HOME");

      const clock = await getGameClock(tx, playerId);
      if (!isNightTime(clock.minuteOfDay)) throw new Error("TOO_EARLY_TO_SLEEP");

      const minutesUntilMorning = clock.minuteOfDay < WAKE_MINUTE
        ? WAKE_MINUTE - clock.minuteOfDay
        : 1440 - clock.minuteOfDay + WAKE_MINUTE;

      const health = clampStat(player.health + 12);
      const happiness = clampStat(player.happiness + 5);

      await tx.player.update({
        where: { id: playerId },
        data: { health, happiness, lastSeen: new Date() },
      });

      await tx.gameActivity.create({
        data: {
          playerId,
          activityType: "sleep",
          reward: 0,
          statChanges: {
            health: health - player.health,
            happiness: happiness - player.happiness,
            minutesSlept: minutesUntilMorning,
          },
        },
      });

      const nextClock = await advanceGameClock(tx, playerId, minutesUntilMorning, "sleep");

      return {
        health,
        happiness,
        minutesSlept: minutesUntilMorning,
        minuteOfDay: nextClock.minuteOfDay,
        dayNumber: nextClock.dayNumber,
      };
    });

    return NextResponse.json({
      ...result,
      message: `You rested at home and woke up at 06:00. Health +${result.health > 0 ? "12 (up to 100)" : "0"}; happiness restored.`,
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    if (code === "PLAYER_NOT_FOUND") return NextResponse.json({ error: "Player not found." }, { status: 404 });
    if (code === "NOT_AT_HOME") return NextResponse.json({ error: "Return to your home before sleeping." }, { status: 400 });
    if (code === "TOO_EARLY_TO_SLEEP") return NextResponse.json({ error: "You can sleep after dark. It is not nighttime yet." }, { status: 400 });
    return NextResponse.json({ error: "Could not complete the rest action." }, { status: 500 });
  }
}
