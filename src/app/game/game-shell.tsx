"use client";

import { useEffect, useMemo, useState } from "react";
import { calculateTravelCost, TRANSPORT_TYPES, type TravelMode } from "@/constants/game";
import BankPanel from "./bank-panel";
import PropertyPanel from "./property-panel";
import { ArrowRight, Banknote, Building2, Car, Compass, Fuel, Home, Map, Menu, Shield, Sparkles, Users, Wallet, X, Zap } from "lucide-react";

type Player = {
  id: string;
  username: string;
  displayName: string;
  background: string;
  backgroundLabel: string;
  aura: number;
  steez: number;
  composure: number;
  hustle: number;
  intelligence: number;
  drivingSkill: number;
  streetSense: number;
  connectLevel: number;
  health: number;
  happiness: number;
  walletBalance: string;
  bankBalance: string;
  totalNetWorth: string;
  currentArea: string;
  homeArea: string;
  housingType: string;
  currentJob: string | null;
  hasVehicle: boolean;
  vehicleName: string | null;
};

const areas = [
  { name: "Nyanya", tier: "Hustle", note: "Affordable start", color: "bg-emerald-500" },
  { name: "Kubwa", tier: "Mid-level", note: "Big estate life", color: "bg-blue-500" },
  { name: "Gwarinpa", tier: "Mid-level", note: "Estate & families", color: "bg-blue-500" },
  { name: "Jabi", tier: "Comfortable", note: "Lake & leisure", color: "bg-cyan-500" },
  { name: "Wuse 2", tier: "Premium", note: "Business & nightlife", color: "bg-violet-500" },
  { name: "Central Area", tier: "Power", note: "CBD & institutions", color: "bg-amber-500" },
  { name: "Guzape", tier: "Elite", note: "Quiet & upscale", color: "bg-indigo-500" },
  { name: "Maitama", tier: "Elite", note: "Embassies & power", color: "bg-rose-500" },
];

const facilities = [
  ["Fuel Station", Fuel, "Keep your vehicle moving"],
  ["Hospital", Shield, "Look after your health"],
  ["Bank", Banknote, "Manage your money"],
  ["Berger", Compass, "Move across the capital"],
  ["Market", Building2, "Buy what you need"],
  ["Jabi Lake", Sparkles, "Leisure & events"],
];

const stats = [
  ["Aura", "aura"], ["Steez", "steez"], ["Composure", "composure"], ["Hustle", "hustle"],
  ["Intelligence", "intelligence"], ["Driving", "drivingSkill"], ["Street Sense", "streetSense"], ["Connection", "connectLevel"],
] as const;

