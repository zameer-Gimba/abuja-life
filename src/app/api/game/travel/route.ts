import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateTravelCost, TRAVEL_AREAS, TRAVEL_MODES, type TravelMode } from "@/constants/game";

const DURATIONS: Record<TravelMode, number> = {
  BUS_STOP: 12,
  ALONE: 8,
  KEKE: 15,
  BOLT: 7,
  INDRIVE: 8,
  METRO: 10,
};

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
      const player = await tx.player.findUnique({
        where: { id: playerId },
        select: {
          id: true,
          currentArea: true,
          walletBalance: true,
          bankBalance: true,
          savingsBalance: true,
          bondsBalance: true,
        },
      });

      if (!player) throw new Error("PLAYER_NOT_FOUND");
      if (player.currentArea === destination) throw new Error("ALREADY_THERE");

      const cost = calculateTravelCost(player.currentArea, destination, mode as TravelMode);
      const costBigInt = BigInt(cost);

      if (player.walletBalance < costBigInt) throw new Error("INSUFFICIENT_FUNDS");

      const balanceAfter = player.walletBalance - costBigInt;
      const netWorthAfter = balanceAfter + player.bankBalance + player.savingsBalance + player.bondsBalance;

      await tx.player.update({
        where: { id: player.id },
        data: {
          currentArea: destination,
          walletBalance: balanceAfter,
          totalNetWorth: netWorthAfter,
          lastSeen: new Date(),
        },
      });

      await tx.transaction.create({
        data: {
          playerId: player.id,
          type: "expense",
          amount: -costBigInt,
          description: `Travelled from ${player.currentArea} to ${destination} by ${mode}.`,
          category: "transport",
          balanceBefore: player.walletBalance,
          balanceAfter,
        },
      });

      await tx.transportEvent.create({
        data: {
          playerId: player.id,
          type: mode,
          from: player.currentArea,
          to: destination,
          cost: costBigInt,
          duration: DURATIONS[mode as TravelMode],
          outcome: "completed",
          statChanges: {},
        },
      });

      return {
        currentArea: destination,
        walletBalance: balanceAfter.toString(),
        totalNetWorth: netWorthAfter.toString(),
        cost,
        duration: DURATIONS[mode as TravelMode],
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";

    if (code === "PLAYER_NOT_FOUND") return NextResponse.json({ error: "Player not found" }, { status: 404 });
    if (code === "ALREADY_THERE") return NextResponse.json({ error: "You are already in that area." }, { status: 400 });
    if (code === "INSUFFICIENT_FUNDS") return NextResponse.json({ error: "Not enough Game Naira for this trip." }, { status: 400 });

    return NextResponse.json({ error: "Travel failed. Try again." }, { status: 500 });
  }
}
