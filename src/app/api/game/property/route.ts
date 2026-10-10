import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { PROPERTY_LISTINGS, calculateMoveInCost } from "@/constants/properties";
import { calculateUnusedRentCredit } from "@/lib/rent-refund";

function listingKey(property: { name: string; area: string; type: string }) {
  return `${property.name}|${property.area}|${property.type}`;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const playerId = session?.user?.id;
  if (!playerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const player = await db.player.findUnique({
    where: { id: playerId },
    select: { walletBalance: true, homeArea: true, housingType: true },
  });
  if (!player) return NextResponse.json({ error: "Player not found." }, { status: 404 });

  const listingNames = PROPERTY_LISTINGS.map((property) => property.name);
  const [occupiedListings, activeRentals] = await Promise.all([
    db.property.findMany({
      where: {
        isForRent: true,
        isOccupied: true,
        name: { in: listingNames },
      },
      select: { name: true, area: true, type: true, tenantId: true },
    }),
    db.property.findMany({
      where: { tenantId: playerId, isForRent: true, isOccupied: true },
      select: { id: true, name: true, area: true, type: true, annualRent: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const occupiedByOthers = new Set(
    occupiedListings
      .filter((listing) => listing.tenantId !== playerId)
      .map(listingKey),
  );
  const currentHomes = new Set(activeRentals.map(listingKey));
  const rentCredit = calculateUnusedRentCredit(activeRentals);

  return NextResponse.json({
    listings: PROPERTY_LISTINGS.map((property) => {
      const key = listingKey(property);
      return {
        ...property,
        ...calculateMoveInCost(property),
        available: !occupiedByOthers.has(key) && !currentHomes.has(key),
        isCurrentHome: currentHomes.has(key),
      };
    }),
    housing: { homeArea: player.homeArea, housingType: player.housingType },
    currentHome: activeRentals[0]
      ? { name: activeRentals[0].name, area: activeRentals[0].area, type: activeRentals[0].type }
      : null,
    rentCredit: rentCredit.toString(),
    walletBalance: player.walletBalance.toString(),
  });
}
