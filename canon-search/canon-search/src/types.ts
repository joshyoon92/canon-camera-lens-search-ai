// Structured query the LLM produces from free text ("smart path").
// The ranking engine only ever sees this shape, never raw text.
export type UseCase =
  | "wildlife" | "birds" | "sports" | "indoor_sports" | "landscape" | "architecture" | "portrait"
  | "weddings" | "events" | "low_light" | "astro" | "video" | "vlogging" | "hybrid" | "travel"
  | "street" | "everyday" | "beginner" | "macro" | "vr";

export type MustHave =
  // cameras
  | "ibis" | "evf" | "weather_sealed" | "vari_angle" | "raw_video" | "4k60" | "4k120" | "fan" | "full_frame"
  // lenses
  | "is" | "macro" | "power_zoom" | "prime" | "zoom";

export interface ParsedQuery {
  category: "camera" | "lens";
  useCases: UseCase[];
  budgetMax?: number;
  ownedCameraId?: string;            // lens queries: "for my R8"
  sensor?: "full_frame" | "aps_c";
  bodyType?: "mirrorless" | "dslr" | "compact";
  level?: "beginner" | "intermediate" | "advanced" | "pro";
  mustHave?: MustHave[];
  maxWeightG?: number;
}

export interface RankedResult {
  id: string;
  name: string;
  score: number;
  priceUSD: number | null;
  reasons: string[];       // grounded in catalog fields; safe to show or pass to the LLM
  compatibility?: { status: string; note: string; effectiveFocalMm: [number, number] | null };
}
