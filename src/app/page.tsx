import { Map, Car, Building2, Fuel, ShieldCheck, Wallet, Users, ArrowRight, Compass, Landmark, Zap } from "lucide-react";

const birthRolls = [
  { name: "Rich Man Pikin", description: "Start with comfort, stronger connections and a head start in the capital.", examples: "Maitama • Asokoro • Guzape", accent: "border-blue-200 bg-blue-50" },
  { name: "Poor Man Pikin", description: "Start with less, but your hustle, street sense and ambition can take you anywhere.", examples: "Kubwa • Lugbe • Nyanya", accent: "border-emerald-200 bg-emerald-50" },
];

const transport = [
  ["Alone", "Charter a commercial car solo.", Car],
  ["Bus Stop", "Share a commercial car.", Map],
  ["Keke", "Tricycle transport around the city.", Car],
  ["Metro", "Use the Abuja light rail.", Zap],
  ["Bolt / inDrive", "Comfortable ride-hailing.", Compass],
  ["One Chance", "A danger event to avoid.", ShieldCheck],
] as const;

const world = [
  ["Landmarks", "Aso Rock, National Assembly, National Mosque, City Gate and more.", Landmark],
  ["Daily Places", "Markets, malls, hotels, restaurants, cinemas and recreation.", Building2],
  ["Essentials", "Fuel stations, hospitals, schools, banks and power infrastructure.", Fuel],
  ["Transport Hubs", "Berger, bus stops, stations, bridges and major junctions.", Map],
] as const;

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_right,_#dbeafe,_transparent_35%),linear-gradient(135deg,#ffffff_0%,#f8fbff_55%,#effcf5_100%)]">
        <div className="mx-auto max-w-7xl px-6 pb-20 pt-7 lg:px-8">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"><Map size={22} /></div>
              <div><div className="font-bold tracking-tight text-slate-950">Abuja Life</div><div className="text-xs font-medium text-slate-500">The Capital Has Levels</div></div>
            </div>
            <span className="rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-xs font-semibold text-blue-700">Abuja / FCT</span>
          </nav>

          <div className="grid items-center gap-12 pt-20 lg:grid-cols-[1.1fr_.9fr]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm"><Map size={15} /> A living map of the capital</div>
              <h1 className="max-w-4xl text-5xl font-black tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">The Capital Has <span className="text-emerald-600">Levels.</span></h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Build your life in a fictional Abuja. Choose your background, move through the city, work, earn Game Naira, find your place, build connections and climb your own level.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#birth-roll" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700">Explore Your Start <ArrowRight size={18} /></a>
                <a href="#world" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700">See the World</a>
              </div>
            </div>

            <div className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-2xl shadow-blue-900/10">
              <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
                <div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">Abuja Map</p><p className="mt-1 text-xl font-bold">Everywhere is a decision.</p></div><Map className="text-blue-300" /></div>
                <div className="grid grid-cols-3 gap-3">{["Maitama","Wuse 2","Berger","Jabi","Gwarinpa","Kubwa","Lugbe","Nyanya","CBD"].map((place) => <div key={place} className="rounded-xl border border-white/10 bg-white/5 px-3 py-4 text-center text-xs font-semibold text-slate-200"><span className="mx-auto mb-2 block h-2 w-2 rounded-full bg-blue-400" />{place}</div>)}</div>
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-3 text-xs text-emerald-200"><Fuel size={15} /> Fuel stations, hospitals, schools, landmarks and everyday businesses belong on the map too.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="birth-roll" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">Your birth roll</p><h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Where did your story begin?</h2><p className="mt-4 text-slate-600">Your background shapes your starting resources and opportunities. It is fixed once your account is created.</p></div>
        <div className="mt-8 grid gap-5 md:grid-cols-2">{birthRolls.map((roll) => <article key={roll.name} className={`rounded-3xl border p-7 ${roll.accent}`}><div className="flex items-start justify-between gap-5"><div><h3 className="text-2xl font-black text-slate-950">{roll.name}</h3><p className="mt-3 max-w-xl leading-7 text-slate-600">{roll.description}</p></div><Users className="shrink-0 text-blue-600" /></div><div className="mt-6 text-sm font-bold text-slate-700">{roll.examples}</div></article>)}</div>
      </section>

      <section id="world" className="border-y border-slate-100 bg-slate-50/70">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">The world</p><h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Not just landmarks. A city you can live in.</h2><p className="mt-4 text-slate-600">The map is built around the places that make everyday Abuja work—not only famous attractions.</p></div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">{world.map(([title, description, Icon]) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Icon size={20} /></div><h3 className="mt-5 font-bold text-slate-950">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></article>)}</div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">Move around</p><h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Know how Abuja moves.</h2><div className="mt-7 grid gap-3 sm:grid-cols-2">{transport.map(([name, description, Icon]) => <div key={name} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-center gap-3"><Icon size={18} className="text-blue-600" /><span className="font-bold text-slate-900">{name}</span></div><p className="mt-2 text-sm text-slate-500">{description}</p></div>)}</div></div>
          <div className="rounded-3xl bg-slate-950 p-8 text-white"><Wallet className="text-blue-300" /><p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-blue-300">The economy</p><h2 className="mt-3 text-3xl font-black">Job → Earn → Spend → Save → Connect → Aura.</h2><p className="mt-4 leading-7 text-slate-300">Game Naira powers your life. Rent a place, move around, build your skills, meet people and make choices that change your position in the city.</p></div>
        </div>
      </section>

      <section className="bg-emerald-50"><div className="mx-auto max-w-7xl px-6 py-16 lg:px-8"><div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center"><div><div className="flex items-center gap-3"><ShieldCheck className="text-emerald-700" /><p className="font-bold text-emerald-900">Before you enter</p></div><p className="mt-3 max-w-3xl leading-7 text-slate-600">Abuja Life is a fictional entertainment simulation. Real places, businesses and institutions may be adapted or fictionalized. Game Naira has no cash value. Political offices and elections are game mechanics and do not represent real-world government processes.</p></div><a href="#birth-roll" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 font-bold text-white">Start the journey <ArrowRight size={18} /></a></div></div></section>
      <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8"><span>Abuja Life — The Capital Has Levels.</span><span>18+ • No cash-out • No bots or exploits • Respect other players</span></div></footer>
    </main>
  );
}
