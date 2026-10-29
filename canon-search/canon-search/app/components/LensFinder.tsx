import { useState } from "react";
import { cameras, compatibleLensCount } from "../catalog.ts";

const bodies = cameras.filter(c => c.type !== "compact");

export function LensFinder({ onAsk }: { onAsk: (text: string) => void }) {
  const [cameraId, setCameraId] = useState(bodies[0]?.id ?? "");
  const camera = bodies.find(c => c.id === cameraId);
  const count = compatibleLensCount(cameraId);

  return (
    <section className="section" aria-labelledby="finder-title">
      <div className="finder">
        <div>
          <p className="eyebrow eyebrow--light">Lens finder</p>
          <h2 id="finder-title">Already have a camera?</h2>
          <p>Pick your body and see which lenses work with it, including adapted EF glass.</p>
        </div>
        <div className="finder__controls">
          <label htmlFor="finder-camera">Your camera</label>
          <select id="finder-camera" value={cameraId} onChange={e => setCameraId(e.target.value)}>
            {bodies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <p className="finder__count"><strong>{count}</strong> compatible lenses</p>
          <div className="finder__actions">
            {["portrait", "travel zoom", "wildlife"].map(use => (
              <button key={use} className="chip chip--light" onClick={() => onAsk(`${use} lens for my ${camera?.name}`)}>
                {use[0].toUpperCase() + use.slice(1)} lenses
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
