#!/usr/bin/env python3
import json, re, time
from datetime import datetime, timezone
try:
    import cloudscraper
    scraper = cloudscraper.create_scraper(browser={'browser':'chrome','platform':'windows','mobile':False})
except ImportError:
    import requests
    scraper = requests.Session()
    scraper.headers.update({'User-Agent':'Mozilla/5.0'})

STORIES = [
    {'id': '14526896', 'key': 'crucible',  'title': 'Crucible',             'fandom': 'Star Wars'},
    {'id': '14533340', 'key': 'woe',       'title': 'Woe to the Vanquished','fandom': 'ASOIAF'},
    {'id': '14455132', 'key': 'shadow',    'title': 'Shadow and Lightning', 'fandom': 'Harry Potter'},
    {'id': '14414477', 'key': 'lightning', 'title': 'Of Lightning and Blood','fandom': 'Skyrim'},
    {'id': '14436816', 'key': 'frost',     'title': 'Frost and Death',      'fandom': 'Danny Phantom'},
]

def parse_ffn(html):
    ch = re.search(r"Chapters:\s*(\d+)", html)
    w = re.search(r"Words:\s*([\d,]+)", html)
    upd = re.search(r"Updated:\s*<[^>]+>([^<]+)", html) or re.search(r"Updated:\s*([\d/]+)", html)
    fav = re.search(r"Favs:\s*([\d,]+)", html)
    fol = re.search(r"Follows:\s*([\d,]+)", html)
    return {'chapters': ch.group(1) if ch else None, 'words': w.group(1) if w else None,
            'updated': upd.group(1).strip() if upd else None,
            'favs': fav.group(1) if fav else None, 'follows': fol.group(1) if fol else None}

results = {}
for s in STORIES:
    print(f"Fetching {s['title']}...")
    try:
        r = scraper.get(f"https://www.fanfiction.net/s/{s['id']}/1/", timeout=20)
        r.raise_for_status()
        data = parse_ffn(r.text)
        if not data['chapters']: data = {}
    except Exception as e:
        print(f"  Failed: {e}"); data = {}
    results[s['key']] = {'id': s['id'], 'title': s['title'], 'fandom': s['fandom'], **data}
    time.sleep(2)

output = {'fetched_at': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'), 'stories': results}
with open('stats.json', 'w') as f: json.dump(output, f, indent=2)
print(f"Done: {len(results)} stories written")
