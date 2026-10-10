import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getVehicle } from "@/constants/vehicles";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const playerId = session?.user?.id;
  if (!playerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const vehicleId = typeof body?.vehicleId === "string" ? body.vehicleId : "";
  const vehicle = getVehicle(vehicleId);
  if (!vehicle) return NextResponse.json({ error: "Vehicle not found." }, { status: 404 });

  try {
    const result = await db.$transaction(async (tx) => {
      await tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "players" WHERE "id" = ${playerId} FOR UPDATE`;
      const player = await tx.player.findUnique({
        where: { id: playerId },
        select: {
          hasVehicle: true,
          drivingSkill: true,
          walletBalance: true,
          totalNetWorth: true,
        },
      });
      if (!player) throw new Error("PLAYER_NOT_FOUND");
      if (player.hasVehicle) throw new Error("ALREADY_OWNS_VEHICLE");
      if (player.drivingSkill < vehicle.drivingRequired) throw new Error("DRIVING_SKILL_REQUIRED");

      const price = BigInt(vehicle.price);
      if (player.walletBalance < price) throw new Error("INSUFFICIENT_FUNDS");
      const balanceAfter = player.walletBalance - price;

      const updated = await tx.player.update({
        where: { id: playerId },
        data: {
          hasVehicle: true,
          vehicleType: vehicle.type,
          vehicleName: vehicle.name,
          vehicleFuel: vehicle.tank,
          vehicleCondition: 100,
          vehicleValue: price,
          aura: { increment: vehicle.aura },
          walletBalance: balanceAfter,
          // Buying a vehicle exchanges cash for an asset rather than destroying net worth.
          totalNetWorth: player.totalNetWorth,
          lastSeen: new Date(),
        },
        select: {
          walletBalance: true,
          totalNetWorth: true,
          vehicleName: true,
          vehicleType: true,
          vehicleFuel: true,
          vehicleCondition: true,
          vehicleValue: true,
        },
      });

      await tx.transaction.create({
        data: {
          playerId,
          type: "expense",
          amount: -price,
          description: `Purchased ${vehicle.name}`,
          category: "vehicle",
          balanceBefore: player.walletBalance,
          balanceAfter,
        },
      });

      return updated;
    });

    return NextResponse.json({
      message: `You bought the ${vehicle.name}. It is now registered to your character.`,
      walletBalance: result.walletBalance.toString(),
      totalNetWorth: result.totalNetWorth.toString(),
      vehicle: {
        name: result.vehicleName,
        type: result.vehicleType,
        fuel: result.vehicleFuel,
        condition: result.vehicleCondition,
        value: result.vehicleValue.toString(),
      },
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    if (code === "PLAYER_NOT_FOUND") return NextResponse.json({ error: "Player not found." }, { status: 404 });
    if (code === "ALREADY_OWNS_VEHICLE") return NextResponse.json({ error: "You already own a vehicle." }, { status: 400 });
    if (code === "DRIVING_SKILL_REQUIRED") return NextResponse.json({ error: `Driving Skill ${vehicle.drivingRequired} required.` }, { status: 400 });
    if (code === "INSUFFICIENT_FUNDS") return NextResponse.json({ error: "Not enough Game Naira in your wallet." }, { status: 400 });
    return NextResponse.json({ error: "Vehicle purchase failed. Please try again." }, { status: 500 });
  }
}
