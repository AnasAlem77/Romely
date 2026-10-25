#!/usr/bin/env python3
"""
Romely image candidate discovery (READ-ONLY research tool).

What it does
  Phase 1  Wikimedia Commons API search for the 39 missing-candidate places.
  Phase 2  Official-source pages (you supply page URLs; the script extracts image
           URLs from them, respecting robots.txt and never bypassing access controls).
  Phase 3  The same Commons search for the 14 replacement places.

What it never does
  - Never modifies new-image-urls.json, missing-image-candidates.json,
    image-coverage-report.json, prisma/paris-places.json, or any database.
  - Never runs seed or replacement scripts.
  - Never builds image URLs by guessing: every URL comes from an API response
    or from parsed HTML of a page you listed.
  - Never marks a subject as visually confirmed. An HTTP image check only proves
    "this URL returns image bytes", not "this is the right place".

Usage
  python discover_image_candidates.py --contact you@example.com --dry-run
  python discover_image_candidates.py --contact you@example.com
  python discover_image_candidates.py --contact you@example.com --phases 1 --only eiffel-tower
  python discover_image_candidates.py --write-official-template   # no network

Requires: python 3.9+, requests. Optional: Pillow (reads dimensions from partial downloads).
"""
import argparse
import hashlib
import io
import json
import os
import re
import sys
import time
import unicodedata
import urllib.parse
import urllib.robotparser
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path

try:
    import requests
except ImportError:
    sys.exit("This script needs the 'requests' package: pip install requests")

try:
    from PIL import ImageFile
except ImportError:  # dimensions for official images will stay null
    ImageFile = None

SCRIPT_VERSION = "1.0.0"
COMMONS_API = "https://commons.wikimedia.org/w/api.php"
ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp"}
DENY_WORDS = [
    "map", "plan", "logo", "coat of arms", "blason", "stamp", "poster", "lithograph",
    "engraving", "drawing", "diagram", "locomotive", "sticker", "flag", "icon",
    "screenshot", "timbre", "carte", "affiche", "gravure", "dessin",
]
FREE_LICENSE_HINTS = ("cc", "public domain", "pd", "gfdl", "free art", "licence ouverte", "etalab")
STOPWORDS = {"de", "du", "la", "le", "les", "des", "d", "l", "et", "and", "the", "of", "paris", "rue", "avenue"}
HTTP_CHECK_BYTES = 256 * 1024  # never download more than this per image check
HTML_LIMIT_BYTES = 2 * 1024 * 1024
FOP_RISK_SLUGS = {  # France has no general freedom of panorama: flag for licence review
    "musee-du-louvre": "Louvre Pyramid is a protected modern work; Commons often warns about it.",
    "eiffel-tower": "Night illumination of the Eiffel Tower is protected; prefer daytime images.",
    "parc-de-la-villette": "Contains modern protected architecture (Folies, Cité des Sciences).",
    "opera-bastille": "Modern building (1989); photograph licence may not cover the architecture.",
}

