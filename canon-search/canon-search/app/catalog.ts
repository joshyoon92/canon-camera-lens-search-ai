// Catalog data and the search pipeline the page uses: text -> ParsedQuery -> ranked results.
import cameraData from "../data/cameras.json";
import lensData from "../data/lenses.json";
import { parseQuery } from "../src/parse.ts";
import { rank } from "../src/ranking.ts";
import { compatibility } from "../src/compatibility.ts";
import { rankBundles } from "../src/bundles.ts";
import kitData from "../data/kits.json";
import type { ParsedQuery, RankedBundle, RankedResult } from "../src/types.ts";

const kits = kitData.kits;

export interface Product {
  id: string;
  name: string;
  category: "camera" | "lens";
  type: string;
  mount: string;
  sensor?: string;
  priceUSD: number;
  regularPriceUSD: number | null;
  productUrl?: string;
  weightG?: number;
  megapixels?: number;
  focalMinMm?: number;
  focalMaxMm?: number;
  maxApertureWide?: number;
  kitLensOnly?: boolean;
}

export const cameras = cameraData.cameras as unknown as Product[];
export const lenses = lensData.lenses as unknown as Product[];
const byId = new Map([...cameras, ...lenses].map(p => [p.id, p]));
export const product = (id: string) => byId.get(id);

// Same mount rules that generate data/compatibility.json, without shipping the 1,541-pair file.
export const compatibleLensCount = (cameraId: string) => {
  const body = byId.get(cameraId);
  return body ? lenses.filter(l => !l.kitLensOnly && compatibility(body, l).usable).length : 0;
};

export interface SearchResponse {
  text: string;
  query: ParsedQuery;
  results: RankedResult[];        // camera or lens queries
  bundles: RankedBundle[];        // camera + lens set queries
}

// `as` lets the page switch a camera request between sets and body only.
export function search(text: string, as?: "camera" | "bundle"): SearchResponse {
  const parsed = parseQuery(text, cameras).query;
  const query = as && parsed.category !== "lens" ? { ...parsed, category: as } : parsed;
  return query.category === "bundle"
    ? { text, query, results: [], bundles: rankBundles(query, cameras, lenses, kits, 5) }
    : { text, query, results: rank(query, cameras, lenses, 5), bundles: [] };
}

export const isOnSale = (p: Product) => p.regularPriceUSD != null && p.regularPriceUSD > p.priceUSD;

export const formatUSD = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: n % 1 ? 2 : 0 });
