import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const ACTIONS = ["deposit", "withdraw", "save", "unsave", "pay_debt"] as const;
type Action = (typeof ACTIONS)[number];

export async function GET() {
  const session = await getServerSession(authOptions);
  const playerId = session?.user?.id;
  if (!playerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const player = await db.player.findUnique({
    where: { id: playerId },
    select: { walletBalance: true, bankBalance: true, savingsBalance: true, bondsBalance: true, debt: true, totalNetWorth: true },
  });
  if (!player) return NextResponse.json({ error: "Player not found." }, { status: 404 });

  const transactions = await db.transaction.findMany({
    where: { playerId },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { id: true, type: true, amount: true, description: true, category: true, balanceAfter: true, createdAt: true },
  });

  return NextResponse.json({
    balances: Object.fromEntries(Object.entries(player).map(([key, value]) => [key, typeof value === "bigint" ? value.toString() : value])),
    transactions: transactions.map((t) => ({ ...t, amount: t.amount.toString(), balanceAfter: t.balanceAfter.toString() })),
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const playerId = session?.user?.id;
  if (!playerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const action = body?.action as Action;
  const amount = Number(body?.amount);
  if (!ACTIONS.includes(action)) return NextResponse.json({ error: "Invalid banking action." }, { status: 400 });
  if (!Number.isSafeInteger(amount) || amount <= 0) return NextResponse.json({ error: "Enter a valid positive whole-number amount." }, { status: 400 });

  const player = await db.player.findUnique({
    where: { id: playerId },
    select: { walletBalance: true, bankBalance: true, savingsBalance: true, debt: true, totalNetWorth: true },
  });
  if (!player) return NextResponse.json({ error: "Player not found." }, { status: 404 });

  const n = BigInt(amount);
  let wallet = player.walletBalance;
  let bank = player.bankBalance;
  let savings = player.savingsBalance;
  let debt = player.debt;
  let description = "";
  let category = "banking";

  if (action === "deposit") {
    if (wallet < n) return NextResponse.json({ error: "Insufficient Game Naira in your wallet." }, { status: 400 });
    wallet -= n; bank += n; description = "Cash deposited into bank";
  } else if (action === "withdraw") {
    if (bank < n) return NextResponse.json({ error: "Insufficient bank balance." }, { status: 400 });
    bank -= n; wallet += n; description = "Cash withdrawn from bank";
  } else if (action === "save") {
    if (bank < n) return NextResponse.json({ error: "Insufficient bank balance for savings." }, { status: 400 });
    bank -= n; savings += n; description = "Transfer to savings";
    category = "savings";
  } else if (action === "unsave") {
    if (savings < n) return NextResponse.json({ error: "Insufficient savings balance." }, { status: 400 });
    savings -= n; bank += n; description = "Savings withdrawn to bank";
    category = "savings";
  } else if (action === "pay_debt") {
    if (wallet < n) return NextResponse.json({ error: "Insufficient wallet balance to pay debt." }, { status: 400 });
    if (debt === 0n) return NextResponse.json({ error: "You have no outstanding debt." }, { status: 400 });
    const payment = n > debt ? debt : n;
    wallet -= payment; debt -= payment; description = "Debt repayment"; category = "debt";
  }

  const walletDelta = wallet - player.walletBalance;
  const updated = await db.$transaction(async (tx) => {
    const updatedPlayer = await tx.player.update({
      where: { id: playerId },
      data: { walletBalance: wallet, bankBalance: bank, savingsBalance: savings, debt, lastSeen: new Date() },
      select: { walletBalance: true, bankBalance: true, savingsBalance: true, bondsBalance: true, debt: true, totalNetWorth: true },
    });

    await tx.transaction.create({
      data: {
        playerId,
        type: walletDelta < 0n ? "expense" : "income",
        amount: n,
        description,
        category,
        balanceBefore: player.walletBalance,
        balanceAfter: wallet,
      },
    });
    return updatedPlayer;
  });

  return NextResponse.json({
    message: description + ".",
    balances: Object.fromEntries(Object.entries(updated).map(([key, value]) => [key, typeof value === "bigint" ? value.toString() : value])),
  });
}