# --------------------------------------------------------------------------------------
# Built-in task definitions (the 39 slugs/names come from the project brief; the script
# prefers missing-image-candidates.json when it exists and warns on any mismatch).
# tuple: (slug, name, visual_terms, aliases, official_priority)
# --------------------------------------------------------------------------------------
MISSING = [
    ("the-peninsula-paris", "The Peninsula Paris", "hotel facade avenue Kléber", ["Hôtel Majestic Paris", "Peninsula Paris hotel"], True),
    ("le-cinq", "Le Cinq", "restaurant Four Seasons George V", ["Four Seasons Hotel George V"], True),
    ("frenchie", "Frenchie", "restaurant rue du Nil", ["Frenchie restaurant Paris"], True),
    ("eiffel-tower", "Eiffel Tower", "daytime", ["Tour Eiffel"], False),
    ("musee-du-louvre", "Musée du Louvre", "facade courtyard", ["Louvre Museum", "Palais du Louvre"], False),
    ("musee-dorsay", "Musée d'Orsay", "facade Seine", ["Orsay Museum"], False),
    ("notre-dame-de-paris", "Notre-Dame de Paris", "cathedral facade", ["Cathédrale Notre-Dame de Paris"], False),
    ("sacre-c-ur-basilica", "Sacré-Cœur Basilica", "basilica Montmartre", ["Basilique du Sacré-Cœur", "Sacré-Coeur"], False),
    ("pantheon", "Panthéon", "facade Paris Latin Quarter", ["Panthéon de Paris"], False),
    ("musee-de-lorangerie", "Musée de l'Orangerie", "Tuileries building", ["Orangerie Museum"], False),
    ("palais-garnier", "Palais Garnier", "facade opera house", ["Opéra Garnier"], False),
    ("sainte-chapelle", "Sainte-Chapelle", "stained glass interior", ["Sainte Chapelle"], False),
    ("ch-teau-de-versailles", "Château de Versailles", "palace facade", ["Palace of Versailles"], False),
    ("petit-palais", "Petit Palais", "facade garden", ["Musée des Beaux-Arts de la Ville de Paris"], False),
    ("lanvin", "Lanvin", "boutique rue du Faubourg Saint-Honoré", ["Lanvin Paris boutique"], True),
    ("mauboussin", "Mauboussin", "boutique Paris", ["Mauboussin joaillier"], True),
    ("fauchon", "Fauchon", "Place de la Madeleine", ["Fauchon Madeleine"], True),
    ("laduree-boutique-royale", "Ladurée — Boutique Royale", "rue Royale", ["Ladurée rue Royale"], True),
    ("loro-piana", "Loro Piana", "boutique Paris", ["Loro Piana boutique"], True),
    ("maison-cartier-trinity", "Maison Cartier — Trinity", "boutique Paris", ["Cartier boutique Paris"], True),
    ("jardin-du-luxembourg", "Jardin du Luxembourg", "garden basin", ["Luxembourg Gardens"], False),
    ("parc-monceau", "Parc Monceau", "park", ["Parc Monceau Paris"], False),
    ("promenade-plantee-coulee-verte", "Promenade Plantée (Coulée Verte)", "elevated garden", ["Coulée verte René-Dumont", "Promenade plantée"], False),
    ("ile-saint-louis", "Île Saint-Louis", "quai Seine", ["Ile Saint-Louis"], False),
    ("quais-de-seine", "Quais de Seine", "banks of the Seine", ["Banks of the Seine Paris", "Quais de la Seine"], False),
    ("jardin-des-plantes", "Jardin des Plantes", "garden", ["Jardin des Plantes Paris"], False),
    ("parc-des-buttes-chaumont", "Parc des Buttes-Chaumont", "temple Sibyl lake", ["Buttes-Chaumont"], False),
    ("place-des-vosges", "Place des Vosges", "arcades square", ["Place des Vosges Paris"], False),
    ("rue-de-rivoli-arcades", "Rue de Rivoli Arcades", "arcades", ["Rue de Rivoli arcades"], False),
    ("jardin-du-palais-royal", "Jardin du Palais Royal", "garden arcades", ["Palais-Royal garden"], False),
    ("parc-de-bagatelle", "Parc de Bagatelle", "gardens", ["Bagatelle Paris roses"], False),
    ("montmartre-streets-place-du-tertre", "Montmartre Streets & Place du Tertre", "square", ["Place du Tertre"], False),
    ("pont-des-arts", "Pont des Arts", "bridge Seine", ["Pont des Arts Paris"], False),
    ("trocadero-gardens", "Trocadéro Gardens", "fountains Eiffel", ["Jardins du Trocadéro"], False),
    ("parc-de-la-villette", "Parc de la Villette", "park", ["Parc de la Villette Paris"], False),
    ("rue-cler-market-street", "Rue Cler Market Street", "market street", ["Rue Cler"], False),
    ("jardins-des-champs-elysees", "Jardins des Champs-Élysées", "gardens", ["Jardins des Champs-Élysées Paris"], False),
    ("pere-lachaise-cemetery", "Père Lachaise Cemetery", "cemetery", ["Cimetière du Père-Lachaise"], False),
    ("parc-montsouris", "Parc Montsouris", "lake park", ["Parc Montsouris Paris"], False),
]

