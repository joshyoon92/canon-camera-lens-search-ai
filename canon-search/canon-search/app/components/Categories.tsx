import { cameras, lenses } from "../catalog.ts";
import { ProductArt } from "./ProductArt.tsx";

const sellable = lenses.filter(l => !l.kitLensOnly);
const CATEGORIES = [
  { title: "Mirrorless cameras", count: cameras.filter(c => c.type === "mirrorless").length, kind: "camera", ask: "best mirrorless camera" },
  { title: "Compact cameras", count: cameras.filter(c => c.type === "compact").length, kind: "compact", ask: "compact camera for travel" },
  { title: "DSLR cameras", count: cameras.filter(c => c.type === "dslr").length, kind: "camera", ask: "DSLR camera" },
  { title: "RF lenses", count: sellable.filter(l => l.mount === "RF").length, kind: "lens", ask: "everyday zoom lens" },
  { title: "RF-S lenses", count: sellable.filter(l => l.mount === "RF-S").length, kind: "lens", ask: "everyday lens for my R50" },
  { title: "EF & EF-S lenses", count: sellable.filter(l => l.mount === "EF" || l.mount === "EF-S").length, kind: "lens", ask: "lens for my 5D Mark IV" },
] as const;

export function Categories({ onAsk }: { onAsk: (text: string) => void }) {
  return (
    <section className="section" aria-labelledby="cat-title">
      <div className="section__head">
        <h2 id="cat-title">Shop by category</h2>
      </div>
      <div className="categories">
        {CATEGORIES.map(c => (
          <button key={c.title} className="category" onClick={() => onAsk(c.ask)}>
            <ProductArt kind={c.kind} />
            <span className="category__title">{c.title}</span>
            <span className="category__count">{c.count} products</span>
          </button>
        ))}
      </div>
    </section>
  );
}
