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
  shiftsCompleted: number;
  performanceScore: number;
  hasVehicle: boolean;
  vehicleName: string | null;
  vehicleType: string | null;
  vehicleFuel: number;
  vehicleCondition: number;
  vehicleValue: string;
};

const areas = [
  { name: "Nyanya", tier: "Hustle", note: "Affordable start", color: "bg-emerald-500" },
  { name: "Mararaba", tier: "Hustle", note: "Busy edge-of-city corridor", color: "bg-orange-500" },
  { name: "Lugbe", tier: "Growing", note: "Residential and airport road", color: "bg-amber-500" },
  { name: "Mpape", tier: "Growing", note: "Hillside neighbourhood", color: "bg-orange-500" },
  { name: "Kubwa", tier: "Mid-level", note: "Big estate life", color: "bg-blue-500" },
  { name: "Gwarinpa", tier: "Mid-level", note: "Estate & families", color: "bg-blue-500" },
  { name: "Garki", tier: "City district", note: "Offices, shops and services", color: "bg-amber-500" },
  { name: "Wuye", tier: "Mid-level", note: "Residential and business", color: "bg-cyan-500" },
  { name: "Jabi", tier: "Comfortable", note: "Lake & leisure", color: "bg-cyan-500" },
  { name: "Wuse 2", tier: "Premium", note: "Business & nightlife", color: "bg-violet-500" },
  { name: "Central Area", tier: "Power", note: "CBD & institutions", color: "bg-amber-500" },
  { name: "Guzape", tier: "Elite", note: "Quiet & upscale", color: "bg-indigo-500" },
  { name: "Asokoro", tier: "Elite", note: "Diplomatic and landmark district", color: "bg-rose-500" },
  { name: "Maitama", tier: "Elite", note: "Embassies & power", color: "bg-rose-500" },
];

