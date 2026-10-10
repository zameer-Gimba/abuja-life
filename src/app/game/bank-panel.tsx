"use client";

import { useEffect, useState } from "react";

type Balances = { walletBalance: string; bankBalance: string; savingsBalance: string; bondsBalance: string; debt: string; totalNetWorth: string };
type Tx = { id: string; type: string; amount: string; description: string; category: string; balanceAfter: string; createdAt: string };

export default function BankPanel({ onUpdate }: { onUpdate: (balances: Balances, message: string) => void }) {
  const [balances, setBalances] = useState<Balances | null>(null);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/game/bank");
      const data = await response.json();
      if (!response.ok) setNotice(data.error ?? "Could not load your bank.");
      else { setBalances(data.balances); setTransactions(data.transactions ?? []); }
    } catch { setNotice("Could not connect to the bank."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  async function action(action: string) {
    const value = Number(amount);
    if (!Number.isSafeInteger(value) || value <= 0) { setNotice("Enter a valid whole-number amount."); return; }
    setLoading(true); setNotice("");
    try {
      const response = await fetch("/api/game/bank", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, amount: value }) });
      const data = await response.json();
      if (!response.ok) setNotice(data.error ?? "Banking action failed.");
      else { setBalances(data.balances); setAmount(""); setNotice(data.message); onUpdate(data.balances, data.message); await load(); }
    } catch { setNotice("Could not connect to the bank."); }
    finally { setLoading(false); }
  }

  return <div className="space-y-5">
    <div className="rounded-3xl border border-slate-200 bg-white p-7">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Abuja Life Bank</p>
      <h1 className="mt-2 text-3xl font-black">Control your money.</h1>
      <p className="mt-2 text-sm text-slate-500">Move Game Naira between your wallet, bank and savings without changing your total net worth.</p>
      {notice && <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">{notice}</div>}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[["Wallet",balances?.walletBalance],["Bank",balances?.bankBalance],["Savings",balances?.savingsBalance],["Debt",balances?.debt]].map(([label,value]) => <div key={String(label)} className="rounded-2xl bg-slate-50 p-5"><p className="text-xs font-bold uppercase text-slate-400">{String(label)}</p><p className="mt-2 text-2xl font-black">₦{Number(value ?? 0).toLocaleString()}</p></div>)}
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input value={amount} onChange={e => setAmount(e.target.value)} type="number" min="1" placeholder="Amount" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500" />
        <button disabled={loading} onClick={() => action("deposit")} className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white">Deposit</button>
        <button disabled={loading} onClick={() => action("withdraw")} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-black">Withdraw</button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button disabled={loading} onClick={() => action("save")} className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white">Move to Savings</button>
        <button disabled={loading} onClick={() => action("unsave")} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-black">Withdraw Savings</button>
        <button disabled={loading} onClick={() => action("pay_debt")} className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700">Pay Debt</button>
      </div>
    </div>
    <div className="rounded-3xl border border-slate-200 bg-white p-7">
      <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Ledger</p><h2 className="mt-2 text-2xl font-black">Recent transactions</h2></div><button onClick={load} disabled={loading} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold">Refresh</button></div>
      <div className="mt-5 space-y-2">{transactions.map(t => <div key={t.id} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4"><div><p className="text-sm font-bold">{t.description}</p><p className="mt-1 text-[11px] text-slate-400">{new Date(t.createdAt).toLocaleString()} · {t.category} · {t.type}</p></div><p className="text-sm font-black">₦{Number(t.amount).toLocaleString()}</p></div>)}{!transactions.length && !loading && <p className="text-sm text-slate-500">No transactions yet.</p>}</div>
    </div>
  </div>;
}
