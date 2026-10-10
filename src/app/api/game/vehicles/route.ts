import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { VEHICLES } from "@/constants/vehicles";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const player = await db.player.findUnique({ where: { id: session.user.id }, select: { hasVehicle:true, vehicleType:true, vehicleName:true, vehicleFuel:true, vehicleCondition:true, vehicleValue:true, drivingSkill:true, walletBalance:true } });
  if (!player) return NextResponse.json({ error: "Player not found" }, { status: 404 });
  return NextResponse.json({ vehicles: VEHICLES, player: { ...player, vehicleValue: player.vehicleValue.toString(), walletBalance: player.walletBalance.toString() } });
}
