"""1mg Medicine & Image Scraper & Hospital Database Ingestion Utility.
Scrapes real medicines, salts, categories, prices, and high-resolution product
box images from https://www.1mg.com and persists them directly into PostgreSQL
pharmacy_medicines or exports to CSV.
"""
from __future__ import annotations

import argparse
import asyncio
import csv
import json
import os
import re
import sys
import time
import urllib.request
from typing import Any, Optional

# Ensure app imports work
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
}


def fetch_url(url: str, timeout: int = 15) -> Optional[str]:
    """Fetch HTML content with standard browser headers."""
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read().decode('utf-8', errors='ignore')
    except Exception as exc:
        print(f"  [ERROR] Failed to fetch {url}: {exc}")
        return None


def parse_1mg_drug(slug: str) -> Optional[dict[str, Any]]:
    """Parse complete medicine metadata, pricing, and pack shots from 1mg drug detail page."""
    url = f"https://www.1mg.com{slug}" if not slug.startswith('http') else slug
    html = fetch_url(url)
    if not html:
        return None

    name = ''
    category = 'General'
    salt = ''
    mrp = 50.0
    price = 40.0
    images = []

    # 1. Attempt Redux State extraction (window.__INITIAL_STATE__)
    idx = html.find('window.__INITIAL_STATE__ = ')
    if idx != -1:
        try:
            state, _ = json.JSONDecoder().raw_decode(html[idx + len('window.__INITIAL_STATE__ = '):])
            dpr = state.get('drugPageReducer', {})
            sd = dpr.get('staticData', {})
            dd = dpr.get('dynamicData', {})

            title_data = sd.get('pageTitleData') or {}
            name = title_data.get('title') or ''

            # Real high-res product photos on 1mg Gumlet CDN
            images_data = sd.get('stillAndMovingImagesData') or []
            for im in images_data:
                img_url = im.get('high') or im.get('medium') or im.get('low')
                if img_url and 'marketing' not in img_url:
                    images.append(img_url)

            # Salt / Composition
            fact_box = sd.get('factBoxData') or {}
            for attr in fact_box.get('attributesData') or []:
                if attr.get('label') == 'Therapeutic Class':
                    category = attr.get('value') or 'General'

            # Pricing
            price_box = dd.get('priceBox') or {}
            if price_box.get('mrp'):
                mrp = float(price_box.get('mrp'))
            if price_box.get('bestPrice') or price_box.get('price'):
                price = float(price_box.get('bestPrice') or price_box.get('price'))
        except Exception:
            pass

    # 2. HTML Fallbacks
    if not name:
        h1 = re.findall(r'<h1[^>]*>(.*?)</h1>', html, re.I)
        name = h1[0].strip() if h1 else slug.replace('/drugs/', '').replace('-', ' ').title()

    if not salt:
        salt_match = re.findall(r'href="[^"]*generics[^"]*"[^>]*>(.*?)</a>', html, re.I)
        if salt_match:
            salt = re.sub(r'<[^>]+>', '', salt_match[0]).strip()

    if mrp == 50.0 and price == 40.0:
        prices_found = re.findall(r'₹\s*([0-9,.]+)', html)
        if len(prices_found) >= 2:
            try:
                p1 = float(prices_found[0].replace(',', ''))
                p2 = float(prices_found[1].replace(',', ''))
                price = min(p1, p2)
                mrp = max(p1, p2)
            except Exception:
                pass

    if not images:
        raw_imgs = re.findall(r'https://onemg\.gumlet\.io/[a-zA-Z0-9_\-/%+.]+(?:jpg|png|webp|jpeg)', html)
        for img in raw_imgs:
            if not any(x in img for x in ['marketing', 'diagnostics', 'external_link', 'watermark']):
                images.append(img)

    # 3. Infer dosage form
    n_lower = name.lower()
    dosage_form = 'Tablet'
    if 'injection' in n_lower or 'vial' in n_lower: dosage_form = 'Injection'
    elif 'capsule' in n_lower or 'cap' in n_lower: dosage_form = 'Capsule'
    elif 'syrup' in n_lower or 'suspension' in n_lower or 'liquid' in n_lower: dosage_form = 'Syrup'
    elif 'drop' in n_lower: dosage_form = 'Drops'
    elif 'gel' in n_lower or 'cream' in n_lower or 'ointment' in n_lower: dosage_form = 'Ointment'
    elif 'inhaler' in n_lower or 'rotacap' in n_lower: dosage_form = 'Inhaler'

    # Extract strength (e.g. 500mg, 650mg, 10mg)
    strength_match = re.search(r'(\d+(?:\.\d+)?\s*(?:mg|gm|mcg|ml|iu|%))', name, re.I)
    strength = strength_match.group(1) if strength_match else ''

    # Clean brand / name
    brand = name.split()[0] if name else 'Standard'

    return {
        'name': name.strip(),
        'brand': brand,
        'salt': salt.strip() or 'Generic Composition',
        'category': category.strip(),
        'dosage_form': dosage_form,
        'strength': strength,
        'mrp': round(mrp, 2),
        'price': round(price, 2),
        'image': images[0] if images else None,
        'all_images': images,
        'url': url,
    }