# (name, visual_terms, aliases, requirement, official_priority)
REPLACEMENTS = [
    ("Les Deux Magots", "terrace facade", ["Café Les Deux Magots"], "Exterior of the café showing facade and outdoor seating; not a meal.", True),
    ("Park Hyatt Paris-Vendôme", "hotel", ["Park Hyatt Paris Vendôme", "Hôtel Park Hyatt rue de la Paix"], "High-resolution hotel exterior or official interior.", True),
    ("La Tour d'Argent", "restaurant quai de la Tournelle", ["Tour d'Argent restaurant"], "Sharp, high-resolution restaurant or recognizable exterior.", True),
    ("Café Marly", "Louvre", ["Café Marly Palais du Louvre"], "Exterior, ideally with the Louvre courtyard setting; not a table.", True),
    ("Pierre Hermé — Bonaparte", "boutique rue Bonaparte", ["Pierre Hermé boutique"], "Sharp photograph of the actual boutique or storefront.", True),
    ("Pont Alexandre III", "bridge", ["Pont Alexandre-III"], "High-resolution, recognizable bridge photograph.", False),
    ("Place Vendôme", "column", ["Colonne Vendôme"], "High-resolution square, architecture or column in context.", False),
    ("Musée Carnavalet", "hôtel Carnavalet courtyard", ["Hôtel Carnavalet"], "Building, courtyard or facade; no children as main subject.", False),
    ("Opéra Bastille", "facade", ["Opéra national de Paris Bastille"], "Working image of the building or its recognizable facade.", False),
    ("Chanel — Rue Cambon", "boutique", ["Chanel 31 rue Cambon", "Chanel boutique Paris"], "Actual rue Cambon boutique or storefront, high quality.", True),
    ("Saint Laurent — Rive Gauche", "boutique", ["Yves Saint Laurent Rive Gauche", "Saint Laurent boutique Paris"], "Actual boutique, storefront or building; not a wooden object.", True),
    ("Chloé — Avenue Montaigne", "boutique", ["Chloé boutique avenue Montaigne"], "Boutique exterior or storefront; not a handbag.", True),
    ("Le Bon Marché", "department store", ["Le Bon Marché Rive Gauche"], "Higher-resolution exterior or interior.", False),
    ("Christian Louboutin — Rue Saint-Honoré", "boutique", ["Christian Louboutin boutique Paris"], "Actual boutique or storefront; not just a shoe.", True),
]


# --------------------------------------------------------------------------------------
# helpers
# --------------------------------------------------------------------------------------
def fold(text):
    t = (text or "").replace("œ", "oe").replace("Œ", "oe").replace("æ", "ae")
    t = unicodedata.normalize("NFKD", t)
    t = "".join(c for c in t if not unicodedata.combining(c)).lower()
    return re.sub(r"[^a-z0-9]+", " ", t).strip()


def tokens(text):
    return [w for w in fold(text).split() if w not in STOPWORDS and len(w) > 1]


def strip_html(s):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", s or "")).strip()


def sha256_file(p):
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def iter_dicts(obj):
    """Yield every dict nested anywhere in obj (read-only traversal)."""
    if isinstance(obj, dict):
        yield obj
        for v in obj.values():
            yield from iter_dicts(v)
    elif isinstance(obj, list):
        for v in obj:
            yield from iter_dicts(v)


