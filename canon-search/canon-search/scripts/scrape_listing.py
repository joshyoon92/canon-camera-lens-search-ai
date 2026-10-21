"""Pulls every product on Canon USA's camera and lens listings (all pages).

Run locally (canon.com was not reachable from the environment this was written in,
so the CSS selectors are based on the page markup seen on 2026-10-20; adjust if needed):

    pip install requests beautifulsoup4
    python scripts/scrape_listing.py          # writes data/scraped.json
    python scripts/reconcile.py               # merges into the catalog, prints a gap report
"""
import json, re, time
import requests
from bs4 import BeautifulSoup

LISTINGS = {
    "mirrorless_cameras": "https://www.usa.canon.com/shop/digital-cameras/mirrorless-cameras",
    "dslr_cameras": "https://www.usa.canon.com/shop/digital-cameras/dslr-cameras",
    "mirrorless_lenses": "https://www.usa.canon.com/shop/camera-lenses/mirrorless-lenses",
    "dslr_lenses": "https://www.usa.canon.com/shop/camera-lenses/dslr-lenses",
}
PRICE = re.compile(r"\$([\d,]+\.\d{2})")
HEADERS = {"User-Agent": "canon-search-concept/0.2 (personal portfolio project)"}

def kind_of(name: str, listing: str) -> str:
    if "lenses" in listing: return "lens"
    if re.search(r"\bKit\b", name, re.I): return "kit"
    if re.search(r"Stop Motion|Cropping Guide|Canon Log", name, re.I): return "variant"
    return "body"

def scrape(listing: str, url: str) -> list[dict]:
    items: dict[str, dict] = {}
    page = 1
    while True:
        html = requests.get(url, params={"p": page}, headers=HEADERS, timeout=30).text
        cards = BeautifulSoup(html, "html.parser").select("li.product-item")
        added = 0
        for card in cards:
            link = card.select_one("a.product-item-link")
            if not link: continue
            href = link["href"].split("?")[0]
            if href in items: continue
            text = card.get_text(" ", strip=True)
            prices = sorted(float(p.replace(",", "")) for p in PRICE.findall(text))
            name = link.get_text(strip=True).removesuffix(" NEW").strip()
            items[href] = {
                "name": name, "url": href, "listing": listing, "kind": kind_of(name, listing),
                "priceUSD": prices[0] if prices else None,
                "regularPriceUSD": prices[-1] if len(prices) > 1 else None,
                "stock": "out" if "Out Of Stock" in text else "backorder" if "Backorder" in text else "in",
            }
            added += 1
        if added == 0: break   # past the last page, Magento repeats the final page
        page += 1
        time.sleep(1.5)
    return list(items.values())

if __name__ == "__main__":
    out = {"scrapedOn": time.strftime("%Y-%m-%d"), "products": []}
    for listing, url in LISTINGS.items():
        rows = scrape(listing, url)
        print(f"{listing}: {len(rows)}")
        out["products"] += rows
    json.dump(out, open("data/scraped.json", "w"), indent=2)