def get_medicine_slugs_from_directory(alphabet: str = 'a', max_pages: int = 1) -> list[str]:
    """Crawl 1mg's A-Z directory for medicine detail slugs."""
    slugs = []
    for page in range(1, max_pages + 1):
        url = f"https://www.1mg.com/drugs-all-medicines?label={alphabet.lower()}&page={page}"
        print(f"[*] Crawling 1mg Directory: Alphabet '{alphabet.upper()}', Page {page}...")
        html = fetch_url(url)
        if not html:
            break
        links = re.findall(r'href="(/drugs/[^"#?]+)"', html)
        unique_links = list(dict.fromkeys(links))
        print(f"    Found {len(unique_links)} medicines on page {page}")
        slugs.extend(unique_links)
        if len(unique_links) == 0:
            break
        time.sleep(1.0)
    return list(dict.fromkeys(slugs))


# Ensure immediate stdout flushing
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(line_buffering=True)


async def insert_into_postgres(medicines: list[dict[str, Any]], hospital_id: Optional[int] = None):
    """Insert or update scraped medicines directly into PostgreSQL pharmacy_medicines using fast batching."""
    from app.config.db import db
    await db.connect()

    # 1. Ensure unique constraint exists for fast idempotent upsert
    try:
        await db.execute("""
            CREATE UNIQUE INDEX IF NOT EXISTS idx_pharmacy_medicines_hosp_name 
            ON pharmacy_medicines(hospital_id, LOWER(TRIM(name)));
        """)
    except Exception as e:
        print(f"[*] Index notice: {e}")

    # 2. Determine hospitals to populate
    if hospital_id:
        hospitals = [{'id': hospital_id}]
    else:
        hospitals = await db.query("SELECT id FROM hospital_tieups")
        if not hospitals:
            hospitals = [{'id': 1}]

    total_records = 0
    batch_params = []
    print(f"\n[*] Preparing {len(medicines)} medicines for {len(hospitals)} hospital(s)...", flush=True)

    upsert_sql = """
        INSERT INTO pharmacy_medicines (
            hospital_id, name, brand, salt, category, dosage_form, strength,
            mrp, price, stock, image, rack_location, requires_rx, is_active, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true, true, NOW())
        ON CONFLICT (hospital_id, LOWER(TRIM(name))) 
        DO UPDATE SET 
            price = EXCLUDED.price,
            mrp = EXCLUDED.mrp,
            image = COALESCE(EXCLUDED.image, pharmacy_medicines.image),
            salt = EXCLUDED.salt,
            category = EXCLUDED.category,
            updated_at = NOW();
    """

    for h in hospitals:
        hid = h['id']
        for m in medicines:
            if not m.get('name'):
                continue
            batch_params.append((
                hid,
                m['name'].strip(),
                m.get('brand') or 'Generic',
                m.get('salt') or 'Generic Salt',
                m.get('category') or 'General',
                m.get('dosage_form') or 'Tablet',
                m.get('strength') or '',
                float(m.get('mrp') or 50.0),
                float(m.get('price') or 40.0),
                150,  # initial stock
                m.get('image'),
                f"Rack {m['name'][0].upper()}-1" if m.get('name') else 'Rack A-1',
            ))

    if batch_params:
        try:
            await db.executemany(upsert_sql, batch_params)
            total_records = len(batch_params)
            print(f"[SUCCESS] Ingested/updated {total_records} medicine records across {len(hospitals)} hospitals!", flush=True)
        except Exception as exc:
            print(f"[!] Batch insert error: {exc}. Retrying individually...", flush=True)
            for p in batch_params:
                try:
                    await db.execute(upsert_sql, *p)
                    total_records += 1
                except Exception as ind_exc:
                    print(f"  [ERROR] {p[1]}: {ind_exc}")
            print(f"[SUCCESS] Ingested {total_records} records individually.", flush=True)

    await db.disconnect()


