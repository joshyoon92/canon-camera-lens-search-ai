// Runs every eval query through the ranking engine and reports:
//   recall@5  - share of expected items that appear in the top 5
//   nDCG@5    - order-aware; expected rank 1 has the highest gain
//   hit@1     - engine's #1 is in the expected top 2
import { readFileSync } from "node:fs";
import { rank } from "../src/ranking.ts";

const { cameras } = JSON.parse(readFileSync("data/cameras.json", "utf8"));
const { lenses } = JSON.parse(readFileSync("data/lenses.json", "utf8"));
const { queries } = JSON.parse(readFileSync("eval/queries.json", "utf8"));
const verbose = process.argv.includes("--verbose");
const splitArg = process.argv.find(a => a.startsWith("--split="))?.split("=")[1];

// Catch typos in expected ids before they silently tank the metrics.
const known = new Set([...cameras, ...lenses].map((x: any) => x.id));
for (const q of queries) for (const id of q.expected)
  if (!known.has(id)) throw new Error(`${q.id}: unknown expected id ${id}`);

function ndcg(got: string[], expected: string[]) {
  const gain = (id: string) => { const i = expected.indexOf(id); return i < 0 ? 0 : expected.length - i; };
  const dcg = got.reduce((s, id, i) => s + gain(id) / Math.log2(i + 2), 0);
  const ideal = expected.slice(0, 5).reduce((s, id, i) => s + gain(id) / Math.log2(i + 2), 0);
  return dcg / ideal;
}

const rows: any[] = [];
for (const q of queries.filter((q: any) => !splitArg || q.split === splitArg)) {
  const t0 = performance.now();
  const results = rank(q.parsed, cameras, lenses, 5);
  const ms = performance.now() - t0;
  const got = results.map(r => r.id);
  const expected5 = q.expected.slice(0, 5);
  const recall = got.filter(id => expected5.includes(id)).length / expected5.length;
  const row = { id: q.id, split: q.split, recall, ndcg: ndcg(got, q.expected), hit1: expected5.slice(0, 2).includes(got[0]) ? 1 : 0, ms, text: q.text };
  rows.push(row);
  if (verbose || recall < 0.6) {
    console.log(`\n${q.id} [${q.split}] "${q.text}"  recall=${recall.toFixed(2)} ndcg=${row.ndcg.toFixed(2)}`);
    results.forEach((r, i) => console.log(`  ${i + 1}. ${expected5.includes(r.id) ? "✓" : "✗"} ${r.name.padEnd(36)} ${r.score.toFixed(3)}  ${r.reasons.join(" · ")}`));
    const missed = expected5.filter((id: string) => !got.includes(id));
    if (missed.length) console.log(`     missed: ${missed.join(", ")}`);
  }
}

const mean = (k: string, rs = rows) => rs.reduce((s, r) => s + r[k], 0) / rs.length;
const summary = (label: string, rs: any[]) => rs.length &&
  console.log(`${label.padEnd(6)} n=${String(rs.length).padStart(2)}  recall@5=${mean("recall", rs).toFixed(3)}  nDCG@5=${mean("ndcg", rs).toFixed(3)}  hit@1=${mean("hit1", rs).toFixed(3)}`);
console.log("\n=== Summary ===");
summary("dev", rows.filter(r => r.split === "dev"));
summary("test", rows.filter(r => r.split === "test"));
summary("all", rows);
const lat = rows.map(r => r.ms).sort((a, b) => a - b);
console.log(`ranking latency p50=${lat[Math.floor(lat.length / 2)].toFixed(2)}ms  p95=${lat[Math.floor(lat.length * 0.95)].toFixed(2)}ms`);
