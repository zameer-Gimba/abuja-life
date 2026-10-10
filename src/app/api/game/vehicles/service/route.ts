import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { VEHICLES, calculateFuelCost, calculateMaintenanceCost } from "@/constants/vehicles";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const playerId = session?.user?.id;
  if (!playerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const action = typeof body?.action === "string" ? body.action : "";
  const requestedLitres = Number(body?.litres);
  if (action !== "fuel" && action !== "maintain") {
    return NextResponse.json({ error: "Unknown vehicle action." }, { status: 400 });
  }
  if (action === "fuel" && (!Number.isSafeInteger(requestedLitres) || requestedLitres <= 0)) {
    return NextResponse.json({ error: "Enter a valid whole-number fuel amount." }, { status: 400 });
  }

  try {
    const result = await db.$transaction(async (tx) => {
      await tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "players" WHERE "id" = ${playerId} FOR UPDATE`;
      const player = await tx.player.findUnique({
        where: { id: playerId },
        select: {
          hasVehicle: true,
          vehicleType: true,
          vehicleName: true,
          vehicleValue: true,
          vehicleFuel: true,
          vehicleCondition: true,
          walletBalance: true,
          totalNetWorth: true,
        },
      });

      if (!player) throw new Error("PLAYER_NOT_FOUND");
      if (!player.hasVehicle || !player.vehicleType) throw new Error("NO_VEHICLE");
      const vehicle = VEHICLES.find((item) => item.type === player.vehicleType);
      if (!vehicle) throw new Error("VEHICLE_CONFIG_NOT_FOUND");

      let walletBalance = player.walletBalance;
      let totalNetWorth = player.totalNetWorth;
      let vehicleFuel = player.vehicleFuel;
      let vehicleCondition = player.vehicleCondition;
      let description = "";
      let amount = 0n;

      if (action === "fuel") {
        const add = Math.min(vehicle.tank - player.vehicleFuel, requestedLitres);
        if (add <= 0) throw new Error("TANK_FULL");
        const cost = BigInt(calculateFuelCost(vehicle, add));
        if (player.walletBalance < cost) throw new Error("INSUFFICIENT_FUNDS");
        walletBalance -= cost;
        totalNetWorth -= cost;
        vehicleFuel += add;
        amount = -cost;
        description = `Fuelled ${vehicle.name} (+${add}L)`;
      } else {
        if (player.vehicleCondition >= 100) throw new Error("VEHICLE_ALREADY_SERVICED");
        const cost = BigInt(calculateMaintenanceCost(vehicle, player.vehicleCondition));
        if (player.walletBalance < cost) throw new Error("INSUFFICIENT_FUNDS");
        walletBalance -= cost;
        totalNetWorth -= cost;
        vehicleCondition = 100;
        amount = -cost;
        description = `Maintained ${vehicle.name}`;
      }

      const updated = await tx.player.update({
        where: { id: playerId },
        data: {
          walletBalance,
          totalNetWorth,
          vehicleFuel,
          vehicleCondition,
          lastSeen: new Date(),
        },
        select: {
          walletBalance: true,
          totalNetWorth: true,
          vehicleName: true,
          vehicleType: true,
          vehicleValue: true,
          vehicleFuel: true,
          vehicleCondition: true,
        },
      });

      await tx.transaction.create({
        data: {
          playerId,
          type: "expense",
          amount,
          description,
          category: "vehicle",
          balanceBefore: player.walletBalance,
          balanceAfter: walletBalance,
        },
      });

      return updated;
    });

    const vehicle = {
      name: result.vehicleName,
      type: result.vehicleType,
      value: result.vehicleValue.toString(),
      fuel: result.vehicleFuel,
      condition: result.vehicleCondition,
    };

    return NextResponse.json({
      message: action === "fuel"
        ? `Fuel added. Your vehicle now has ${result.vehicleFuel}L.`
        : `${result.vehicleName} serviced successfully.`,
      walletBalance: result.walletBalance.toString(),
      totalNetWorth: result.totalNetWorth.toString(),
      vehicle,
      vehicleFuel: result.vehicleFuel,
      vehicleCondition: result.vehicleCondition,
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    if (code === "PLAYER_NOT_FOUND") return NextResponse.json({ error: "Player not found." }, { status: 404 });
    if (code === "NO_VEHICLE") return NextResponse.json({ error: "You do not own a vehicle." }, { status: 400 });
    if (code === "VEHICLE_CONFIG_NOT_FOUND") return NextResponse.json({ error: "Vehicle configuration not found." }, { status: 400 });
    if (code === "TANK_FULL") return NextResponse.json({ error: "Your tank is already full." }, { status: 400 });
    if (code === "VEHICLE_ALREADY_SERVICED") return NextResponse.json({ error: "Your vehicle is already in good condition." }, { status: 400 });
    if (code === "INSUFFICIENT_FUNDS") return NextResponse.json({ error: "Not enough Game Naira for this vehicle service." }, { status: 400 });
    return NextResponse.json({ error: "Vehicle service failed. Please try again." }, { status: 500 });
  }
}
