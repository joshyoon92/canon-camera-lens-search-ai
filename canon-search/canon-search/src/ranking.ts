// Deterministic ranking: hard filters -> use-case fit scores -> sort.
// No network, no LLM. Every reason string comes from catalog fields.
import { compatibility } from "./compatibility.ts";
import type { ParsedQuery, RankedResult, UseCase } from "./types.ts";

const clamp = (x: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));

// ---------------- camera features (each normalized to 0..1) ----------------
const SENSOR_QUALITY: Record<string, number> = { full_frame: 1, aps_c: 0.55, "1_4_inch": 0.4, "1_inch": 0.35, "1_2_3_inch": 0.1 };
const SEALING: Record<string, number> = { none: 0, basic: 0.4, advanced: 0.8, pro: 1 };
const VIDEO_RES: Record<string, number> = { "8K": 1, "7K": 0.9, "6K": 0.8, "4K": 0.5, "1080p": 0.1 };

function camFeatures(c: any) {
  const fps = Math.max(c.burstFpsElectronic ?? 0, c.burstFpsMechanical ?? 0);
  const v = c.video;
  const videoRaw = (VIDEO_RES[v.maxResolution] ?? 0) + (v.rawInternal ? 0.2 : 0) + ((v.max4kFps ?? 0) >= 120 ? 0.15 : (v.max4kFps ?? 0) >= 60 ? 0.07 : 0)
    + (v.openGate ? 0.1 : 0) + (v.log ? 0.1 : 0) + (c.coolingFan ? 0.1 : 0);
  const zoomReach = c.fixedLens ? clamp((c.fixedLens.focalEquivMm[1] - 200) / 800) : 0;
  return {
    burst: clamp(fps / 40),
    resolution: clamp((c.megapixels - 20) / 25),
    sensor: SENSOR_QUALITY[c.sensor] ?? 0.3,
    sealing: SEALING[c.weatherSealing] ?? 0,
    video: clamp(videoRaw / 1.65),
    // Steeper curve: buyers feel 375g vs 550g vs 700g as clearly different classes.
    light: c.weightG ? clamp(1 - (c.weightG - 250) / 600) : 0.5,
    cheap: c.priceUSD ? clamp(1 - c.priceUSD / 7000) : 0.5,
    ibis: c.ibis ? 1 : 0,
    vari: c.variAngleScreen ? 1 : 0,
    // Reach: APS-C crop, very high resolution (crop in post), or a superzoom compact.
    reach: c.sensor === "aps_c" ? 1 : c.megapixels >= 40 ? 0.75 : Math.max(0.5, zoomReach * 0.9),
    dualSlots: /2x|\+/.test(c.cardSlots ?? "") ? 1 : 0,
    proLevel: c.level === "pro" ? 1 : c.level === "advanced" ? 0.7 : c.level === "intermediate" ? 0.4 : 0.1,
    beginnerLevel: c.level === "beginner" ? 1 : c.level === "intermediate" ? 0.5 : 0,
    interchangeable: c.mount === "fixed" ? 0 : 1,
  };
}

type F = ReturnType<typeof camFeatures>;
const CAMERA_FIT: Record<UseCase, (f: F) => number> = {
  sports:        f => 0.45 * f.burst + 0.2 * f.sealing + 0.15 * f.sensor + 0.2 * f.proLevel,
  indoor_sports: f => 0.4 * f.burst + 0.4 * f.sensor + 0.2 * f.proLevel,
  wildlife:      f => 0.35 * f.burst + 0.2 * f.reach + 0.15 * f.sealing + 0.15 * f.ibis + 0.15 * f.interchangeable,
  birds:         f => 0.35 * f.burst + 0.25 * f.reach + 0.1 * f.sealing + 0.15 * f.ibis + 0.15 * f.interchangeable,
  landscape:     f => 0.45 * f.resolution + 0.2 * f.sensor + 0.2 * f.sealing + 0.15 * f.ibis,
  architecture:  f => 0.5 * f.resolution + 0.3 * f.sensor + 0.2 * f.ibis,
  portrait:      f => 0.4 * f.sensor + 0.3 * f.resolution + 0.2 * f.ibis + 0.1 * f.interchangeable,
  weddings:      f => 0.3 * f.sensor + 0.2 * f.ibis + 0.2 * f.dualSlots + 0.15 * f.burst + 0.15 * f.video,
  events:        f => 0.3 * f.sensor + 0.2 * f.ibis + 0.2 * f.dualSlots + 0.15 * f.burst + 0.15 * f.video,
  low_light:     f => 0.65 * f.sensor + 0.35 * f.ibis,
  astro:         f => 0.6 * f.sensor + 0.2 * f.ibis + 0.2 * (1 - Math.abs(f.resolution - 0.4)),
  video:         f => 0.7 * f.video + 0.3 * f.ibis,
  vlogging:      f => 0.3 * f.vari + 0.3 * f.light + 0.25 * f.video + 0.15 * f.ibis,
  hybrid:        f => 0.45 * f.video + 0.25 * f.burst + 0.15 * f.ibis + 0.15 * f.sensor,
  travel:        f => 0.6 * f.light + 0.1 * f.ibis + 0.15 * f.sensor + 0.15 * f.sealing,
  street:        f => 0.55 * f.light + 0.3 * f.sensor + 0.15 * f.ibis,
  everyday:      f => 0.4 * f.light + 0.3 * f.cheap + 0.3 * f.sensor,
  // Interchangeable lenses give a beginner room to grow, so compacts rank a bit lower.
  beginner:      f => 0.4 * f.cheap + 0.35 * f.beginnerLevel + 0.1 * f.light + 0.15 * f.interchangeable,
  macro:         f => 0.5 * f.resolution + 0.5 * f.ibis,
  vr:            f => 0.5 * f.sensor + 0.5 * f.resolution,
};