def export_to_csv(medicines: list[dict[str, Any]], filepath: str = 'scraped_1mg_medicines.csv'):
    """Export scraped medicines to a clean CSV file."""
    if not medicines:
        print("[!] No medicines to export.")
        return

    keys = ['name', 'brand', 'salt', 'category', 'dosage_form', 'strength', 'mrp', 'price', 'image', 'url']
    with open(filepath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=keys, extrasaction='ignore')
        writer.writeheader()
        for m in medicines:
            writer.writerow(m)
    print(f"[SUCCESS] Exported {len(medicines)} medicines to CSV: {filepath}")


def main():
    parser = argparse.ArgumentParser(description="1mg Medicine & Image Scraper")
    parser.add_argument('--alphabet', default='a', help="Alphabet label to scrape (e.g. 'a', 'a,b,c', 'all', or 'common')")
    parser.add_argument('--pages', type=int, default=1, help="Number of pages to scrape per letter (30 items/page)")
    parser.add_argument('--limit', type=int, default=20, help="Maximum medicines to scrape per alphabet")
    parser.add_argument('--delay', type=float, default=0.6, help="Delay in seconds between requests")
    parser.add_argument('--hospital-id', type=int, default=None, help="Specific hospital_id to populate in DB (default: all)")
    parser.add_argument('--csv-only', action='store_true', help="Only save to CSV, skip DB insert")
    parser.add_argument('--output', default='scraped_1mg_medicines.csv', help="Output CSV path")

    args = parser.parse_args()

    print(f"============================================================")
    print(f"  Tata 1mg Medicine & Image Scraper & DB Ingestion")
    print(f"============================================================")

    # Determine alphabets to crawl
    if args.alphabet.lower() == 'all':
        letters = [chr(c) for c in range(ord('a'), ord('z') + 1)]
    elif args.alphabet.lower() == 'common':
        letters = ['a', 'b', 'c', 'd', 'm', 'p', 't', 'z']
    else:
        letters = [x.strip().lower() for x in args.alphabet.split(',') if x.strip()]

    all_scraped = []

    for letter in letters:
        print(f"\n---> Starting Alphabet '{letter.upper()}' (Pages: {args.pages}, Limit: {args.limit}) <---")
        slugs = get_medicine_slugs_from_directory(letter, max_pages=args.pages)
        if not slugs:
            print(f"[!] No medicine links found for letter {letter.upper()}. Skipping...")
            continue

        selected_slugs = slugs[:args.limit]
        print(f"[*] Scraping details & high-res images for {len(selected_slugs)} medicines...")

        for i, s in enumerate(selected_slugs, 1):
            print(f"  [{letter.upper()} {i}/{len(selected_slugs)}] Scraping {s}...")
            med = parse_1mg_drug(s)
            if med:
                all_scraped.append(med)
                print(f"    [OK] {med['name']} | Salt: {med['salt'][:30]} | Rs. {med['price']} | Img: {med['image'] is not None}")
            time.sleep(args.delay)

    print(f"\n============================================================")
    print(f"Scraping Completed! Total unique medicines extracted: {len(all_scraped)}")
    print(f"============================================================")

    # 1. Export CSV
    export_to_csv(all_scraped, args.output)

    # 2. Ingest into PostgreSQL if not csv_only
    if not args.csv_only and all_scraped:
        asyncio.run(insert_into_postgres(all_scraped, args.hospital_id))


if __name__ == '__main__':
    main()

