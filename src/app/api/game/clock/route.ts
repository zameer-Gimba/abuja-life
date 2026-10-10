import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatGameTime, getGameClock } from "@/lib/game-clock";

export async function GET() {
  const session = await getServerSession(authOptions);
  const playerId = session?.user?.id;
  if (!playerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const clock = await db.$transaction(async (tx) => {
      await tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "players" WHERE "id" = ${playerId} FOR UPDATE`;
      return getGameClock(tx, playerId);
    });

    return NextResponse.json({
      ...clock,
      time: formatGameTime(clock.minuteOfDay),
      minutesPerRealMinute: 60,
    });
  } catch {
    return NextResponse.json({ error: "Could not load the in-game clock." }, { status: 500 });
  }
}
