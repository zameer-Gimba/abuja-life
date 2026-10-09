/**
 * Abuja Life world identity registry.
 *
 * These stable IDs are the source of truth for world art. 3D scenes must resolve
 * these keys to hand-authored/reused assets; do not regenerate character traits
 * from frame, camera angle, district, or arbitrary AI prompts.
 *
 * This file contains game-art direction, not a claim that every real street looks
 * exactly like its archetype. The city is a fictionalized, internally consistent
 * version of Abuja and its surrounding settlements.
 */

export type DistrictEnvironment =
  | "diplomatic_modern"
  | "civic_modern"
  | "commercial_dense"
  | "planned_residential"
  | "suburban_edge"
  | "peri_urban";

export type DistrictWorldProfile = {
  id: string;
  label: string;
  environment: DistrictEnvironment;
  buildingHeightRange: readonly [number, number];
  roadWidth: "wide" | "standard" | "narrow";
  vegetation: "formal" | "mixed" | "sparse";
  streetFurniture: "premium" | "standard" | "basic";
  palette: string;
  signatureDetails: readonly string[];
};

export const DISTRICT_WORLD_PROFILES: Record<string, DistrictWorldProfile> = {
  Maitama: {
    id: "maitama_v1",
    label: "Maitama",
    environment: "diplomatic_modern",
    buildingHeightRange: [2, 8],
    roadWidth: "wide",
    vegetation: "formal",
    streetFurniture: "premium",
    palette: "sandstone-glass-deep-green",
    signatureDetails: ["setback villas", "embassy-style walls", "trimmed verges", "guarded entrances"],
  },
  "Central Area": {
    id: "central_area_v1",
    label: "Central Area",
    environment: "civic_modern",
    buildingHeightRange: [5, 24],
    roadWidth: "wide",
    vegetation: "formal",
    streetFurniture: "premium",
    palette: "concrete-glass-stone",
    signatureDetails: ["civic plazas", "office towers", "large junctions", "formal landscaping"],
  },
  "Wuse 2": {
    id: "wuse_2_v1",
    label: "Wuse 2",
    environment: "commercial_dense",
    buildingHeightRange: [2, 12],
    roadWidth: "standard",
    vegetation: "mixed",
    streetFurniture: "standard",
    palette: "warm-concrete-signage",
    signatureDetails: ["shops at street level", "restaurants", "busy parking edges", "illuminated signs"],
  },
  Jabi: {
    id: "jabi_v1",
    label: "Jabi",
    environment: "planned_residential",
    buildingHeightRange: [2, 12],
    roadWidth: "wide",
    vegetation: "mixed",
    streetFurniture: "premium",
    palette: "lake-blue-palm-green",
    signatureDetails: ["lakefront leisure", "modern retail", "apartment blocks", "landscaped paths"],
  },
  Guzape: {
    id: "guzape_v1",
    label: "Guzape",
    environment: "planned_residential",
    buildingHeightRange: [2, 6],
    roadWidth: "wide",
    vegetation: "mixed",
    streetFurniture: "premium",
    palette: "hillside-sandstone-green",
    signatureDetails: ["hillside homes", "large compounds", "retaining walls", "winding roads"],
  },
  Gwarinpa: {
    id: "gwarinpa_v1",
    label: "Gwarinpa",
    environment: "planned_residential",
    buildingHeightRange: [1, 6],
    roadWidth: "standard",
    vegetation: "mixed",
    streetFurniture: "standard",
    palette: "estate-cream-red-earth",
    signatureDetails: ["estate streets", "duplexes", "local shopping rows", "compound walls"],
  },
  Kubwa: {
    id: "kubwa_v1",
    label: "Kubwa",
    environment: "suburban_edge",
    buildingHeightRange: [1, 5],
    roadWidth: "standard",
    vegetation: "mixed",
    streetFurniture: "basic",
    palette: "concrete-ochre-painted-block",
    signatureDetails: ["mixed-density housing", "busy local markets", "unfinished upper floors", "minibus stops"],
  },
  Nyanya: {
    id: "nyanya_v1",
    label: "Nyanya",
    environment: "suburban_edge",
    buildingHeightRange: [1, 4],
    roadWidth: "standard",
    vegetation: "sparse",
    streetFurniture: "basic",
    palette: "warm-concrete-red-earth",
    signatureDetails: ["dense mixed-use streets", "small shops", "shared transport stops", "compact compounds"],
  },
  Mararaba: {
    id: "mararaba_v1",
    label: "Mararaba",
    environment: "peri_urban",
    buildingHeightRange: [1, 4],
    roadWidth: "narrow",
    vegetation: "sparse",
    streetFurniture: "basic",
    palette: "red-earth-painted-block",
    signatureDetails: ["dense roadside commerce", "informal market stalls", "mixed-finish buildings", "busy transport corridors"],
  },
};

export type CharacterAppearancePreset = {
  id: string;
  skinTone: string;
  hairstyle: string;
  hairColor: string;
  bodyType: string;
  heightCm: number;
  outfitTop: string;
  outfitBottom: string;
  outfitShoes: string;
  outfitOuterwear: string;
};

export const STARTING_APPEARANCE_PRESETS: Record<"rich" | "poor", CharacterAppearancePreset> = {
  poor: {
    id: "nigerian_young_adult_v1",
    skinTone: "medium_brown",
    hairstyle: "low_cut_v1",
    hairColor: "black",
    bodyType: "average",
    heightCm: 170,
    outfitTop: "tee_cream_v1",
    outfitBottom: "jeans_dark_v1",
    outfitShoes: "sneakers_black_v1",
    outfitOuterwear: "none",
  },
  rich: {
    id: "nigerian_young_adult_v1",
    skinTone: "medium_brown",
    hairstyle: "low_fade_v1",
    hairColor: "black",
    bodyType: "average",
    heightCm: 170,
    outfitTop: "polo_navy_v1",
    outfitBottom: "chinos_sand_v1",
    outfitShoes: "sneakers_white_v1",
    outfitOuterwear: "none",
  },
};

export const HOME_SCENE_PRESETS = {
  nyanya_shared_room_v1: {
    id: "nyanya_shared_room_v1",
    background: "poor",
    area: "Nyanya",
    sceneType: "single_room",
    roommateIds: ["roommate_dummy_01", "roommate_dummy_02"],
    features: ["foam_mattress", "plastic_chair", "standing_fan", "shared_door", "small_window"],
    exitTarget: "nyanya_street_v1",
  },
  guzape_mansion_v1: {
    id: "guzape_mansion_v1",
    background: "rich",
    area: "Guzape",
    sceneType: "mansion",
    roommateIds: [],
    features: ["large_lounge", "sofa_set", "dining_area", "wide_windows", "compound_driveway", "garage_slot"],
    exitTarget: "guzape_street_v1",
  },
} as const;

export const WORLD_PERSISTENCE_RULES = [
  "A player keeps the same character preset, skin tone, hairstyle, hair color, body type and height across scenes.",
  "Clothing changes only after an explicit wardrobe/equipment action and successful persistence.",
  "Each district loads its authored environment profile; camera changes must not change geometry, identity or materials.",
  "The poor starting home uses stationary non-player roommate props/actors that do not replace or impersonate the player.",
  "Rich and poor starting homes use different scene IDs and authored layouts.",
  "Use stable model/asset IDs and deterministic seeds; never generate a fresh character or house from text for each frame.",
] as const;
