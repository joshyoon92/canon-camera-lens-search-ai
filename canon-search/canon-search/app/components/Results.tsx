import type { ParsedQuery, RankedBundle, RankedResult } from "../../src/types.ts";
import { formatUSD, isOnSale, product, type SearchResponse } from "../catalog.ts";
import { ProductArt } from "./ProductArt.tsx";

const USE_CASE_LABEL: Record<string, string> = {
  indoor_sports: "indoor sports", low_light: "low light", vr: "VR",
};
const MUST_HAVE_LABEL: Record<string, string> = {
  ibis: "in-body stabilization", evf: "viewfinder", weather_sealed: "weather sealed", vari_angle: "flip screen",
  raw_video: "RAW video", "4k60": "4K 60fps", "4k120": "4K 120fps", fan: "cooling fan", full_frame: "full frame",
  is: "stabilized", macro: "macro", power_zoom: "power zoom", prime: "prime", zoom: "zoom",
};
const CATEGORY_LABEL = { bundle: "Camera + lens set", camera: "Camera body", lens: "Lens" };

// Shows how the request was understood, so a wrong parse is visible rather than silent.
function understood(q: ParsedQuery): string[] {
  const out: string[] = [CATEGORY_LABEL[q.category]];
  for (const u of q.useCases) out.push(USE_CASE_LABEL[u] ?? u);
  if (q.ownedCameraId) out.push(`fits ${product(q.ownedCameraId)?.name ?? q.ownedCameraId}`);
  if (q.budgetMax) out.push(`${q.category === "bundle" ? "set total " : ""}under ${formatUSD(q.budgetMax)}`);
  if (q.maxWeightG) out.push(`under ${q.maxWeightG} g`);
  if (q.sensor) out.push(q.sensor === "full_frame" ? "full frame" : "APS-C");
  if (q.bodyType) out.push(q.bodyType === "dslr" ? "DSLR" : q.bodyType);
  if (q.level) out.push(`${q.level} level`);
  for (const m of q.mustHave ?? []) out.push(MUST_HAVE_LABEL[m] ?? m);
  return out;
}

// The engine adds a "$479" chip for beginners; the price is already shown.
const chips = (reasons: string[]) => reasons.filter(r => !r.startsWith("$"));
const artKind = (id: string) => {
  const p = product(id);
  return p?.category === "lens" ? "lens" : p?.type === "compact" ? "compact" : "camera";
};

interface Props {
  response: SearchResponse;
  onClear: () => void;
  onSwitch: (as: "camera" | "bundle") => void;
}

export function Results({ response, onClear, onSwitch }: Props) {
  const { text, query, results, bundles } = response;
  const isSet = query.category === "bundle";
  const count = isSet ? bundles.length : results.length;

  return (
    <section className="results" aria-live="polite" aria-labelledby="results-title">
      <div className="results__head">
        <div>
          <p className="eyebrow">Your request</p>
          <h2 id="results-title" className="results__title">“{text}”</h2>
          <div className="results__understood">
            <span>Understood as</span>
            {understood(query).map(chip => <span key={chip} className="chip">{chip}</span>)}
          </div>
        </div>
        <div className="results__tools">
          {query.category !== "lens" && (
            <div className="toggle" role="group" aria-label="Show">
              <button aria-pressed={isSet} onClick={() => onSwitch("bundle")}>Camera + lens</button>
              <button aria-pressed={!isSet} onClick={() => onSwitch("camera")}>Body only</button>
            </div>
          )}
          <button className="link-btn" onClick={onClear}>Clear</button>
        </div>
      </div>

      {count === 0 ? (
        <div className="results__empty">
          <p>Nothing in the current catalog matches every requirement{isSet ? " as a complete set" : ""}.</p>
          <p>Try raising the budget or dropping a must-have feature.</p>
        </div>
      ) : isSet ? (
        <ol className="sets">
          {bundles.map((b, i) => <SetRow key={b.id} bundle={b} rank={i} budget={query.budgetMax} />)}
        </ol>
      ) : (
        <ol className="results__list">
          {results.map((r, i) => <ProductCard key={r.id} result={r} rank={i} />)}
        </ol>
      )}
    </section>
  );
}

