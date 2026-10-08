import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { PROPERTY_LISTINGS, calculateMoveInCost } from "@/constants/properties";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const playerId = session?.user?.id;
  if (!playerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const propertyId = typeof body?.propertyId === "string" ? body.propertyId : "";
  const property = PROPERTY_LISTINGS.find((item) => item.id === propertyId);
  if (!property) return NextResponse.json({ error: "Property listing not found." }, { status: 404 });

  const cost = calculateMoveInCost(property);
  const player = await db.player.findUnique({
    where: { id: playerId },
    select: { walletBalance: true, totalNetWorth: true, currentArea: true },
  });
  if (!player) return NextResponse.json({ error: "Player not found." }, { status: 404 });

  const total = BigInt(cost.total);
  if (player.walletBalance < total) {
    return NextResponse.json({
      error: `You need ₦${cost.total.toLocaleString()} to move in, including rent and fees.`,
      required: cost.total,
      walletBalance: player.walletBalance.toString(),
    }, { status: 400 });
  }

  const now = new Date();
  const result = await db.$transaction(async (tx) => {
    const balanceBefore = player.walletBalance;
    const balanceAfter = balanceBefore - total;

    const saved = await tx.property.create({
      data: {
        name: property.name,
        type: property.type,
        area: property.area,
        annualRent: BigInt(cost.annualRent),
        moveInFee: BigInt(cost.inspectionFee),
        agencyFee: BigInt(cost.agencyFee),
        cautionFee: BigInt(cost.cautionFee),
        legalFee: BigInt(cost.legalFee),
        isForRent: true,
        isOccupied: true,
        tenantId: playerId,
      },
    });

    const updatedPlayer = await tx.player.update({
      where: { id: playerId },
      data: {
        homeArea: property.area,
        currentArea: property.area,
        housingType: property.type,
        walletBalance: balanceAfter,
        totalNetWorth: player.totalNetWorth - total,
        lastSeen: now,
      },
      select: { walletBalance: true, totalNetWorth: true, homeArea: true, housingType: true, currentArea: true },
    });

    await tx.transaction.create({
      data: {
        playerId,
        type: "expense",
        amount: total,
        description: `Moved into ${property.name}`,
        category: "housing",
        balanceBefore,
        balanceAfter,
      },
    });

    return { saved, updatedPlayer };
  });

  return NextResponse.json({
    message: `You moved into ${property.name} in ${property.area}.`,
    housing: result.updatedPlayer,
    walletBalance: result.updatedPlayer.walletBalance.toString(),
    netWorth: result.updatedPlayer.totalNetWorth.toString(),
  });
}
