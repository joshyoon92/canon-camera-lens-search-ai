// Keyword parser: free text -> ParsedQuery.
// Stand-in for the LLM step so the search box works offline. It produces the exact
// shape the LLM will, so swapping it out later changes nothing downstream.
import type { MustHave, ParsedQuery, UseCase } from "./types.ts";

const USE_CASE_WORDS: [UseCase, RegExp][] = [
  ["birds", /\bbird(s|ing)?\b/],
  ["wildlife", /\b(wildlife|animals?|safari|zoo)\b/],
  ["indoor_sports", /\b(indoor|gym|basketball|volleyball|hockey)\b/],
  ["sports", /\b(sports?|soccer|football|basketball|baseball|volleyball|hockey|athletes?|racing|stadium|action)\b/],
  ["astro", /\b(astro\w*|stars|milky way|night sky)\b/],
  ["landscape", /\b(landscapes?|scenery|mountains?|hiking|nature|wide[- ]angle)\b/],
  ["architecture", /\b(architecture|buildings?|real estate|interiors?|tilt[- ]shift)\b/],
  ["portrait", /\b(portraits?|headshots?|people)\b/],
  ["weddings", /\bweddings?\b/],
  ["events", /\b(events?|concerts?|parties|party|conferences?|gigs?)\b/],
  ["low_light", /\b(low[- ]light|night|dark|dim|concerts?)\b/],
  ["vlogging", /\b(vlog\w*|youtube\w*|content creat\w*|tiktok|stream\w*|selfie)\b/],
  ["hybrid", /\b(hybrid|photo and video|stills and video)\b/],
  ["video", /\b(video\w*|film\w*|cinema\w*|movies?|slow[- ]motion|overheat\w*|4k|recording)\b/],
  ["travel", /\b(travel\w*|vacation|trips?|hiking|backpack\w*)\b/],
  ["street", /\bstreet\b/],
  ["macro", /\b(macro|close[- ]ups?|product photo\w*|products?|insects?|flowers?)\b/],
  ["beginner", /\b(beginners?|first camera|starter|students?|entry[- ]level|cheapest|learning)\b/],
  ["everyday", /\b(everyday|daily|walk[- ]?around|all[- ]purpose|general|family|upgrade|first prime)\b/],
  ["vr", /\b(vr|virtual reality|3d|180)\b/],
];

const LENS_WORDS = /\b(lens(es)?|primes?|zooms?|telephoto|tele|wide[- ]angle|fisheye|tilt[- ]shift)\b/;
const CAMERA_WORDS = /\b(cameras?|body|bodies)\b/;
// Asking for the whole kit: "camera and lens", "camera with a zoom lens", "starter kit", "setup".
const SET_WORDS = /\b(kits?|set ?ups?|combos?|bundles?|packages?|everything i need|cameras? (with|and|\+|&) (an? )?([\w-]+ ){0,2}lens(es)?)\b/;
const BODY_ONLY_WORDS = /\b(body|bodies)\b/;

// Camera aliases, longest first so "R6 Mark III" wins over "R6 Mark II" and "R50 V" over "R50".
function cameraAliases(cameras: any[]): [RegExp, string][] {
  const out: [string, string][] = [];
  for (const c of cameras) {
    const base = c.name.toLowerCase().replace(/^(eos|powershot)\s+/, "");
    const variants = new Set([base, base.replace(/^rebel\s+/, ""), base.replace(/\s+/g, "")]);
    for (const [roman, n] of [["iii", "3"], ["ii", "2"], ["iv", "4"]]) {
      if (base.endsWith(` mark ${roman}`)) {
        const stem = base.slice(0, -` mark ${roman}`.length);
        variants.add(`${stem} mark ${n}`).add(`${stem} mk${n}`).add(`${stem} m${n}`).add(`${stem} mk ${roman}`);
      }
    }
    for (const v of variants) out.push([v, c.id]);
  }
  out.sort((a, b) => b[0].length - a[0].length);
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return out.map(([v, id]) => [new RegExp(`(^|[^a-z0-9])${esc(v)}(?![a-z0-9])`), id]);
}

export interface ParseResult {
  query: ParsedQuery;
  mentionedCameraId?: string; // set even for camera queries ("upgrade from my T7")
}

