// Generic line drawings instead of product photos (the catalog has no images and
// Canon's own photography should not be reused).
export function ProductArt({ kind, label }: { kind: "camera" | "lens" | "compact"; label?: string }) {
  return (
    <div className={`art art--${kind}`} role="img" aria-label={label ?? kind}>
      <svg viewBox="0 0 120 80" aria-hidden="true">
        {kind === "lens" ? (
          <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round">
            <rect x="22" y="22" width="76" height="36" rx="6" />
            <line x1="40" y1="22" x2="40" y2="58" />
            <line x1="46" y1="22" x2="46" y2="58" />
            <rect x="98" y="26" width="8" height="28" rx="2" />
            <rect x="14" y="27" width="8" height="26" rx="2" />
            <circle cx="72" cy="40" r="2.5" fill="currentColor" stroke="none" className="art__dot" />
          </g>
        ) : kind === "compact" ? (
          <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round">
            <rect x="24" y="22" width="72" height="42" rx="8" />
            <circle cx="56" cy="43" r="13" />
            <circle cx="56" cy="43" r="6" />
            <rect x="78" y="28" width="10" height="6" rx="2" />
            <circle cx="84" cy="18" r="3" fill="currentColor" stroke="none" className="art__dot" />
          </g>
        ) : (
          <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round">
            <path d="M18 30 h20 l6 -10 h24 l6 10 h28 a6 6 0 0 1 6 6 v26 a6 6 0 0 1 -6 6 h-78 a6 6 0 0 1 -6 -6 v-26 a6 6 0 0 1 6 -6 z" />
            <circle cx="58" cy="48" r="15" />
            <circle cx="58" cy="48" r="8" />
            <rect x="22" y="36" width="10" height="20" rx="3" />
            <circle cx="92" cy="38" r="3" fill="currentColor" stroke="none" className="art__dot" />
          </g>
        )}
      </svg>
    </div>
  );
}