export default function GameShell({ player }: { player: Player }) {
  const [currentArea, setCurrentArea] = useState(player.currentArea);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState("You have entered Abuja.");
  const [view, setView] = useState("map");
  const [travelMode, setTravelMode] = useState<TravelMode>("BUS_STOP");
  const [travelling, setTravelling] = useState(false);
  const [balance, setBalance] = useState(BigInt(player.walletBalance));
  const [netWorth, setNetWorth] = useState(BigInt(player.totalNetWorth));
  const [jobs, setJobs] = useState<Array<{ title: string; category: string; location: string; payPerShift: number; shiftHours: number; minHustle?: number; minIntelligence?: number; minConnect?: number; requiresVehicle?: boolean }>>([]);
  const [jobLoading, setJobLoading] = useState(false);
  const [jobNotice, setJobNotice] = useState("");
  const [activeJob, setActiveJob] = useState(player.currentJob);

  const cash = useMemo(() => Number(balance).toLocaleString(), [balance]);
  const displayedNetWorth = useMemo(() => Number(netWorth).toLocaleString(), [netWorth]);
  const currentJob = player.currentJob;

  function openView(nextView: string) {
    setView(nextView);
    if (nextView === "jobs") void loadJobs();
  }

  async function loadJobs() {
    setJobLoading(true);
    try {
      const response = await fetch("/api/game/jobs");
      const data = await response.json();
      if (response.ok) setJobs(data.jobs ?? []);
      else setJobNotice(data.error ?? "Could not load jobs.");
    } catch {
      setJobNotice("Could not connect to the jobs board.");
    } finally {
      setJobLoading(false);
    }
  }

  async function applyForJob(title: string) {
    setJobLoading(true);
    setJobNotice("");
    try {
      const response = await fetch("/api/game/jobs/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await response.json();
      setJobNotice(data.message ?? data.error ?? "Application completed.");
      if (response.ok) setActiveJob(data.job);
    } catch {
      setJobNotice("Could not submit the application.");
    } finally {
      setJobLoading(false);
    }
  }

  async function completeShift() {
    setJobLoading(true);
    setJobNotice("");
    try {
      const response = await fetch("/api/game/jobs/shift", { method: "POST" });
      const data = await response.json();
      if (response.ok) {
        setBalance(BigInt(data.walletBalance));
        setNetWorth(BigInt(data.totalNetWorth));
        setJobNotice(data.message);
      } else {
        setJobNotice(data.error ?? "Could not complete shift.");
      }
    } catch {
      setJobNotice("Could not connect to the jobs system.");
    } finally {
      setJobLoading(false);
    }
  }

  async function travel(area: string) {
    if (area === currentArea || travelling) return;
    setTravelling(true);
    setNotice("Calculating your route...");

    try {
      const response = await fetch("/api/game/travel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination: area, mode: travelMode }),
      });
      const data = await response.json();

      if (!response.ok) {
        setNotice(data.error ?? "Travel failed.");
        return;
      }

      setCurrentArea(data.currentArea);
      setBalance(BigInt(data.walletBalance));
      setNetWorth(BigInt(data.totalNetWorth));
      setNotice(`You arrived in ${data.currentArea}. ${TRANSPORT_TYPES[travelMode].label} cost ₦${Number(data.cost).toLocaleString()}.`);
    } catch {
      setNotice("Could not connect to the transport system.");
    } finally {
      setTravelling(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-xl p-2 hover:bg-slate-100 lg:hidden" aria-label="Open menu">{menuOpen ? <X /> : <Menu />}</button>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white"><Map size={20} /></div>
            <div><p className="font-black tracking-tight">Abuja Life</p><p className="text-[11px] font-semibold text-slate-500">The Capital Has Levels</p></div>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Game Naira</p><p className="font-black">₦{cash}</p></div>
            <div className="rounded-xl bg-slate-950 px-4 py-2 text-white"><p className="text-[10px] font-bold uppercase tracking-wider text-blue-300">Level</p><p className="font-black">{player.backgroundLabel}</p></div>
          </div>
        </div>
      </header>

      {menuOpen && <div className="border-b border-slate-200 bg-white p-4 lg:hidden"><div className="grid grid-cols-2 gap-2">{["Map","Jobs","Property","Bank","Politics","Profile"].map((item) => <button key={item} onClick={() => { openView(item.toLowerCase()); setMenuOpen(false); }} className="rounded-xl border border-slate-200 p-3 text-left text-sm font-bold">{item}</button>)}</div></div>}

      <div className="mx-auto grid max-w-[1500px] gap-5 p-4 sm:p-6 lg:grid-cols-[240px_1fr_300px]">
        <aside className="hidden rounded-2xl border border-slate-200 bg-white p-4 lg:block">
          <p className="px-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">City menu</p>
          <div className="mt-3 space-y-1">{[["map","Map",Map],["jobs","Jobs",Banknote],["property","Property",Home],["bank","Bank",Wallet],["politics","Politics",Users],["profile","Profile",Shield]].map(([id,label,Icon]) => <button key={String(id)} onClick={() => openView(String(id))} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold ${view === id ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"}`}><Icon size={17} />{String(label)}</button>)}</div>
          <div className="mt-8 rounded-2xl bg-slate-950 p-4 text-white"><p className="text-xs font-bold text-blue-300">CURRENT AREA</p><p className="mt-1 text-xl font-black">{currentArea}</p><p className="mt-1 text-xs font-semibold text-blue-300">{travelling ? "Travelling..." : `${TRANSPORT_TYPES[travelMode].label} selected`}</p><p className="mt-2 text-xs leading-5 text-slate-400">{areas.find(a => a.name === currentArea)?.note ?? "Your current location"}</p></div>
        </aside>

        <section className="min-w-0">
          {notice && <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">{notice}</div>}

          {view === "map" && <div className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Abuja / FCT</p><h1 className="mt-2 text-3xl font-black tracking-tight">Your city is open.</h1><p className="mt-2 text-sm text-slate-500">Choose an area and transport mode. Trips are charged and saved on the server.</p></div><div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold"><Map size={16} className="text-blue-600" /> {currentArea}</div></div>
              <div className="mt-5 flex flex-wrap gap-2">
                {(Object.entries(TRANSPORT_TYPES).filter(([key]) => key !== "ONE_CHANCE") as [TravelMode, { label: string; baseCost: number }][]).map(([mode, transport]) => (
                  <button key={mode} onClick={() => setTravelMode(mode)} disabled={travelling} className={`rounded-xl border px-3 py-2 text-xs font-bold ${travelMode === mode ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600"}`}>
                    {transport.label} <span className="ml-1 font-normal text-slate-400">from ₦{transport.baseCost.toLocaleString()}</span>
                  </button>
                ))}
              </div>
              <div className="relative mt-7 min-h-[430px] overflow-hidden rounded-2xl border border-blue-100 bg-[radial-gradient(circle_at_20%_20%,#dbeafe,transparent_25%),linear-gradient(135deg,#eff6ff,#ecfdf5)] p-5">
                <div className="absolute inset-0 opacity-40" style={{backgroundImage:"linear-gradient(#94a3b8 1px, transparent 1px),linear-gradient(90deg,#94a3b8 1px,transparent 1px)",backgroundSize:"48px 48px"}} />
                <div className="relative grid h-full min-h-[390px] grid-cols-2 gap-3 sm:grid-cols-4">
                  {areas.map((area) => <button key={area.name} onClick={() => travel(area.name)} className={`group relative flex min-h-28 flex-col justify-end rounded-2xl border border-white/80 bg-white/80 p-4 text-left shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-lg ${currentArea === area.name ? "ring-2 ring-blue-500" : ""}`}><span className={`absolute right-4 top-4 h-3 w-3 rounded-full ${area.color}`} /><span className="text-lg font-black">{area.name}</span><span className="text-xs font-bold text-slate-500">{area.tier}</span><span className="mt-2 text-xs text-slate-500">{area.note}</span><span className="mt-2 text-[11px] font-bold text-blue-600">{area.name === currentArea ? "You are here" : `₦${calculateTravelCost(currentArea, area.name, travelMode).toLocaleString()} · ${TRANSPORT_TYPES[travelMode].label}`}</span></button>)}
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{facilities.map(([label,Icon,note]) => <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-5"><Icon className="text-blue-600" size={20} /><p className="mt-4 font-black">{String(label)}</p><p className="mt-1 text-xs leading-5 text-slate-500">{String(note)}</p></div>)}</div>
          </div>}

          {view === "jobs" && <div className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-7">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Abuja Jobs Board</p><h1 className="mt-2 text-3xl font-black">Find your hustle.</h1><p className="mt-2 text-sm text-slate-500">Jobs use your skills, location, vehicle status and Connection.</p></div>
                <button onClick={loadJobs} disabled={jobLoading} className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white">{jobLoading ? "Loading..." : "Refresh jobs"}</button>
              </div>
              {jobNotice && <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">{jobNotice}</div>}
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {jobs.map((job) => <div key={job.title} className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-start justify-between gap-3"><div><p className="font-black">{job.title}</p><p className="mt-1 text-xs font-semibold text-slate-500">{job.location} · {job.shiftHours}h shift</p></div><span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase text-emerald-700">{job.category}</span></div>
                  <p className="mt-4 text-xl font-black">₦{job.payPerShift.toLocaleString()} <span className="text-xs font-semibold text-slate-400">/ shift</span></p>
                  <p className="mt-2 text-xs text-slate-500">Requirements: Hustle {job.minHustle ?? 0} · Intelligence {job.minIntelligence ?? 0} · Connection {job.minConnect ?? 0}{job.requiresVehicle ? " · Vehicle" : ""}</p>
                  <button onClick={() => applyForJob(job.title)} disabled={jobLoading} className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold hover:bg-slate-50">Apply</button>
                </div>)}
              </div>
              {!jobs.length && <p className="mt-6 text-sm text-slate-500">Select Jobs and refresh the board to load available work.</p>}
            </div>
            {activeJob && <div className="rounded-3xl bg-slate-950 p-7 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">Current Job</p>
              <h2 className="mt-2 text-2xl font-black">{activeJob}</h2>
              <p className="mt-2 text-sm text-slate-400">Complete a shift to earn Game Naira and build your employment history.</p>
              <button onClick={completeShift} disabled={jobLoading} className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white">{jobLoading ? "Processing..." : "Complete Shift"}</button>
            </div>}
          </div>}
          {view === "bank" && <BankPanel onUpdate={(b, message) => { setBalance(BigInt(b.walletBalance)); setNetWorth(BigInt(b.totalNetWorth)); setNotice(message); }} />}
          {view === "property" && <PropertyPanel onUpdate={(data) => { setBalance(BigInt(data.walletBalance)); setNetWorth(BigInt(data.netWorth)); setCurrentArea(data.housing.currentArea); setNotice(data.message); }} />}
          {view !== "map" && view !== "jobs" && view !== "property" && view !== "bank" && <div className="rounded-3xl border border-slate-200 bg-white p-7"><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">{view}</p><h1 className="mt-2 text-3xl font-black capitalize">{view} is coming into the playable economy.</h1><p className="mt-4 max-w-2xl leading-7 text-slate-600">The dashboard shell is ready. This section will be connected to its server-authoritative game actions in the next build stages.</p></div>}
        </section>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Player</p><p className="mt-1 text-xl font-black">{player.displayName}</p></div><div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-black text-emerald-700">{player.displayName.slice(0,1).toUpperCase()}</div></div>
            <div className="mt-5 grid grid-cols-2 gap-2">{stats.map(([label,key]) => <div key={label} className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase text-slate-400">{label}</p><p className="mt-1 text-lg font-black">{player[key]}</p></div>)}</div>
          </div>
          <div className="rounded-2xl bg-slate-950 p-5 text-white"><div className="flex items-center gap-2 text-blue-300"><Wallet size={18} /><span className="text-xs font-bold uppercase tracking-wider">Financial snapshot</span></div><p className="mt-4 text-3xl font-black">₦{cash}</p><div className="mt-4 grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl bg-white/5 p-3"><p className="text-slate-400">Bank</p><p className="mt-1 font-bold">₦{Number(player.bankBalance).toLocaleString()}</p></div><div className="rounded-xl bg-white/5 p-3"><p className="text-slate-400">Net worth</p><p className="mt-1 font-bold">₦{displayedNetWorth}</p></div></div></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2"><Home size={17} className="text-emerald-600" /><span className="font-bold">Home</span></div><p className="mt-3 text-lg font-black">{player.homeArea}</p><p className="text-sm text-slate-500">{player.housingType}</p><div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500"><Car size={14} /> {player.hasVehicle ? player.vehicleName ?? "Vehicle owned" : "No vehicle yet"}</div></div>
        </aside>
      </div>
    </main>
  );
}
