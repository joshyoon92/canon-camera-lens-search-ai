"""Label sanity checks. Uses only catalog + compatibility data, never the ranker.
Every expected item must exist, satisfy the query's hard constraints, be usable on the
owned camera, and every query must have exactly 5 expected results."""
import json, sys
C = {c["id"]: c for c in json.load(open("data/cameras.json"))["cameras"]}
L = {l["id"]: l for l in json.load(open("data/lenses.json"))["lenses"]}
P = {(p["cameraId"], p["lensId"]): p for p in json.load(open("data/compatibility.json"))["pairs"]}
E = json.load(open("eval/queries.json"))["queries"]

def cam_ok(c, q):
    if q.get("budgetMax") is not None and (c["priceUSD"] or 1e9) > q["budgetMax"]: return "over budget"
    if q.get("sensor") and c["sensor"] != q["sensor"]: return "sensor"
    if q.get("bodyType") and c["type"] != q["bodyType"]: return "body type"
    if q.get("maxWeightG") and (c["weightG"] or 1e9) > q["maxWeightG"]: return "weight"
    v = c["video"]
    checks = {"ibis": c["ibis"], "evf": c["evf"], "weather_sealed": c["weatherSealing"] != "none",
              "vari_angle": c["variAngleScreen"], "raw_video": v["rawInternal"], "4k60": (v["max4kFps"] or 0) >= 60,
              "4k120": (v["max4kFps"] or 0) >= 120, "fan": c["coolingFan"], "full_frame": c["sensor"] == "full_frame"}
    for m in q.get("mustHave", []):
        if not checks[m]: return f"missing {m}"
    return None

def lens_ok(l, q):
    if q.get("budgetMax") is not None and l["priceUSD"] > q["budgetMax"]: return "over budget"
    if q.get("maxWeightG") and (l["weightG"] or 1e9) > q["maxWeightG"]: return "weight unknown/over"
    if l.get("vr") and "vr" not in q["useCases"]: return "VR lens on non-VR query"
    if l.get("kitLensOnly"): return "kit-only"
    checks = {"is": l["imageStabilization"], "macro": l.get("macro"), "power_zoom": l.get("powerZoom"),
              "prime": l["type"] == "prime", "zoom": l["type"] == "zoom", "weather_sealed": l.get("weatherSealed")}
    for m in q.get("mustHave", []):
        if not checks[m]: return f"missing {m}"
    if q.get("ownedCameraId"):
        pr = P.get((q["ownedCameraId"], l["id"]))
        if not pr or not pr["usable"]: return f"not usable on {q['ownedCameraId']}"
    return None

errors = 0
for q in E:
    pq, exp = q["parsed"], q["expected"]
    if len(exp) != 5: print(f"{q['id']}: has {len(exp)} expected (need 5)"); errors += 1
    if len(set(exp)) != len(exp): print(f"{q['id']}: duplicate ids"); errors += 1
    for i in exp:
        cat = C if pq["category"] == "camera" else L
        if i not in cat: print(f"{q['id']}: unknown {pq['category']} {i}"); errors += 1; continue
        why = (cam_ok if pq["category"] == "camera" else lens_ok)(cat[i], pq)
        if why: print(f"{q['id']}: {i} fails ({why})"); errors += 1
splits = {s: sum(q["split"] == s for q in E) for s in ("dev", "test")}
print(f"{len(E)} queries {splits}; {errors} problems")
sys.exit(1 if errors else 0)
