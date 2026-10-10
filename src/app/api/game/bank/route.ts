import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const ACTIONS = ["deposit", "withdraw", "save", "unsave", "pay_debt"] as const;
type Action = (typeof ACTIONS)[number];

function toSerializableBalances<T extends Record<string, unknown>>(balances: T) {
  return Object.fromEntries(
    Object.entries(balances).map(([key, value]) => [
      key,
      typeof value === "bigint" ? value.toString() : value,
    ]),
  );
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const playerId = session?.user?.id;
  if (!playerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const player = await db.player.findUnique({
    where: { id: playerId },
    select: {
      walletBalance: true,
      bankBalance: true,
      savingsBalance: true,
      bondsBalance: true,
      debt: true,
      totalNetWorth: true,
    },
  });
  if (!player) return NextResponse.json({ error: "Player not found." }, { status: 404 });

  const transactions = await db.transaction.findMany({
    where: { playerId },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      type: true,
      amount: true,
      description: true,
      category: true,
      balanceAfter: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    balances: toSerializableBalances(player),
    transactions: transactions.map((transaction) => ({
      ...transaction,
      amount: transaction.amount.toString(),
      balanceAfter: transaction.balanceAfter.toString(),
    })),
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const playerId = session?.user?.id;
  if (!playerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const action = body?.action as Action;
  const amount = Number(body?.amount);
  if (!ACTIONS.includes(action)) {
    return NextResponse.json({ error: "Invalid banking action." }, { status: 400 });
  }
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    return NextResponse.json(
      { error: "Enter a valid positive whole-number amount." },
      { status: 400 },
    );
  }

  const requestedAmount = BigInt(amount);

  try {
    const result = await db.$transaction(async (tx) => {
      // Lock this player's row so concurrent banking requests cannot overwrite each other's balances.
      await tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "players" WHERE "id" = ${playerId} FOR UPDATE`;

      const player = await tx.player.findUnique({
        where: { id: playerId },
        select: {
          walletBalance: true,
          bankBalance: true,
          savingsBalance: true,
          bondsBalance: true,
          debt: true,
        },
      });
      if (!player) throw new Error("PLAYER_NOT_FOUND");

      let wallet = player.walletBalance;
      let bank = player.bankBalance;
      let savings = player.savingsBalance;
      let debt = player.debt;
      let description = "";
      let category = "banking";
      let transactionType: "income" | "expense" | "transfer";
      let transactionAmount = requestedAmount;

      if (action === "deposit") {
        if (wallet < requestedAmount) throw new Error("INSUFFICIENT_WALLET");
        wallet -= requestedAmount;
        bank += requestedAmount;
        description = "Cash deposited into bank";
        transactionType = "expense";
        transactionAmount = -requestedAmount;
      } else if (action === "withdraw") {
        if (bank < requestedAmount) throw new Error("INSUFFICIENT_BANK");
        bank -= requestedAmount;
        wallet += requestedAmount;
        description = "Cash withdrawn from bank";
        transactionType = "income";
      } else if (action === "save") {
        if (bank < requestedAmount) throw new Error("INSUFFICIENT_BANK_FOR_SAVINGS");
        bank -= requestedAmount;
        savings += requestedAmount;
        description = "Transfer to savings";
        category = "savings";
        transactionType = "transfer";
      } else if (action === "unsave") {
        if (savings < requestedAmount) throw new Error("INSUFFICIENT_SAVINGS");
        savings -= requestedAmount;
        bank += requestedAmount;
        description = "Savings withdrawn to bank";
        category = "savings";
        transactionType = "transfer";
      } else {
        if (debt === 0n) throw new Error("NO_DEBT");
        const payment = requestedAmount > debt ? debt : requestedAmount;
        if (wallet < payment) throw new Error("INSUFFICIENT_WALLET_FOR_DEBT");
        wallet -= payment;
        debt -= payment;
        description = `Debt repayment (₦${payment.toString()})`;
        category = "debt";
        transactionType = "expense";
        transactionAmount = -payment;
      }

      const totalNetWorth = wallet + bank + savings + player.bondsBalance;
      const updated = await tx.player.update({
        where: { id: playerId },
        data: {
          walletBalance: wallet,
          bankBalance: bank,
          savingsBalance: savings,
          debt,
          totalNetWorth,
          lastSeen: new Date(),
        },
        select: {
          walletBalance: true,
          bankBalance: true,
          savingsBalance: true,
          bondsBalance: true,
          debt: true,
          totalNetWorth: true,
        },
      });

      await tx.transaction.create({
        data: {
          playerId,
          type: transactionType,
          amount: transactionAmount,
          description,
          category,
          balanceBefore: player.walletBalance,
          balanceAfter: wallet,
        },
      });

      return { description, balances: updated };
    });

    return NextResponse.json({
      message: result.description + ".",
      balances: toSerializableBalances(result.balances),
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    if (code === "PLAYER_NOT_FOUND") {
      return NextResponse.json({ error: "Player not found." }, { status: 404 });
    }
    if (code === "INSUFFICIENT_WALLET") {
      return NextResponse.json({ error: "Insufficient Game Naira in your wallet." }, { status: 400 });
    }
    if (code === "INSUFFICIENT_BANK") {
      return NextResponse.json({ error: "Insufficient bank balance." }, { status: 400 });
    }
    if (code === "INSUFFICIENT_BANK_FOR_SAVINGS") {
      return NextResponse.json({ error: "Insufficient bank balance for savings." }, { status: 400 });
    }
    if (code === "INSUFFICIENT_SAVINGS") {
      return NextResponse.json({ error: "Insufficient savings balance." }, { status: 400 });
    }
    if (code === "INSUFFICIENT_WALLET_FOR_DEBT") {
      return NextResponse.json({ error: "Insufficient wallet balance to pay debt." }, { status: 400 });
    }
    if (code === "NO_DEBT") {
      return NextResponse.json({ error: "You have no outstanding debt." }, { status: 400 });
    }
    return NextResponse.json({ error: "Banking action failed. Please try again." }, { status: 500 });
  }
}
