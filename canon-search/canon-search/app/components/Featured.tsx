import { formatUSD, isOnSale, product } from "../catalog.ts";
import { ProductArt } from "./ProductArt.tsx";

const FEATURED = [
  { id: "eos-r1", tagline: "The flagship for sports and news" },
  { id: "eos-r5-mark-ii", tagline: "45MP stills, 8K video" },
  { id: "eos-r6-mark-iii", tagline: "The all-rounder, renewed" },
  { id: "eos-r50-v", tagline: "Built for creators" },
];

export function Featured() {
  const items = FEATURED.flatMap(f => {
    const p = product(f.id);
    return p ? [{ ...f, p }] : [];
  });

  return (
    <section className="section" aria-labelledby="featured-title">
      <div className="section__head">
        <h2 id="featured-title">Featured cameras</h2>
      </div>
      <div className="featured">
        {items.map(({ p, tagline }, i) => (
          <article key={p.id} className={`feature ${i === 0 ? "feature--hero" : ""}`}>
            {i === 0 && <span className="feature__ghost" aria-hidden="true">{p.name.replace(/^EOS\s+/, "")}</span>}
            <div className="feature__text">
              <p className="eyebrow">{p.sensor === "full_frame" ? "Full frame" : "APS-C"} · {p.megapixels}MP</p>
              <h3>{p.name}</h3>
              <p className="feature__tagline">{tagline}</p>
              <p className="feature__price">
                {formatUSD(p.priceUSD)}
                {isOnSale(p) && <s>{formatUSD(p.regularPriceUSD!)}</s>}
              </p>
              {p.productUrl && <a className="btn btn--small" href={p.productUrl} target="_blank" rel="noreferrer">Shop now</a>}
            </div>
            <ProductArt kind="camera" label={p.name} />
          </article>
        ))}
      </div>
    </section>
  );
}
