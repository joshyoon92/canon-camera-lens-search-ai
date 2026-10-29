// Scores the keyword parser (src/parse.ts) against the hand-parsed queries, then
// runs the ranker on its output so you can see how much parsing costs end to end.
//   field accuracy - share of queries where that field matches the hand parse exactly
//   exact          - every field matches
//   recall@5       - same metric as run-eval.ts, but from parsed text instead of hand parses
// --verbose prints mismatches for dev queries only; don't tune the parser on test.
import { readFileSync } from "node:fs";
import { parseQuery } from "../src/parse.ts";
import { rank } from "../src/ranking.ts";

const { cameras } = JSON.parse(readFileSync("data/cameras.json", "utf8"));
const { lenses } = JSON.parse(readFileSync("data/lenses.json", "utf8"));
const { queries } = JSON.parse(readFileSync("eval/queries.json", "utf8"));
const verbose = process.argv.includes("--verbose");

const FIELDS = ["category", "useCases", "budgetMax", "ownedCameraId", "sensor", "bodyType", "level", "mustHave", "maxWeightG"] as const;
const norm = (v: unknown) => Array.isArray(v) ? JSON.stringify([...v].sort()) : JSON.stringify(v ?? null);
const recall = (got: string[], want: string[]) => want.filter(id => got.includes(id)).length / want.length;

for (const split of ["dev", "test"]) {
  const qs = queries.filter((q: any) => q.split === split);
  const fieldHits: Record<string, number> = Object.fromEntries(FIELDS.map(f => [f, 0]));
  let exact = 0, rHand = 0, rParsed = 0;
  let sets = 0;
  for (const q of qs) {
    const parsed = parseQuery(q.text, cameras).query;
    // The hand parses predate camera + lens sets and label bodies only. A set request scores
    // as a camera match here, and the body ranking is what gets measured (eval/check-bundles.ts covers sets).
    if (parsed.category === "bundle") sets++;
    const query = parsed.category === "bundle" ? { ...parsed, category: "camera" as const } : parsed;
    const misses = FIELDS.filter(f => norm((query as any)[f]) !== norm(q.parsed[f]));
    for (const f of FIELDS) if (!misses.includes(f)) fieldHits[f]++;
    if (!misses.length) exact++;
    rHand += recall(rank(q.parsed, cameras, lenses).map(r => r.id), q.expected);
    rParsed += recall(rank(query, cameras, lenses).map(r => r.id), q.expected);
    if (verbose && split === "dev" && misses.length) {
      console.log(`${q.id} "${q.text}"`);
      for (const f of misses) console.log(`   ${f}: got ${norm((query as any)[f])}, want ${norm(q.parsed[f])}`);
    }
  }
  const pct = (n: number) => (n / qs.length).toFixed(3);
  console.log(`\n${split} n=${qs.length}  exact=${pct(exact)}  recall@5 hand-parsed=${pct(rHand)}  text-parsed=${pct(rParsed)}  parsed as sets=${sets}`);
  console.log("  " + FIELDS.map(f => `${f}=${pct(fieldHits[f])}`).join("  "));
}