function ProductCard({ result: r, rank }: { result: RankedResult; rank: number }) {
  const p = product(r.id);
  return (
    <li className={`result ${rank === 0 ? "result--top" : ""}`}>
      <div className="result__rank">{rank === 0 ? "Best match" : `#${rank + 1}`}</div>
      <ProductArt kind={artKind(r.id)} label={r.name} />
      <div className="result__body">
        <h3>{r.name}</h3>
        <div className="result__price">
          {r.priceUSD != null && <strong>{formatUSD(r.priceUSD)}</strong>}
          {p && isOnSale(p) && <s>{formatUSD(p.regularPriceUSD!)}</s>}
        </div>
        <ul className="result__reasons">
          {chips(r.reasons).map(reason => <li key={reason}>{reason}</li>)}
        </ul>
        {r.compatibility && r.compatibility.status !== "native" && (
          <p className="result__note">{r.compatibility.note}</p>
        )}
      </div>
      {p?.productUrl && (
        <a className="btn btn--small" href={p.productUrl} target="_blank" rel="noreferrer">View product</a>
      )}
    </li>
  );
}

function SetRow({ bundle: b, rank, budget }: { bundle: RankedBundle; rank: number; budget?: number }) {
  const items = [b.camera, ...b.lenses];
  const saved = b.separateUSD - b.totalUSD;
  const note = b.lenses.find(l => l.compatibility && l.compatibility.status !== "native")?.compatibility?.note;
  const title = b.lenses.length ? `${b.camera.name} + ${b.lenses.map(l => l.name).join(" + ")}` : b.camera.name;

  return (
    <li className={`set ${rank === 0 ? "set--top" : ""}`}>
      <div className="set__rank">{rank === 0 ? "Best set" : `#${rank + 1}`}</div>

      <div className="set__art" aria-hidden="true">
        <ProductArt kind={artKind(b.camera.id)} />
        {b.lenses.slice(0, 1).map(l => <ProductArt key={l.id} kind="lens" />)}
      </div>

      <div className="set__body">
        <h3 className="sr-only">{title}</h3>
        <ul className="set__items">
          {items.map(item => {
            const url = product(item.id)?.productUrl;
            return (
              <li key={item.id}>
                <span className="set__kind">{item === b.camera ? "Body" : "Lens"}</span>
                {url ? <a href={url} target="_blank" rel="noreferrer">{item.name}</a> : <span>{item.name}</span>}
                {item.priceUSD != null && <span className="set__price">{formatUSD(item.priceUSD)}</span>}
              </li>
            );
          })}
          {b.builtInLens && (
            <li>
              <span className="set__kind">Lens</span>
              <span>{b.builtInLens}</span>
              <span className="set__price">included</span>
            </li>
          )}
        </ul>
        <ul className="result__reasons">
          {[...chips(b.camera.reasons).slice(0, 2), ...b.lenses.flatMap(l => chips(l.reasons).slice(0, 2))]
            .filter((r, i, all) => all.indexOf(r) === i)
            .map(r => <li key={r}>{r}</li>)}
        </ul>
        {note && <p className="result__note">{note}</p>}
      </div>

      <div className="set__total">
        {b.kit && <span className="set__kit">Canon kit{saved > 0 ? ` · save ${formatUSD(saved)}` : ""}</span>}
        <span className="set__label">Set total</span>
        <strong>{formatUSD(b.totalUSD)}</strong>
        {b.kit && saved > 0 && <s>{formatUSD(b.separateUSD)}</s>}
        <span className="set__meta">
          {b.totalWeightG != null && `${b.totalWeightG.toLocaleString()} g`}
          {budget != null && ` · ${formatUSD(budget - b.totalUSD)} under budget`}
        </span>
        {b.kit?.url && <a className="btn btn--small" href={b.kit.url} target="_blank" rel="noreferrer">View kit</a>}
      </div>
    </li>
  );
}
