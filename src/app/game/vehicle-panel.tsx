"use client";

import { useEffect, useState } from "react";

type Vehicle = { id:string; name:string; type:string; price:number; tank:number; efficiency:number; maintenance:number; drivingRequired:number; aura:number };
type PlayerVehicle = { hasVehicle:boolean; vehicleType:string|null; vehicleName:string|null; vehicleFuel:number; vehicleCondition:number; vehicleValue:string; drivingSkill:number; walletBalance:string };

export default function VehiclePanel({ onUpdate }:{onUpdate:(data:any)=>void}) {
  const [vehicles,setVehicles]=useState<Vehicle[]>([]);
  const [player,setPlayer]=useState<PlayerVehicle|null>(null);
  const [loading,setLoading]=useState(true);
  const [notice,setNotice]=useState("");
  const [litres,setLitres]=useState("10");

  async function load(){setLoading(true);try{const r=await fetch("/api/game/vehicles");const d=await r.json();if(!r.ok)setNotice(d.error??"Could not load dealerships.");else{setVehicles(d.vehicles??[]);setPlayer(d.player);}}catch{setNotice("Could not connect to the vehicle market.");}finally{setLoading(false);}}
  useEffect(()=>{void load()},[]);

  async function action(path:string,body:any){setLoading(true);setNotice("");try{const r=await fetch(path,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)setNotice(d.error??"Vehicle action failed.");else{setNotice(d.message);onUpdate(d);await load();}}catch{setNotice("Could not connect to the vehicle system.");}finally{setLoading(false);}}

  return <div className="space-y-5">
    <div className="rounded-3xl border border-slate-200 bg-white p-7">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Abuja Motor Market</p>
      <h1 className="mt-2 text-3xl font-black">Get your own wheels.</h1>
      <p className="mt-2 text-sm text-slate-500">Ownership unlocks vehicle-based jobs and future driving/Drifters progression. All vehicle actions are verified on the server.</p>
      {notice&&<div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">{notice}</div>}
      {player?.hasVehicle ? <div className="mt-6 rounded-2xl bg-slate-950 p-6 text-white">
        <p className="text-xs font-bold uppercase tracking-wider text-blue-300">Owned Vehicle</p>
        <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h2 className="text-2xl font-black">{player.vehicleName}</h2><p className="text-sm text-slate-400">{player.vehicleType}</p></div><p className="text-2xl font-black">₦{Number(player.vehicleValue).toLocaleString()}</p></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-white/5 p-4"><p className="text-xs text-slate-400">Fuel</p><p className="mt-1 font-black">{player.vehicleFuel} L</p></div><div className="rounded-xl bg-white/5 p-4"><p className="text-xs text-slate-400">Condition</p><p className="mt-1 font-black">{player.vehicleCondition}%</p></div></div>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row"><input value={litres} onChange={e=>setLitres(e.target.value)} type="number" min="1" className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold text-white" /><button disabled={loading} onClick={()=>action("/api/game/vehicles/service",{action:"fuel",litres:Number(litres)})} className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-black">Buy Fuel</button><button disabled={loading} onClick={()=>action("/api/game/vehicles/service",{action:"maintain"})} className="rounded-xl border border-white/15 px-4 py-3 text-sm font-black">Service Vehicle</button></div>
      </div> : <div className="mt-6 grid gap-3 md:grid-cols-2">
        {vehicles.map(v=><div key={v.id} className="rounded-2xl border border-slate-200 p-5"><div className="flex items-start justify-between gap-3"><div><p className="font-black">{v.name}</p><p className="text-xs font-semibold text-slate-500">{v.type} · {v.tank}L tank</p></div><span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">+{v.aura} Aura</span></div><p className="mt-4 text-xl font-black">₦{v.price.toLocaleString()}</p><p className="mt-2 text-xs text-slate-500">Driving Skill {v.drivingRequired} · Maintenance ₦{v.maintenance.toLocaleString()} · ~{v.efficiency} km/L</p><button disabled={loading} onClick={()=>action("/api/game/vehicles/buy",{vehicleId:v.id})} className="mt-4 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white">Buy Vehicle</button></div>)}
      </div>}
    </div>
  </div>;
}
