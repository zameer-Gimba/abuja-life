import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getVehicle, calculateFuelCost, calculateMaintenanceCost } from "@/constants/vehicles";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { action, litres } = await request.json();
  const player = await db.player.findUnique({ where:{id:session.user.id} });
  if (!player?.hasVehicle || !player.vehicleType) return NextResponse.json({ error:"You do not own a vehicle." }, { status:400 });
  const vehicle = [...(await import("@/constants/vehicles")).VEHICLES].find(v=>v.type===player.vehicleType);
  if (!vehicle) return NextResponse.json({ error:"Vehicle configuration not found." }, { status:400 });

  if (action === "fuel") {
    const requested = Number(litres);
    if (!Number.isFinite(requested) || requested <= 0) return NextResponse.json({error:"Enter a valid fuel amount."},{status:400});
    const add = Math.min(vehicle.tank - player.vehicleFuel, Math.floor(requested));
    if (add <= 0) return NextResponse.json({error:"Your tank is already full."},{status:400});
    const cost=BigInt(calculateFuelCost(vehicle,add));
    if(player.walletBalance<cost) return NextResponse.json({error:"Not enough Game Naira for fuel."},{status:400});
    const next=await db.$transaction(async tx=>{const p=await tx.player.update({where:{id:player.id},data:{vehicleFuel:{increment:add},walletBalance:{decrement:cost},totalNetWorth:{decrement:cost}}});await tx.transaction.create({data:{playerId:player.id,type:"expense",amount:cost,description:`Fuelled ${vehicle.name} (+${add}L)`,category:"vehicle",balanceBefore:player.walletBalance,balanceAfter:p.walletBalance}});return p;});
    return NextResponse.json({message:`Added ${add}L of fuel.`,walletBalance:next.walletBalance.toString(),totalNetWorth:next.totalNetWorth.toString(),fuel:next.vehicleFuel,condition:next.vehicleCondition});
  }
  if(action==="maintain"){
    const cost=BigInt(calculateMaintenanceCost(vehicle,player.vehicleCondition));
    if(player.vehicleCondition>=100)return NextResponse.json({error:"Your vehicle is already in good condition."},{status:400});
    if(player.walletBalance<cost)return NextResponse.json({error:"Not enough Game Naira for maintenance."},{status:400});
    const next=await db.$transaction(async tx=>{const p=await tx.player.update({where:{id:player.id},data:{vehicleCondition:100,walletBalance:{decrement:cost},totalNetWorth:{decrement:cost}}});await tx.transaction.create({data:{playerId:player.id,type:"expense",amount:cost,description:`Maintained ${vehicle.name}`,category:"vehicle",balanceBefore:player.walletBalance,balanceAfter:p.walletBalance}});return p;});
    return NextResponse.json({message:`${vehicle.name} serviced successfully.`,walletBalance:next.walletBalance.toString(),totalNetWorth:next.totalNetWorth.toString(),fuel:next.vehicleFuel,condition:next.vehicleCondition});
  }
  return NextResponse.json({error:"Unknown vehicle action."},{status:400});
}