const pointDestinations = [
  { name: "Abuja National Mosque", area: "Central Area", type: "Mosque", description: "Courtyard, prayer hall and community activities" },
  { name: "National Assembly", area: "Central Area", type: "Government", description: "The National Assembly complex" },
  { name: "City Gate", area: "Central Area", type: "Landmark", description: "The city entrance landmark" },
  { name: "Aminu Kano Crescent", area: "Wuse 2", type: "Street", description: "Restaurants, shops and evening city life" },
  { name: "Jabi Lake", area: "Jabi", type: "Leisure", description: "Lakefront walks and relaxation" },
  { name: "Wuse Market", area: "Wuse 2", type: "Market", description: "Everyday shopping and street activity" },
  { name: "Aso Rock", area: "Asokoro", type: "Landmark", description: "Rock landmark and surrounding district" },
  { name: "Millennium Park", area: "Maitama", type: "Park", description: "Green space and walking paths" },
  { name: "Berger Junction", area: "Garki", type: "Transport hub", description: "A busy transport interchange" },
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
  const [jobs, setJobs] = useState<Array<{ title: string; category: string; location: string; venue?: string; requiredArea?: string | null; opensAt?: number | null; commissionBased?: boolean; payPerShift: number; shiftHours: number; minHustle?: number; minIntelligence?: number; minConnect?: number; requiresVehicle?: boolean }>>([]);
  const [jobLoading, setJobLoading] = useState(false);
  const [jobNotice, setJobNotice] = useState("");
  const [activeJob, setActiveJob] = useState(player.currentJob);
  const [shiftsCompleted, setShiftsCompleted] = useState(player.shiftsCompleted);
  const [performanceScore, setPerformanceScore] = useState(player.performanceScore);
  const [fitness, setFitness] = useState(player.fitness);
  const [health, setHealth] = useState(player.health);
  const [happiness, setHappiness] = useState(player.happiness);
  const [aura, setAura] = useState(player.aura);
  const [connection, setConnection] = useState(player.connectLevel);
  const [hasVehicle, setHasVehicle] = useState(player.hasVehicle);
  const [vehicleFuel, setVehicleFuel] = useState(player.vehicleFuel);
  const [worldScene, setWorldScene] = useState<"home" | "street" | "mosque">("home");
  const [mapOpen, setMapOpen] = useState(false);
  const [currentPoi, setCurrentPoi] = useState<string | null>(null);
  const [journeyMessage, setJourneyMessage] = useState<string | null>(null);
  const [activityOpen, setActivityOpen] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [activityBusy, setActivityBusy] = useState(false);
  const [activityToast, setActivityToast] = useState("");
  const [selectedNpc, setSelectedNpc] = useState<{ name: string; role: string; x: number; z: number } | null>(null);
  const [npcHistory, setNpcHistory] = useState<{ greetings: number; lastSeenAt: string } | null>(null);
  const [savedContacts, setSavedContacts] = useState<Array<{ name: string; greetings: number; lastSeenAt: string }>>([]);
  const [contactsLoading, setContactsLoading] = useState(false);

  useEffect(() => {
    if (!selectedNpc) {
      setNpcHistory(null);
      return;
    }
    let active = true;
    setNpcHistory(null);
    fetch("/api/game/social")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Contacts unavailable")))
      .then((data: { contacts?: Array<{ name: string; greetings: number; lastSeenAt: string }> }) => {
        if (!active) return;
        const contact = data.contacts?.find((item) => item.name === selectedNpc.name);
        setNpcHistory(contact ? { greetings: contact.greetings, lastSeenAt: contact.lastSeenAt } : { greetings: 0, lastSeenAt: "" });
      })
      .catch(() => { if (active) setNpcHistory({ greetings: 0, lastSeenAt: "" }); });
    return () => { active = false; };
  }, [selectedNpc?.name]);

  useEffect(() => {
    if (!phoneOpen) return;
    let active = true;
    setContactsLoading(true);
    fetch("/api/game/social")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Contacts unavailable")))
      .then((data: { contacts?: Array<{ name: string; greetings: number; lastSeenAt: string }> }) => {
        if (active) setSavedContacts(data.contacts ?? []);
      })
      .catch(() => { if (active) setSavedContacts([]); })
      .finally(() => { if (active) setContactsLoading(false); });
    return () => { active = false; };
  }, [phoneOpen]);

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
        setShiftsCompleted(data.shiftsCompleted);
        setPerformanceScore(data.performanceScore);
        setJobNotice(`${data.message} Career performance +${data.performanceGain}.`);
      } else {
        setJobNotice(data.error ?? "Could not complete shift.");
        if (data.requiredArea) setJobNotice(data.error + " Use the Map to travel there, then return to Jobs.");
      }
    } catch {
      setJobNotice("Could not connect to the jobs system.");
    } finally {
      setJobLoading(false);
    }
  }

  async function travel(area: string, pointOfInterest?: string) {
    if ((area === currentArea && !pointOfInterest) || travelling) return;
    setTravelling(true);
    const destinationLabel = pointOfInterest ?? area;
    setNotice(`Planning your trip to ${destinationLabel}...`);
    setJourneyMessage(`On the way to ${destinationLabel}...`);
    setMapOpen(false);

    try {
      // Moving between nearby landmarks in the same district does not charge a second area fare.
      if (pointOfInterest && area === currentArea) {
        await new Promise<void>((resolve) => window.setTimeout(resolve, 1350));
        setCurrentPoi(pointOfInterest);
        setWorldScene(pointOfInterest === "Abuja National Mosque" ? "mosque" : "street");
        setView("world");
        const message = `You arrived at ${destinationLabel}. Click the ground to move, or use WASD / arrow keys.`;
        setNotice(message);
        setActivityToast(message);
        setJourneyMessage(null);
        return;
      }

      const response = await fetch("/api/game/travel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination: area, mode: travelMode }),
      });
      const data = await response.json();

      if (!response.ok) {
        setNotice(data.error ?? "Travel failed.");
        setJourneyMessage(null);
        setMapOpen(true);
        return;
      }

      // Keep the route transition short and visible instead of switching scenes instantly.
      await new Promise<void>((resolve) => window.setTimeout(resolve, 1350));
      setCurrentArea(data.currentArea);
      setBalance(BigInt(data.walletBalance));
      setNetWorth(BigInt(data.totalNetWorth));
      if (typeof data.fitness === "number") setFitness(data.fitness);
      if (typeof data.happiness === "number") setHappiness(data.happiness);
      if (typeof data.vehicleFuel === "number") setVehicleFuel(data.vehicleFuel);
      const arrivalMessage = travelMode === "TREK"
        ? `You trekked to ${destinationLabel}. +₦${Number(data.reward ?? 0).toLocaleString()} Game Naira · Fitness +2.`
        : travelMode === "PERSONAL_CAR"
          ? `You arrived at ${destinationLabel}. Fuel −${data.fuelUsed}; car condition −1.`
          : `You arrived at ${destinationLabel}. ${TRANSPORT_TYPES[travelMode].label} cost ₦${Number(data.cost).toLocaleString()}.`;
      setCurrentPoi(pointOfInterest ?? null);
      setWorldScene(pointOfInterest === "Abuja National Mosque" ? "mosque" : "street");
      setView("world");
      setNotice(`${arrivalMessage} Click the ground to move, or use WASD / arrow keys.`);
      setActivityToast(arrivalMessage);
      setJourneyMessage(null);
    } catch {
      setNotice("Could not connect to the transport system.");
      setJourneyMessage(null);
      setMapOpen(true);
    } finally {
      setTravelling(false);
    }
  }

  async function performActivity(activity: "walk" | "dance" | "eat" | "call_mummy" | "greet_neighbour" | "pray_salah" | "perform_wudu" | "read_quran" | "give_sadaqah", targetName?: string) {
    if (activityBusy) return;
    setActivityBusy(true);
    setActivityToast("");
    try {
      const response = await fetch("/api/game/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activity, ...(targetName ? { targetName } : {}) }),
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
            key={`${worldScene}:${currentArea}`}
            sceneId={player.background === "rich" ? "guzape_mansion_v1" : player.homeSceneId}
            look={{ gender: player.gender, skinTone: player.skinTone, hairstyle: player.hairstyle, hairColor: player.hairColor, outfitTop: player.outfitTop, outfitBottom: player.outfitBottom, outfitShoes: player.outfitShoes, heightCm: player.heightCm, background: player.background }}
            immersive
            worldScene={worldScene}
            area={currentArea}
            onNpcSelect={(npc) => { setSelectedNpc(npc); setMapOpen(false); }}
          />
        </div>

        <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex flex-wrap items-start justify-between gap-2 sm:inset-x-5 sm:top-5">
          <div className="pointer-events-auto max-w-[55vw] rounded-2xl border border-white/15 bg-slate-950/80 px-3 py-2.5 text-white shadow-2xl backdrop-blur-xl sm:max-w-sm sm:px-4">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-emerald-300">ABUJA LIFE <span className="text-white/40">/ LIVE WORLD</span></p>
            <p className="mt-0.5 truncate text-sm font-black sm:text-base">{currentPoi ?? currentArea}</p>
            <p className="mt-0.5 text-[10px] text-slate-300">{worldScene === "home" ? "Home" : worldScene === "mosque" ? "Mosque courtyard" : "Abuja, FCT"} · {travelling ? "On the move…" : "Free roam"}</p>
          </div>
          <div className="pointer-events-auto flex max-w-[72vw] items-center gap-2 rounded-2xl border border-white/15 bg-slate-950/80 px-2.5 py-2 text-white shadow-2xl backdrop-blur-xl sm:gap-4 sm:px-4">
            <div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Mood</p><p className="text-xs font-black text-emerald-300 sm:text-sm">{happiness >= 80 ? "Very Happy" : happiness >= 55 ? "Good" : "Low"}</p></div>
            <span className="h-7 w-px bg-white/15" />
            <div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Fitness</p><p className="text-xs font-black sm:text-sm">{fitness}/100</p></div>
            <span className="h-7 w-px bg-white/15" />
            <div><p className="text-[9px] font-bold uppercase tracking-wider text-amber-300">Wallet</p><p className="whitespace-nowrap text-xs font-black sm:text-sm">₦{cash}</p></div>
            <button onClick={() => setActivityOpen(true)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-400 text-lg font-black text-slate-950 shadow-sm transition hover:bg-emerald-300" aria-label="Open activities">+</button>
          </div>
        </div>

        <div className="absolute left-3 top-20 flex max-w-[185px] flex-col gap-2 sm:left-4 sm:max-w-[225px]">
          <button onClick={() => performActivity("eat")} disabled={activityBusy} className="rounded-2xl border border-white/15 bg-slate-950/75 p-3 text-left text-white shadow-xl backdrop-blur transition hover:bg-slate-900 disabled:opacity-60">
            <span className="block text-xs font-black">Eat something</span>
            <span className="mt-1 block text-[11px] text-slate-300">Meal costs ₦180 · restores health</span>
          </button>
          <div className="rounded-2xl border border-white/15 bg-slate-950/75 p-3 text-white shadow-xl backdrop-blur">
            <div className="mb-2 flex items-center justify-between text-[11px] font-bold text-slate-200"><span>Health</span><span>{health}/100</span></div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-rose-500 transition-all" style={{ width: `${health}%` }} /></div>
            <div className="mb-2 mt-3 flex items-center justify-between text-[11px] font-bold text-slate-200"><span>Fitness</span><span>{fitness}/100</span></div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${fitness}%` }} /></div>
            <div className="mb-2 mt-3 flex items-center justify-between text-[11px] font-bold text-slate-200"><span>Happiness</span><span>{happiness}/100</span></div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${happiness}%` }} /></div>
          </div>
        </div>

        <div className="absolute right-3 top-20 flex flex-col items-end gap-2 sm:right-4">
          <div className="rounded-2xl border border-white/15 bg-slate-950/80 px-3 py-2.5 text-right text-white shadow-xl backdrop-blur">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">PLAYER</p>
            <p className="text-xs font-black">{player.displayName}</p>
            <p className="text-[10px] text-slate-300">Aura {aura} · Connection {connection}</p>{hasVehicle && <p className="mt-1 text-[10px] font-semibold text-emerald-300">Car fuel: {vehicleFuel} L</p>}
          </div>
          <button onClick={() => {
            if (worldScene === "home") {
              setWorldScene("street");
              setCurrentPoi(null);
            } else if (worldScene === "mosque") {
              setWorldScene("street");
              setCurrentPoi(null);
            } else if (currentArea === player.homeArea) {
              setWorldScene("home");
              setCurrentPoi(null);
            } else {
              setMapOpen(true);
            }
          }} className="rounded-xl border border-amber-300/40 bg-amber-300 px-3 py-2.5 text-xs font-black text-slate-950 shadow-xl transition hover:bg-amber-200">
            {worldScene === "home" ? "Step outside →" : worldScene === "mosque" ? "← Return to street" : currentArea === player.homeArea ? "← Enter home" : "Choose destination"}
          </button>
        </div>

        {worldScene === "mosque" && <div className="absolute left-3 top-[292px] z-20 w-[min(66vw,220px)] space-y-2 sm:left-4">
          <div className="rounded-xl border border-white/80 bg-white/90 p-3 shadow-lg backdrop-blur">
            <p className="text-xs font-black">Abuja National Mosque</p><p className="mt-1 text-[10px] text-slate-500">Courtyard activities</p>
            <div className="mt-2 space-y-1.5">
              <button onClick={() => void performActivity("pray_salah")} disabled={activityBusy} className="w-full rounded-lg bg-emerald-50 px-2.5 py-2 text-left text-[11px] font-bold text-emerald-900 hover:bg-emerald-100 disabled:opacity-50">Pray (Salah)</button>
              <button onClick={() => void performActivity("perform_wudu")} disabled={activityBusy} className="w-full rounded-lg bg-white px-2.5 py-2 text-left text-[11px] font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50">Perform ablution (Wudu)</button>
              <button onClick={() => void performActivity("read_quran")} disabled={activityBusy} className="w-full rounded-lg bg-white px-2.5 py-2 text-left text-[11px] font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50">Read the Quran</button>
              <button onClick={() => void performActivity("give_sadaqah")} disabled={activityBusy} className="w-full rounded-lg bg-white px-2.5 py-2 text-left text-[11px] font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50">Give Sadaqah · ₦100</button>
            </div>
          </div>
        </div>}

        {selectedNpc && <div className="absolute bottom-[92px] left-1/2 z-40 w-[min(92vw,380px)] -translate-x-1/2 sm:bottom-24">
          <section className="rounded-[24px] border border-white/20 bg-slate-950/95 p-4 text-white shadow-2xl backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400 text-sm font-black text-slate-950">{selectedNpc.name.split(" ").map(part => part[0]).slice(0, 2).join("")}</div>
                <div><p className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-300">Neighbourhood contact</p><h2 className="mt-0.5 text-base font-black">{selectedNpc.name}</h2><p className="text-xs text-slate-400">{selectedNpc.role} · {currentArea}</p></div>
              </div>
              <button onClick={() => setSelectedNpc(null)} aria-label="Close conversation" className="rounded-full bg-white/10 p-2 text-slate-300 hover:bg-white/20"><X size={16} /></button>
            </div>
            <p className="mt-3 rounded-xl bg-white/5 p-3 text-xs leading-5 text-slate-200">“{selectedNpc.role === "Shop owner" ? "Welcome. If you need provisions, there are a few good shops around here." : selectedNpc.role === "University student" ? "I'm trying to balance classes and life in Abuja. Have you explored the area yet?" : selectedNpc.role === "Neighbour" ? "This neighbourhood has its own rhythm. You will get to know familiar faces soon." : selectedNpc.role === "Ride-hailing driver" ? "Traffic changes quickly around Abuja. Plan your trip before the rush gets worse." : selectedNpc.role === "Office worker" ? "The workday moves fast here. I try to find time to enjoy the city too." : selectedNpc.role === "Local trader" ? "Business is all about knowing people and showing up consistently." : selectedNpc.role === "Creative freelancer" ? "There are always new ideas and people to meet around the city." : selectedNpc.role === "Community volunteer" ? "A good neighbourhood starts when people look out for each other." : "It is good to see you. May your day go well."}”</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={() => { void performActivity("greet_neighbour", selectedNpc.name); setSelectedNpc(null); }} disabled={activityBusy} className="rounded-xl bg-emerald-400 px-3 py-2.5 text-xs font-black text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50">{activityBusy ? "Saving…" : "Say hello"}</button>
              <button onClick={() => { setNotice(`${selectedNpc.name}: “${currentArea} has its own rhythm. Take your time and get to know the area.”`); setSelectedNpc(null); }} className="rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-white/15">Ask about the area</button>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Relationship</p><p className="mt-0.5 text-xs font-black text-amber-200">{npcHistory === null ? "Checking history…" : npcHistory.greetings === 0 ? "New face" : npcHistory.greetings < 3 ? "Familiar face" : "Known neighbour"}</p></div>
              <p className="text-right text-[10px] text-slate-400">{npcHistory && npcHistory.greetings > 0 ? `${npcHistory.greetings} saved greeting${npcHistory.greetings === 1 ? "" : "s"}` : "Start building trust"}</p>
            </div>
            <p className="mt-2 text-[10px] text-slate-500">Your greetings are saved, so familiar residents stay familiar when you return.</p>
          </section>
        </div>}

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

        {journeyMessage && <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#cfe0e9]/95 px-5 text-slate-950">
          <div className="w-full max-w-sm text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg"><Car size={28} className="text-emerald-700" /></div>
            <p className="mt-5 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700">Abuja Life · Journey</p>
            <h2 className="mt-2 text-2xl font-black">{journeyMessage}</h2>
            <p className="mt-2 text-sm text-slate-600">Leaving the current location and arriving in the next scene.</p>
            <div className="mx-auto mt-6 flex h-12 max-w-[230px] items-center justify-center gap-3 overflow-hidden rounded-full bg-white px-4 shadow-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-600" /><span className="h-1 w-16 rounded-full bg-slate-200" /><Car size={20} className="animate-pulse text-slate-700" /><span className="h-1 w-16 rounded-full bg-slate-200" /><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-600" />
            </div>
          </div>
        </div>}

        {mapOpen && <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-sm sm:p-6" onClick={() => setMapOpen(false)}>
          <section className="max-h-[88dvh] w-full max-w-5xl overflow-y-auto rounded-[28px] border border-white/70 bg-[#f3f7f5] p-4 text-slate-950 shadow-2xl sm:p-6" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Abuja / FCT · In-game map</p><h2 className="mt-1 text-2xl font-black sm:text-3xl">Where to next?</h2><p className="mt-1 text-sm text-slate-500">Choose a district or a landmark. Your world stays behind this panel.</p></div>
              <button onClick={() => setMapOpen(false)} aria-label="Close map" className="rounded-full bg-white p-2 shadow-sm"><X size={18} /></button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(Object.entries(TRANSPORT_TYPES).filter(([key]) => key !== "ONE_CHANCE") as [TravelMode, { label: string; baseCost: number }][]).map(([mode, transport]) => (
                <button key={mode} onClick={() => setTravelMode(mode)} disabled={travelling || (mode === "PERSONAL_CAR" && !hasVehicle)} className={`rounded-full border px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${travelMode === mode ? "border-emerald-700 bg-emerald-700 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-emerald-400"}`}>
                  {transport.label} <span className={travelMode === mode ? "text-emerald-100" : "text-slate-400"}>{mode === "PERSONAL_CAR" && !hasVehicle ? "buy a car first" : mode === "TREK" || mode === "PERSONAL_CAR" ? "free" : `from ₦${transport.baseCost.toLocaleString()}`}</span>
                </button>
              ))}
            </div>
            <div className="relative mt-5 overflow-hidden rounded-2xl border border-emerald-100 bg-[#dcebd8] p-3 sm:p-4">
              <div className="pointer-events-none absolute inset-0 opacity-50" style={{ backgroundImage: "linear-gradient(26deg, transparent 46%, #a4b9a4 47%, #a4b9a4 50%, transparent 51%), linear-gradient(90deg, transparent 46%, #f8f7ec 47%, #f8f7ec 51%, transparent 52%), linear-gradient(#a6c3a5 1px, transparent 1px), linear-gradient(90deg, #a6c3a5 1px, transparent 1px)", backgroundSize: "220px 150px, 260px 180px, 36px 36px, 36px 36px" }} />
              <div className="relative grid grid-cols-2 gap-2 sm:grid-cols-4">
                {areas.map((area) => <button key={area.name} onClick={() => void travel(area.name)} disabled={travelling || area.name === currentArea} className={`flex min-h-24 flex-col justify-between rounded-xl border bg-white/95 p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-default disabled:opacity-70 ${area.name === currentArea ? "border-emerald-600 ring-2 ring-emerald-200" : "border-white"}`}>
                  <span className={`h-2.5 w-2.5 rounded-full ${area.color}`} />
                  <span><span className="block text-sm font-black">{area.name}</span><span className="mt-0.5 block text-[10px] font-semibold text-slate-500">{area.note}</span></span>
                  <span className="mt-2 text-[10px] font-bold text-emerald-700">{area.name === currentArea ? "You are here" : travelMode === "TREK" || travelMode === "PERSONAL_CAR" ? "Ready to go" : `₦${calculateTravelCost(currentArea, area.name, travelMode).toLocaleString()} · ${TRANSPORT_TYPES[travelMode].label}`}</span>
                </button>)}
              </div>
            </div>
            <div className="mt-5 flex items-end justify-between gap-3"><div><h3 className="text-sm font-black">Landmarks & places</h3><p className="mt-1 text-xs text-slate-500">These destinations route you to their district; the National Mosque opens a dedicated courtyard scene.</p></div><span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold text-slate-500">{pointDestinations.length} destinations</span></div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {pointDestinations.map((place) => <button key={place.name} onClick={() => void travel(place.area, place.name)} disabled={travelling} className={`rounded-xl border bg-white p-3 text-left transition hover:border-emerald-400 hover:shadow-sm ${currentPoi === place.name ? "border-emerald-600 ring-1 ring-emerald-200" : "border-slate-200"}`}>
                <div className="flex items-center justify-between gap-2"><span className="text-sm font-black">{place.name}</span><span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-800">{place.type}</span></div>
                <p className="mt-1 text-xs text-slate-500">{place.description}</p><p className="mt-2 text-[10px] font-bold text-slate-400">{place.area} · {place.name === "Abuja National Mosque" ? "Enter courtyard" : "Visit district"}</p>
              </button>)}
            </div>
            <p className="mt-4 text-[11px] text-slate-400">More districts, streets, buildings and enterable destinations can be added as the 3D city expands.</p>
          </section>
        </div>}

        {phoneOpen && <div className="absolute inset-0 z-40 flex items-end justify-center bg-slate-950/30 p-3 pb-24 backdrop-blur-[2px] sm:items-center sm:pb-3" onClick={() => setPhoneOpen(false)}>
          <section className="w-full max-w-sm rounded-[28px] border border-white/80 bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">In-game phone</p><h2 className="mt-1 text-xl font-black">Phone</h2></div><button onClick={() => setPhoneOpen(false)} aria-label="Close phone" className="rounded-full bg-slate-100 p-2"><X size={18} /></button></div>
            <div className="mt-4 space-y-2">
              <button onClick={() => void performActivity("call_mummy")} disabled={activityBusy} className="flex w-full items-center gap-3 rounded-2xl bg-slate-50 p-4 text-left hover:bg-emerald-50"><PhoneCall className="text-emerald-600" size={20} /><span><span className="block text-sm font-black">Call Mummy</span><span className="block text-xs text-slate-500">Family contact · in-game only</span></span></button>
              <button onClick={() => { setPhoneOpen(false); setMapOpen(true); }} className="flex w-full items-center gap-3 rounded-2xl bg-slate-50 p-4 text-left hover:bg-blue-50"><Map className="text-blue-600" size={20} /><span><span className="block text-sm font-black">Find a place</span><span className="block text-xs text-slate-500">Open Abuja destinations</span></span></button>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">Phone features are added only when the action is connected to game state. Calls do not reach real-world phone numbers.</p>
          </section>
        </div>}

        <nav aria-label="Life simulator controls" className="absolute bottom-3 left-1/2 z-30 flex max-w-[calc(100vw-20px)] -translate-x-1/2 items-center gap-1 rounded-[22px] border border-white/15 bg-slate-950/90 p-1.5 text-white shadow-2xl backdrop-blur-xl sm:bottom-5 sm:gap-2 sm:p-2">
          <button onClick={() => { setWorldScene(currentArea === player.homeArea ? "home" : "street"); setCurrentPoi(null); setMapOpen(false); setActivityOpen(false); setPhoneOpen(false); }} className="flex min-w-[61px] flex-col items-center gap-1 rounded-2xl bg-emerald-400 px-3 py-2 text-slate-950 transition hover:bg-emerald-300 sm:min-w-[76px] sm:px-4"><Home size={18} /><span className="text-[10px] font-black">World</span></button>
          <button onClick={() => { setActivityOpen(false); setPhoneOpen(false); setMapOpen(true); }} className="flex min-w-[61px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-slate-300 transition hover:bg-white/10 hover:text-white sm:min-w-[76px] sm:px-4"><Map size={18} /><span className="text-[10px] font-bold">Map</span></button>
          <button onClick={() => { setPhoneOpen(true); setActivityOpen(false); }} className="flex min-w-[61px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-slate-300 transition hover:bg-white/10 hover:text-white sm:min-w-[76px] sm:px-4"><Smartphone size={18} /><span className="text-[10px] font-bold">Phone</span></button>
          <button onClick={() => { setActivityOpen(true); setPhoneOpen(false); }} className="flex min-w-[61px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-slate-300 transition hover:bg-white/10 hover:text-white sm:min-w-[76px] sm:px-4"><Activity size={18} /><span className="text-[10px] font-bold">Activities</span></button>
        </nav>
        <div className="pointer-events-none absolute bottom-[86px] left-3 hidden rounded-xl border border-white/15 bg-slate-950/75 px-3 py-2 text-[11px] font-semibold text-white/80 shadow-lg backdrop-blur sm:bottom-5 sm:left-5 sm:block">W A S D <span className="text-white/40">/</span> Arrow keys <span className="text-white/40">·</span> Click ground to walk <span className="text-white/40">·</span> Tap residents to talk</div>
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
                  <button key={mode} onClick={() => setTravelMode(mode)} disabled={travelling || (mode === "PERSONAL_CAR" && !hasVehicle)} className={`rounded-xl border px-3 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40 ${travelMode === mode ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600"}`}>
                    {transport.label} <span className="ml-1 font-normal text-slate-400">{mode === "PERSONAL_CAR" && !hasVehicle ? "buy a car first" : mode === "TREK" || mode === "PERSONAL_CAR" ? "free" : `from ₦${transport.baseCost.toLocaleString()}`}</span>
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
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-950 p-4 text-white"><p className="text-[10px] font-bold uppercase tracking-wider text-blue-300">Shifts completed</p><p className="mt-1 text-2xl font-black">{shiftsCompleted}</p></div>
                <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-950"><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Career performance</p><p className="mt-1 text-2xl font-black">{performanceScore}</p></div>
                <div className="col-span-2 rounded-2xl border border-slate-200 p-4 sm:col-span-1"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Career tip</p><p className="mt-1 text-xs leading-5 text-slate-600">Each completed shift adds to your work record and improves your performance score.</p></div>
              </div>
              {jobNotice && <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">{jobNotice}</div>}
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {jobs.map((job) => <div key={job.title} className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-start justify-between gap-3"><div><p className="font-black">{job.title}</p><p className="mt-1 text-xs font-semibold text-slate-500">{job.location} · {job.venue ?? job.location}</p>{job.requiredArea && <p className="mt-1 text-xs font-semibold text-blue-700">Workplace: {job.requiredArea}</p>}<p className="mt-1 text-xs text-slate-500">{job.commissionBased ? "Commission-based earnings" : `${job.shiftHours}h shift`}{job.opensAt !== null && job.opensAt !== undefined ? ` · Opens ${String(job.opensAt).padStart(2, "0")}:00` : ""}</p></div><span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase text-emerald-700">{job.category}</span></div>
                  <p className="mt-4 text-xl font-black">{job.commissionBased ? "Commission" : `₦${job.payPerShift.toLocaleString()}`} {!job.commissionBased && <span className="text-xs font-semibold text-slate-400">/ shift</span>}</p>
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
          {view === "vehicles" && <VehiclePanel onUpdate={(data) => { setBalance(BigInt(data.walletBalance)); setNetWorth(BigInt(data.totalNetWorth)); setNotice(data.message); if (data.vehicle) { setHasVehicle(true); if (typeof data.vehicle.fuel === "number") setVehicleFuel(data.vehicle.fuel); } if (typeof data.vehicleFuel === "number") setVehicleFuel(data.vehicleFuel); }} />}\n          {view === "bank" && <BankPanel onUpdate={(b, message) => { setBalance(BigInt(b.walletBalance)); setNetWorth(BigInt(b.totalNetWorth)); setNotice(message); }} />}
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
          <div className="mt-5">
            <div className="flex items-center justify-between"><h3 className="text-sm font-black">Contacts</h3><span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{savedContacts.length} saved</span></div>
            {contactsLoading ? <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">Loading your connections…</p> : savedContacts.length ? <div className="mt-2 max-h-44 space-y-2 overflow-y-auto">{savedContacts.map((contact) => <div key={contact.name} className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-black text-emerald-800">{contact.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("")}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{contact.name}</p><p className="text-[11px] text-slate-500">{contact.greetings >= 5 ? "Known neighbour" : contact.greetings >= 2 ? "Familiar face" : "New face"} · {contact.greetings} {contact.greetings === 1 ? "greeting" : "greetings"}</p></div><span className="text-[10px] text-slate-400">{new Date(contact.lastSeenAt).toLocaleDateString()}</span></div>)}</div> : <p className="mt-2 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">Your contacts will appear here as you greet residents around Abuja.</p>}
          </div>
          {activityToast && <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{activityToast}</p>}
          <p className="mt-4 text-xs leading-5 text-slate-500">Calls and contacts are in-game only. Your contacts are saved from your interaction history.</p>
        </section>
      </div>}
    </main>
  );
}
