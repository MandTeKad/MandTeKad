#!/usr/bin/env python3
import json, re, time
from datetime import datetime, timezone

try:
    import cloudscraper
    scraper = cloudscraper.create_scraper(browser={'browser':'chrome','platform':'windows','mobile':False})
except ImportError:
    import requests
    scraper = requests.Session()
    scraper.headers.update({'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})

STORIES = [
    {'id': '14526896', 'key': 'crucible',  'title': 'Crucible',             'fandom': 'Star Wars'},
    {'id': '14533340', 'key': 'woe',       'title': 'Woe to the Vanquished','fandom': 'ASOIAF'},
    {'id': '14455132', 'key': 'shadow',    'title': 'Shadow and Lightning', 'fandom': 'Harry Potter'},
    {'id': '14414477', 'key': 'lightning', 'title': 'Of Lightning and Blood','fandom': 'Skyrim'},
    {'id': '14436816', 'key': 'frost',     'title': 'Frost and Death',      'fandom': 'Danny Phantom'},
]

# Manual fallbacks for stories that FFN consistently blocks
# Update these manually when you post a new chapter
FALLBACKS = {
    'crucible': {'chapters': '17', 'words': '91,325', 'updated': 'Apr 2026'},
}

def parse_ffn(html):
    ch  = re.search(r'Chapters:\s*(\d+)', html)
    w   = re.search(r'Words:\s*([\d,]+)', html)
    upd = re.search(r'Updated:\s*<[^>]+>([^<]+)', html) or re.search(r'Updated:\s*([\d/]+)', html)
    fav = re.search(r'Favs:\s*([\d,]+)', html)
    fol = re.search(r'Follows:\s*([\d,]+)', html)
    return {
        'chapters': ch.group(1) if ch else None,
        'words':    w.group(1)  if w  else None,
        'updated':  upd.group(1).strip() if upd else None,
        'favs':     fav.group(1) if fav else None,
        'follows':  fol.group(1) if fol else None,
    }

# Load existing stats.json to preserve fallback data
try:
    with open('stats.json') as f:
        existing = json.load(f)
    existing_stories = existing.get('stories', {})
except:
    existing_stories = {}

results = {}
for s in STORIES:
    url = f"https://www.fanfiction.net/s/{s['id']}/1/"
    print(f"Fetching {s['title']}...")
    data = {}
    try:
        r = scraper.get(url, timeout=20)
        r.raise_for_status()
        data = parse_ffn(r.text)
        if data['chapters']:
            print(f"  ✓ ch={data['chapters']} w={data['words']}")
        else:
            print(f"  ⚠ Got page but no metadata (Cloudflare?)")
            data = {}
    except Exception as e:
        print(f"  ✗ Failed: {e}")
        data = {}

    # If scrape failed, use fallback — first check manual FALLBACKS, then existing stats.json
    if not data.get('chapters'):
        if s['key'] in FALLBACKS:
            data = FALLBACKS[s['key']]
            print(f"  → Using manual fallback: ch={data['chapters']} w={data['words']}")
        elif s['key'] in existing_stories and existing_stories[s['key']].get('chapters'):
            prev = existing_stories[s['key']]
            data = {k: prev.get(k) for k in ['chapters','words','updated','favs','follows']}
            print(f"  → Using previous stats: ch={data['chapters']} w={data['words']}")

    results[s['key']] = {
        'id':     s['id'],
        'title':  s['title'],
        'fandom': s['fandom'],
        **{k: v for k, v in data.items() if v is not None}
    }
    time.sleep(2)

output = {
    'fetched_at': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
    'stories': results
}

with open('stats.json', 'w') as f:
    json.dump(output, f, indent=2)

print(f"\n✓ stats.json written with {len(results)} stories")