def load_json(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return None


def urls_in(d):
    return [v for k, v in d.items() if isinstance(v, str) and v.startswith("http") and "url" in k.lower()]


class Http:
    """Polite HTTP: descriptive UA, per-host delay, retries with backoff, Retry-After."""

    def __init__(self, ua, delay, timeout):
        self.s = requests.Session()
        self.s.headers.update({"User-Agent": ua, "Accept-Encoding": "gzip"})
        self.delay, self.timeout, self._last = delay, timeout, {}

    def get(self, url, retries=3, **kw):
        host = urllib.parse.urlparse(url).netloc
        last_err = None
        for attempt in range(retries):
            wait = self.delay - (time.time() - self._last.get(host, 0))
            if wait > 0:
                time.sleep(wait)
            try:
                r = self.s.get(url, timeout=self.timeout, **kw)
                self._last[host] = time.time()
                if r.status_code == 429 or r.status_code >= 500:
                    ra = r.headers.get("Retry-After", "")
                    back = int(ra) if ra.isdigit() else 2 ** (attempt + 1)
                    last_err = f"HTTP {r.status_code}"
                    r.close()
                    time.sleep(min(back, 60))
                    continue
                return r
            except requests.RequestException as e:
                self._last[host] = time.time()
                last_err = f"{type(e).__name__}: {e}"
                time.sleep(2 ** (attempt + 1))
        raise RuntimeError(last_err or "request failed")


def magic_ok(data, content_type):
    if data[:3] == b"\xff\xd8\xff":
        return "jpeg"
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return "png"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "webp"
    return None


def http_image_check(http, url):
    """Ranged GET, capped read. Proves only that the URL serves image bytes."""
    out = {"status_code": None, "content_type": None, "magic": None, "bytes_read": 0,
           "final_url": None, "redirected": False, "width": None, "height": None,
           "result": "FAIL", "error": None}
    try:
        r = http.get(url, headers={"Range": f"bytes=0-{HTTP_CHECK_BYTES - 1}"}, stream=True, allow_redirects=True)
    except RuntimeError as e:
        out["error"] = str(e)
        return out
    try:
        out["status_code"] = r.status_code
        out["content_type"] = (r.headers.get("Content-Type") or "").split(";")[0].strip().lower()
        out["final_url"] = r.url
        out["redirected"] = r.url != url
        buf = b""
        parser = ImageFile.Parser() if ImageFile else None
        for chunk in r.iter_content(8192):
            buf += chunk
            if parser and out["width"] is None:
                try:
                    parser.feed(chunk)
                    if parser.image is not None:
                        out["width"], out["height"] = parser.image.size
                except Exception:
                    parser = None
            if len(buf) >= HTTP_CHECK_BYTES:
                break
        out["bytes_read"] = len(buf)
        out["magic"] = magic_ok(buf, out["content_type"])
        if r.status_code not in (200, 206):
            out["error"] = f"unexpected status {r.status_code}"
        elif not out["content_type"].startswith("image/"):
            out["error"] = f"content-type {out['content_type']!r} is not an image"
        elif out["magic"] is None:
            out["error"] = "content-type says image but magic bytes are not JPEG/PNG/WEBP"
        else:
            out["result"] = "PASS"
    finally:
        r.close()
    return out


# --------------------------------------------------------------------------------------
# Phase 1 / 3: Commons
# --------------------------------------------------------------------------------------
def build_queries(task):
    n, terms = task["name"], task["terms"]
    qs = [f'"{n}"', f"{n} {terms}".strip()]
    for a in task["aliases"][:2]:
        qs.append(f"{a} {terms}".strip())
    seen, out = set(), []
    for q in qs:
        q = q + " filetype:bitmap"
        if q not in seen:
            seen.add(q)
            out.append(q)
    return out[:4]


def commons_search(http, query, limit=25):
    params = {"action": "query", "format": "json", "formatversion": "2", "maxlag": "5",
              "generator": "search", "gsrsearch": query, "gsrnamespace": "6", "gsrlimit": str(limit),
              "prop": "imageinfo", "iiprop": "url|size|mime|extmetadata",
              "iiextmetadatafilter": "Artist|LicenseShortName|LicenseUrl|UsageTerms|AttributionRequired|"
                                     "ImageDescription|ObjectName|Categories|Restrictions|DateTimeOriginal"}
    r = http.get(COMMONS_API + "?" + urllib.parse.urlencode(params))
    try:
        data = r.json()
    finally:
        r.close()
    if "error" in data:
        raise RuntimeError("Commons API error: " + json.dumps(data["error"])[:300])
    pages = data.get("query", {}).get("pages", [])
    return sorted(pages, key=lambda p: p.get("index", 0))


def evaluate_page(page, task, min_dim, query):
    """Return (candidate_dict|None, reject_reason|None). Text-only relevance, never visual."""
    ii = (page.get("imageinfo") or [None])[0]
    if not ii:
        return None, "no_imageinfo"
    mime = ii.get("mime", "")
    if mime not in ALLOWED_MIME:
        return None, f"unsupported_mime:{mime}"
    w, h = ii.get("width") or 0, ii.get("height") or 0
    if max(w, h) < min_dim:
        return None, f"below_min_dim:{w}x{h}"
    em = {k: strip_html(v.get("value", "")) for k, v in (ii.get("extmetadata") or {}).items()}
    lic = em.get("LicenseShortName", "")
    if not lic or not any(x in lic.lower() for x in FREE_LICENSE_HINTS):
        return None, f"license_missing_or_unrecognised:{lic!r}"
    title = page.get("title", "")
    cats = [c for c in em.get("Categories", "").split("|") if c]
    hay = fold(" ".join([title, em.get("ImageDescription", ""), em.get("ObjectName", ""), " ".join(cats)]))
    for bad in DENY_WORDS:
        if re.search(r"\b" + re.escape(bad) + r"\b", fold(title)):
            return None, f"denylist:{bad}"
    best_frac, phrase_hit = 0.0, False
    for nm in [task["name"]] + task["aliases"]:
        toks = tokens(nm)
        if not toks:
            continue
        frac = sum(1 for t in toks if t in hay) / len(toks)
        best_frac = max(best_frac, frac)
        if fold(nm) and fold(nm) in hay:
            phrase_hit = True
    if best_frac < 0.5:
        return None, f"subject_text_mismatch:{best_frac:.2f}"
    flags, longest = [], max(w, h)
    ratio = w / h if h else 0
    score = best_frac * 40 + (20 if phrase_hit else 0) + min(longest, 6000) / 6000 * 20
    if 1.2 <= ratio <= 1.9:
        score += 8
    if ratio > 3:
        score -= 8
        flags.append("very_wide_panorama")
    if ratio < 0.9:
        flags.append("portrait_orientation")
    catblob = " ".join(cats).lower()
    for label in ("featured pictures", "quality images", "valued images"):
        if label in catblob:
            score += 4
            flags.append(label.replace(" ", "_"))
    if task.get("slug") in FOP_RISK_SLUGS:
        flags.append("france_freedom_of_panorama_review")
    if em.get("Restrictions"):
        flags.append("commons_restrictions:" + em["Restrictions"][:80])
    return {
        "source_type": "wikimedia_commons",
        "file_title": title,
        "direct_image_url": ii.get("url"),
        "source_page_url": ii.get("descriptionurl"),
        "width": w, "height": h, "mime": mime,
        "author": em.get("Artist") or None,
        "license": lic, "license_url": em.get("LicenseUrl") or None,
        "attribution_required": em.get("AttributionRequired") or None,
        "description": (em.get("ImageDescription") or em.get("ObjectName") or "")[:300],
        "categories": cats[:12],
        "search_query": query,
        "text_relevance": round(best_frac, 2),
        "score": round(score, 1),
        "flags": flags,
    }, None


def discover_commons(http, task, args, rejects):
    cands = {}
    for q in build_queries(task):
        try:
            pages = commons_search(http, q)
        except RuntimeError as e:
            task["errors"].append(f"query {q!r}: {e}")
            continue
        for p in pages:
            c, why = evaluate_page(p, task, args.min_dim, q)
            if c is None:
                rejects.setdefault(task["key"], {}).setdefault(why.split(":")[0], 0)
                rejects[task["key"]][why.split(":")[0]] += 1
                continue
            key = c["direct_image_url"]
            if key in cands:
                cands[key].setdefault("matched_queries", [cands[key]["search_query"]]).append(q)
            else:
                cands[key] = c
    return sorted(cands.values(), key=lambda c: -c["score"])[: args.max_candidates]


# --------------------------------------------------------------------------------------
# Phase 2: official source pages
# --------------------------------------------------------------------------------------
class ImgExtractor(HTMLParser):
    SKIP = ("logo", "icon", "sprite", "favicon", "pixel", "tracking", "placeholder", "avatar")

    def __init__(self, base):
        super().__init__()
        self.base, self.found, self._ld, self._buf = base, [], False, []

    def add(self, raw, kind):
        if not raw or raw.startswith("data:"):
            return
        u = urllib.parse.urljoin(self.base, raw.strip())
        p = urllib.parse.urlparse(u)
        if p.scheme != "https" or p.path.lower().endswith((".svg", ".gif", ".ico")):
            return
        if any(s in p.path.lower() for s in self.SKIP):
            return
        if all(u != f[0] for f in self.found):
            self.found.append((u, kind))

    def handle_starttag(self, tag, attrs):
        a = {k: (v or "") for k, v in attrs}
        if tag == "meta":
            key = (a.get("property") or a.get("name")).lower()
            if key in ("og:image", "og:image:secure_url", "twitter:image", "twitter:image:src"):
                self.add(a.get("content"), "meta:" + key)
        elif tag == "link":
            rel = a.get("rel", "").lower()
            if "image_src" in rel or ("preload" in rel and a.get("as") == "image"):
                self.add(a.get("href"), "link:" + rel)
        elif tag == "img":
            ss = a.get("srcset") or a.get("data-srcset")
            if ss:
                best = None
                for part in ss.split(","):
                    bits = part.strip().split()
                    if bits:
                        wd = int(bits[1][:-1]) if len(bits) > 1 and bits[1].endswith("w") and bits[1][:-1].isdigit() else 0
                        if best is None or wd > best[0]:
                            best = (wd, bits[0])
                if best:
                    self.add(best[1], "img:srcset")
            self.add(a.get("src") or a.get("data-src"), "img:src")
        elif tag == "script" and a.get("type", "").lower() == "application/ld+json":
            self._ld, self._buf = True, []

    def handle_data(self, d):
        if self._ld:
            self._buf.append(d)

    def handle_endtag(self, tag):
        if tag == "script" and self._ld:
            self._ld = False
            try:
                doc = json.loads("".join(self._buf))
            except ValueError:
                return
            for d in iter_dicts(doc):
                im = d.get("image")
                for v in (im if isinstance(im, list) else [im]):
                    if isinstance(v, str):
                        self.add(v, "jsonld:image")
                    elif isinstance(v, dict) and isinstance(v.get("url"), str):
                        self.add(v["url"], "jsonld:image")


def robots_allows(http, page_url):
    p = urllib.parse.urlparse(page_url)
    robots = f"{p.scheme}://{p.netloc}/robots.txt"
    rp = urllib.robotparser.RobotFileParser()
    try:
        r = http.get(robots, retries=1)
        if r.status_code >= 400:
            return True, "robots.txt unavailable; treated as allowed"
        rp.parse(r.text.splitlines())
        r.close()
    except RuntimeError:
        return True, "robots.txt fetch failed; treated as allowed"
    ok = rp.can_fetch(http.s.headers["User-Agent"], page_url) or rp.can_fetch("*", page_url)
    return ok, "robots.txt checked"


def discover_official(http, task, entries, args):
    out = []
    for e in entries:
        url, source = e.get("page_url"), e.get("source", "official site")
        if not url:
            continue
        allowed, why = robots_allows(http, url)
        if not allowed:
            task["errors"].append(f"{url}: disallowed by robots.txt; skipped")
            continue
        try:
            r = http.get(url, stream=True, allow_redirects=True)
        except RuntimeError as ex:
            task["errors"].append(f"{url}: {ex}")
            continue
        try:
            if r.status_code in (401, 403, 451) or r.status_code >= 400:
                task["errors"].append(f"{url}: HTTP {r.status_code} (access restricted; not bypassed)")
                continue
            if "html" not in (r.headers.get("Content-Type") or "").lower():
                task["errors"].append(f"{url}: not an HTML page")
                continue
            raw = b""
            for chunk in r.iter_content(65536):
                raw += chunk
                if len(raw) >= HTML_LIMIT_BYTES:
                    break
            base = r.url
            text = raw.decode(r.encoding or "utf-8", errors="replace")
        finally:
            r.close()
        ex = ImgExtractor(base)
        ex.feed(text)
        for img_url, kind in ex.found[:12]:
            chk = http_image_check(http, img_url) if not args.no_verify else None
            w = chk["width"] if chk else None
            h = chk["height"] if chk else None
            flags = []
            if w and max(w, h) < args.min_dim:
                flags.append("below_min_dim")
            if kind.startswith("img:src") and not w:
                flags.append("may_be_thumbnail")
            out.append({
                "source_type": "official_page", "file_title": None, "direct_image_url": img_url,
                "source_page_url": url, "source_publisher": source, "extraction": kind,
                "width": w, "height": h, "mime": chk["content_type"] if chk else None,
                "author": None, "license": e.get("license", "unknown (official/brand site; rights not cleared)"),
                "license_url": None, "attribution_required": None, "description": "", "categories": [],
                "search_query": None, "text_relevance": None, "flags": flags,
                "score": (30 if kind.startswith("meta:og") else 10) + min((max(w, h) if w else 0), 4000) / 200,
                "http_check": chk, "_prechecked": True,
            })
    return sorted(out, key=lambda c: -c["score"])[: args.max_candidates]


# --------------------------------------------------------------------------------------
# orchestration
# --------------------------------------------------------------------------------------
def load_existing(root):
    """Read-only. Returns (known_urls_by_slug, places_by_fold_name, input_hashes, warnings)."""
    paths = {
        "new_image_urls": root / "image-migration/new-image-urls.json",
        "missing_candidates": root / "image-migration/missing-image-candidates.json",
        "coverage_report": root / "image-migration/image-coverage-report.json",
        "places": root / "prisma/paris-places.json",
    }
    warnings, hashes, docs = [], {}, {}
    for k, p in paths.items():
        if p.exists():
            hashes[k] = {"path": str(p), "sha256": sha256_file(p)}
            docs[k] = load_json(p)
        else:
            warnings.append(f"input not found: {p}")
    known = {}
    for d in iter_dicts(docs.get("new_image_urls")):
        if "slug" in d:
            known.setdefault(d["slug"], set()).update(urls_in(d))
    existing_count = sum(1 for d in iter_dicts(docs.get("new_image_urls")) if "slug" in d)
    places = {}
    for d in iter_dicts(docs.get("places")):
        if "slug" in d and isinstance(d.get("name"), str):
            places.setdefault(fold(d["name"]), []).append(d["slug"])
            known.setdefault(d["slug"], set()).update(urls_in(d))
    miss = [(d["slug"], d.get("name")) for d in iter_dicts(docs.get("missing_candidates")) if "slug" in d]
    return known, places, hashes, warnings, existing_count, miss, paths


def make_tasks(places, file_missing, warnings, only):
    cfg = {m[0]: m for m in MISSING}
    tasks = []
    slugs = [s for s, _ in file_missing] or [m[0] for m in MISSING]
    if file_missing:
        if set(slugs) != set(cfg):
            warnings.append(f"missing-image-candidates.json slugs differ from built-in list: "
                            f"only_in_file={sorted(set(slugs) - set(cfg))} only_builtin={sorted(set(cfg) - set(slugs))}")
        if len(slugs) != 39:
            warnings.append(f"expected 39 missing-candidate records, file has {len(slugs)}")
    else:
        warnings.append("using built-in list of 39 places (missing-image-candidates.json not read)")
    names_in_file = dict(file_missing)
    for s in slugs:
        m = cfg.get(s)
        name = names_in_file.get(s) or (m[1] if m else s)
        tasks.append({"key": s, "slug": s, "name": name, "task_type": "MISSING_CANDIDATE",
                      "terms": m[2] if m else "", "aliases": m[3] if m else [], "official_priority": bool(m and m[4]),
                      "requirement": None, "errors": [], "notes": []})
    for name, terms, aliases, req, prio in REPLACEMENTS:
        found = sorted(set(places.get(fold(name), [])))
        slug = found[0] if len(found) == 1 else None
        t = {"key": slug or name, "slug": slug, "name": name, "task_type": "REPLACEMENT", "terms": terms,
             "aliases": aliases, "official_priority": prio, "requirement": req, "errors": [], "notes": []}
        if len(found) > 1:
            t["notes"].append(f"slug ambiguous in paris-places.json: {found}; left null")
        if slug is None and not found:
            t["notes"].append("slug not found in paris-places.json by exact name; left null (not guessed)")
        tasks.append(t)
    if only:
        tasks = [t for t in tasks if t["slug"] in only or t["name"] in only]
    return tasks


def write_template(root):
    out = root / "image-migration/official-source-pages.template.json"
    rows = [{"slug": m[0], "name": m[1], "page_url": None, "source": None} for m in MISSING]
    rows += [{"slug": None, "name": r[0], "page_url": None, "source": None} for r in REPLACEMENTS]
    if out.exists():
        sys.exit(f"{out} already exists; not overwriting")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(rows, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote {out}. Fill in page_url (real official page URLs only) and save as official-source-pages.json")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--project-root", default=".")
    ap.add_argument("--contact", help="email/URL for the User-Agent (required for network runs)")
    ap.add_argument("--phases", default="1,2,3")
    ap.add_argument("--only", nargs="*", default=[], help="limit to these slugs or names")
    ap.add_argument("--min-dim", type=int, default=1200)
    ap.add_argument("--max-candidates", type=int, default=4)
    ap.add_argument("--delay", type=float, default=1.0)
    ap.add_argument("--timeout", type=float, default=20)
    ap.add_argument("--no-verify", action="store_true", help="skip HTTP image checks")
    ap.add_argument("--dry-run", action="store_true", help="read inputs and print the plan; no network, no output file")
    ap.add_argument("--out", default="image-migration/discovered-image-candidates.json")
    ap.add_argument("--official-pages", default="image-migration/official-source-pages.json")
    ap.add_argument("--force", action="store_true", help="allow overwriting the discovery output file only")
    ap.add_argument("--write-official-template", action="store_true")
    args = ap.parse_args()
    root = Path(args.project_root).resolve()
    phases = {p.strip() for p in args.phases.split(",")}

    if args.write_official_template:
        return write_template(root)

    known, places, hashes, warnings, existing_count, file_missing, paths = load_existing(root)
    out_path = (root / args.out).resolve()
    protected = {Path(h["path"]).resolve() for h in hashes.values()}
    if out_path in protected or out_path.name == "new-image-urls.json":
        sys.exit("Refusing: output path would overwrite a protected input file.")
    if out_path.exists() and not args.force and not args.dry_run:
        sys.exit(f"{out_path} exists; use --force to overwrite this discovery file (inputs are never written).")

    tasks = make_tasks(places, file_missing, warnings, set(args.only))
    n_missing = sum(t["task_type"] == "MISSING_CANDIDATE" for t in tasks)
    n_repl = sum(t["task_type"] == "REPLACEMENT" for t in tasks)
    print(f"Tasks: {len(tasks)} ({n_missing} missing-candidate, {n_repl} replacement); "
          f"existing candidate records seen: {existing_count}")
    for w in warnings:
        print("WARNING:", w)
    if args.dry_run:
        for t in tasks:
            print(f"- [{t['task_type']}] {t['slug'] or '(no slug)'} | {t['name']} | queries: {build_queries(t)}")
        return

    if not args.contact or "@" not in args.contact and "http" not in args.contact:
        sys.exit("--contact (email or URL) is required for network runs; Wikimedia requires a real contact in the User-Agent.")
    ua = f"RomelyImageResearch/{SCRIPT_VERSION} (read-only candidate discovery; {args.contact}) python-requests"
    http = Http(ua, args.delay, args.timeout)

    official = {}
    op = root / args.official_pages
    if "2" in phases:
        data = load_json(op)
        if data is None:
            warnings.append(f"{op} not found: phase 2 will have no official pages to read "
                            f"(run --write-official-template, then fill in real page URLs)")
        else:
            for e in data:
                official.setdefault(e.get("slug") or e.get("name"), []).append(e)

    rejects, results = {}, []
    for i, t in enumerate(tasks, 1):
        print(f"[{i}/{len(tasks)}] {t['name']}", flush=True)
        cands = []
        if ("1" in phases and t["task_type"] == "MISSING_CANDIDATE") or ("3" in phases and t["task_type"] == "REPLACEMENT"):
            cands += discover_commons(http, t, args, rejects)
        if "2" in phases:
            cands += discover_official(http, t, official.get(t["slug"], []) + official.get(t["name"], []) if t["slug"] != t["name"] else official.get(t["name"], []), args)

        # dedupe by (slug/name, direct URL) and drop URLs already recorded for this slug
        seen, final = set(), []
        for c in cands:
            u = c["direct_image_url"]
            if not u or u in seen:
                continue
            seen.add(u)
            if t["slug"] and u in known.get(t["slug"], set()):
                c["flags"].append("same_url_as_existing_project_record")
            final.append(c)

        for c in final:
            if "http_check" not in c:
                c["http_check"] = None if args.no_verify else http_image_check(http, c["direct_image_url"])
            chk = c["http_check"]
            c["subject_visually_confirmed"] = False
            if chk and chk["result"] == "PASS":
                c["status"] = "VERIFIED_DIRECT_IMAGE"
                c["notes"] = ("HTTP check passed (image bytes returned). Subject NOT visually confirmed; "
                              "text relevance only." if c["source_type"] == "wikimedia_commons"
                              else "HTTP check passed. Subject NOT visually confirmed; rights not cleared.")
            else:
                c["status"] = "CANDIDATE_UNVERIFIED"
                c["notes"] = ("HTTP check not run." if chk is None else f"HTTP check failed: {chk['error']}")
            if c["source_type"] == "wikimedia_commons":
                c["notes"] += " Dimensions/licence from Commons API."
            c.pop("_prechecked", None)
        passing = [c for c in final if c["status"] == "VERIFIED_DIRECT_IMAGE"]
        pref = (passing or final or [None])[0]
        notes = list(t["notes"])
        if t["slug"] in FOP_RISK_SLUGS:
            notes.append("Licence review: " + FOP_RISK_SLUGS[t["slug"]])
        if t["official_priority"]:
            notes.append("Commons rarely has the actual storefront/venue for this type of place; prefer an official source and check the real subject.")
        if not final:
            notes.append("No candidate passed filters in the phases that ran. This is NOT_FOUND for those phases only.")
        results.append({
            "name": t["name"], "slug": t["slug"], "task_type": t["task_type"],
            "requirement": t["requirement"],
            "status": "VERIFIED_DIRECT_IMAGE" if passing else ("CANDIDATE_UNVERIFIED" if final else "NOT_FOUND"),
            "preferred_direct_image_url": pref["direct_image_url"] if pref else None,
            "preferred_reason": ("highest text-relevance/resolution score among HTTP-passing candidates; "
                                 "a proposal only, pending visual review" if pref else None),
            "needs_official_source": bool(t["official_priority"] and not any(c["source_type"] == "official_page" for c in final)),
            "candidates": final, "errors": t["errors"], "notes": notes,
        })

    # post-run safety: inputs must be byte-identical
    for k, h in hashes.items():
        if sha256_file(h["path"]) != h["sha256"]:
            sys.exit(f"ABORT: input file changed during run: {h['path']}")

    summary = {
        "tasks": len(results),
        "missing_candidate_tasks": sum(r["task_type"] == "MISSING_CANDIDATE" for r in results),
        "replacement_tasks": sum(r["task_type"] == "REPLACEMENT" for r in results),
        "VERIFIED_DIRECT_IMAGE": sum(r["status"] == "VERIFIED_DIRECT_IMAGE" for r in results),
        "CANDIDATE_UNVERIFIED": sum(r["status"] == "CANDIDATE_UNVERIFIED" for r in results),
        "NOT_FOUND": sum(r["status"] == "NOT_FOUND" for r in results),
        "tasks_with_errors": [r["name"] for r in results if r["errors"]],
        "duplicate_task_keys": len(results) - len({(r["slug"], r["name"]) for r in results}),
    }
    doc = {"meta": {"generated_at": datetime.now(timezone.utc).isoformat(), "script_version": SCRIPT_VERSION,
                    "user_agent": ua, "phases": sorted(phases), "min_dim": args.min_dim,
                    "inputs_sha256": hashes, "existing_candidate_records_seen": existing_count,
                    "warnings": warnings,
                    "caveat": "VERIFIED_DIRECT_IMAGE means the URL returned image bytes. No image has been visually inspected."},
           "summary": summary, "reject_counts_by_task": rejects, "results": results}
    out_path.parent.mkdir(parents=True, exist_ok=True)
    tmp = out_path.with_suffix(".tmp")
    tmp.write_text(json.dumps(doc, indent=2, ensure_ascii=False), encoding="utf-8")
    os.replace(tmp, out_path)
    print(json.dumps(summary, indent=2))
    print("Wrote", out_path)


if __name__ == "__main__":
    main()