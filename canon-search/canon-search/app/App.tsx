// Placeholder until pages and design exist. Proves the app can load the
// catalog and call the ranking engine in the browser.
import { cameras } from "../data/cameras.json";
import { lenses } from "../data/lenses.json";
import { rank } from "../src/ranking.ts";

const sample = rank({ category: "camera", useCases: ["beginner"] }, cameras, lenses);

export function App() {
  return (
    <main>
      <h1>Canon Search</h1>
      <p>{cameras.length} cameras, {lenses.length} lenses loaded.</p>
      <p>Sample "beginner camera" top 5:</p>
      <ol>
        {sample.map(r => <li key={r.id}>{r.name}</li>)}
      </ol>
    </main>
  );
}
