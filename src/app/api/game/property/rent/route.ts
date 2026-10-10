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
  if (!property) {
    return NextResponse.json({ error: "Property listing not found." }, { status: 404 });
  }

  const cost = calculateMoveInCost(property);
  const total = BigInt(cost.total);

  try {
    const result = await db.$transaction(async (tx) => {
      await tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "players" WHERE "id" = ${playerId} FOR UPDATE`;

      const player = await tx.player.findUnique({
        where: { id: playerId },
        select: {
          walletBalance: true,
          totalNetWorth: true,
          currentArea: true,
        },
      });

      if (!player) throw new Error("PLAYER_NOT_FOUND");
      if (player.walletBalance < total) throw new Error("INSUFFICIENT_FUNDS");

      const balanceBefore = player.walletBalance;
      const balanceAfter = balanceBefore - total;
      const netWorthAfter = player.totalNetWorth - total;
      const now = new Date();

      // The player row lock serializes move-ins with banking, transport and market transactions.
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
          totalNetWorth: netWorthAfter,
          lastSeen: now,
        },
        select: {
          walletBalance: true,
          totalNetWorth: true,
          homeArea: true,
          housingType: true,
          currentArea: true,
        },
      });

      await tx.transaction.create({
        data: {
          playerId,
          type: "expense",
          amount: -total,
          description: `Moved into ${property.name}`,
          category: "housing",
          balanceBefore,
          balanceAfter,
        },
      });

      return { property: saved, player: updatedPlayer };
    });

    return NextResponse.json({
      message: `You moved into ${property.name} in ${property.area}.`,
      housing: result.player,
      walletBalance: result.player.walletBalance.toString(),
      netWorth: result.player.totalNetWorth.toString(),
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    if (code === "PLAYER_NOT_FOUND") {
      return NextResponse.json({ error: "Player not found." }, { status: 404 });
    }
    if (code === "INSUFFICIENT_FUNDS") {
      return NextResponse.json({
        error: `You need ₦${cost.total.toLocaleString()} to move in, including rent and fees.`,
        required: cost.total,
      }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not complete the move-in. Please try again." }, { status: 500 });
  }
}
