import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getLagosDayStart } from "@/lib/lagos-day";
import { calculateTravelCost, TRAVEL_AREAS, TRAVEL_AREA_DISTANCE, TRAVEL_MODES, type TravelMode } from "@/constants/game";
import { advanceGameClock } from "@/lib/game-clock";

const DURATIONS: Record<TravelMode, number> = {
  TREK: 25,
  BUS_STOP: 12,
  ALONE: 8,
  KEKE: 15,
  BOLT: 7,
  INDRIVE: 8,
  METRO: 10,
  PERSONAL_CAR: 8,
};

function clampStat(value: number) {
  return Math.max(0, Math.min(100, value));
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const playerId = session?.user?.id;

  if (!playerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const destination = typeof body?.destination === "string" ? body.destination : "";
  const mode = typeof body?.mode === "string" ? body.mode : "";

  if (!TRAVEL_AREAS.includes(destination as (typeof TRAVEL_AREAS)[number])) {
    return NextResponse.json({ error: "Invalid destination" }, { status: 400 });
  }

  if (!TRAVEL_MODES.includes(mode as TravelMode)) {
    return NextResponse.json({ error: "Invalid transport mode" }, { status: 400 });
  }

  try {
    const result = await db.$transaction(async (tx) => {
      await tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "players" WHERE "id" = ${playerId} FOR UPDATE`;
      const player = await tx.player.findUnique({
        where: { id: playerId },
        select: {
          id: true,
          currentArea: true,
          walletBalance: true,
          bankBalance: true,
          savingsBalance: true,
          bondsBalance: true,
          totalNetWorth: true,
          hasVehicle: true,
          vehicleFuel: true,
          vehicleCondition: true,
          drivingSkill: true,
          fitness: true,
          happiness: true,
        },
      });

      if (!player) throw new Error("PLAYER_NOT_FOUND");
      if (player.currentArea === destination) throw new Error("ALREADY_THERE");

      if (mode === "PERSONAL_CAR" && !player.hasVehicle) throw new Error("NO_PERSONAL_CAR");
      if (mode === "TREK") {
        const now = new Date();
        const dayStart = getLagosDayStart(now);
        const lastTrek = await tx.gameActivity.findFirst({
          where: { playerId, activityType: "trek" },
          orderBy: { createdAt: "desc" },
          select: { createdAt: true },
        });
        if (lastTrek && now.getTime() - lastTrek.createdAt.getTime() < 20_000) {
          throw new Error("TREK_COOLDOWN");
        }
        const dailyTreks = await tx.gameActivity.count({
          where: { playerId, activityType: "trek", createdAt: { gte: dayStart } },
        });
        if (dailyTreks >= 12) throw new Error("TREK_DAILY_LIMIT");
      }

      const cost = calculateTravelCost(player.currentArea, destination, mode as TravelMode);
      const costBigInt = BigInt(cost);
      const distanceFactor = Math.max(1, Math.abs((TRAVEL_AREA_DISTANCE[player.currentArea] ?? 1) - (TRAVEL_AREA_DISTANCE[destination] ?? 1)) + 1);
      const fuelUsed = mode === "PERSONAL_CAR" ? distanceFactor * 5 : 0;
      const reward = mode === "TREK" ? 25 : 0;

      if (player.walletBalance < costBigInt) throw new Error("INSUFFICIENT_FUNDS");
      if (fuelUsed > player.vehicleFuel) throw new Error("INSUFFICIENT_FUEL");

      const balanceAfter = player.walletBalance - costBigInt + BigInt(reward);
      const netWorthAfter = player.totalNetWorth - costBigInt + BigInt(reward);
      const fitnessAfter = mode === "TREK" ? clampStat(player.fitness + 2) : player.fitness;
      const happinessAfter = mode === "TREK" ? clampStat(player.happiness + 1) : player.happiness;
      const drivingSkillAfter = mode === "PERSONAL_CAR" ? Math.min(100, player.drivingSkill + 1) : player.drivingSkill;
      const vehicleFuelAfter = Math.max(0, player.vehicleFuel - fuelUsed);
      const vehicleConditionAfter = mode === "PERSONAL_CAR" ? Math.max(0, player.vehicleCondition - 1) : player.vehicleCondition;

      await tx.player.update({
        where: { id: player.id },
        data: {
          currentArea: destination,
          walletBalance: balanceAfter,
          totalNetWorth: netWorthAfter,
          fitness: fitnessAfter,
          happiness: happinessAfter,
          ...(mode === "PERSONAL_CAR" ? { drivingSkill: drivingSkillAfter, vehicleFuel: vehicleFuelAfter, vehicleCondition: vehicleConditionAfter } : {}),
          lastSeen: new Date(),
        },
      });

      if (cost > 0) {
        await tx.transaction.create({
          data: {
            playerId: player.id,
            type: "expense",
            amount: -costBigInt,
            description: `Travelled from ${player.currentArea} to ${destination} by ${mode}.`,
            category: "transport",
            balanceBefore: player.walletBalance,
            balanceAfter: player.walletBalance - costBigInt,
          },
        });
      }
      if (reward > 0) {
        await tx.transaction.create({
          data: {
            playerId: player.id,
            type: "income",
            amount: BigInt(reward),
            description: `Fitness reward for trekking from ${player.currentArea} to ${destination}.`,
            category: "daily_activity",
            balanceBefore: player.walletBalance - costBigInt,
            balanceAfter,
          },
        });
        await tx.gameActivity.create({
          data: {
            playerId: player.id,
            activityType: "trek",
            reward,
            statChanges: { fitness: 2, happiness: 1, reward },
          },
        });
        await tx.notification.create({
          data: {
            playerId: player.id,
            type: "activity_reward",
            title: `+₦${reward} Game Naira`,
            body: "You trekked to your destination, improved your fitness and earned a small reward.",
            data: { activity: "trek", fitness: 2, happiness: 1, reward },
          },
        });
      }

      const statChanges = mode === "TREK"
        ? { fitness: 2, happiness: 1, reward }
        : mode === "PERSONAL_CAR"
          ? { fuelUsed, drivingSkill: 1, vehicleCondition: -1 }
          : {};
      await tx.transportEvent.create({
        data: {
          playerId: player.id,
          type: mode,
          from: player.currentArea,
          to: destination,
          cost: costBigInt,
          duration: DURATIONS[mode as TravelMode],
          outcome: "completed",
          statChanges,
        },
      });
      await advanceGameClock(tx, player.id, DURATIONS[mode as TravelMode], "travel");

      return {
        currentArea: destination,
        walletBalance: balanceAfter.toString(),
        totalNetWorth: netWorthAfter.toString(),
        cost,
        reward,
        fuelUsed,
        vehicleFuel: vehicleFuelAfter,
        fitness: fitnessAfter,
        happiness: happinessAfter,
        drivingSkill: drivingSkillAfter,
        vehicleCondition: vehicleConditionAfter,
        duration: DURATIONS[mode as TravelMode],
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";

    if (code === "PLAYER_NOT_FOUND") return NextResponse.json({ error: "Player not found" }, { status: 404 });
    if (code === "ALREADY_THERE") return NextResponse.json({ error: "You are already in that area." }, { status: 400 });
    if (code === "INSUFFICIENT_FUNDS") return NextResponse.json({ error: "Not enough Game Naira for this trip." }, { status: 400 });
    if (code === "NO_PERSONAL_CAR") return NextResponse.json({ error: "Buy a vehicle before choosing Personal Car." }, { status: 400 });
    if (code === "INSUFFICIENT_FUEL") return NextResponse.json({ error: "Your car needs fuel before this trip." }, { status: 400 });
    if (code === "TREK_COOLDOWN") return NextResponse.json({ error: "Take a short breather before trekking again." }, { status: 429 });
    if (code === "TREK_DAILY_LIMIT") return NextResponse.json({ error: "You have reached today's trekking reward limit." }, { status: 429 });

    return NextResponse.json({ error: "Travel failed. Try again." }, { status: 500 });
  }
}
