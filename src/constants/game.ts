// src/constants/game.ts
// Core Abuja Life game constants

export const GAME_NAME = "Abuja Life"
export const CURRENCY_SYMBOL = "N"
export const CURRENCY_NAME = "Game Naira"

// ── World Landmarks & Everyday Facilities ─────────────────
export const WORLD_CATEGORIES = [
  "landmark", "fuel_station", "hospital", "school", "bank", "market",
  "mall", "restaurant", "hotel", "cinema", "mosque", "church",
  "government", "transport_hub", "metro_station", "park", "golf",
  "event_venue", "car_dealership", "power_facility",
]

export const LANDMARKS = [
  { name: "Aso Rock", category: "landmark", area: "Asokoro", importance: "major" },
  { name: "National Assembly", category: "government", area: "Central Area", importance: "major" },
  { name: "National Mosque", category: "mosque", area: "Central Area", importance: "major" },
  { name: "National Christian Centre", category: "church", area: "Central Area", importance: "major" },
  { name: "City Gate", category: "landmark", area: "CBD", importance: "major" },
  { name: "World Trade Center", category: "landmark", area: "CBD", importance: "major" },
  { name: "Jabi Lake", category: "park", area: "Jabi", importance: "major" },
  { name: "Millennium Park", category: "park", area: "Maitama", importance: "major" },
  { name: "Berger Junction", category: "transport_hub", area: "Berger", importance: "major" },
]

export const EVERYDAY_FACILITIES = [
  { category: "fuel_station", label: "Fuel Station", gameplay: "refuel_vehicle" },
  { category: "hospital", label: "Hospital", gameplay: "healthcare" },
  { category: "school", label: "School", gameplay: "education" },
  { category: "bank", label: "Bank", gameplay: "finance" },
  { category: "market", label: "Market", gameplay: "shopping" },
  { category: "restaurant", label: "Restaurant", gameplay: "food" },
  { category: "hotel", label: "Hotel", gameplay: "lodging_or_jobs" },
  { category: "car_dealership", label: "Car Dealership", gameplay: "vehicle_purchase" },
  { category: "power_facility", label: "Power Facility", gameplay: "utilities" },
]

// ── Districts & Housing Tiers ──────────────────────────────
export const DISTRICTS = {
  DESTITUTE: ["Nyanya", "Mararaba", "Lugbe", "Mpape", "Karmo", "Pyakasa"],
  STRUGGLING: ["Kubwa", "Lokogoma", "Galadimawa", "Dawaki", "Zuba"],
  MID_LEVEL: ["Gwarinpa", "Life Camp", "Wuye", "Kado", "Jahi", "Gaduwa"],
  COMFORTABLE: ["Utako", "Mabushi", "Wuse", "Jabi", "Gudu", "Katampe"],
  PREMIUM: ["Wuse 2", "Guzape", "Garki", "Central Area"],
  ELITE: ["Maitama", "Asokoro"],
  CLAIMS_ABUJA: ["Mararaba", "Suleja", "Zuba", "Karu"], // not actually FCT
}

export const HOUSING_TYPES = {
  FACE_ME: { label: "Face-me-I-face-you", short: "Face-me" },
  SELF_CONTAIN: { label: "Self-Contain", short: "Sef-con" },
  MINI_FLAT: { label: "Mini Flat", short: "Mini-flat" },
  TWO_BEDROOM: { label: "2-Bedroom Flat", short: "2-Bed" },
  DUPLEX: { label: "Duplex", short: "Duplex" },
  MANSION: { label: "Mansion", short: "Mansion" },
}

// ── Transport ──────────────────────────────────────────────
export const TRAVEL_AREAS = [
  "Nyanya", "Mararaba", "Lugbe", "Mpape", "Kubwa", "Gwarinpa",
  "Garki", "Wuye", "Jabi", "Wuse 2", "Central Area", "Guzape", "Asokoro", "Maitama",
] as const

export const TRAVEL_AREA_DISTANCE: Record<string, number> = {
  Nyanya: 1,
  Mararaba: 1,
  Lugbe: 2,
  Mpape: 2,
  Kubwa: 2,
  Gwarinpa: 2,
  Garki: 3,
  Wuye: 3,
  Jabi: 3,
  "Wuse 2": 3,
  "Central Area": 4,
  Guzape: 4,
  Asokoro: 4,
  Maitama: 5,
}

export const TRAVEL_MODES = ["TREK", "BUS_STOP", "ALONE", "KEKE", "BOLT", "INDRIVE", "METRO", "PERSONAL_CAR"] as const
export type TravelMode = (typeof TRAVEL_MODES)[number]

