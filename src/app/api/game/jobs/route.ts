import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { JOBS } from "@/constants/game";

export async function GET() {
  const session = await getServerSession(authOptions);
  const playerId = session?.user?.id;
  if (!playerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const history = await db.jobHistory.findMany({
      where: { playerId },
      select: {
        shiftsWorked: true,
        totalEarned: true,
        performance: true,
        job: { select: { title: true } },
      },
      orderBy: { startedAt: "desc" },
    });

    const historyByTitle = new Map(
      history.map((record) => [
        record.job.title,
        {
          shiftsWorked: record.shiftsWorked,
          totalEarned: record.totalEarned.toString(),
          performance: record.performance,
        },
      ]),
    );

    return NextResponse.json({
      jobs: JOBS.map((job) => ({
        title: job.title,
        category: job.category,
        location: job.location,
        payPerShift: job.payPerShift,
        shiftHours: job.shiftHours,
        opensAt: "opensAt" in job && typeof job.opensAt === "number" ? job.opensAt : undefined,
        closesAt: "closesAt" in job && typeof job.closesAt === "number" ? job.closesAt : undefined,
        minHustle: job.minHustle ?? 0,
        minIntelligence: job.minIntelligence ?? 0,
        minConnect: job.minConnect ?? 0,
        requiresVehicle: job.requiresVehicle ?? false,
        careerRecord: historyByTitle.get(job.title) ?? null,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Could not load the jobs board." }, { status: 500 });
  }
}
