# Canon AI search concept: catalog, compatibility, ranking, eval

Independent concept project, not affiliated with Canon.

## What's here

| Path | What it is |
|---|---|
| `data/cameras.json` | 23 bodies (16 mirrorless, 2 DSLR, 5 compact); firmware variants folded in |
| `data/kits.json` | 8 body + lens kits seen on the live listings, linked by `bodyId` / `lensIds` |
| `data/lenses.json` | 67 lenses (RF, RF-S, EF, EF-S, incl. VR and 2 kit-only lenses) |
| `data/compatibility.json` | All 1,541 camera x lens pairs, plus `lensesByCamera` / `camerasByLens` indexes |
| `src/compatibility.ts` | Mount rules (the single source of truth for the matrix) |
| `src/ranking.ts` | Deterministic ranker: hard filters, use-case fit scores, query-aware reasons |
| `app/` | React homepage (Vite): prompt box, results, categories, featured, lens finder, deals. `?q=` opens a search directly |
| `src/parse.ts` | Keyword parser, free text to `ParsedQuery`. Stand-in for the LLM step, same output shape. "a travel camera" parses as a camera + lens set (`bundle`), "camera body" as body only, "lens for my R8" as lens |
| `src/bundles.ts` | Camera + lens sets: every body x usable lens plus real kits at kit price; budget and weight apply to the set total; one set per body |
| `src/types.ts` | `ParsedQuery`, the shape the LLM must output |
| `eval/queries.json` | 32 queries with hand-labeled expected top 5, split dev/test |
| `eval/run-eval.ts` | recall@5, nDCG@5, hit@1, ranking latency |
| `eval/run-parse-eval.ts` | Parser field accuracy vs the hand parses, and recall@5 from text (`npm run eval:parse`) |
| `eval/check-bundles.ts` | Rule checks for sets (fit, budget, weight, distinct bodies) and sample output (`npm run eval:sets`) |
| `scripts/scrape_listing.py` | Pulls every product on all four camera/lens listings (all pages) into `data/scraped.json` |
| `scripts/reconcile.py` | Updates catalog prices from the scrape and prints a gap report |

Setup: `npm install` (Node 22.6+).

- App: `npm run dev` (Vite dev server), `npm run build`, `npm run typecheck`
- Engine: `npm run build:compat` then `npm run eval` (these run through Node type stripping and need no build)

Full refresh from the live site: `pip install requests beautifulsoup4 && npm run refresh`. The reconcile step lists every product on the site that has no specs yet; adding those to `scripts/build_catalog.py` is the remaining manual work. Kits need no compatibility rows of their own; they inherit their body's.

See `COVERAGE.md` for exactly which listings have been verified against the live site.

## Data provenance (read before publishing)

Every record has `source` and `priceSource`:

- `usa.canon.com/2026-10-20`: the mirrorless body roster and prices were read from the live store listing.
- `press/2026`: specs for models launched in 2026 (R6 Mark III, R6 V, R8 Mark II, RF20-50 PZ), from launch coverage.
- `knowledge-unverified`: everything else. DSLR/compact rosters, all lens prices, and most specs. **Verify these against Canon's spec pages before you demo.**

Firmware variants (Stop Motion, Cropping Guide) are folded into their base body.
`imageUrl` is intentionally `null`; use your own photos or illustrations rather than Canon's.

## Compatibility rules

| Body | RF | RF-S | EF | EF-S |
|---|---|---|---|---|
| RF full-frame | native | crop_mode | adapter | adapter_crop |
| RF APS-C | native (1.6x) | native | adapter | adapter |
| EF full-frame | incompatible | incompatible | native | incompatible |
| EF APS-C | incompatible | incompatible | native (1.6x) | native |

VR dual-fisheye lenses override this with a per-body whitelist. Each pair carries an `effectiveFocalMm`, which the ranker uses so "portrait lens for my R50" correctly favors a 50mm (80mm equivalent).

## Eval results (as of this build)

The 90D and Rebel SL3 were removed from expected lists after the live DSLR listing showed Canon USA no longer sells them.

| Split | n | recall@5 | nDCG@5 | hit@1 |
|---|---|---|---|---|
| dev | 22 | 0.855 | 0.867 | 0.818 |
| test | 10 | 0.695 | 0.806 | 1.000 |

Expected lists were labeled before the engine was run. Two changes were made after the first run, both driven by dev queries: a steeper weight curve (travel) and an interchangeable-lens preference for beginners. Test recall before those changes was 0.680. Don't tune against test queries.

Known weakness (test q27, "wedding zoom"): wide f/2.8 zooms outrank f/4 standard zooms because the fit score over-rewards aperture.

Queries here are pre-parsed by hand so the eval measures ranking only. Add a second eval for the LLM parser (text to `ParsedQuery`) before combining them.
