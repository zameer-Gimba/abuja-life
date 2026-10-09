"use client";

import { useEffect, useMemo, useState } from "react";
import { calculateTravelCost, TRANSPORT_TYPES, type TravelMode } from "@/constants/game";
import BankPanel from "./bank-panel";
import PropertyPanel from "./property-panel";
import VehiclePanel from "./vehicle-panel";
import WorldHome from "./world-home";
import { Activity, ArrowRight, Banknote, Building2, Car, Compass, Fuel, Home, Map, Menu, PhoneCall, Shield, Smartphone, Sparkles, Users, Wallet, X, Zap } from "lucide-react";

type Player = {
  id: string;
  username: string;
  gender: string;
  characterPresetId: string;
  skinTone: string;
  hairstyle: string;
  hairColor: string;
  bodyType: string;
  heightCm: number;
  appearanceSeed: number;
  outfitTop: string;
  outfitBottom: string;
  outfitShoes: string;
  outfitOuterwear: string;
  homeSceneId: string;
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
  fitness: number;
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
  vehicleType: string | null;
  vehicleFuel: number;
  vehicleCondition: number;
  vehicleValue: string;
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
  const [view, setView] = useState("world");
  const [travelMode, setTravelMode] = useState<TravelMode>("BUS_STOP");
  const [travelling, setTravelling] = useState(false);
  const [balance, setBalance] = useState(BigInt(player.walletBalance));
  const [netWorth, setNetWorth] = useState(BigInt(player.totalNetWorth));
  const [jobs, setJobs] = useState<Array<{ title: string; category: string; location: string; payPerShift: number; shiftHours: number; minHustle?: number; minIntelligence?: number; minConnect?: number; requiresVehicle?: boolean }>>([]);
  const [jobLoading, setJobLoading] = useState(false);
  const [jobNotice, setJobNotice] = useState("");
  const [activeJob, setActiveJob] = useState(player.currentJob);
  const [fitness, setFitness] = useState(player.fitness);
  const [health, setHealth] = useState(player.health);
  const [happiness, setHappiness] = useState(player.happiness);
  const [aura, setAura] = useState(player.aura);
  const [connection, setConnection] = useState(player.connectLevel);
  const [worldScene, setWorldScene] = useState<"home" | "street">("home");
  const [activityOpen, setActivityOpen] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [activityBusy, setActivityBusy] = useState(false);
  const [activityToast, setActivityToast] = useState("");

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
      if (typeof data.fitness === "number") setFitness(data.fitness);
      if (typeof data.happiness === "number") setHappiness(data.happiness);
      const arrivalMessage = travelMode === "TREK"
        ? `You trekked to ${data.currentArea}. +₦${Number(data.reward ?? 0).toLocaleString()} Game Naira · Fitness +2.`
        : travelMode === "PERSONAL_CAR"
          ? `You arrived in ${data.currentArea}. Fuel −${data.fuelUsed}; car condition −1.`
          : `You arrived in ${data.currentArea}. ${TRANSPORT_TYPES[travelMode].label} cost ₦${Number(data.cost).toLocaleString()}.`;
      setNotice(arrivalMessage);
      setActivityToast(arrivalMessage);
      setWorldScene("street");
      setView("world");
    } catch {
      setNotice("Could not connect to the transport system.");
    } finally {
      setTravelling(false);
    }
  }

  async function performActivity(activity: "walk" | "dance" | "eat" | "call_mummy" | "greet_neighbour") {
    if (activityBusy) return;
    setActivityBusy(true);
    setActivityToast("");
    try {
      const response = await fetch("/api/game/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activity }),
      });
      const data = await response.json();
      if (!response.ok) {
        setActivityToast(data.error ?? "That activity could not be completed.");
        return;
      }
      setBalance(BigInt(data.walletBalance));
      setNetWorth(BigInt(data.totalNetWorth));
      setFitness(data.fitness);
      setHealth(data.health);
      setHappiness(data.happiness);
      setAura(data.aura);
      setConnection(data.connectLevel);
      const rewardText = data.reward > 0 ? ` +₦${Number(data.reward).toLocaleString()} Game Naira.` : "";
      const costText = data.cost > 0 ? ` −₦${Number(data.cost).toLocaleString()}.` : "";
      const message = `${data.message}${rewardText}${costText}`;
      setActivityToast(message);
      setNotice(message);
    } catch {
      setActivityToast("Could not connect to the activities service.");
    } finally {
      setActivityBusy(false);
    }
  }

  if (view === "world") {
    return (
      <main className="relative h-[100dvh] w-screen overflow-hidden bg-sky-200 text-slate-950">
        <div className="absolute inset-0">
          <WorldHome
            sceneId={player.background === "rich" ? "guzape_mansion_v1" : player.homeSceneId}
            look={{ gender: player.gender, skinTone: player.skinTone, hairstyle: player.hairstyle, hairColor: player.hairColor, outfitTop: player.outfitTop, outfitBottom: player.outfitBottom, outfitShoes: player.outfitShoes, heightCm: player.heightCm, background: player.background }}
            immersive
            worldScene={worldScene}
            area={currentArea}
          />
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center px-3">
          <div className="pointer-events-auto flex max-w-full items-center gap-3 rounded-full border border-white/70 bg-white/90 px-4 py-2 shadow-lg backdrop-blur-xl sm:gap-4 sm:px-6">
            <div className="hidden text-sm font-bold sm:block">{currentArea} · Abuja</div>
            <span className="hidden h-5 w-px bg-slate-200 sm:block" />
            <span className="text-xs font-semibold text-slate-600">Mood</span>
            <span className="text-sm font-black text-emerald-600">{happiness >= 80 ? "Very Happy" : happiness >= 55 ? "Good" : "Low"}</span>
            <span className="hidden h-5 w-px bg-slate-200 sm:block" />
            <span className="text-xs font-semibold text-slate-500">Fitness {fitness}</span>
            <span className="hidden h-5 w-px bg-slate-200 sm:block" />
            <span className="whitespace-nowrap text-sm font-black">₦{cash}</span>
            <button onClick={() => setActivityOpen(true)} className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-lg font-black text-white shadow-sm" aria-label="Open activities">+</button>
          </div>
        </div>

        <div className="absolute left-3 top-20 flex max-w-[185px] flex-col gap-2 sm:left-4 sm:max-w-[225px]">
          <button onClick={() => performActivity("eat")} disabled={activityBusy} className="rounded-2xl border border-white/80 bg-white/90 p-3 text-left shadow-lg backdrop-blur transition hover:bg-white disabled:opacity-60">
            <span className="block text-xs font-black">Eat something</span>
            <span className="mt-1 block text-[11px] text-slate-500">Meal costs ₦180 · restores health</span>
          </button>
          <div className="rounded-2xl border border-white/80 bg-white/90 p-3 shadow-lg backdrop-blur">
            <div className="mb-2 flex items-center justify-between text-[11px] font-bold"><span>Health</span><span>{health}/100</span></div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-rose-500 transition-all" style={{ width: `${health}%` }} /></div>
            <div className="mb-2 mt-3 flex items-center justify-between text-[11px] font-bold"><span>Fitness</span><span>{fitness}/100</span></div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${fitness}%` }} /></div>
            <div className="mb-2 mt-3 flex items-center justify-between text-[11px] font-bold"><span>Happiness</span><span>{happiness}/100</span></div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${happiness}%` }} /></div>
          </div>
        </div>

        <div className="absolute right-3 top-20 flex flex-col items-end gap-2 sm:right-4">
          <div className="rounded-xl border border-white/70 bg-white/85 px-3 py-2 text-right shadow-md backdrop-blur">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Character</p>
            <p className="text-xs font-black">{player.displayName}</p>
            <p className="text-[10px] text-slate-500">Aura {aura} · Connection {connection}</p>
          </div>
          <button onClick={() => {
            if (worldScene === "home") setWorldScene("street");
            else if (currentArea === player.homeArea) setWorldScene("home");
            else openView("map");
          }} className="rounded-xl bg-slate-950/90 px-3 py-2 text-xs font-black text-white shadow-lg transition hover:bg-slate-800">
            {worldScene === "home" ? "Step outside →" : currentArea === player.homeArea ? "← Enter home" : "Choose destination"}
          </button>
        </div>

        {activityToast && <div role="status" className="absolute left-1/2 top-[86px] z-30 flex w-[min(92vw,460px)] -translate-x-1/2 items-start justify-between gap-3 rounded-2xl border border-emerald-200 bg-white/95 px-4 py-3 text-sm font-semibold text-slate-800 shadow-xl backdrop-blur">
          <span>{activityToast}</span><button onClick={() => setActivityToast("")} aria-label="Dismiss notification" className="rounded-full p-1 text-slate-400 hover:bg-slate-100"><X size={15} /></button>
        </div>}

        {activityOpen && <div className="absolute inset-0 z-40 flex items-end justify-center bg-slate-950/30 p-3 pb-24 backdrop-blur-[2px] sm:items-center sm:pb-3" onClick={() => setActivityOpen(false)}>
          <section className="max-h-[72dvh] w-full max-w-xl overflow-y-auto rounded-[28px] border border-white/80 bg-white p-5 shadow-2xl sm:p-6" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Daily life</p><h2 className="mt-1 text-xl font-black">What should you do?</h2></div><button onClick={() => setActivityOpen(false)} aria-label="Close activities" className="rounded-full bg-slate-100 p-2"><X size={18} /></button></div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { id: "walk", label: "Take a walk", detail: "Fitness +2 · Earn ₦25", icon: "WALK" },
                { id: "dance", label: "Dance to Afrobeats", detail: "Fitness +3 · Mood +4 · Earn ₦50", icon: "DANCE" },
                { id: "eat", label: "Eat something", detail: "Health +8 · Costs ₦180", icon: "MEAL" },
                { id: "greet_neighbour", label: "Greet a neighbour", detail: "Connection +1 · Earn ₦10", icon: "SOCIAL" },
                { id: "call_mummy", label: "Call Mummy", detail: "Family call · Mood +4", icon: "CALL" },
              ].map((item) => <button key={item.id} disabled={activityBusy} onClick={() => void performActivity(item.id as "walk" | "dance" | "eat" | "call_mummy" | "greet_neighbour")} className="rounded-2xl border border-slate-200 p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50 disabled:opacity-60"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-[10px] font-black text-slate-600">{item.icon}</span><span className="mt-3 block text-sm font-black">{item.label}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{item.detail}</span></button>)}
            </div>
            {activityBusy && <p className="mt-4 text-xs font-semibold text-slate-500">Saving activity...</p>}
            {activityToast && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{activityToast}</p>}
          </section>
        </div>}

        {phoneOpen && <div className="absolute inset-0 z-40 flex items-end justify-center bg-slate-950/30 p-3 pb-24 backdrop-blur-[2px] sm:items-center sm:pb-3" onClick={() => setPhoneOpen(false)}>
          <section className="w-full max-w-sm rounded-[28px] border border-white/80 bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">In-game phone</p><h2 className="mt-1 text-xl font-black">Phone</h2></div><button onClick={() => setPhoneOpen(false)} aria-label="Close phone" className="rounded-full bg-slate-100 p-2"><X size={18} /></button></div>
            <div className="mt-4 space-y-2">
              <button onClick={() => void performActivity("call_mummy")} disabled={activityBusy} className="flex w-full items-center gap-3 rounded-2xl bg-slate-50 p-4 text-left hover:bg-emerald-50"><PhoneCall className="text-emerald-600" size={20} /><span><span className="block text-sm font-black">Call Mummy</span><span className="block text-xs text-slate-500">Family contact · in-game only</span></span></button>
              <button onClick={() => { setPhoneOpen(false); openView("map"); }} className="flex w-full items-center gap-3 rounded-2xl bg-slate-50 p-4 text-left hover:bg-blue-50"><Map className="text-blue-600" size={20} /><span><span className="block text-sm font-black">Find a place</span><span className="block text-xs text-slate-500">Open Abuja destinations</span></span></button>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">Phone features are added only when the action is connected to game state. Calls do not reach real-world phone numbers.</p>
          </section>
        </div>}

        <nav className="absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-white/80 bg-white/95 p-1.5 shadow-xl backdrop-blur">
          <button onClick={() => { setWorldScene("home"); setActivityOpen(false); setPhoneOpen(false); }} className="flex min-w-[68px] flex-col items-center gap-1 rounded-xl bg-slate-900 px-4 py-2 text-white"><Home size={18} /><span className="text-[10px] font-bold">Home</span></button>
          <button onClick={() => { setActivityOpen(false); setPhoneOpen(false); openView("map"); }} className="flex min-w-[68px] flex-col items-center gap-1 rounded-xl px-4 py-2 text-slate-600 hover:bg-slate-100"><Map size={18} /><span className="text-[10px] font-bold">Map</span></button>
          <button onClick={() => { setPhoneOpen(true); setActivityOpen(false); }} className="flex min-w-[68px] flex-col items-center gap-1 rounded-xl px-4 py-2 text-slate-600 hover:bg-slate-100"><Smartphone size={18} /><span className="text-[10px] font-bold">Phone</span></button>
          <button onClick={() => { setActivityOpen(true); setPhoneOpen(false); }} className="flex min-w-[68px] flex-col items-center gap-1 rounded-xl px-4 py-2 text-slate-600 hover:bg-slate-100"><Activity size={18} /><span className="text-[10px] font-bold">Activities</span></button>
        </nav>
        <div className="pointer-events-none absolute bottom-4 left-3 hidden rounded-xl border border-white/80 bg-white/85 px-3 py-2 text-[11px] font-semibold text-slate-600 shadow sm:block">WASD / arrow keys to move</div>
      </main>
    );
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

      {menuOpen && <div className="border-b border-slate-200 bg-white p-4 lg:hidden"><div className="grid grid-cols-2 gap-2">{["World","Map","Jobs","Property","Vehicles","Bank","Politics","Profile"].map((item) => <button key={item} onClick={() => { openView(item.toLowerCase()); setMenuOpen(false); }} className="rounded-xl border border-slate-200 p-3 text-left text-sm font-bold">{item}</button>)}</div></div>}

      <div className="mx-auto grid max-w-[1500px] gap-5 p-4 sm:p-6 lg:grid-cols-[240px_1fr_300px]">
        <aside className="hidden rounded-2xl border border-slate-200 bg-white p-4 lg:block">
          <p className="px-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">City menu</p>
          <div className="mt-3 space-y-1">{[["world","World",Home],["map","Map",Map],["jobs","Jobs",Banknote],["property","Property",Home],["vehicles","Vehicles",Car],["bank","Bank",Wallet],["politics","Politics",Users],["profile","Profile",Shield]].map(([id,label,Icon]) => <button key={String(id)} onClick={() => openView(String(id))} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold ${view === id ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"}`}><Icon size={17} />{String(label)}</button>)}</div>
          <div className="mt-8 rounded-2xl bg-slate-950 p-4 text-white"><p className="text-xs font-bold text-blue-300">CURRENT AREA</p><p className="mt-1 text-xl font-black">{currentArea}</p><p className="mt-1 text-xs font-semibold text-blue-300">{travelling ? "Travelling..." : `${TRANSPORT_TYPES[travelMode].label} selected`}</p><p className="mt-2 text-xs leading-5 text-slate-400">{areas.find(a => a.name === currentArea)?.note ?? "Your current location"}</p></div>
        </aside>

        <section className="min-w-0">
          {notice && <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">{notice}</div>}

          {view === "world" && <WorldHome sceneId={player.background === "rich" ? "guzape_mansion_v1" : player.homeSceneId} look={{ gender: player.gender, skinTone: player.skinTone, hairstyle: player.hairstyle, hairColor: player.hairColor, outfitTop: player.outfitTop, outfitBottom: player.outfitBottom, outfitShoes: player.outfitShoes, heightCm: player.heightCm, background: player.background }} />}

          {view === "map" && <div className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Abuja / FCT</p><h1 className="mt-2 text-3xl font-black tracking-tight">Your city is open.</h1><p className="mt-2 text-sm text-slate-500">Choose an area and transport mode. Trips are charged and saved on the server.</p></div><div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold"><Map size={16} className="text-blue-600" /> {currentArea}</div></div>
              <div className="mt-5 flex flex-wrap gap-2">
                {(Object.entries(TRANSPORT_TYPES).filter(([key]) => key !== "ONE_CHANCE") as [TravelMode, { label: string; baseCost: number }][]).map(([mode, transport]) => (
                  <button key={mode} onClick={() => setTravelMode(mode)} disabled={travelling || (mode === "PERSONAL_CAR" && !player.hasVehicle)} className={`rounded-xl border px-3 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40 ${travelMode === mode ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600"}`}>
                    {transport.label} <span className="ml-1 font-normal text-slate-400">{mode === "PERSONAL_CAR" && !player.hasVehicle ? "buy a car first" : mode === "TREK" || mode === "PERSONAL_CAR" ? "free" : `from ₦${transport.baseCost.toLocaleString()}`}</span>
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
          {view === "vehicles" && <VehiclePanel onUpdate={(data) => { setBalance(BigInt(data.walletBalance)); setNetWorth(BigInt(data.totalNetWorth)); setNotice(data.message); }} />}\n          {view === "bank" && <BankPanel onUpdate={(b, message) => { setBalance(BigInt(b.walletBalance)); setNetWorth(BigInt(b.totalNetWorth)); setNotice(message); }} />}
          {view === "property" && <PropertyPanel onUpdate={(data) => { setBalance(BigInt(data.walletBalance)); setNetWorth(BigInt(data.netWorth)); setCurrentArea(data.housing.currentArea); setNotice(data.message); }} />}
          {view !== "world" && view !== "map" && view !== "jobs" && view !== "property" && view !== "bank" && view !== "vehicles" && <div className="rounded-3xl border border-slate-200 bg-white p-7"><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">{view}</p><h1 className="mt-2 text-3xl font-black capitalize">{view} is coming into the playable economy.</h1><p className="mt-4 max-w-2xl leading-7 text-slate-600">The dashboard shell is ready. This section will be connected to its server-authoritative game actions in the next build stages.</p></div>}
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

      <nav className="fixed bottom-3 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-white/80 bg-white/95 p-1.5 shadow-xl backdrop-blur">
        <button onClick={() => openView("world")} className="flex min-w-[70px] flex-col items-center gap-1 rounded-xl px-4 py-2 text-slate-600 hover:bg-slate-100"><Home size={18} /><span className="text-[10px] font-bold">Home</span></button>
        <button onClick={() => openView("map")} className={`flex min-w-[70px] flex-col items-center gap-1 rounded-xl px-4 py-2 ${view === "map" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}><Map size={18} /><span className="text-[10px] font-bold">Map</span></button>
        <button onClick={() => setPhoneOpen(true)} className="flex min-w-[70px] flex-col items-center gap-1 rounded-xl px-4 py-2 text-slate-600 hover:bg-slate-100"><Smartphone size={18} /><span className="text-[10px] font-bold">Phone</span></button>
      </nav>

      {phoneOpen && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/30 p-3 pb-24 backdrop-blur-[2px] sm:items-center sm:pb-3" onClick={() => setPhoneOpen(false)}>
        <section className="w-full max-w-sm rounded-[28px] border border-white/80 bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
          <div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">In-game phone</p><h2 className="mt-1 text-xl font-black">Phone</h2></div><button onClick={() => setPhoneOpen(false)} aria-label="Close phone" className="rounded-full bg-slate-100 p-2"><X size={18} /></button></div>
          <div className="mt-4 space-y-2">
            <button onClick={() => void performActivity("call_mummy")} disabled={activityBusy} className="flex w-full items-center gap-3 rounded-2xl bg-slate-50 p-4 text-left hover:bg-emerald-50"><PhoneCall className="text-emerald-600" size={20} /><span><span className="block text-sm font-black">Call Mummy</span><span className="block text-xs text-slate-500">Family contact · in-game only</span></span></button>
            <button onClick={() => { setPhoneOpen(false); openView("map"); }} className="flex w-full items-center gap-3 rounded-2xl bg-slate-50 p-4 text-left hover:bg-blue-50"><Map className="text-blue-600" size={20} /><span><span className="block text-sm font-black">Find a place</span><span className="block text-xs text-slate-500">Open Abuja destinations</span></span></button>
          </div>
          {activityToast && <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{activityToast}</p>}
          <p className="mt-4 text-xs leading-5 text-slate-500">Phone features are added only when connected to game state. Calls are in-game only.</p>
        </section>
      </div>}
    </main>
  );
}
