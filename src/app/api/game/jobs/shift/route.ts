import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { JOBS } from "@/constants/game";

export async function POST() {
  const session = await getServerSession(authOptions);
  const playerId = session?.user?.id;
  if (!playerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const result = await db.$transaction(async (tx) => {
      const player = await tx.player.findUnique({
        where: { id: playerId },
        select: {
          id: true,
          currentJob: true,
          currentArea: true,
          walletBalance: true,
          bankBalance: true,
          savingsBalance: true,
          bondsBalance: true,
          hustle: true,
          intelligence: true,
          connectLevel: true,
          performanceScore: true,
          shiftsCompleted: true,
        },
      });

      if (!player) throw new Error("PLAYER_NOT_FOUND");
      if (!player.currentJob) throw new Error("NO_JOB");

      const job = JOBS.find((item) => item.title === player.currentJob);
      if (!job) throw new Error("JOB_NOT_FOUND");

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
      const requiredArea = requiredAreaByJob[job.title];
      if (requiredArea && player.currentArea !== requiredArea) {
        throw new Error("WORKPLACE_" + requiredArea.toUpperCase().replace(/\s+/g, "_"));
      }

      const pay = BigInt(job.payPerShift ?? 0);
      if (pay <= 0n) throw new Error("COMMISSION_JOB");

      const balanceAfter = player.walletBalance + pay;
      const netWorthAfter = balanceAfter + player.bankBalance + player.savingsBalance + player.bondsBalance;
      const performanceGain = Math.max(1, Math.floor((player.hustle + player.intelligence + player.connectLevel) / 30));

      await tx.player.update({
        where: { id: player.id },
        data: {
          walletBalance: balanceAfter,
          totalNetWorth: netWorthAfter,
          performanceScore: player.performanceScore + performanceGain,
          shiftsCompleted: player.shiftsCompleted + 1,
          lastSeen: new Date(),
        },
      });

      let dbJob = await tx.job.findFirst({ where: { title: job.title } });
      if (!dbJob) {
        dbJob = await tx.job.create({
          data: {
            title: job.title,
            category: job.category,
            location: job.location,
            venueName: job.venue ?? "Various",
            payPerShift: pay,
            shiftDuration: job.shiftHours ?? 0,
            requiresVehicle: job.requiresVehicle ?? false,
            minHustle: job.minHustle ?? 0,
            minIntelligence: job.minIntelligence ?? 0,
            minConnect: job.minConnect ?? 0,
          },
        });
      }

      const history = await tx.jobHistory.findFirst({
        where: { playerId: player.id, jobId: dbJob.id },
      });

      if (history) {
        await tx.jobHistory.update({
          where: { id: history.id },
          data: {
            shiftsWorked: history.shiftsWorked + 1,
            totalEarned: history.totalEarned + pay,
            performance: history.performance + performanceGain,
          },
        });
      } else {
        await tx.jobHistory.create({
          data: {
            playerId: player.id,
            jobId: dbJob.id,
            shiftsWorked: 1,
            totalEarned: pay,
            performance: performanceGain,
          },
        });
      }

      await tx.transaction.create({
        data: {
          playerId: player.id,
          type: "income",
          amount: pay,
          description: `Completed a shift as ${job.title}.`,
          category: "employment",
          balanceBefore: player.walletBalance,
          balanceAfter,
        },
      });

      return {
        walletBalance: balanceAfter.toString(),
        totalNetWorth: netWorthAfter.toString(),
        pay: pay.toString(),
        performanceGain,
        performanceScore: player.performanceScore + performanceGain,
        shiftsCompleted: player.shiftsCompleted + 1,
      };
    });

    return NextResponse.json({
      ...result,
      message: `Shift completed. You earned ₦${Number(result.pay).toLocaleString()} Game Naira.`,
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    if (code === "PLAYER_NOT_FOUND") return NextResponse.json({ error: "Player not found." }, { status: 404 });
    if (code === "NO_JOB") return NextResponse.json({ error: "Choose a job first." }, { status: 400 });
    if (code === "JOB_NOT_FOUND") return NextResponse.json({ error: "Your current job is no longer available." }, { status: 400 });
    if (code === "COMMISSION_JOB") return NextResponse.json({ error: "This is a commission-based role. Its payout system comes in the next jobs expansion." }, { status: 400 });
    if (code.startsWith("WORKPLACE_")) {
      const area = code.slice("WORKPLACE_".length).replace(/_/g, " ");
      return NextResponse.json({ error: "Travel to " + area + " before starting this shift.", requiredArea: area }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not complete the shift." }, { status: 500 });
  }
}