export function parseQuery(raw: string, cameras: any[]): ParseResult {
  let t = ` ${raw.toLowerCase().replace(/[“”]/g, '"')} `;

  // Weight first, then strip it so "under 700 grams" is not read as a $700 budget.
  let maxWeightG: number | undefined;
  t = t.replace(/(?:under|below|less than|lighter than|max|<)\s*([\d.,]+)\s*(kg|g|grams?|lbs?|pounds?)\b/, (_m, n, unit) => {
    const v = parseFloat(n.replace(/,/g, ""));
    maxWeightG = Math.round(/^kg/.test(unit) ? v * 1000 : /^(lb|pound)/.test(unit) ? v * 453.6 : v);
    return " ";
  });

  let budgetMax: number | undefined;
  const money = t.match(/(?:under|below|less than|max(?:imum)?|up to|budget(?: of| is)?|around|about|<|\$)\s*\$?\s*([\d,.]+)\s*(k)?\b/);
  if (money) {
    const v = parseFloat(money[1].replace(/,/g, "")) * (money[2] ? 1000 : 1);
    if (v >= 50) budgetMax = v;
  }

  let mentionedCameraId: string | undefined;
  for (const [re, id] of cameraAliases(cameras)) {
    if (re.test(t)) { mentionedCameraId = id; break; }
  }
  // Drop the model name so "R50 V" or "5D" does not trigger use-case words like "vr".
  const words = mentionedCameraId ? t.replace(cameraAliases(cameras).find(([, id]) => id === mentionedCameraId)![0], " ") : t;

  const saysLens = LENS_WORDS.test(words);
  const saysCamera = CAMERA_WORDS.test(words);
  const lensForOwned = mentionedCameraId && !/\bupgrad\w*\b/.test(t) && !saysCamera;
  // A camera request without "body" means the buyer needs something to shoot with: a camera + lens set.
  const category: ParsedQuery["category"] = SET_WORDS.test(words) ? "bundle"
    : saysLens || lensForOwned ? "lens"
    : BODY_ONLY_WORDS.test(words) ? "camera"
    : "bundle";

  const useCases = USE_CASE_WORDS.filter(([, re]) => re.test(words)).map(([u]) => u);
  // A bare "telephoto" lens query is almost always about reach for distant subjects.
  if (category === "lens" && !useCases.length && /\b(telephoto|tele|long lens)\b/.test(words)) useCases.push("wildlife", "sports");

  const mustHave: MustHave[] = [];
  const need = (m: MustHave, re: RegExp) => { if (re.test(words) && !mustHave.includes(m)) mustHave.push(m); };
  if (category !== "lens") {
    need("ibis", /\b(ibis|in[- ]body (image )?stabili[sz]\w*|stabili[sz]ed (body|sensor))\b/);
    need("weather_sealed", /\b(weather[- ]?(sealed|sealing|proof|resistant)|rain\w*)\b/);
    need("vari_angle", /\b(flip(py)?[- ]screen|vari[- ]angle|articulating|selfie screen|flip[- ]out)\b/);
    need("raw_video", /\b(raw video|internal raw|raw recording)\b/);
    need("4k120", /\b(4k\s*120|120\s*fps|120p)\b/);
    need("4k60", /\b(4k\s*60|60\s*fps|60p)\b/);
    need("evf", /\b(viewfinder|evf)\b/);
  }
  if (category === "bundle") {
    need("power_zoom", /\bpower[- ]zoom\b/);
    if (!mustHave.includes("power_zoom")) need("zoom", /\bzoom lens(es)?\b/);
    need("prime", /\bprime( lens)?\b/);
  }
  if (category === "lens") {
    need("is", /\bstabili[sz]\w*/);
    need("power_zoom", /\bpower[- ]zoom\b/);
    if (!mustHave.includes("power_zoom")) need("zoom", /\b(zooms?|telephoto zoom)\b/);
    need("prime", /\bprimes?\b/);
    need("macro", /\b(true macro|1:1)\b/);
    need("weather_sealed", /\bweather[- ]?(sealed|sealing|proof|resistant)\b/);
  }

  const sensor = /\bfull[- ]?frame\b/.test(words) ? "full_frame" : /\b(aps[- ]?c|crop sensor)\b/.test(words) ? "aps_c" : undefined;
  const bodyType = /\bmirrorless\b/.test(words) ? "mirrorless"
    : /\bdslr\b/.test(words) ? "dslr"
    : /\b(compact|point[- ]and[- ]shoot|pocket)\b/.test(words) && category !== "lens" ? "compact" : undefined;
  const level = useCases.includes("beginner") && !/\bcheapest\b/.test(words) ? "beginner"
    : /\b(pro|professional)\b/.test(words) ? "pro"
    : /\b(upgrad\w*|enthusiast|intermediate)\b/.test(words) ? "intermediate" : undefined;

  const query: ParsedQuery = { category, useCases };
  if (budgetMax) query.budgetMax = budgetMax;
  if (category === "lens" && mentionedCameraId) query.ownedCameraId = mentionedCameraId;
  if (sensor && category !== "lens") query.sensor = sensor;
  if (bodyType) query.bodyType = bodyType;
  if (level) query.level = level;
  if (mustHave.length) query.mustHave = mustHave;
  if (maxWeightG) query.maxWeightG = maxWeightG;
  return { query, mentionedCameraId };
}