export const TRANSPORT_TYPES = {
  TREK: { label: "Trek", description: "Walk across town; builds fitness and earns a small activity reward", baseCost: 0 },
  BUS_STOP: { label: "Bus Stop", description: "Share a commercial car with strangers", baseCost: 150 },
  ALONE: { label: "Alone", description: "Charter the whole car solo — premium", baseCost: 800 },
  KEKE: { label: "Keke NAPEP", description: "Tricycle taxi — common in outskirts", baseCost: 100 },
  BOLT: { label: "Bolt", description: "Ride-hailing app — comfortable", baseCost: 1200 },
  INDRIVE: { label: "inDrive", description: "Ride-hailing with negotiated fares", baseCost: 1100 },
  METRO: { label: "Abuja Metro", description: "Light rail — cheap and modern", baseCost: 200 },
  PERSONAL_CAR: { label: "Personal Car", description: "Drive your own vehicle; consumes fuel", baseCost: 0 },
  ONE_CHANCE: { label: "One Chance ⚠️", description: "Looks like a bus stop... but it's not.", baseCost: 0 },
}

export function calculateTravelCost(from: string, to: string, mode: TravelMode) {
  const transport = TRANSPORT_TYPES[mode]
  const fromDistance = TRAVEL_AREA_DISTANCE[from] ?? 1
  const toDistance = TRAVEL_AREA_DISTANCE[to] ?? 1
  const distanceFactor = Math.max(1, Math.abs(fromDistance - toDistance) + 1)
  return transport.baseCost * distanceFactor
}

// ── Berger — The Mother of All Junctions ──────────────────
export const BERGER = {
  name: "Berger",
  fullName: "Berger Junction / Roundabout",
  description: "The nerve centre of Abuja transport. If you're lost, come to Berger.",
  tagline: "From Berger, you can go anywhere in Abuja.",
  destinations: ["Kubwa", "Gwarinpa", "Gwagwalada", "Kuje", "Nyanya", "Zuba", "Airport", "Wuse", "Life Camp", "Jabi"],
  onChanceRisk: 0.15, // 15% at night
}

// ── Jobs ───────────────────────────────────────────────────
export const JOBS = [
  { title: "Security Guard", category: "hustle", location: "Citywide", venue: "Various", payPerShift: 3500, shiftHours: 8, minHustle: 0 },
  { title: "Keke Driver", category: "hustle", location: "Suburbs", venue: "Berger Motor Park", payPerShift: 5000, shiftHours: 8, requiresVehicle: true, opensAt: 6, closesAt: 20 },
  { title: "Flyer Distributor", category: "hustle", location: "Wuse 2", venue: "Wuse Market Area", payPerShift: 2500, shiftHours: 3, minHustle: 0, opensAt: 8, closesAt: 18 },
  { title: "Suya Spot Attendant", category: "hustle", location: "Wuse 2", venue: "Yahuza Suya", payPerShift: 4000, shiftHours: 6, opensAt: 16, closesAt: 2 },
  { title: "Shop Assistant", category: "private", location: "Wuse 2", venue: "Wuse Market", payPerShift: 6000, shiftHours: 8, minHustle: 5, opensAt: 9, closesAt: 20 },
  { title: "Restaurant Staff", category: "private", location: "Jabi", venue: "Jabi Lake Restaurants", payPerShift: 7000, shiftHours: 8, opensAt: 10, closesAt: 24 },
  { title: "Hotel Staff", category: "private", location: "Central Area", venue: "Transcorp Hilton", payPerShift: 12000, shiftHours: 8, minHustle: 10, opensAt: 6, closesAt: 24 },
  { title: "Bank Teller", category: "private", location: "Garki", venue: "Various Banks", payPerShift: 15000, shiftHours: 8, minIntelligence: 20, opensAt: 8, closesAt: 18 },
  { title: "Junior Civil Servant", category: "government", location: "Garki", venue: "Federal Secretariat", payPerShift: 18000, shiftHours: 8, minIntelligence: 15, opensAt: 8, closesAt: 18 },
  { title: "Real Estate Agent", category: "hustle", location: "Citywide", venue: "Various", payPerShift: 0, shiftHours: 0, commissionBased: true },
  { title: "Alone Driver", category: "hustle", location: "Citywide", venue: "Own Vehicle", payPerShift: 8000, shiftHours: 8, requiresVehicle: true },
  { title: "Event Planner", category: "private", location: "Citywide", venue: "Various", payPerShift: 25000, shiftHours: 10, minConnect: 20 },
  { title: "Government Contractor", category: "elite", location: "CBD", venue: "NASS Area", payPerShift: 0, shiftHours: 0, commissionBased: true, minConnect: 50 },
  { title: "Hype Man", category: "hustle", location: "Wuse 2", venue: "Hustle & Bustle Club", payPerShift: 10000, shiftHours: 5, opensAt: 22, closesAt: 6 },
]

