// Camera + lens sets have no hand labels yet, so this checks the rules every set must obey
// on all camera queries (re-run as sets) and prints the sets for a few sample requests.
//   - the lens works on the body; kit prices match kits.json
//   - the set total fits the budget and weight limits
//   - no body appears twice in a top 5
// Also reports body overlap: how often the camera-only labels' bodies appear in the sets.
import { readFileSync } from "node:fs";
import { rankBundles } from "../src/bundles.ts";
import { compatibility } from "../src/compatibility.ts";

const { cameras } = JSON.parse(readFileSync("data/cameras.json", "utf8"));
const { lenses } = JSON.parse(readFileSync("data/lenses.json", "utf8"));
const { kits } = JSON.parse(readFileSync("data/kits.json", "utf8"));
const { queries } = JSON.parse(readFileSync("eval/queries.json", "utf8"));
const byId = new Map([...cameras, ...lenses].map((x: any) => [x.id, x]));

const failures: string[] = [];
let overlap = 0, n = 0;
for (const q of queries.filter((x: any) => x.parsed.category === "camera")) {
  const sets = rankBundles({ ...q.parsed, category: "bundle" }, cameras, lenses, kits);
  const fail = (msg: string) => failures.push(`${q.id} "${q.text}": ${msg}`);
  if (!sets.length) fail("no sets");
  const bodies = sets.map(s => s.camera.id);
  if (new Set(bodies).size !== bodies.length) fail("duplicate body");
  for (const s of sets) {
    const body = byId.get(s.camera.id);
    for (const l of s.lenses) if (!compatibility(body, byId.get(l.id)).usable) fail(`${l.id} does not fit ${body.id}`);
    if (!s.lenses.length && body.mount !== "fixed") fail(`${body.id} has no lens`);
    if (q.parsed.budgetMax && s.totalUSD > q.parsed.budgetMax) fail(`${s.id} $${s.totalUSD} over budget`);
    if (q.parsed.maxWeightG && (s.totalWeightG ?? Infinity) > q.parsed.maxWeightG) fail(`${s.id} over weight`);
    if (s.kit && kits.find((k: any) => k.id === s.kit!.id)?.priceUSD !== s.totalUSD) fail(`${s.id} kit price mismatch`);
  }
  overlap += q.expected.filter((id: string) => bodies.includes(id)).length / q.expected.length;
  n++;
}

const SAMPLES = [
  { category: "bundle", useCases: ["travel"] },
  { category: "bundle", useCases: ["travel"], budgetMax: 1500 },
  { category: "bundle", useCases: ["beginner"], level: "beginner", budgetMax: 1000 },
  { category: "bundle", useCases: ["wildlife"], budgetMax: 3000 },
  { category: "bundle", useCases: ["portrait"], budgetMax: 2500, sensor: "full_frame" },
];
for (const q of SAMPLES) {
  console.log("\n" + JSON.stringify(q));
  for (const s of rankBundles(q as any, cameras, lenses, kits)) {
    const what = s.lenses.map(l => l.name).join(" + ") || s.builtInLens;
    console.log(`  ${s.score.toFixed(3)}  $${s.totalUSD}${s.kit ? " (kit)" : ""}  ${s.totalWeightG ?? "?"} g  ${s.camera.name} + ${what}`);
  }
}

console.log(`\n${n} camera queries re-run as sets. Rule failures: ${failures.length}`);
for (const f of failures) console.log("  " + f);
console.log(`Body overlap with camera-only labels: ${(overlap / n).toFixed(3)} (informational; sets trade some body fit for lens fit)`);
if (failures.length) process.exit(1);