// ---------------- lens features ----------------
function lensFeatures(l: any, effMin: number, effMax: number) {
  const a = l.maxApertureWide;
  const overlap = (lo: number, hi: number) => (effMin <= hi && effMax >= lo ? 1 : 0);
  return {
    fast: clamp((4 - a) / 2.8),
    wide: effMin <= 16 ? 1 : effMin <= 20 ? 0.85 : effMin <= 24 ? 0.65 : effMin <= 35 ? 0.3 : 0,
    portraitFocal: overlap(70, 135) ? 1 : overlap(50, 160) ? 0.6 : 0,
    // indoor courts: shooting distance ~5-25m, so 70-200mm equivalent is the sweet spot; >300mm can't frame the action
    courtFocal: effMin > 300 ? 0 : (effMin <= 85 && effMax >= 200) ? 1 : overlap(70, 200) ? 0.6 : 0,
    tele: effMax >= 300 ? 1 : effMax >= 200 ? 0.8 : effMax >= 135 ? 0.5 : 0,
    reach: clamp((effMax - 200) / 700),
    range: l.type === "zoom" ? clamp(Math.log(effMax / effMin) / Math.log(10)) : 0,
    standard: overlap(24, 70) && effMin <= 35 ? 1 : 0,
    light: l.weightG ? clamp(1 - (l.weightG - 100) / 1400) : 0.6,
    cheap: clamp(1 - l.priceUSD / 3000),
    is: l.imageStabilization ? 1 : 0,
    pro: l.series === "L" ? 1 : 0,
    macro: l.macro ? 1 : 0,
    powerZoom: l.powerZoom ? 1 : 0,
    prime: l.type === "prime" ? 1 : 0,
    vr: l.vr ? 1 : 0,
    streetFocal: l.type === "prime" && effMin >= 24 && effMin <= 50 ? 1 : 0,
  };
}
type LF = ReturnType<typeof lensFeatures>;
const LENS_FIT: Record<UseCase, (f: LF) => number> = {
  portrait:      f => 0.5 * f.portraitFocal + 0.35 * f.fast + 0.15 * f.pro,
  landscape:     f => 0.6 * f.wide + 0.2 * f.pro + 0.1 * f.is + 0.1 * f.light,
  architecture:  f => 0.7 * f.wide + 0.3 * f.pro,
  astro:         f => 0.5 * f.wide + 0.5 * f.fast,
  wildlife:      f => 0.7 * f.reach + 0.15 * f.is + 0.15 * (f.range > 0 ? 1 : 0),
  birds:         f => 0.8 * f.reach + 0.1 * f.is + 0.1 * f.pro,
  sports:        f => 0.45 * f.tele + 0.35 * f.fast + 0.2 * f.pro,
  indoor_sports: f => 0.5 * f.fast + 0.35 * f.courtFocal + 0.15 * f.pro,
  weddings:      f => 0.45 * f.fast + 0.3 * f.pro + 0.25 * Math.max(f.standard, f.portraitFocal),
  events:        f => 0.45 * f.fast + 0.3 * f.pro + 0.25 * Math.max(f.standard, f.portraitFocal),
  low_light:     f => f.fast,
  macro:         f => f.macro,
  travel:        f => 0.5 * f.range + 0.3 * f.light + 0.2 * f.is,
  everyday:      f => 0.45 * f.standard + 0.25 * f.light + 0.2 * f.is + 0.1 * f.range,
  street:        f => 0.5 * f.streetFocal + 0.5 * f.light,
  vlogging:      f => 0.5 * f.wide + 0.25 * f.light + 0.15 * f.is + 0.1 * f.powerZoom,
  video:         f => 0.3 * f.is + 0.25 * f.powerZoom + 0.25 * f.fast + 0.2 * f.pro,
  hybrid:        f => 0.4 * f.standard + 0.3 * f.is + 0.3 * f.fast,
  beginner:      f => 0.6 * f.cheap + 0.2 * f.light + 0.2 * f.is,
  vr:            f => f.vr,
};