// Physical workplaces required before a paid shift can be completed.
export const JOB_WORKPLACE_AREAS: Record<string, string> = {
  "Flyer Distributor": "Wuse 2",
  "Suya Spot Attendant": "Wuse 2",
  "Shop Assistant": "Wuse 2",
  "Restaurant Staff": "Jabi",
  "Hotel Staff": "Central Area",
  "Bank Teller": "Garki",
  "Junior Civil Servant": "Garki",
  "Hype Man": "Wuse 2",
};

// ── Universities ───────────────────────────────────────────
export const UNIVERSITIES = [
  { name: "University of Abuja", short: "UniAbuja", type: "public", tier: 1, area: "Airport Road / Gwagwalada", intBonus: 15, auraBonus: 5, cost: 0, event: "asuu_strike" },
  { name: "Miva Open University", short: "Miva", type: "online", tier: 2, area: "Online", intBonus: 12, auraBonus: 3, cost: 80000 },
  { name: "Nile University of Nigeria", short: "Nile Uni", type: "private", tier: 3, area: "Jabi Airport Bypass", intBonus: 20, auraBonus: 15, cost: 500000 },
  { name: "Baze University", short: "Baze", type: "elite", tier: 4, area: "Abuja", intBonus: 25, auraBonus: 25, cost: 1200000, requiresBackground: "rich" },
]

export const SECONDARY_SCHOOLS = [
  { name: "Government Secondary School", type: "public", tier: 1, cost: 0 },
  { name: "Nigerian Tulip International Colleges", short: "NTIC", type: "elite", tier: 4, cost: 800000, auraBonus: 20, requiresBackground: "rich" },
]

// ── Hospitals ──────────────────────────────────────────────
export const HOSPITALS = [
  { name: "Nyanya General Hospital", area: "Nyanya", tier: 1, waitTime: 180, cost: 2000, quality: 30 },
  { name: "Kubwa General Hospital", area: "Kubwa", tier: 1, waitTime: 120, cost: 2500, quality: 35 },
  { name: "Garki Hospital", area: "Garki", tier: 2, waitTime: 60, cost: 8000, quality: 55 },
  { name: "Wuse General Hospital", area: "Wuse", tier: 2, waitTime: 60, cost: 8000, quality: 55 },
  { name: "Maitama District Hospital", area: "Maitama", tier: 3, waitTime: 30, cost: 20000, quality: 70 },
  { name: "National Hospital Abuja", area: "Central Area", tier: 3, waitTime: 90, cost: 15000, quality: 65 },
  { name: "Nizamiye Hospital", area: "Abuja", tier: 5, waitTime: 5, cost: 150000, quality: 98 },
]

// ── Billboards ─────────────────────────────────────────────
export const BILLBOARD_SPOTS = [
  { id: "nyanya-1", location: "Nyanya", label: "Nyanya Junction Billboard", pricePerWeek: 50000, audience: "budget", tier: 1 },
  { id: "kubwa-1", location: "Kubwa", label: "Kubwa Main Road", pricePerWeek: 80000, audience: "budget", tier: 1 },
  { id: "berger-1", location: "Berger", label: "Berger Junction (Main)", pricePerWeek: 500000, audience: "everyone", tier: 3, isPrime: true },
  { id: "berger-2", location: "Berger", label: "Berger Bridge Billboard", pricePerWeek: 450000, audience: "everyone", tier: 3 },
  { id: "gwarinpa-1", location: "Gwarinpa", label: "1st Avenue Gwarinpa", pricePerWeek: 150000, audience: "mid", tier: 2 },
  { id: "wuse2-amk-1", location: "Wuse 2", label: "Aminu Kano Crescent", pricePerWeek: 400000, audience: "nightlife", tier: 3 },
  { id: "jabi-lake-1", location: "Jabi", label: "Jabi Lake Mall Entrance", pricePerWeek: 600000, audience: "shoppers", tier: 4 },
  { id: "maitama-1", location: "Maitama", label: "Millennium Park Axis", pricePerWeek: 800000, audience: "elite", tier: 5 },
  { id: "metro-1", location: "Metro Stations", label: "Abuja Metro Station", pricePerWeek: 350000, audience: "commuters", tier: 3 },
  { id: "cbd-1", location: "CBD", label: "Central Business District Screen", pricePerWeek: 1200000, audience: "corporate", tier: 4 },
  { id: "nass-1", location: "Asokoro", label: "NASS / Aso Rock Corridor", pricePerWeek: 2000000, audience: "political", tier: 5, isPolitical: true },
]

