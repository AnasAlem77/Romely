# pip install requests
import json, requests, time

HEADERS = {"User-Agent": "paris-image-resolver/1.0 (you@example.com)"}
API = "https://en.wikipedia.org/w/api.php"

def find_image(name):
    # Strip street suffixes like "— Rue Cambon" for a better page match
    base = name.split(" — ")[0].replace(" & ", " and ")
    for q in (f"{base} Paris", base):
        r = requests.get(API, headers=HEADERS, params={
            "action": "query", "format": "json", "generator": "search",
            "gsrsearch": q, "gsrlimit": 1, "prop": "pageimages",
            "piprop": "thumbnail", "pithumbsize": 1600,
        }, timeout=15).json()
        pages = r.get("query", {}).get("pages", {})
        for p in pages.values():
            url = p.get("thumbnail", {}).get("source")
            if url and requests.head(url, headers=HEADERS, timeout=15).status_code == 200:
                return url
    return None

places = json.load(open("places.json", encoding="utf-8"))  # your list of names
out = []
for n in places:
    out.append({"name": n, "imageUrl": find_image(n)})
    time.sleep(0.2)

json.dump(out, open("images.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print("Missing:", [o["name"] for o in out if not o["imageUrl"]])