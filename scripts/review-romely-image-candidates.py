import json
import html
import urllib.request
import urllib.error
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

ROOT = Path(__file__).resolve().parent.parent
INPUT = ROOT / "image-migration/new-image-urls.json"
OUTPUT_HTML = ROOT / "image-migration/candidate-review.html"
OUTPUT_REPORT = ROOT / "image-migration/candidate-url-check.json"

data = json.loads(INPUT.read_text(encoding="utf-8"))
candidates = data.get("updates", [])

def check(item):
    url = item.get("imageUrl", "")
    result = {
        "name": item.get("name", ""),
        "slug": item.get("slug", ""),
        "imageUrl": url,
        "status": "UNKNOWN",
        "httpStatus": None,
        "contentType": None,
        "note": ""
    }

    if not url.startswith(("https://", "http://")):
        result["status"] = "INVALID_URL"
        result["note"] = "Missing HTTP/HTTPS URL"
        return result

    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/537.36 Chrome/130 Safari/537.36",
            "Range": "bytes=0-1023"
        }
    )

    try:
        with urllib.request.urlopen(request, timeout=18) as response:
            result["httpStatus"] = response.status
            result["contentType"] = response.headers.get("Content-Type", "")
            if result["contentType"].lower().startswith("image/"):
                result["status"] = "HTTP_IMAGE_OK"
                result["note"] = "Server returned an image content type"
            else:
                result["status"] = "CHECK_CONTENT"
                result["note"] = "Response is not clearly an image"
    except urllib.error.HTTPError as error:
        result["httpStatus"] = error.code
        result["contentType"] = error.headers.get("Content-Type", "")
        result["status"] = "HTTP_ERROR"
        result["note"] = str(error)
    except Exception as error:
        result["status"] = "CONNECTION_ERROR"
        result["note"] = str(error)

    return result

results = [None] * len(candidates)
with ThreadPoolExecutor(max_workers=8) as pool:
    jobs = {pool.submit(check, item): i for i, item in enumerate(candidates)}
    for job in as_completed(jobs):
        i = jobs[job]
        results[i] = job.result()
        r = results[i]
        print(f'[{r["status"]}] {r["name"]}')

OUTPUT_REPORT.write_text(
    json.dumps(results, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8"
)

cards = []
for r in results:
    name = html.escape(r["name"])
    url = html.escape(r["imageUrl"], quote=True)
    status = html.escape(r["status"])
    code = r["httpStatus"] if r["httpStatus"] is not None else "—"
    content_type = html.escape(r["contentType"] or "unknown")
    note = html.escape(r["note"])

    cards.append(f"""
    <article class="card">
      <div class="image-wrap">
        <img src="{url}" alt="{name}" loading="lazy"
             onload="this.closest('.card').classList.add('loaded')"
             onerror="this.closest('.card').classList.add('broken')">
        <span class="image-state">Loading image…</span>
      </div>
      <div class="details">
        <h2>{name}</h2>
        <p><strong>URL check:</strong> {status} · HTTP {code}</p>
        <p><strong>Content-Type:</strong> {content_type}</p>
        <p class="note">{note}</p>
        <a href="{url}" target="_blank" rel="noopener noreferrer">Open original image</a>
      </div>
    </article>
    """)

page = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Romely — Image Candidate Review</title>
<style>
*{{box-sizing:border-box}}
body{{margin:0;padding:22px;font:15px/1.5 system-ui,sans-serif;background:#f4f3f0;color:#222}}
header{{max-width:1400px;margin:0 auto 22px}}
h1{{font-size:26px;margin:0 0 6px}}
header p{{color:#555;margin:4px 0}}
.grid{{max-width:1400px;margin:auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px}}
.card{{background:white;border:1px solid #ddd;border-radius:12px;overflow:hidden;min-width:0}}
.image-wrap{{height:230px;background:#e5e3df;position:relative;display:flex;align-items:center;justify-content:center}}
img{{width:100%;height:100%;object-fit:contain}}
.image-state{{position:absolute;bottom:8px;left:8px;padding:3px 7px;border-radius:5px;background:#fff;color:#333;font-size:12px}}
.loaded .image-state{{background:#e1f5e6;color:#175d2c}}
.broken .image-state{{background:#ffe1df;color:#8b1c13}}
.broken img{{display:none}}
.details{{padding:13px;overflow-wrap:anywhere}}
h2{{font-size:17px;line-height:1.35;margin:0 0 10px}}
.details p{{font-size:12px;color:#555;margin:5px 0}}
.details a{{display:inline-block;margin-top:8px;color:#1757a6}}
.note{{overflow-wrap:anywhere}}
</style>
</head>
<body>
<header>
<h1>Romely — Image Candidate Review</h1>
<p>{len(results)} candidates · HTTP checks are indicative, not proof that the photo matches the place.</p>
<p>Review the actual image, not just its HTTP status. Some servers block automated checks while still allowing browser display.</p>
</header>
<main class="grid">
{''.join(cards)}
</main>
<script>
document.querySelectorAll('.card img').forEach(img => {{
  if (img.complete && img.naturalWidth > 0) img.closest('.card').classList.add('loaded');
  else if (img.complete && img.naturalWidth === 0) img.closest('.card').classList.add('broken');
}});
document.querySelectorAll('.card').forEach(card => {{
  const state = card.querySelector('.image-state');
  card.querySelector('img').addEventListener('load', () => state.textContent = 'Image loaded');
  card.querySelector('img').addEventListener('error', () => state.textContent = 'Image failed to load');
}});
</script>
</body>
</html>
"""

OUTPUT_HTML.write_text(page, encoding="utf-8")
print("\nFinished.")
print("Candidates checked:", len(results))
print("URL report:", OUTPUT_REPORT)
print("Review gallery:", OUTPUT_HTML)
