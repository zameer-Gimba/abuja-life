import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { JOBS, JOB_WORKPLACE_AREAS } from "@/constants/game";
import { advanceGameClock, formatGameTime, getGameClock, isWithinOpeningWindow } from "@/lib/game-clock";



export async function POST() {
  const session = await getServerSession(authOptions);
  const playerId = session?.user?.id;
  if (!playerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const result = await db.$transaction(async (tx) => {
      // Prevent two rapid requests from paying for the same career state concurrently.
      await tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "players" WHERE "id" = ${playerId} FOR UPDATE`;

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
          totalNetWorth: true,
          hustle: true,
          intelligence: true,
          connectLevel: true,
          hasVehicle: true,
          performanceScore: true,
          shiftsCompleted: true,
        },
      });

      if (!player) throw new Error("PLAYER_NOT_FOUND");
      if (!player.currentJob) throw new Error("NO_JOB");

      const job = JOBS.find((item) => item.title === player.currentJob);
      if (!job) throw new Error("JOB_NOT_FOUND");
      // Eligibility can change after applying (for example, a vehicle can be sold).
      if (player.hustle < (job.minHustle ?? 0)) throw new Error("HUSTLE_TOO_LOW");
      if (player.intelligence < (job.minIntelligence ?? 0)) throw new Error("INTELLIGENCE_TOO_LOW");
      if (player.connectLevel < (job.minConnect ?? 0)) throw new Error("CONNECTION_TOO_LOW");
      if (job.requiresVehicle && !player.hasVehicle) throw new Error("VEHICLE_REQUIRED");

      const requiredArea = JOB_WORKPLACE_AREAS[job.title];
      if (requiredArea && player.currentArea !== requiredArea) {
        throw new Error("WORKPLACE_AREA:" + requiredArea);
      }

      const clock = await getGameClock(tx, player.id);
      const opensAt = "opensAt" in job && typeof job.opensAt === "number" ? job.opensAt : undefined;
      const closesAt = "closesAt" in job && typeof job.closesAt === "number" ? job.closesAt : undefined;
      if (
        opensAt !== undefined &&
        !isWithinOpeningWindow(clock.minuteOfDay, opensAt, job.shiftHours ?? 1, closesAt)
      ) {
        throw new Error(`JOB_NOT_OPEN_${opensAt}_${closesAt ?? -1}_${clock.minuteOfDay}`);
      }

      const pay = BigInt(job.payPerShift ?? 0);
      if (pay <= 0n) throw new Error("COMMISSION_JOB");

      const balanceAfter = player.walletBalance + pay;
      const netWorthAfter = player.totalNetWorth + pay;
      const performanceGain = Math.max(
        1,
        Math.floor((player.hustle + player.intelligence + player.connectLevel) / 30),
      );

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

      // shiftHours is expressed in hours; the game clock API expects minutes.
      await advanceGameClock(tx, player.id, (job.shiftHours ?? 0) * 60, "job_shift");

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
    if (code === "HUSTLE_TOO_LOW") return NextResponse.json({ error: "Your Hustle no longer meets this job's requirements." }, { status: 400 });
    if (code === "INTELLIGENCE_TOO_LOW") return NextResponse.json({ error: "Your Intelligence no longer meets this job's requirements." }, { status: 400 });
    if (code === "CONNECTION_TOO_LOW") return NextResponse.json({ error: "Your Connection no longer meets this job's requirements." }, { status: 400 });
    if (code === "VEHICLE_REQUIRED") return NextResponse.json({ error: "This job requires a vehicle. Buy or restore your vehicle before completing another shift." }, { status: 400 });
    if (code.startsWith("WORKPLACE_AREA:")) {
      const area = code.slice("WORKPLACE_AREA:".length);
      return NextResponse.json({ error: `Travel to ${area} before starting this shift.`, requiredArea: area }, { status: 400 });
    }
    const notOpen = code.match(/^JOB_NOT_OPEN_(\d+)_(-?\d+)_(\d+)$/);
    if (notOpen) {
      const opensAt = Number(notOpen[1]);
      const configuredClose = Number(notOpen[2]);
      const closesAt = configuredClose >= 0 ? configuredClose : (opensAt + 8) % 24;
      const currentTime = formatGameTime(Number(notOpen[3]));
      const openingTime = `${String(opensAt).padStart(2, "0")}:00`;
      const closingTime = `${String(closesAt).padStart(2, "0")}:00`;
      return NextResponse.json({
        error: `This shift runs ${openingTime}–${closingTime}. Current in-game time is ${currentTime}.`,
        opensAt,
        closesAt,
        currentTime,
      }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not complete the shift." }, { status: 500 });
  }
}
