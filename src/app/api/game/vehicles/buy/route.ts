import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getVehicle } from "@/constants/vehicles";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { vehicleId } = await request.json();
  const vehicle = getVehicle(String(vehicleId));
  if (!vehicle) return NextResponse.json({ error: "Vehicle not found." }, { status: 404 });

  const player = await db.player.findUnique({ where: { id: session.user.id } });
  if (!player) return NextResponse.json({ error: "Player not found." }, { status: 404 });
  if (player.hasVehicle) return NextResponse.json({ error: "You already own a vehicle." }, { status: 400 });
  if (player.drivingSkill < vehicle.drivingRequired) return NextResponse.json({ error: `Driving Skill ${vehicle.drivingRequired} required.` }, { status: 400 });
  const price = BigInt(vehicle.price);
  if (player.walletBalance < price) return NextResponse.json({ error: "Not enough Game Naira in your wallet." }, { status: 400 });

  const updated = await db.$transaction(async (tx) => {
    const next = await tx.player.update({ where:{id:player.id}, data:{ hasVehicle:true, vehicleType:vehicle.type, vehicleName:vehicle.name, vehicleFuel:vehicle.tank, vehicleCondition:100, vehicleValue:price, walletBalance:{decrement:price}, totalNetWorth:{decrement:price} } });
    await tx.transaction.create({ data:{ playerId:player.id, type:"expense", amount:price, description:`Purchased ${vehicle.name}`, category:"vehicle", balanceBefore:player.walletBalance, balanceAfter:next.walletBalance }});
    return next;
  });
  return NextResponse.json({ message:`You bought the ${vehicle.name}. It is now registered to your character.`, walletBalance:updated.walletBalance.toString(), totalNetWorth:updated.totalNetWorth.toString(), vehicle:{name:updated.vehicleName,type:updated.vehicleType,fuel:updated.vehicleFuel,condition:updated.vehicleCondition,value:updated.vehicleValue.toString()} });
}
