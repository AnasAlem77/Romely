const fs = require('fs');
const https = require('https');

const places = JSON.parse(fs.readFileSync('places.json', 'utf-8'));
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "application/json"
};

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: HEADERS }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function findUnsplashImage(name) {
  const cleanName = name.split(" — ")[0].replace(" & ", " and ");
  const query = encodeURIComponent(`${cleanName} Paris architecture interior`);
  const api = `https://unsplash.com/napi/search/photos?query=${query}&per_page=1`;

  try {
    const r = await fetchJson(api);
    if (r && r.results && r.results.length > 0) {
      const photo = r.results[0];
      if (photo && photo.urls && photo.urls.regular) {
        return photo.urls.regular;
      }
    }
  } catch (e) {}

  // محاولة ثانية ببحث أبسط لو لم يجد من المرة الأولى
  try {
    const base = cleanName.split(" ")[0];
    const apiFallback = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(base + " Paris landmark")}&per_page=1`;
    const r = await fetchJson(apiFallback);
    if (r && r.results && r.results.length > 0) {
      return r.results[0].urls.regular;
    }
  } catch (e) {}

  return null;
}

async function main() {
  const out = [];
  const missing = [];

  console.log("🚀 Fetching professional images from Unsplash...");
  for (const n of places) {
    process.stdout.write(`Searching Unsplash for: ${n}... `);
    const imageUrl = await findUnsplashImage(n);
    out.push({ name: n, imageUrl });
    if (imageUrl) {
      console.log("✅ Found");
    } else {
      console.log("❌ Missing");
      missing.push(n);
    }
    await new Promise(r => setTimeout(r, 350));
  }

  fs.writeFileSync('images.json', JSON.stringify(out, null, 2, 'utf-8'));
  console.log("\n✨ Done! Professional Unsplash results saved to images.json");
  if (missing.length > 0) {
    console.log("Missing places:", missing);
  }
}

main();
