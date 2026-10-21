// Generates data/compatibility.json: every camera x lens permutation.
import { readFileSync, writeFileSync } from "node:fs";
import { compatibility } from "../src/compatibility.ts";

const { cameras } = JSON.parse(readFileSync("data/cameras.json", "utf8"));
const { lenses } = JSON.parse(readFileSync("data/lenses.json", "utf8"));

const pairs = cameras.flatMap((c: any) => lenses.map((l: any) => compatibility(c, l)));
const byStatus: Record<string, number> = {};
for (const p of pairs) byStatus[p.status] = (byStatus[p.status] ?? 0) + 1;

// Two lookup indexes so the search bar never scans the full matrix.
const lensesByCamera: Record<string, string[]> = {};
const camerasByLens: Record<string, string[]> = {};
for (const p of pairs.filter((p: any) => p.usable)) {
  (lensesByCamera[p.cameraId] ??= []).push(p.lensId);
  (camerasByLens[p.lensId] ??= []).push(p.cameraId);
}

writeFileSync("data/compatibility.json", JSON.stringify({
  meta: { cameras: cameras.length, lenses: lenses.length, pairs: pairs.length, byStatus },
  pairs, lensesByCamera, camerasByLens,
}, null, 1));
console.log(`${pairs.length} pairs`, byStatus);
