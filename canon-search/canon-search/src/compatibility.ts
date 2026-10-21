// Mount compatibility rules: the single source of truth for camera x lens pairs.
// Both the precomputed matrix (data/compatibility.json) and the ranking engine use this.

export type CompatStatus =
  | "native"          // fits and works as designed
  | "crop_mode"       // fits natively, camera switches to 1.6x crop (RF-S on full-frame RF)
  | "adapter"         // needs Mount Adapter EF-EOS R, full functionality
  | "adapter_crop"    // adapter + 1.6x crop (EF-S on full-frame RF)
  | "incompatible"
  | "not_applicable"; // fixed-lens compact

export interface Compat {
  cameraId: string;
  lensId: string;
  status: CompatStatus;
  usable: boolean;
  adapter: string | null;
  cropFactor: number | null;
  effectiveFocalMm: [number, number] | null; // 35mm-equivalent framing on this body
  note: string;
}

const CROP = 1.6;
const ADAPTER = "Mount Adapter EF-EOS R";

export function compatibility(camera: any, lens: any): Compat {
  const base = { cameraId: camera.id, lensId: lens.id };
  const eff = (crop: number): [number, number] =>
    [round(lens.focalMinMm * crop), round(lens.focalMaxMm * crop)];
  const out = (status: CompatStatus, crop: number | null, adapter: string | null, note: string): Compat => ({
    ...base, status, usable: status !== "incompatible" && status !== "not_applicable",
    adapter, cropFactor: crop, effectiveFocalMm: crop ? eff(crop) : null, note,
  });

  if (camera.mount === "fixed") return out("not_applicable", null, null, "Fixed-lens camera; interchangeable lenses don't apply.");

  // VR lenses are whitelisted per body by Canon, regardless of mount.
  if (lens.vr) {
    return lens.compatibleBodiesOnly?.includes(camera.id)
      ? out("native", camera.sensor === "aps_c" ? CROP : 1, null, "Supported VR body (requires EOS VR Utility / Plugin for processing).")
      : out("incompatible", null, null, "Canon does not list this body as supported for this VR lens.");
  }

  const bodyCrop = camera.sensor === "aps_c" ? CROP : 1;

  if (camera.mount === "RF") {
    switch (lens.mount) {
      case "RF":
        return out("native", bodyCrop, null, bodyCrop > 1 ? "Native fit; 1.6x crop narrows the field of view." : "Native fit.");
      case "RF-S":
        return bodyCrop > 1
          ? out("native", CROP, null, "Native fit.")
          : out("crop_mode", CROP, null, "Fits; full-frame body automatically records in 1.6x crop mode (lower resolution).");
      case "EF":
        return out("adapter", bodyCrop, ADAPTER, lens.manualFocus
          ? "Works through the EF-EOS R adapter; manual focus (tilt-shift), as on a DSLR."
          : lens.imageStabilization ? "Full AF and IS through the EF-EOS R adapter." : "Full AF through the EF-EOS R adapter.");
      case "EF-S":
        return bodyCrop > 1
          ? out("adapter", CROP, ADAPTER, "Works through the EF-EOS R adapter.")
          : out("adapter_crop", CROP, ADAPTER, "Works through the adapter in 1.6x crop mode.");
    }
  }

  if (camera.mount === "EF") {
    if (lens.mount === "RF" || lens.mount === "RF-S")
      return out("incompatible", null, null, "RF lenses can't be mounted on EF DSLRs (flange distance too short).");
    if (lens.mount === "EF") return out("native", bodyCrop, null, bodyCrop > 1 ? "Native fit; 1.6x crop." : "Native fit.");
    if (lens.mount === "EF-S")
      return bodyCrop > 1
        ? out("native", CROP, null, "Native fit.")
        : out("incompatible", null, null, "EF-S lenses physically can't mount on full-frame EF bodies.");
  }

  return out("incompatible", null, null, "Unknown mount combination.");
}

function round(n: number) { return Math.round(n * 10) / 10; }
