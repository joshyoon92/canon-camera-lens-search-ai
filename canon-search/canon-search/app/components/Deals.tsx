import { cameras, formatUSD, isOnSale, lenses } from "../catalog.ts";
import { ProductArt } from "./ProductArt.tsx";

const deals = [...cameras, ...lenses]
  .filter(p => isOnSale(p) && !p.kitLensOnly)
  .map(p => ({ p, saved: p.regularPriceUSD! - p.priceUSD }))
  .sort((a, b) => b.saved - a.saved)
  .slice(0, 10);

export function Deals() {
  if (!deals.length) return null;
  return (
    <section className="section" aria-labelledby="deals-title">
      <div className="section__head">
        <h2 id="deals-title">Current savings</h2>
        <p>Biggest price drops across cameras and lenses.</p>
      </div>
      <div className="rail" tabIndex={0} aria-label="Deals, scroll sideways">
        {deals.map(({ p, saved }) => (
          <a key={p.id} className="deal" href={p.productUrl ?? "#"} target="_blank" rel="noreferrer">
            <span className="deal__badge">Save {formatUSD(saved)}</span>
            <ProductArt kind={p.category === "lens" ? "lens" : p.type === "compact" ? "compact" : "camera"} label={p.name} />
            <span className="deal__name">{p.name}</span>
            <span className="deal__price">
              {formatUSD(p.priceUSD)} <s>{formatUSD(p.regularPriceUSD!)}</s>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