// Penalties for lenses that technically work but aren't the natural choice.
const COMPAT_PENALTY: Record<string, number> = { native: 0, crop_mode: 0.2, adapter: 0.08, adapter_crop: 0.3 };

// ---------------- hard filters ----------------
function cameraPasses(c: any, q: ParsedQuery): boolean {
  if (q.budgetMax != null && (c.priceUSD ?? Infinity) > q.budgetMax) return false;
  if (q.sensor && c.sensor !== q.sensor) return false;
  if (q.bodyType && c.type !== q.bodyType) return false;
  if (q.maxWeightG && (c.weightG ?? Infinity) > q.maxWeightG) return false;
  for (const m of q.mustHave ?? []) {
    if (m === "ibis" && !c.ibis) return false;
    if (m === "evf" && !c.evf) return false;
    if (m === "weather_sealed" && c.weatherSealing === "none") return false;
    if (m === "vari_angle" && !c.variAngleScreen) return false;
    if (m === "raw_video" && !c.video.rawInternal) return false;
    if (m === "4k60" && (c.video.max4kFps ?? 0) < 60) return false;
    if (m === "4k120" && (c.video.max4kFps ?? 0) < 120) return false;
    if (m === "fan" && !c.coolingFan) return false;
    if (m === "full_frame" && c.sensor !== "full_frame") return false;
  }
  return true;
}

function lensPasses(l: any, q: ParsedQuery): boolean {
  if (q.budgetMax != null && l.priceUSD > q.budgetMax) return false;
  if (q.maxWeightG && (l.weightG ?? Infinity) > q.maxWeightG) return false;
  if (l.vr && !q.useCases.includes("vr")) return false;
  if (l.kitLensOnly) return false; // not sold separately // VR lenses only when asked
  for (const m of q.mustHave ?? []) {
    if (m === "is" && !l.imageStabilization) return false;
    if (m === "macro" && !l.macro) return false;
    if (m === "power_zoom" && !l.powerZoom) return false;
    if (m === "prime" && l.type !== "prime") return false;
    if (m === "zoom" && l.type !== "zoom") return false;
    if (m === "weather_sealed" && !l.weatherSealed) return false;
  }
  return true;
}

// When no camera is named, assume a full-frame RF shooter: EF lenses need an adapter,
// RF-S lenses would crop. This is the most common case on Canon's current site.
const DEFAULT_BODY = { id: "_default_rf_ff", mount: "RF", sensor: "full_frame" };

// ---------------- public API ----------------
const usesOf = (q: ParsedQuery) => q.useCases.length ? q.useCases : (["everyday"] as UseCase[]);
const avg = (fns: ((x: any) => number)[], f: any) => fns.reduce((s, fn) => s + fn(f), 0) / fns.length;

// Fit of one body for the query. Hard filters are the caller's job.
export function scoreCamera(c: any, q: ParsedQuery): number {
  const uses = usesOf(q);
  const f = camFeatures(c);
  let score = avg(uses.map(u => CAMERA_FIT[u]), f);
  const tagHits = uses.filter(u => c.useTags.includes(u)).length;
  score += 0.12 * Math.min(tagHits, 2) / 2;                        // curated tags as a tie-breaker
  if (q.budgetMax) score += 0.1 * clamp(c.priceUSD / q.budgetMax); // spend the budget on capability
  if (q.level === "beginner" && (c.level === "pro" || c.level === "advanced")) score -= 0.3;
  if (q.level === "pro") score += 0.15 * f.proLevel;
  return score;
}

// Fit of one lens on a given body, or null if it can't be used there.
export function scoreLens(l: any, body: any, q: ParsedQuery): { score: number; compat: any } | null {
  const uses = usesOf(q);
  const compat = compatibility(body, l);
  if (!compat.usable) return null;
  const [effMin, effMax] = compat.effectiveFocalMm!;
  const f = lensFeatures(l, effMin, effMax);
  let score = avg(uses.map(u => LENS_FIT[u]), f);
  const tagHits = uses.filter(u => l.useTags.includes(u)).length;
  score += 0.12 * Math.min(tagHits, 2) / 2;
  score -= COMPAT_PENALTY[compat.status] ?? 0;
  if (q.budgetMax) score += 0.05 * clamp(l.priceUSD / q.budgetMax);
  return { score, compat };
}

