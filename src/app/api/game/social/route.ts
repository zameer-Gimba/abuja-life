import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  const playerId = session?.user?.id;
  if (!playerId) return NextResponse.json({ error: "Sign in to view your contacts." }, { status: 401 });

  try {
    const activities = await db.gameActivity.findMany({
      where: { playerId, activityType: "greet_neighbour" },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { statChanges: true, createdAt: true },
    });

    const contacts = new Map<string, { id: string; name: string; greetings: number; lastSeenAt: string; area?: string }>();
    for (const activity of activities) {
      const data = activity.statChanges;
      if (!data || typeof data !== "object" || Array.isArray(data)) continue;
      const name = "targetName" in data && typeof data.targetName === "string" ? data.targetName.trim().slice(0, 60) : "";
      if (!name) continue;
      const storedId = "targetId" in data && typeof data.targetId === "string" ? data.targetId.trim().slice(0, 120) : "";
      const area = "targetArea" in data && typeof data.targetArea === "string" ? data.targetArea.trim().slice(0, 60) : "";
      // Keep legacy name-keyed greetings visible while new contacts use stable NPC identities.
      const id = storedId || `legacy:${name.toLowerCase()}`;
      const existing = contacts.get(id);
      if (existing) existing.greetings += 1;
      else contacts.set(id, { id, name, greetings: 1, lastSeenAt: activity.createdAt.toISOString(), ...(area ? { area } : {}) });
    }

    return NextResponse.json({
      contacts: [...contacts.values()].sort((a, b) => b.greetings - a.greetings || a.name.localeCompare(b.name)),
    });
  } catch {
    return NextResponse.json({ error: "Could not load your saved contacts." }, { status: 500 });
  }
}
