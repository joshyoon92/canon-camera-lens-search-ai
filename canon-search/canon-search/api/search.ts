// Vercel Function: GET /api/search?q=...&as=camera|bundle, or POST { q, as }.
import { handleSearch } from "../server/search.ts";

export const GET = handleSearch;
export const POST = handleSearch;
