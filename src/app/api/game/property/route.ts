import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { PROPERTY_LISTINGS, calculateMoveInCost } from "@/constants/properties";

export async function GET() {
  const session = await getServerSession(authOptions);
  const playerId = session?.user?.id;
  if (!playerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const player = await db.player.findUnique({
    where: { id: playerId },
    select: { walletBalance: true, homeArea: true, housingType: true },
  });
  if (!player) return NextResponse.json({ error: "Player not found." }, { status: 404 });

  return NextResponse.json({
    listings: PROPERTY_LISTINGS.map((property) => ({ ...property, ...calculateMoveInCost(property) })),
    housing: { homeArea: player.homeArea, housingType: player.housingType },
    walletBalance: player.walletBalance.toString(),
  });
}
