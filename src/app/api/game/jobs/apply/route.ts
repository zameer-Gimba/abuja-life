import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { JOBS } from "@/constants/game";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const playerId = session?.user?.id;
  if (!playerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title : "";
  const job = JOBS.find((item) => item.title === title);

  if (!job) return NextResponse.json({ error: "Job not found." }, { status: 404 });

  const player = await db.player.findUnique({
    where: { id: playerId },
    select: {
      hustle: true,
      intelligence: true,
      connectLevel: true,
      hasVehicle: true,
    },
  });

  if (!player) return NextResponse.json({ error: "Player not found." }, { status: 404 });
  if (player.hustle < (job.minHustle ?? 0)) return NextResponse.json({ error: "Your Hustle is too low for this job." }, { status: 400 });
  if (player.intelligence < (job.minIntelligence ?? 0)) return NextResponse.json({ error: "Your Intelligence is too low for this job." }, { status: 400 });
  if (player.connectLevel < (job.minConnect ?? 0)) return NextResponse.json({ error: "You need more Connect for this job." }, { status: 400 });
  if (job.requiresVehicle && !player.hasVehicle) return NextResponse.json({ error: "This job requires a vehicle." }, { status: 400 });

  await db.player.update({
    where: { id: playerId },
    data: { currentJob: job.title, jobLocation: job.location },
  });

  return NextResponse.json({ message: `You are now working as ${job.title}.`, job: job.title });
}
