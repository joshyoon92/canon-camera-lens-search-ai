"""Merges data/scraped.json into the catalog and prints what still needs human work.

- Prices / stock for products already in the catalog are updated in place (priceSource set to the scrape date).
- Products on the site but not in the catalog are listed: add their specs to build_catalog.py.
- Catalog products not on the site are listed: remove them or mark them discontinued.
Matching is by product URL first, then by normalized name.
"""
import json, re, sys

def norm(s: str) -> str:
    return re.sub(r"[^a-z0-9]", "", s.lower().replace("body", "").replace("camera", ""))

scraped = json.load(open("data/scraped.json"))
date = scraped["scrapedOn"]
files = {"cameras": "data/cameras.json", "lenses": "data/lenses.json", "kits": "data/kits.json"}
cat = {k: json.load(open(v)) for k, v in files.items()}

index = {}
for k in files:
    for item in cat[k][k]:
        if item.get("productUrl") or item.get("url"): index[(item.get("productUrl") or item.get("url"))] = (k, item)
        index[norm(item["name"])] = (k, item)
        for v in item.get("variants", []): index[v["url"]] = (k, item)

matched, unknown = set(), []
for p in scraped["products"]:
    hit = index.get(p["url"]) or index.get(norm(p["name"]))
    if not hit:
        unknown.append(p); continue
    k, item = hit
    matched.add(item["id"])
    if p["kind"] == "variant": continue  # base product keeps its own price
    item.update(priceUSD=p["priceUSD"], regularPriceUSD=p["regularPriceUSD"], stock=p["stock"],
                priceSource=f"usa.canon.com/{date}")
    item.setdefault("productUrl", p["url"]) if k != "kits" else None

for k, path in files.items(): json.dump(cat[k], open(path, "w"), indent=2)

stale = [i for k in files for i in cat[k][k] if i["id"] not in matched and not i.get("kitLensOnly")]
print(f"Updated prices for {len(matched)} catalog products from the {date} scrape.\n")
print(f"ON SITE, NOT IN CATALOG ({len(unknown)}): add specs in scripts/build_catalog.py")
for p in sorted(unknown, key=lambda p: (p["kind"], p["name"])):
    print(f"  [{p['kind']:7}] {p['name']}  ${p['priceUSD']}  {p['url']}")
print(f"\nIN CATALOG, NOT ON SITE ({len(stale)}): verify, then remove or mark discontinued")
for i in stale: print(f"  {i['id']}  ({i['name']})")
sys.exit(0)
