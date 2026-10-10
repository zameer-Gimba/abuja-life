import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { JOBS } from "@/constants/game";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({
    jobs: JOBS.map((job) => ({
      title: job.title,
      category: job.category,
      location: job.location,
      payPerShift: job.payPerShift,
      shiftHours: job.shiftHours,
      opensAt: job.opensAt,
      minHustle: job.minHustle ?? 0,
      minIntelligence: job.minIntelligence ?? 0,
      minConnect: job.minConnect ?? 0,
      requiresVehicle: job.requiresVehicle ?? false,
    })),
  });
}
