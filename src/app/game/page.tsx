import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import GameShell from "./game-shell";

export default async function GamePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const player = await db.player.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      username: true,
      gender: true,
      characterPresetId: true,
      skinTone: true,
      hairstyle: true,
      hairColor: true,
      bodyType: true,
      heightCm: true,
      appearanceSeed: true,
      outfitTop: true,
      outfitBottom: true,
      outfitShoes: true,
      outfitOuterwear: true,
      homeSceneId: true,
      displayName: true,
      background: true,
      backgroundLabel: true,
      aura: true,
      steez: true,
      composure: true,
      hustle: true,
      intelligence: true,
      drivingSkill: true,
      streetSense: true,
      connectLevel: true,
      health: true,
      fitness: true,
      happiness: true,
      walletBalance: true,
      bankBalance: true,
      totalNetWorth: true,
      currentArea: true,
      homeArea: true,
      housingType: true,
      currentJob: true,
      hasVehicle: true,
      vehicleName: true,
      vehicleType: true,
      vehicleFuel: true,
      vehicleCondition: true,
      vehicleValue: true,
    },
  });

  if (!player) redirect("/register");

  return (
    <GameShell
      player={{
        ...player,
        walletBalance: player.walletBalance.toString(),
        bankBalance: player.bankBalance.toString(),
        totalNetWorth: player.totalNetWorth.toString(),
        vehicleValue: player.vehicleValue.toString(),
      }}
    />
  );
}
