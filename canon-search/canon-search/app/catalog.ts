// Catalog data for browsing sections, plus the client for the search API.
import cameraData from "../data/cameras.json";
import lensData from "../data/lenses.json";
import { compatibility } from "../src/compatibility.ts";
import type { SearchResponse } from "../server/search.ts";

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

export type { SearchResponse };

// Search runs on the backend (api/search.ts on Vercel, the Vite dev server locally).
// `as` lets the page switch a camera request between sets and body only.
export async function search(text: string, as?: "camera" | "bundle", signal?: AbortSignal): Promise<SearchResponse> {
  const params = new URLSearchParams({ q: text, ...(as && { as }) });
  const res = await fetch(`/api/search?${params}`, { signal });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error ?? `Search failed (${res.status})`);
  return body as SearchResponse;
}

export const isOnSale = (p: Product) => p.regularPriceUSD != null && p.regularPriceUSD > p.priceUSD;

export const formatUSD = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: n % 1 ? 2 : 0 });
