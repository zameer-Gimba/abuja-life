"use client";

import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, LockKeyhole, Map, ShieldCheck, UserRound } from "lucide-react";

const backgrounds = [
  { id: "rich", name: "Rich Man Pikin", detail: "Comfort, connections and stronger starting resources.", tone: "border-blue-200 bg-blue-50" },
  { id: "poor", name: "Poor Man Pikin", detail: "Less starting capital, stronger hustle and street sense.", tone: "border-emerald-200 bg-emerald-50" },
];

export default function RegisterPage() {
  const [background, setBackground] = useState("poor");
  const [gender, setGender] = useState("male");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.get("username"),
        email: form.get("email"),
        password: form.get("password"),
        background,
        gender,
      }),
    });
    const result = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(result.error ?? "Unable to create your account.");
      return;
    }
    window.location.href = "/login?created=1";
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white"><Map size={20} /></div>
            <div><p className="font-bold text-slate-950">Abuja Life</p><p className="text-xs text-slate-500">The Capital Has Levels</p></div>
          </a>
          <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700"><ArrowLeft size={16} /> Guidelines</a>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-10 px-6 py-12 lg:grid-cols-[.8fr_1.2fr] lg:py-20">
        <aside className="rounded-3xl bg-slate-950 p-8 text-white">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-300">Enter Abuja</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight">Your story starts here.</h1>
          <p className="mt-5 leading-7 text-slate-300">Create your account, choose your birth roll and enter a city where your decisions shape your level.</p>
          <div className="mt-8 space-y-4">
            <div className="flex gap-3"><UserRound className="mt-0.5 text-blue-300" size={19} /><div><p className="font-semibold">One identity</p><p className="text-sm text-slate-400">Your username becomes part of your Abuja identity.</p></div></div>
            <div className="flex gap-3"><LockKeyhole className="mt-0.5 text-blue-300" size={19} /><div><p className="font-semibold">Secure account</p><p className="text-sm text-slate-400">Authentication and account security come before the economy.</p></div></div>
            <div className="flex gap-3"><ShieldCheck className="mt-0.5 text-blue-300" size={19} /><div><p className="font-semibold">Fixed birth roll</p><p className="text-sm text-slate-400">Choose carefully. Your starting background is part of your story.</p></div></div>
          </div>
        </aside>

        <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
          <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">Create account</p><h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Choose your beginning.</h2><p className="mt-3 text-sm leading-6 text-slate-500">Your account is stored persistently, with your birth roll and starting state recorded from the moment you enter the city.</p></div>

          <form onSubmit={submit} className="mt-8 space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block"><span className="text-sm font-bold text-slate-700">Username</span><input name="username" placeholder="e.g. AbujaBoy" className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></label>
              <label className="block"><span className="text-sm font-bold text-slate-700">Email</span><input type="email" name="email" placeholder="you@example.com" className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></label>
            </div>

            <label className="block"><span className="text-sm font-bold text-slate-700">Password</span><input type="password" name="password" placeholder="Create a strong password" className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></label>

            <fieldset>
              <legend className="text-sm font-bold text-slate-700">Character</legend>
              <p className="mt-1 text-sm text-slate-500">Choose the character you want to play. Your character’s gender and appearance stay consistent in the world.</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {[
                  { id: "male", name: "Male character", detail: "A Nigerian male character preset." },
                  { id: "female", name: "Female character", detail: "A Nigerian female character preset." },
                ].map((item) => (
                  <button type="button" key={item.id} onClick={() => setGender(item.id)} className={`rounded-2xl border p-4 text-left transition ${gender === item.id ? "border-blue-300 bg-blue-50 ring-2 ring-blue-500/30" : "border-slate-200 bg-white hover:border-blue-200"}`}>
                    <div className="flex items-center justify-between"><span className="font-black text-slate-950">{item.name}</span><span className={`h-4 w-4 rounded-full border-2 ${gender === item.id ? "border-blue-600 bg-blue-600" : "border-slate-300"}`} /></div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{item.detail}</p>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-bold text-slate-700">Birth roll</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {backgrounds.map((item) => (
                  <button type="button" key={item.id} onClick={() => setBackground(item.id)} className={`rounded-2xl border p-5 text-left transition ${background === item.id ? item.tone + " ring-2 ring-blue-500/30" : "border-slate-200 bg-white hover:border-blue-200"}`}>
                    <div className="flex items-center justify-between"><span className="font-black text-slate-950">{item.name}</span><span className={`h-4 w-4 rounded-full border-2 ${background === item.id ? "border-blue-600 bg-blue-600" : "border-slate-300"}`} /></div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{item.detail}</p>
                  </button>
                ))}
              </div>
            </fieldset>

            {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

            <label className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              <input type="checkbox" className="mt-1 accent-blue-600" required />
              <span>I understand that Abuja Life is a fictional simulation, Game Naira has no cash value, and the birth roll becomes fixed after account creation.</span>
            </label>

            <button disabled={busy} type="submit" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 font-bold text-white shadow-lg shadow-emerald-600/15 transition hover:bg-emerald-700">{busy ? "Creating account..." : "Create Abuja Life Account"} <ArrowRight size={18} /></button>
          </form>
        </section>
      </div>
    </main>
  );
}
