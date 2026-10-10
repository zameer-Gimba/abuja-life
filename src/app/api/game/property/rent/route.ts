import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { PROPERTY_LISTINGS, calculateMoveInCost } from "@/constants/properties";
import { calculateUnusedRentCredit } from "@/lib/rent-refund";

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
      // Serialize claims to the same listing, even when prospective tenants are different players.
      await tx.$queryRaw<Array<{ pg_advisory_xact_lock: null }>>`SELECT pg_advisory_xact_lock(hashtext(${property.id})::bigint)`;
      await tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "players" WHERE "id" = ${playerId} FOR UPDATE`;

      const player = await tx.player.findUnique({
        where: { id: playerId },
        select: {
          walletBalance: true,
          totalNetWorth: true,
        },
      });
      if (!player) throw new Error("PLAYER_NOT_FOUND");

      const activeRentals = await tx.property.findMany({
        where: { tenantId: playerId, isForRent: true, isOccupied: true },
        select: { id: true, name: true, annualRent: true, createdAt: true },
      });

      const alreadyLivesHere = activeRentals.some((rental) => rental.name === property.name);
      if (alreadyLivesHere) throw new Error("ALREADY_CURRENT_HOME");

      const occupied = await tx.property.findFirst({
        where: {
          name: property.name,
          area: property.area,
          type: property.type,
          isForRent: true,
          isOccupied: true,
        },
        select: { tenantId: true },
      });
      if (occupied) throw new Error("PROPERTY_UNAVAILABLE");

      const now = new Date();
      const rentCredit = calculateUnusedRentCredit(activeRentals, now);
      if (player.walletBalance + rentCredit < total) throw new Error("INSUFFICIENT_FUNDS");

      // Moving releases the previous rental. Unused prepaid annual rent is credited;
      // agency, caution, inspection and legal fees remain non-refundable.
      if (activeRentals.length > 0) {
        await tx.property.updateMany({
          where: { id: { in: activeRentals.map((rental) => rental.id) } },
          data: { isOccupied: false, tenantId: null },
        });
      }

      const walletAfterCredit = player.walletBalance + rentCredit;
      const balanceAfter = walletAfterCredit - total;
      const netWorthAfter = player.totalNetWorth + rentCredit - total;

      if (rentCredit > 0n) {
        await tx.transaction.create({
          data: {
            playerId,
            type: "income",
            amount: rentCredit,
            description: "Credit for unused prepaid rent",
            category: "housing",
            balanceBefore: player.walletBalance,
            balanceAfter: walletAfterCredit,
          },
        });
      }

      await tx.property.create({
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

      const homeSceneId = property.type === "mansion" || property.type === "duplex"
        ? "guzape_mansion_v1"
        : "nyanya_shared_room_v1";
      const updatedPlayer = await tx.player.update({
        where: { id: playerId },
        data: {
          homeArea: property.area,
          currentArea: property.area,
          housingType: property.type,
          homeSceneId,
          walletBalance: balanceAfter,
          totalNetWorth: netWorthAfter,
          lastSeen: now,
        },
        select: {
          walletBalance: true,
          totalNetWorth: true,
          homeArea: true,
          housingType: true,
          homeSceneId: true,
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
          balanceBefore: walletAfterCredit,
          balanceAfter,
        },
      });

      return {
        player: updatedPlayer,
        rentCredit,
      };
    });

    const creditText = result.rentCredit > 0n
      ? ` ₦${Number(result.rentCredit).toLocaleString()} in unused rent was credited from your previous home.`
      : "";
    return NextResponse.json({
      message: `You moved into ${property.name} in ${property.area}.${creditText}`,
      housing: result.player,
      walletBalance: result.player.walletBalance.toString(),
      netWorth: result.player.totalNetWorth.toString(),
      rentCredit: result.rentCredit.toString(),
      moveInCost: cost.total,
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    if (code === "PLAYER_NOT_FOUND") {
      return NextResponse.json({ error: "Player not found." }, { status: 404 });
    }
    if (code === "ALREADY_CURRENT_HOME") {
      return NextResponse.json({ error: "You already live in this property." }, { status: 400 });
    }
    if (code === "PROPERTY_UNAVAILABLE") {
      return NextResponse.json({ error: "This property has already been rented. Choose another listing." }, { status: 409 });
    }
    if (code === "INSUFFICIENT_FUNDS") {
      return NextResponse.json({
        error: `You need ₦${cost.total.toLocaleString()} after any rent credit to move in.`,
        required: cost.total,
      }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not complete the move-in. Please try again." }, { status: 500 });
  }
}
