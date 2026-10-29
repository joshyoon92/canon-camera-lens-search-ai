// Search endpoint logic, shared by the Vercel function (api/search.ts) and the Vite dev server.
// Free text -> ParsedQuery -> ranked products or camera + lens sets.
// The LLM parsing step will replace parseQuery here; the API key stays server-side.
import cameraData from "../data/cameras.json" with { type: "json" };
import lensData from "../data/lenses.json" with { type: "json" };
import kitData from "../data/kits.json" with { type: "json" };
import { parseQuery } from "../src/parse.ts";
import { rank } from "../src/ranking.ts";
import { rankBundles } from "../src/bundles.ts";
import type { ParsedQuery, RankedBundle, RankedResult } from "../src/types.ts";

const cameras = cameraData.cameras as any[];
const lenses = lensData.lenses as any[];
const kits = kitData.kits as any[];

export const MAX_QUERY_LENGTH = 300;

export interface SearchResponse {
  text: string;
  query: ParsedQuery;
  results: RankedResult[];   // camera or lens queries
  bundles: RankedBundle[];   // camera + lens set queries
  parser: "keyword";
}

// `as` switches a camera request between sets and body only.
export function runSearch(text: string, as?: "camera" | "bundle"): SearchResponse {
  const parsed = parseQuery(text, cameras).query;
  const query = as && parsed.category !== "lens" ? { ...parsed, category: as } : parsed;
  const base = { text, query, parser: "keyword" as const };
  return query.category === "bundle"
    ? { ...base, results: [], bundles: rankBundles(query, cameras, lenses, kits, 5) }
    : { ...base, results: rank(query, cameras, lenses, 5), bundles: [] };
}

// Web-standard handler: validates input, returns JSON. Used as-is by Vercel and the dev server.
export async function handleSearch(request: Request): Promise<Response> {
  let text: unknown, as: unknown;
  if (request.method === "GET") {
    const url = new URL(request.url);
    text = url.searchParams.get("q");
    as = url.searchParams.get("as") ?? undefined;
  } else if (request.method === "POST") {
    const body = (await request.json().catch(() => null)) as { q?: unknown; as?: unknown } | null;
    text = body?.q;
    as = body?.as;
  } else {
    return Response.json({ error: "Use GET or POST." }, { status: 405, headers: { Allow: "GET, POST" } });
  }

  if (typeof text !== "string" || !text.trim()) {
    return Response.json({ error: "Missing query text (q)." }, { status: 400 });
  }
  if (text.length > MAX_QUERY_LENGTH) {
    return Response.json({ error: `Query is longer than ${MAX_QUERY_LENGTH} characters.` }, { status: 400 });
  }
  if (as !== undefined && as !== "camera" && as !== "bundle") {
    return Response.json({ error: 'as must be "camera" or "bundle".' }, { status: 400 });
  }

  return Response.json(runSearch(text.trim(), as as "camera" | "bundle" | undefined), {
    // Results depend only on the query and the catalog, so let the CDN reuse them.
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