// ── AEDC / Power ───────────────────────────────────────────
export const AEDC = {
  unitPrice: 225, // per kWh in game naira
  bypassRiskPerDay: 5, // risk increases by 5 each day on bypass
  raidFine: 50000,
  raidThreshold: 70, // bypass risk > 70 = possible AEDC raid
}

// ── Random Events ──────────────────────────────────────────
export const RANDOM_EVENTS = [
  { id: "aedc_outage", label: "AEDC Don Cut Light!", probability: 0.2, effect: { aedcUnits: -50 } },
  { id: "aedc_raid", label: "AEDC Officials at Your Gate!", probability: 0.05, triggerCondition: "hasBypass", effect: { wallet: -50000, hasBypass: false } },
  { id: "police_checkpoint", label: "Police Checkpoint on Your Route", probability: 0.1, effect: { wallet: -5000, label: "Settle" } },
  { id: "traffic_jam", label: "Traffic Jam at Berger!", probability: 0.3, effect: { happiness: -5, performanceScore: -3 } },
  { id: "one_chance_alert", label: "One Chance Alert in Your Area", probability: 0.08, condition: "night", effect: { health: -30, wallet: -50000 } },
  { id: "real_estate_scam", label: "You Paid Inspection Fee for a Mpape House Listed as Maitama!", probability: 0.07, effect: { wallet: -10000, streetSense: -2 } },
  { id: "jumat_flyer", label: "You Got a Job Flyer After Juma'at!", probability: 0.3, condition: "friday_afternoon", effect: { newJobUnlocked: true } },
  { id: "asuu_strike", label: "ASUU Strike! UniAbuja Closed.", probability: 0.1, condition: "uniabuja_student", effect: { educationPaused: true } },
  { id: "drifters_event", label: "Abuja Drifters Night Event at Berger!", probability: 0.05, condition: "hasVehicle", effect: { aura: 10, drivingSkill: 5 } },
  { id: "reading_club", label: "Abuja Reading Club Meetup This Weekend", probability: 0.1, condition: "intelligence>30", effect: { intelligence: 5, aura: 3, connectLevel: 2 } },
]

// ── Election Types ─────────────────────────────────────────
export const ELECTION_CYCLE_MONTHS = 4

export const ELECTION_TYPES = {
  PRESIDENT: { label: "Abuja President", scope: "Abuja Life", campaignDays: 30, minConnect: 80, minCampaignBudget: 10000000 },
  FCT_GOVERNOR: { label: "FCT Governor", scope: "Federal Capital Territory", campaignDays: 30, minConnect: 60, minCampaignBudget: 5000000 },
  FCT_CHAIRMAN: { label: "FCT Chairman", scope: "Municipal", campaignDays: 14, minConnect: 30, minCampaignBudget: 500000 },
}

// ── Topup Packages ─────────────────────────────────────────
export const TOPUP_PACKAGES = [
  { id: "starter", label: "Starter Pack", realNGN: 500, gameNaira: 500000, bonus: 0 },
  { id: "hustle", label: "Hustle Pack", realNGN: 1000, gameNaira: 1200000, bonus: 200000 },
  { id: "connect", label: "Connect Pack", realNGN: 2500, gameNaira: 3500000, bonus: 1000000 },
  { id: "abuja_boy", label: "Abuja Boy Pack", realNGN: 5000, gameNaira: 8000000, bonus: 3000000 },
  { id: "big_man", label: "Big Man Pack", realNGN: 10000, gameNaira: 20000000, bonus: 10000000 },
  { id: "maitama", label: "Maitama Pack", realNGN: 25000, gameNaira: 60000000, bonus: 35000000 },
]

// ── Naming Confusion Zones ─────────────────────────────────
export const CONFUSION_ZONES = [
  { confused: "Wuse", actual: "Wuye", tip: "Wuse is Phase 1 nightlife. Wuye is Phase 2 residential. Very different!" },
  { confused: "Maitama", actual: "Mpape", tip: "Mpape is close to Maitama only on the map. Rent is 5x cheaper for a reason." },
  { confused: "Asokoro", actual: "Apo", tip: "Senators live in Asokoro. Apo is a different area entirely." },
  { confused: "Jabi", actual: "Jahi", tip: "Jabi has the lake and mall. Jahi is quiet residential." },
  { confused: "Abuja", actual: "Mararaba / Suleja / Zuba", tip: "These are not in FCT. They just say Abuja." },
  { confused: "Gwarinpa", actual: "Galadimawa", tip: "Gwarinpa is a proper estate. Galadimawa is further out." },
]
