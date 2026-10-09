import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const ACTIVITIES = {
  walk: {
    label: "Take a walk",
    reward: 25,
    cost: 0,
    changes: { fitness: 2, happiness: 1 },
    message: "A short walk through Abuja helped build your fitness.",
  },
  dance: {
    label: "Dance to Afrobeats",
    reward: 50,
    cost: 0,
    changes: { fitness: 3, happiness: 4, aura: 1 },
    message: "You enjoyed the music, lifted your mood and earned a small reward.",
  },
  eat: {
    label: "Eat something",
    reward: 0,
    cost: 180,
    changes: { health: 8, happiness: 2 },
    message: "You had a meal and restored some energy.",
  },
  call_mummy: {
    label: "Call Mummy",
    reward: 0,
    cost: 0,
    changes: { happiness: 4 },
    message: "Mummy reminds you to take care of yourself. Your mood improves.",
  },
  greet_neighbour: {
    label: "Greet a neighbour",
    reward: 10,
    cost: 0,
    changes: { connectLevel: 1, happiness: 1 },
    message: "A friendly greeting helped you build connections.",
  },
  pray_salah: {
    label: "Pray (Salah)",
    reward: 0,
    cost: 0,
    changes: { happiness: 3 },
    message: "You completed Salah at the mosque.",
  },
  perform_wudu: {
    label: "Perform ablution (Wudu)",
    reward: 0,
    cost: 0,
    changes: { happiness: 1 },
    message: "You completed ablution at the mosque.",
  },
  read_quran: {
    label: "Read the Quran",
    reward: 0,
    cost: 0,
    changes: { happiness: 3 },
    message: "You spent some time reading the Quran.",
  },
  give_sadaqah: {
    label: "Give Sadaqah",
    reward: 0,
    cost: 100,
    changes: { happiness: 2, connectLevel: 1 },
    message: "You gave ₦100 in Sadaqah.",
  },
} as const;

type ActivityKey = keyof typeof ACTIVITIES;

function clampStat(value: number) {
  return Math.max(0, Math.min(100, value));
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const playerId = session?.user?.id;
  if (!playerId) return NextResponse.json({ error: "Sign in to perform activities." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const activity = typeof body?.activity === "string" ? body.activity : "";
  if (!Object.prototype.hasOwnProperty.call(ACTIVITIES, activity)) {
    return NextResponse.json({ error: "That activity is not available." }, { status: 400 });
  }

  const key = activity as ActivityKey;
  const config = ACTIVITIES[key];
  const now = new Date();
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);

  try {
    const result = await db.$transaction(async (tx) => {
      const player = await tx.player.findUnique({
        where: { id: playerId },
        select: {
          id: true,
          currentArea: true,
          walletBalance: true,
          bankBalance: true,
          savingsBalance: true,
          bondsBalance: true,
          totalNetWorth: true,
          health: true,
          fitness: true,
          happiness: true,
          aura: true,
          connectLevel: true,
        },
      });
      if (!player) throw new Error("PLAYER_NOT_FOUND");
      if (["pray_salah", "perform_wudu", "read_quran", "give_sadaqah"].includes(key) && player.currentArea !== "Central Area") {
        throw new Error("NOT_AT_MOSQUE");
      }

      const previous = await tx.gameActivity.findFirst({
        where: { playerId, activityType: key },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      });
      if (previous) {
        const elapsed = now.getTime() - previous.createdAt.getTime();
        const cooldownMs = 20_000;
        if (elapsed < cooldownMs) throw new Error(`COOLDOWN:${Math.ceil((cooldownMs - elapsed) / 1000)}`);
      }

      const todayCount = await tx.gameActivity.count({
        where: { playerId, activityType: key, createdAt: { gte: dayStart } },
      });
      if (todayCount >= 12) throw new Error("DAILY_LIMIT");

      const changes = config.changes as Partial<Record<"health" | "fitness" | "happiness" | "aura" | "connectLevel", number>>;
      const cost = BigInt(config.cost);
      if (player.walletBalance < cost) throw new Error("INSUFFICIENT_FUNDS");

      const balanceBefore = player.walletBalance;
      const balanceAfter = balanceBefore - cost + BigInt(config.reward);
      const bankAndSavings = player.bankBalance + player.savingsBalance + player.bondsBalance;
      const netWorthAfter = balanceAfter + bankAndSavings;

      const updated = await tx.player.update({
        where: { id: playerId },
        data: {
          walletBalance: balanceAfter,
          totalNetWorth: netWorthAfter,
          ...(changes.health !== undefined ? { health: clampStat(player.health + changes.health) } : {}),
          ...(changes.fitness !== undefined ? { fitness: clampStat(player.fitness + changes.fitness) } : {}),
          ...(changes.happiness !== undefined ? { happiness: clampStat(player.happiness + changes.happiness) } : {}),
          ...(changes.aura !== undefined ? { aura: player.aura + changes.aura } : {}),
          ...(changes.connectLevel !== undefined ? { connectLevel: player.connectLevel + changes.connectLevel } : {}),
          lastSeen: now,
        },
        select: {
          walletBalance: true,
          totalNetWorth: true,
          health: true,
          fitness: true,
          happiness: true,
          aura: true,
          connectLevel: true,
        },
      });

      if (config.reward > 0 || config.cost > 0) {
        const amount = BigInt(config.reward - config.cost);
        await tx.transaction.create({
          data: {
            playerId,
            type: config.reward > config.cost ? "income" : "expense",
            amount,
            description: config.reward > 0 && config.cost > 0
              ? `${config.label}: reward minus cost`
              : config.reward > 0
                ? `Activity reward: ${config.label}`
                : `Activity purchase: ${config.label}`,
            category: "daily_activity",
            balanceBefore,
            balanceAfter,
          },
        });
      }

      const statChanges = { ...config.changes, cost: config.cost, reward: config.reward };
      await tx.gameActivity.create({
        data: {
          playerId,
          activityType: key,
          reward: config.reward,
          statChanges,
        },
      });
      await tx.notification.create({
        data: {
          playerId,
          type: "activity_reward",
          title: config.reward > 0 ? `+₦${config.reward} Game Naira` : config.label,
          body: config.message,
          data: statChanges,
        },
      });

      return { ...updated, message: config.message, activity: key, activityLabel: config.label, reward: config.reward, cost: config.cost };
    });

    return NextResponse.json({
      ...result,
      walletBalance: result.walletBalance.toString(),
      totalNetWorth: result.totalNetWorth.toString(),
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    if (code === "PLAYER_NOT_FOUND") return NextResponse.json({ error: "Player not found." }, { status: 404 });
    if (code === "NOT_AT_MOSQUE") return NextResponse.json({ error: "Travel to Central Area to perform mosque activities." }, { status: 400 });
    if (code === "INSUFFICIENT_FUNDS") return NextResponse.json({ error: "You do not have enough Game Naira for that." }, { status: 400 });
    if (code === "DAILY_LIMIT") return NextResponse.json({ error: "You have reached today's limit for this activity. Try another activity." }, { status: 429 });
    if (code.startsWith("COOLDOWN:")) return NextResponse.json({ error: `Try again in ${code.split(":")[1]} seconds.` }, { status: 429 });
    return NextResponse.json({ error: "The activity could not be completed. Please try again." }, { status: 500 });
  }
}
