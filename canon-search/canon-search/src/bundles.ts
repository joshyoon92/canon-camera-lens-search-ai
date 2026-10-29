// Camera + lens sets for "I want a travel camera" style queries.
// Every body is paired with every usable lens (and with Canon's real kits at kit price);
// budget and weight limits apply to the whole set; one set per body so the top 5 are real alternatives.
import type { MustHave, ParsedQuery, RankedBundle, RankedResult } from "./types.ts";
import {
  cameraPasses, cameraReasons, lensPasses, lensReasons, scoreCamera, scoreFixedLens, scoreLens,
} from "./ranking.ts";

const clamp = (x: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));

// The body carries most of a set's capability; the lens decides framing and light.
const BODY_WEIGHT = 0.55;
const LENS_WEIGHT = 0.45;
const EXTRA_KIT_LENS_BONUS = 0.05; // e.g. a double-zoom kit covers more than its best lens alone

const LENS_MUST_HAVES: MustHave[] = ["is", "macro", "power_zoom", "prime", "zoom"];

// Buying a new set, an adapted lens means an extra part (not in the catalog's prices) and a
// crop-mode lens wastes the sensor; only pick them when nothing native fits.
const SET_COMPAT_PENALTY: Record<string, number> = { native: 0, adapter: 0.15, crop_mode: Infinity, adapter_crop: Infinity };

interface Candidate {
  body: any;
  lenses: { lens: any; compat: any }[];
  kit?: any;
  score: number;
  totalUSD: number;
  separateUSD: number;
  totalWeightG: number | null;
}

export function rankBundles(q: ParsedQuery, cameras: any[], lenses: any[], kits: any[], k = 5): RankedBundle[] {
  // Limits are checked on the set total, so score parts without them.
  const parts: ParsedQuery = { ...q, budgetMax: undefined, maxWeightG: undefined };
  const lensQ: ParsedQuery = { ...parts, category: "lens", mustHave: (q.mustHave ?? []).filter(m => LENS_MUST_HAVES.includes(m)) };
  const bodyQ: ParsedQuery = { ...parts, category: "camera", mustHave: (q.mustHave ?? []).filter(m => !LENS_MUST_HAVES.includes(m)) };
  const wantsSpecificLens = lensQ.mustHave!.length > 0;
  const lensById = new Map(lenses.map(l => [l.id, l]));

  const candidates: Candidate[] = [];
  const add = (body: any, bodyScore: number, picked: { lens: any; compat: any; score: number }[], kit?: any) => {
    const separateUSD = body.priceUSD + picked.reduce((s, p) => s + p.lens.priceUSD, 0);
    const totalUSD = kit ? kit.priceUSD : separateUSD;
    const weights = [body.weightG, ...picked.map(p => p.lens.weightG)];
    const totalWeightG = weights.every(w => w != null) ? weights.reduce((a, b) => a + b, 0) : null;
    if (q.budgetMax != null && totalUSD > q.budgetMax) return;
    if (q.maxWeightG != null && (totalWeightG == null || totalWeightG > q.maxWeightG)) return;

    const best = Math.max(...picked.map(p => p.score));
    const lensScore = picked.length ? best + EXTRA_KIT_LENS_BONUS * (picked.length - 1) : scoreFixedLens(body, parts);
    let score = BODY_WEIGHT * bodyScore + LENS_WEIGHT * lensScore;
    if (q.budgetMax) score += 0.1 * clamp(totalUSD / q.budgetMax); // spend the budget on capability
    candidates.push({ body, lenses: picked, kit, score, totalUSD, separateUSD, totalWeightG });
  };

  for (const body of cameras.filter(c => cameraPasses(c, bodyQ))) {
    const bodyScore = scoreCamera(body, bodyQ);
    if (body.mount === "fixed") {
      // A compact is already a complete set, if its built-in lens meets the lens requirements.
      const [fMin, fMax] = body.fixedLens.focalEquivMm;
      const fits = lensQ.mustHave!.every(m => (m === "zoom" && fMax > fMin) || (m === "prime" && fMax === fMin));
      if (fits) add(body, bodyScore, []);
      continue;
    }
    for (const lens of lenses.filter(l => lensPasses(l, lensQ))) {
      const s = scoreLens(lens, body, lensQ);
      const penalty = s ? SET_COMPAT_PENALTY[s.compat.status] ?? 0 : Infinity;
      if (s && penalty !== Infinity) add(body, bodyScore, [{ lens, compat: s.compat, score: s.score - penalty }]);
    }
    for (const kit of kits.filter(kt => kt.bodyId === body.id)) {
      const kitLenses = kit.lensIds.map((id: string) => lensById.get(id));
      if (kitLenses.some((l: any) => !l)) continue;
      const scored = kitLenses.map((lens: any) => {
        const s = scoreLens(lens, body, lensQ);
        return s && { lens, compat: s.compat, score: s.score };
      });
      if (scored.some((s: any) => !s)) continue;
      // A kit must still satisfy lens requirements like "prime" through at least one of its lenses.
      if (wantsSpecificLens && !kitLenses.some((l: any) => lensPasses(l, lensQ))) continue;
      add(body, bodyScore, scored, kit);
    }
  }

  // Same body + same lenses as a kit: keep only the kit, it's the cheaper way to buy it.
  const kitKeys = new Set(candidates.filter(c => c.kit).map(keyOf));
  const deduped = candidates.filter(c => c.kit || !kitKeys.has(keyOf(c)));

  const bestPerBody = new Map<string, Candidate>();
  for (const c of deduped) {
    const cur = bestPerBody.get(c.body.id);
    if (!cur || c.score > cur.score) bestPerBody.set(c.body.id, c);
  }

  return [...bestPerBody.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map(c => toBundle(c, q));
}

const keyOf = (c: Candidate) => [c.body.id, ...c.lenses.map(p => p.lens.id).sort()].join("+");

function toBundle(c: Candidate, q: ParsedQuery): RankedBundle {
  const uses = q.useCases.length ? q.useCases : ["everyday" as const];
  const camera: RankedResult = {
    id: c.body.id, name: c.body.name, score: 0, priceUSD: c.body.priceUSD, reasons: cameraReasons(c.body, uses),
  };
  const lenses: RankedResult[] = c.lenses.map(({ lens, compat }) => ({
    id: lens.id, name: lens.name, score: 0, priceUSD: lens.priceUSD, reasons: lensReasons(lens, compat),
    compatibility: { status: compat.status, note: compat.note, effectiveFocalMm: compat.effectiveFocalMm },
  }));
  const fixed = c.body.fixedLens;
  return {
    id: keyOf(c) + (c.kit ? `@${c.kit.id}` : ""),
    score: Math.round(c.score * 1000) / 1000,
    camera,
    lenses,
    ...(fixed && {
      builtInLens: `${fixed.focalEquivMm[0]}-${fixed.focalEquivMm[1]}mm equiv. f/${fixed.aperture[0]}-${fixed.aperture[1]} built-in lens`,
    }),
    ...(c.kit && { kit: { id: c.kit.id, name: c.kit.name, priceUSD: c.kit.priceUSD, url: c.kit.url ?? null } }),
    totalUSD: round2(c.totalUSD),
    separateUSD: round2(c.separateUSD),
    totalWeightG: c.totalWeightG,
  };
}

const round2 = (n: number) => Math.round(n * 100) / 100;
