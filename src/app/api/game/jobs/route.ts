import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { JOBS } from "@/constants/game";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requiredAreaByJob: Record<string, string> = {
    "Flyer Distributor": "Wuse 2",
    "Suya Spot Attendant": "Wuse 2",
    "Shop Assistant": "Wuse 2",
    "Restaurant Staff": "Jabi",
    "Hotel Staff": "Central Area",
    "Bank Teller": "Garki",
    "Junior Civil Servant": "Garki",
    "Hype Man": "Wuse 2",
  };

  return NextResponse.json({
    jobs: JOBS.map((job) => ({
      title: job.title,
      category: job.category,
      location: job.location,
      requiredArea: requiredAreaByJob[job.title] ?? null,
      opensAt: "opensAt" in job ? job.opensAt : null,
      payPerShift: job.payPerShift,
      shiftHours: job.shiftHours,
      minHustle: job.minHustle ?? 0,
      minIntelligence: job.minIntelligence ?? 0,
      minConnect: job.minConnect ?? 0,
      requiresVehicle: job.requiresVehicle ?? false,
    })),
  });
}