// Fit of a compact's built-in lens, scored as if it were a lens on that body.
export function scoreFixedLens(c: any, q: ParsedQuery): number {
  const [effMin, effMax] = c.fixedLens.focalEquivMm;
  const [apWide, apTele] = c.fixedLens.aperture;
  const builtIn = {
    type: effMin === effMax ? "prime" : "zoom", maxApertureWide: apWide, maxApertureTele: apTele,
    weightG: 0, priceUSD: 0, imageStabilization: true, series: "standard", macro: false, useTags: [],
  };
  const f = lensFeatures(builtIn, effMin, effMax);
  return avg(usesOf(q).map(u => LENS_FIT[u]), f);
}

export { cameraPasses, lensPasses, cameraReasons, lensReasons };

export function rank(q: ParsedQuery, cameras: any[], lenses: any[], k = 5): RankedResult[] {
  if (q.category === "camera") {
    return cameras.filter(c => cameraPasses(c, q))
      .map(c => ({ item: c, score: scoreCamera(c, q), reasons: cameraReasons(c, usesOf(q)) }))
      .sort((a, b) => b.score - a.score).slice(0, k).map(toResult);
  }

  const owned = q.ownedCameraId ? cameras.find(c => c.id === q.ownedCameraId) : DEFAULT_BODY;
  if (!owned) throw new Error(`Unknown camera: ${q.ownedCameraId}`);
  return lenses.filter(l => lensPasses(l, q)).flatMap(l => {
    const s = scoreLens(l, owned, q);
    return s ? [{ item: l, score: s.score, reasons: lensReasons(l, s.compat), compat: s.compat }] : [];
  }).sort((a, b) => b.score - a.score).slice(0, k).map(toResult);
}

function toResult(r: any): RankedResult {
  return {
    id: r.item.id, name: r.item.name, score: Math.round(r.score * 1000) / 1000,
    priceUSD: r.item.priceUSD, reasons: r.reasons,
    ...(r.compat && { compatibility: { status: r.compat.status, note: r.compat.note, effectiveFocalMm: r.compat.effectiveFocalMm } }),
  };
}

// Query-aware spec chips: pick the specs that matter for the stated use cases.
function cameraReasons(c: any, uses: UseCase[]): string[] {
  const out: string[] = [];
  const fps = Math.max(c.burstFpsElectronic ?? 0, c.burstFpsMechanical ?? 0);
  const want = (...u: UseCase[]) => u.some(x => uses.includes(x));
  if (want("sports", "wildlife", "birds", "indoor_sports") && fps) out.push(`${fps} fps burst`);
  if (want("wildlife", "birds") && c.sensor === "aps_c") out.push("1.6x crop adds reach");
  if (want("landscape", "architecture", "portrait")) out.push(`${c.megapixels}MP`);
  if (want("video", "vlogging", "hybrid")) out.push(`${c.video.maxResolution}${c.video.rawInternal ? " RAW" : ""} video`);
  if (want("video", "vlogging") && c.coolingFan) out.push("cooling fan");
  if (want("vlogging") && c.variAngleScreen) out.push("flip screen");
  if (want("travel", "street", "vlogging", "everyday") && c.weightG) out.push(`${c.weightG} g`);
  if (want("beginner") && c.priceUSD) out.push(`$${c.priceUSD}`);
  if (want("beginner") && c.level === "beginner") out.push("beginner-friendly");
  if (c.ibis) out.push("in-body stabilization");
  if (c.sensor === "full_frame") out.push("full-frame");
  if (c.fixedLens) out.push(`${c.fixedLens.focalEquivMm[0]}-${c.fixedLens.focalEquivMm[1]}mm equiv. lens`);
  return [...new Set(out)].slice(0, 3);
}

function lensReasons(l: any, compat: any): string[] {
  const out: string[] = [];
  const [a, b] = compat.effectiveFocalMm;
  out.push(compat.cropFactor > 1 ? `${a === b ? a : `${a}-${b}`}mm equiv. on this body` : `${l.focalMinMm === l.focalMaxMm ? l.focalMinMm : `${l.focalMinMm}-${l.focalMaxMm}`}mm`);
  out.push(`f/${l.maxApertureWide}${l.maxApertureTele !== l.maxApertureWide ? `-${l.maxApertureTele}` : ""}`);
  if (l.imageStabilization) out.push("IS");
  if (l.macro) out.push("macro");
  if (l.powerZoom) out.push("power zoom");
  if (compat.adapter) out.push(`needs ${compat.adapter}`);
  if (compat.status === "crop_mode") out.push("crop mode on full-frame");
  return out.slice(0, 4);
}
