"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { ArrowRight, LockKeyhole, Map } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      username: String(form.get("username") ?? ""),
      password: String(form.get("password") ?? ""),
      redirect: false,
    });
    setBusy(false);
    if (!result?.ok) {
      setError("Invalid username/email or password.");
      return;
    }
    window.location.href = "/game";
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <a href="/" className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white"><Map size={20} /></div><div><p className="font-bold text-slate-950">Abuja Life</p><p className="text-xs text-slate-500">The Capital Has Levels</p></div></a>
          <a href="/register" className="text-sm font-semibold text-blue-700">Create account</a>
        </div>
      </header>
      <div className="mx-auto max-w-md px-6 py-16">
        <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
          <LockKeyhole className="text-blue-600" size={22} />
          <p className="mt-5 text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">Welcome back</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Enter Abuja again.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">Continue your life, money, connections and progress.</p>
          <form onSubmit={submit} className="mt-8 space-y-5">
            <label className="block"><span className="text-sm font-bold text-slate-700">Username or email</span><input name="username" autoComplete="username" required className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></label>
            <label className="block"><span className="text-sm font-bold text-slate-700">Password</span><input type="password" name="password" autoComplete="current-password" required className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></label>
            {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
            <button disabled={busy} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60">{busy ? "Entering..." : "Enter Abuja"} <ArrowRight size={18} /></button>
          </form>
        </section>
      </div>
    </main>
  );
}
