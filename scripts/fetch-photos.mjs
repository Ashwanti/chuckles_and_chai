/**
 * Fills every image slot with a REAL PHOTOGRAPH, from Wikimedia Commons.
 *
 *   npm run photos           fetch, crop and install
 *   npm run photos -- --dry  show what would be picked, download nothing
 *
 * -----------------------------------------------------------------------------
 * WHERE THESE COME FROM, AND WHY IT MATTERS
 *
 * We have no photography of Chuckles & Chai. Instagram serves a login wall to
 * anything scripted, so their own photos cannot be fetched - they have to be
 * handed over. Until then this fills the site with real, openly-licensed
 * photographs so the design can be judged on real images.
 *
 * This is a real trading business, so every photo on its website has to be one
 * it is allowed to use. Licences are filtered to CC0, Public Domain, CC BY and
 * CC BY-SA only. Non-commercial (NC) and no-derivatives (ND) are rejected
 * outright: this is a commercial site and every image is cropped, so both would
 * be breached the moment the file was written.
 *
 * CC BY and CC BY-SA require attribution, and cropping a BY-SA photo makes an
 * adaptation that must be offered under the same licence. Both obligations are
 * met by the credits page this script generates - lib/photo-credits.json feeds
 * /credits, which is linked from the footer. That page is not decoration; it is
 * the thing that makes using these photos lawful. Do not delete it while these
 * images are still in place.
 *
 * WHAT THESE PHOTOS ARE NOT
 * They are not photographs of Chuckles & Chai. Alt text describes what is actually
 * in the frame and never claims a shot was taken at the café, and no search
 * targets another business's shopfront or signage - a rival café's frontage
 * under this masthead would misrepresent a real business. Every slot is filled with the subject the page
 * beside it actually names.
 *
 * REPLACING THEM
 * Drop a real photo over any file in public/images: dimensions already match
 * and no code changes. Once every slot is the café's own work, delete
 * lib/photo-credits.json and the /credits link. See README.md.
 * -----------------------------------------------------------------------------
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import https from "node:https";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const IMAGES = join(ROOT, "public", "images");
const DRY = process.argv.includes("--dry");
const FRESH = process.argv.includes("--fresh");
/* --only a.jpg,b.jpg re-fetches just those slots, so one bad pick can be
   replaced without pulling the other twenty-nine again. */
const ONLY = (process.argv.find((a) => a.startsWith("--only="))?.slice(7) ?? "")
  .split(",")
  .map((v) => v.trim())
  .filter(Boolean);
/* Commons starts returning 429 after about ten searches in quick succession.
   Results are cached so repeated dry runs cost nothing, and live searches are
   spaced out and backed off. Pass --fresh to ignore the cache. */
const CACHE = join(ROOT, "scripts", ".photo-cache.json");
const PAUSE_MS = 1200;

const API = "https://commons.wikimedia.org/w/api.php";
/* Commons asks for a descriptive User-Agent that identifies the client. */
const UA = "ChucklesAndChaiSiteBuild/1.0 (static site build script; contact via repository)";

/* == LICENCES ==============================================================
   Rank, best first. NC and ND are absent on purpose and must stay absent. */
const ALLOWED = [
  { test: /^cc0/i, rank: 0, tidy: "CC0", attribution: false, shareAlike: false },
  { test: /public domain|^pd|^pdm/i, rank: 0, tidy: "Public domain", attribution: false, shareAlike: false },
  { test: /^cc by(?!-sa)/i, rank: 1, tidy: null, attribution: true, shareAlike: false },
  { test: /^cc by-sa/i, rank: 2, tidy: null, attribution: true, shareAlike: true },
];

function classify(licence) {
  const value = (licence ?? "").trim();
  if (!value) return null;
  // Anything non-commercial or no-derivatives is unusable here, whatever else
  // the string says. Checked before the allow-list so "CC BY-NC" cannot match
  // the "CC BY" rule by prefix.
  if (/\bnc\b|non-commercial|\bnd\b|no-?derivat/i.test(value)) return null;
  for (const rule of ALLOWED) {
    if (rule.test.test(value)) {
      return { ...rule, label: rule.tidy ?? value };
    }
  }
  return null;
}

/* == THEMES ================================================================
   One search per subject, reused by every slot that wants it. */
/* Food and drink should be punchy: 0.14 let through a black coffee on a white
   flat-lay, technically colour but reading as clinical stock against the dark
   menu section. Interiors are a different case - a real café of wood, cream
   walls and muted light sits around 0.15, and holding it to the food bar threw
   away every good room shot. So the floor is per-theme. */
const MIN_SATURATION = 0.2;
const MUTED_OK = 0.09; // interiors and rooms
const MIN_LUMA = 46; // near-silhouettes and murk
const MAX_LUMA = 205; // washed-out white-background flat-lays

/* Each theme is a search plus a `must` gate and an `avoid` list.
   Commons search is AND-based, so every word has to appear: two or three words
   is the working length, and a long descriptive query returns nothing at all.

   Nearly every food and drink query ends in "Unsplash". Commons holds
   Unsplash's CC0 library, and those files are the difference between
   documentary snapshots of a strip-lit greasy spoon and photography a café
   would actually put on its website. They are CC0, so they also carry no
   attribution obligation. Whitby is searched on Commons proper - Unsplash has
   no Whitby, and the local shots are the point of that section.

   `avoid` catches the cases where the subject is right but the frame is wrong:
   another business's signage, a menu board, a drinks fridge, or a photograph
   built around strangers' faces - none of which belong in a real café's
   marketing. */
const THEMES = {
  /* Chai and Indian café subjects. Commons search is AND-based, so every word
     has to appear: two or three words is the working length and a long
     descriptive query returns nothing at all. Where Commons proper holds only
     documentary snapshots, the query ends in "Unsplash" — Commons mirrors
     Unsplash's CC0 library, and those are the files that look like the
     photography a café would actually put on its website. */
  chai:      { q: "masala chai", must: ["chai", "tea"], avoid: ["plantation", "garden", "estate", "field", "harvest", "leaves", "people", "man", "woman", "shop", "stall", "packet"] },
  chaipour:  { q: "tea pouring", must: ["tea", "chai", "pour"], avoid: ["plantation", "field", "ceremony", "people", "party"] },
  chaicup:   { q: "tea cup Unsplash", must: ["tea", "cup"], avoid: ["plantation", "leaves", "people", "man", "woman", "book", "laptop"] },
  spice:     { q: "spices India", must: ["spice", "masala", "cardamom", "cinnamon", "clove"], avoid: ["market", "stall", "shop", "field", "plant", "people", "mill"] },
  cardamom:  { q: "cardamom", must: ["cardamom", "cinnamon"], avoid: ["plant", "field", "plantation", "botanical", "illustration"] },

  coffee:    { minSat: 0.09, q: "filter coffee India", must: ["coffee", "kaapi", "filter"], avoid: ["plantation", "estate", "drying", "people", "shop", "machine"] },
  latte:     { q: "latte art Unsplash", must: ["latte", "coffee", "cappuc"], avoid: ["people", "man", "woman", "book", "iphone", "laptop", "notebook"] },
  espresso:  { q: "cappuccino Unsplash", must: ["cappuc", "coffee", "espresso"], avoid: ["machine", "people", "man", "woman", "shop"] },
  barista:   { minSat: 0.09, q: "barista Unsplash", must: ["barista", "coffee", "espresso"], avoid: ["portrait", "woman", "man"] },
  iced:      { q: "iced coffee Unsplash", must: ["iced", "cold brew"], avoid: ["texting", "phone", "people", "man", "woman", "girl", "friends", "life"] },

  samosa:    { q: "samosa", must: ["samosa"], avoid: ["stall", "shop", "vendor", "people", "market", "making", "raw"] },
  pakora:    { q: "pakora", must: ["pakora", "bhaji", "bhajji", "fritter"], avoid: ["stall", "vendor", "people", "market", "raw"] },
  momo:      { q: "momo dumpling", must: ["momo", "dumpling"], avoid: ["stall", "vendor", "people", "market", "raw", "frozen"] },
  toastie:   { q: "grilled sandwich Unsplash", must: ["sandwich", "toast"], avoid: ["people", "man", "woman", "diner", "sign"] },

  cake:      { q: "cheesecake Unsplash", must: ["cheesecake", "cake"], avoid: ["birthday", "wedding", "store", "colorful", "raindrop"] },
  dessert:   { q: "cake slice Unsplash", must: ["cake", "slice", "brownie"], avoid: ["birthday", "wedding", "people", "store"] },

  interior:  { minSat: 0.09, crop: "centre", q: "cafe Unsplash", must: ["cafe", "café"], avoid: ["diner", "ice cream", "street", "people", "man", "woman", "girl", "boy", "meeting", "reading", "chatting", "working"] },
  cafe:      { minSat: 0.09, crop: "centre", q: "coffee shop Unsplash", must: ["coffee", "cafe", "café"], avoid: ["men", "people", "busy", "man", "woman", "sign", "menu", "chatting", "meeting", "reading"] },
  evening:   { minSat: 0.09, crop: "centre", q: "restaurant interior Unsplash", must: ["restaurant", "interior", "cafe", "café"], avoid: ["people", "man", "woman", "kitchen", "exterior", "sign"] },
};

/* == SLOTS =================================================================
   [path, width, height, theme, pick, alt]

   `pick` indexes into that theme's ranked results, so slots sharing a subject
   get different photographs. `alt` is read aloud by screen readers and indexed
   by Google: it describes what is in the frame, and never claims the café.
   Keep it in step with lib/site.config.ts, which carries its own copy of the
   alt text for the gallery and Instagram grids. */
const SLOTS = [
  ["hero-main.jpg", 1200, 1600, "chai", 0, "Masala chai in a clay kulhad", "File:Kulhad Chai.jpg"],
  ["og-image.jpg", 1200, 630, "chai", 1, "A glass of hot masala chai", "File:Garam Chai.jpg"],
  ["story-interior.jpg", 1200, 1500, "cafe", 0, "The counter of a small independent café"],
  ["evening.jpg", 1600, 1000, "evening", 0, "Warm evening light inside a café"],

  ["menu/chai.jpg", 900, 1125, "chai", 2, "Masala chai in a clay kulhad", "File:Kulhad Chai 2.jpg"],
  ["menu/coffee.jpg", 900, 1125, "latte", 0, "A cup of coffee with latte art", "File:Latte art 3.jpg"],
  ["menu/cold.jpg", 900, 1125, "iced", 0, "An iced coffee in a tall glass"],
  ["menu/bites.jpg", 900, 1125, "samosa", 0, "Samosas fresh out of the fryer"],
  ["menu/desserts.jpg", 900, 1125, "cake", 0, "Cheesecake from the counter"],

  ["into-kulhad.jpg", 1200, 900, "chai", 3, "Chai served in a clay kulhad", "File:Kulhad Chai 3.jpg"],
  ["into-spice.jpg", 1200, 900, "spice", 0, "Whole Indian spices"],
  ["into-coffee.jpg", 1200, 900, "coffee", 0, "South Indian filter coffee in a steel dabara", "File:South Indian Filter Coffee.jpg"],
  ["into-food.jpg", 1200, 900, "pakora", 0, "Pakoras on a plate"],
  ["into-evening.jpg", 1200, 900, "interior", 0, "Warm light in a quiet café"],

  ["story-detail.jpg", 1000, 1000, "chai", 4, "Chai in a clay kulhad on the counter", "File:Kulhad wali chai.jpg"],
  ["gallery/gallery-02.jpg", 1000, 1000, "chai", 5, "Chai in a glass", "File:Chai in a Glass.jpg"],
  ["gallery/gallery-03.jpg", 1000, 1400, "spice", 1, "Whole spices, close up"],
  ["gallery/gallery-04.jpg", 1000, 1000, "barista", 0, "A barista pouring milk into a cup"],
  ["gallery/gallery-05.jpg", 1000, 1000, "samosa", 1, "Samosas served with chutney", "File:Samosa with chutney.jpg"],
  ["gallery/gallery-06.jpg", 1000, 1400, "interior", 1, "A quiet corner table in a café", "File:Rustic Cafe Table (Unsplash).jpg"],
  ["gallery/gallery-07.jpg", 1000, 1000, "pakora", 1, "Pakoras fresh out of the pan"],
  ["gallery/gallery-08.jpg", 1000, 1000, "dessert", 0, "A slice of chocolate cake on a plate", "File:Piece of chocolate cake on a white plate decorated with chocolate sauce.jpg"],
  ["gallery/gallery-09.jpg", 1000, 1400, "iced", 1, "Iced cold brew coffee in a glass", "File:Iced cold brew coffee.jpg"],
  ["gallery/gallery-10.jpg", 1000, 1000, "cardamom", 0, "Green cardamom pods", "File:Green Cardamom Pods.jpg"],

  ["instagram/ig-01.jpg", 1080, 1080, "chaicup", 1, "A cup of tea with something sweet"],
  ["instagram/ig-02.jpg", 1080, 1080, "momo", 0, "Steamed momos with achar"],
  ["instagram/ig-03.jpg", 1080, 1080, "dessert", 1, "A slice of cake from the counter", "File:Flourless Chocolate Cake - Sugardough 2025-07-01.jpg"],
  ["instagram/ig-04.jpg", 1080, 1080, "espresso", 0, "Cappuccinos and cake"],
  ["instagram/ig-05.jpg", 1080, 1080, "chai", 6, "Chai in the pan before straining"],
  ["instagram/ig-06.jpg", 1080, 1080, "toastie", 0, "A grilled cheese toastie, hot off the press", "File:Grilled cheese sandwich prepared in toaster oven.jpg"],
];

/* == HTTP ================================================================== */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function once(url, binary, depth = 0) {
  if (depth > 5) return Promise.reject(new Error("too many redirects"));
  return new Promise((resolve, reject) => {
    https
      .get(new URL(url), { headers: { "User-Agent": UA } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          resolve(once(new URL(res.headers.location, url).toString(), binary, depth + 1));
          return;
        }
        if (res.statusCode !== 200) {
          res.resume();
          const error = new Error(`HTTP ${res.statusCode}`);
          error.status = res.statusCode;
          reject(error);
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(binary ? Buffer.concat(chunks) : Buffer.concat(chunks).toString("utf8")));
      })
      .on("error", reject);
  });
}

/** Retries on 429 and 5xx with a widening pause; gives up on real errors. */
async function get(url, binary = false) {
  let wait = 2000;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await once(url, binary);
    } catch (error) {
      const retryable = error.status === 429 || (error.status >= 500 && error.status < 600);
      if (!retryable || attempt === 4) throw error;
      await sleep(wait);
      wait *= 2;
    }
  }
  throw new Error("unreachable");
}

/**
 * The standard Commons thumbnail URL for a file.
 *
 * When the requested width is larger than the original, MediaWiki hands back
 * the original instead - and API-driven downloads of originals are the thing
 * Commons throttles. Asking for a width just under the original always yields
 * a real, cached thumbnail: smaller to serve, and the path they want used.
 *
 *   .../commons/a/ab/Name.jpg  ->  .../commons/thumb/a/ab/Name.jpg/1200px-Name.jpg
 */
/* Commons pre-generates these widths and refuses a thumbnail that is not a
   meaningful reduction on the original, so pick from the ladder rather than
   asking for "original minus one pixel", which returns HTTP 400. */
const THUMB_WIDTHS = [1920, 1280, 1024, 800, 640];

function thumbWidth(originalWidth) {
  return THUMB_WIDTHS.find((w) => w <= originalWidth * 0.92) ?? 640;
}

function thumbFor(url, width) {
  // imageinfo URLs carry ?utm_* tracking params. Split them off first, or the
  // query string ends up spliced into the middle of the derived path.
  const [bare, query] = url.split("?");
  const match = bare.match(/^(https:\/\/[^/]+\/wikipedia\/commons)\/([0-9a-f])\/([0-9a-f]{2})\/(.+)$/);
  if (!match) return url;
  const [, root, a, ab, name] = match;
  const thumb = `${root}/thumb/${a}/${ab}/${name}/${width}px-${name}`;
  return query ? `${thumb}?${query}` : thumb;
}

const strip = (html) => (html ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

/* Commons is an encyclopaedia archive, so a search for "coffee shop" happily
   returns a photo of a menu board, a shop sign or a museum exhibit label.
   None of those work as café photography. */
const REJECT_GLOBAL = /starbucks|costa coffee|nespresso|nescaf|mcdonald|pret a manger|caffe nero|dunkin|monochrome|black and white|b&w|greyscale|grayscale|yin yang|neon|storefront|shopfront|facade|entrance|roasters|price list/i;

const REJECT_TITLE =
  /menu|signage|sign|logo|poster|plaque|leaflet|banner|advert|diagram|map|chart|screenshot|packaging|label|receipt|coin|stamp|book cover|illustration|drawing|painting|engraving|etching|lithograph|print|postcard|watercolour|sketch|RMG|NMM|museum|exhibit|archive|herbarium|botanical|specimen|patent|blueprint|to accompany|aquatint|mezzotint|woodcut|vol\.|pl\.|fig\.|NINO|1[5-9][0-9]{2}|\([A-Z]{2,5}[ _]\d{5,}\)/i;

/* == SEARCH ================================================================ */

/**
 * Ranked, licence-cleared candidates for one subject.
 * Ranking is licence first (CC0 before BY before BY-SA, because the cheapest
 * obligation is no obligation) then resolution.
 */
async function searchTheme(name, { q: query, must, avoid }) {
  const url =
    `${API}?action=query&format=json&origin=*` +
    `&generator=search&gsrsearch=${encodeURIComponent(`filetype:bitmap ${query}`)}` +
    `&gsrnamespace=6&gsrlimit=40` +
    `&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=1920`;

  const json = JSON.parse(await get(url));
  const pages = json?.query?.pages ?? {};

  const candidates = Object.values(pages)
    .map((page) => {
      const info = page.imageinfo?.[0];
      if (!info) return null;
      if (REJECT_TITLE.test(page.title) || REJECT_GLOBAL.test(page.title)) return null;
      // The title must actually mention the subject. Commons full-text search
      // matches on description and category too, which is how a search for
      // "glass" reaches a cathedral window.
      const title = page.title.toLowerCase();
      if (must?.length && !must.some((word) => title.includes(word))) return null;
      // Subject is right, framing is wrong: a drinks fridge is a "cafe
      // interior" and another shop's price list is a "coffee shop counter".
      if (avoid?.length && avoid.some((word) => title.includes(word))) return null;
      const meta = info.extmetadata ?? {};
      const licence = classify(strip(meta.LicenseShortName?.value));
      if (!licence) return null;
      // Archival scans of Georgian prints survive every keyword filter, and
      // Commons is full of them. The capture date is the reliable tell.
      const shot = strip(meta.DateTimeOriginal?.value) || strip(meta.DateTime?.value);
      const year = Number(shot.match(/(1[5-9]\d{2}|20\d{2})/)?.[1] ?? 0);
      if (year && year < 1970) return null;
      if (/\.tiff?$/i.test(page.title)) return null;
      // Below the target size the crop would be an upscale, which looks worse
      // than the illustration it is replacing.
      if ((info.width ?? 0) < 1100 || (info.height ?? 0) < 700) return null;
      return {
        file: page.title,
        page: info.descriptionshorturl ?? `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,
        // Always the pre-rendered thumbnail, never the original. Commons
        // throttles full-size downloads driven by the API (they tag them
        // utm_content=thumbnail_unscaled and rate-limit them), and rightly so
        // - the originals here run to 20MB and nothing on this site needs
        // more than 1920px. The thumbnail is a few hundred KB and cached.
        src:
          info.thumburl && /\/thumb\//.test(info.thumburl)
            ? info.thumburl
            : thumbFor(info.url, thumbWidth(info.width ?? 1200)),
        width: info.width,
        height: info.height,
        licence: licence.label,
        licenceUrl: strip(meta.LicenseUrl?.value),
        attribution: licence.attribution,
        shareAlike: licence.shareAlike,
        rank: licence.rank,
        author: strip(meta.Artist?.value) || "Unknown",
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.rank - b.rank || b.width * b.height - a.width * a.height);

  const free = candidates.filter((c) => c.rank === 0).length;
  console.log(`  ${name.padEnd(10)} ${String(candidates.length).padStart(2)} usable (${free} with no attribution needed)  "${query}"`);
  return candidates;
}

/**
 * Metadata for one exact Commons file.
 *
 * Search ranks by licence then megapixels, which is fine for filling a gallery
 * but keeps surfacing the largest file rather than the best photograph - a
 * travel mug held over mud outranked every latte art shot for "coffee".
 * For the handful of slots that carry the design, a named file beats a query.
 */
async function lookupFile(title) {
  const url =
    `${API}?action=query&format=json&titles=${encodeURIComponent(title)}` +
    `&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=1920`;
  const json = JSON.parse(await get(url));
  const page = Object.values(json?.query?.pages ?? {})[0];
  const info = page?.imageinfo?.[0];
  if (!info) throw new Error(`no such file: ${title}`);

  const meta = info.extmetadata ?? {};
  const licence = classify(strip(meta.LicenseShortName?.value));
  if (!licence) throw new Error(`${title} is not openly licensed enough to use`);

  return {
    file: page.title,
    page: info.descriptionshorturl ?? `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,
    src:
      info.thumburl && /\/thumb\//.test(info.thumburl)
        ? info.thumburl
        : thumbFor(info.url, thumbWidth(info.width ?? 1200)),
    width: info.width,
    height: info.height,
    licence: licence.label,
    licenceUrl: strip(meta.LicenseUrl?.value),
    attribution: licence.attribution,
    shareAlike: licence.shareAlike,
    rank: licence.rank,
    author: strip(meta.Artist?.value) || "Unknown",
  };
}

/* == PICTURE QUALITY =======================================================
   A title tells you the subject, never the photograph. "Meeting at the Cafe"
   turned out to be black and white and "Reading at a cafe" a near-silhouette:
   both perfectly good photos, neither right for a warm, food-led cafe site,
   and neither detectable from its filename. So we look at the pixels. */

async function inspect(buffer) {
  // 64x64 is plenty to characterise colour and exposure, and costs nothing.
  // .raw().toBuffer() resolves to the pixel Buffer itself, not { data }.
  const data = await sharp(buffer).resize(64, 64, { fit: "cover" }).removeAlpha().raw().toBuffer();

  let luma = 0;
  let saturation = 0;
  const pixels = data.length / 3;

  for (let i = 0; i < data.length; i += 3) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    luma += 0.2126 * r + 0.7152 * g + 0.0722 * b;
    // HSV saturation: how far this pixel sits from grey.
    saturation += max === 0 ? 0 : (max - min) / max;
  }

  return { luma: luma / pixels, saturation: saturation / pixels };
}

function judge({ luma, saturation }, minSaturation = MIN_SATURATION) {
  if (saturation < minSaturation) return `monochrome (sat ${saturation.toFixed(2)})`;
  if (luma < MIN_LUMA) return `too dark (luma ${luma.toFixed(0)})`;
  if (luma > MAX_LUMA) return `blown out (luma ${luma.toFixed(0)})`;
  return null;
}

/* == RUN =================================================================== */

console.log("Searching Wikimedia Commons (CC0 / PD / CC BY / CC BY-SA only)...");

let cache = {};
if (!FRESH) {
  try {
    cache = JSON.parse(await readFile(CACHE, "utf8"));
  } catch {
    // No cache yet, or it is unreadable. Either way, search afresh.
  }
}

const pools = {};
let searched = 0;
for (const [name, theme] of Object.entries(THEMES)) {
  // Cache is keyed by the query itself, so editing a query re-searches it and
  // leaving it alone costs nothing.
  const hit = cache[name];
  const key = `v10|${theme.q}|${(theme.must ?? []).join(",")}|${(theme.avoid ?? []).join(",")}`;
  if (hit && hit.query === key && Array.isArray(hit.results)) {
    pools[name] = hit.results;
    console.log(`  ${name.padEnd(10)} ${String(hit.results.length).padStart(2)} usable (cached)`);
    continue;
  }
  // Space out live searches; Commons is a donated resource, not a CDN.
  if (searched > 0) await sleep(PAUSE_MS);
  searched += 1;
  try {
    pools[name] = await searchTheme(name, theme);
    cache[name] = { query: key, results: pools[name] };
  } catch (error) {
    console.log(`  ${name.padEnd(10)} FAILED: ${error.message}`);
    pools[name] = hit?.results ?? [];
  }
}

try {
  await writeFile(CACHE, `${JSON.stringify(cache, null, 1)}
`, "utf8");
} catch {
  // A missing cache only costs time on the next run.
}

console.log(DRY ? "\nDry run - nothing written.\n" : "\nDownloading and cropping...\n");

/* Resume: slots already installed in a previous run are left alone, so a run
   that hit the rate limit halfway can simply be run again. upload.wikimedia.org
   throttles thumbnail generation hard, and re-downloading 20MB originals we
   already have is rude as well as slow. Pass --fresh to redo everything. */
let credits = [];
try {
  if (!FRESH && !DRY) {
    credits = JSON.parse(await readFile(join(ROOT, "lib", "photo-credits.json"), "utf8")).map((c) => ({
      rel: c.file.replace(/^\/images\//, ""),
      alt: c.alt,
      file: `File:${c.title}`,
      page: c.source,
      licence: c.licence,
      licenceUrl: c.licenceUrl,
      author: c.author,
      attribution: c.attributionRequired,
      shareAlike: c.shareAlike,
      done: true,
    }));
  }
} catch {
  // First run, or the manifest is gone. Fetch everything.
}

const already = new Set(credits.map((c) => c.rel));
if (ONLY.length) {
  // Drop the named slots from the manifest so they are fetched afresh, and
  // free the photographs they were using for reuse.
  credits = credits.filter((c) => !ONLY.includes(c.rel));
  for (const rel of ONLY) already.delete(rel);
}
const failures = [];
const usedPages = new Set(credits.map((c) => c.page));

for (const [rel, w, h, theme, pick, alt, pin] of SLOTS) {
  if (already.has(rel)) {
    console.log(`  have ${rel}`);
    continue;
  }
  let pinned = null;
  if (pin) {
    try {
      pinned = await lookupFile(pin);
      await sleep(PAUSE_MS);
    } catch (error) {
      console.log(`  ..   ${rel} - pinned "${pin}" unusable (${error.message}), falling back to search`);
    }
  }

  const pool = pinned ? [pinned, ...(pools[theme] ?? [])] : pools[theme] ?? [];
  // Candidates in preference order: from the wanted index onward, then wrap.
  // Anything already used by another slot is skipped, so no photograph appears
  // on the page twice.
  // A pinned file always goes first; `pick` only indexes into search results.
  const searchPool = pinned ? pool.slice(1) : pool;
  const ordered = pinned
    ? [pinned, ...searchPool.slice(pick), ...searchPool.slice(0, pick)]
    : [...searchPool.slice(pick), ...searchPool.slice(0, pick)];
  const queue = ordered.filter((c) => !usedPages.has(c.page));

  if (queue.length === 0) {
    failures.push(rel);
    console.log(`  SKIP ${rel} - nothing usable for "${theme}"`);
    continue;
  }

  if (DRY) {
    const chosen = queue[0];
    usedPages.add(chosen.page);
    console.log(`  ${rel.padEnd(30)} ${chosen.licence.padEnd(13)} ${chosen.width}x${chosen.height}  ${chosen.file.replace("File:", "").slice(0, 52)}`);
    credits.push({ rel, alt, ...chosen });
    continue;
  }

  /* Try candidates until one actually downloads. Commons will refuse a
     thumbnail it has not got and rate-limit a burst, and a single dud must not
     leave an illustration sitting in a slot that is supposed to be a photo. */
  let installed = false;
  for (const chosen of queue.slice(0, 14)) {
    try {
      await sleep(400);
      const raw = await get(chosen.src, true);

      // A pinned file is a deliberate editorial choice, so it is exempt: the
      // automatic gate exists to filter search results nobody looked at, and
      // it was rejecting a hand-picked shot for sitting a hundredth under the
      // saturation floor.
      const reject = chosen === pinned ? null : judge(await inspect(raw), THEMES[theme]?.minSat ?? MIN_SATURATION);
      if (reject) {
        console.log(`  ..   ${rel.padEnd(28)} ${chosen.file.replace("File:", "").slice(0, 32)} ${reject}`);
        continue;
      }

      const out = join(IMAGES, rel);
      await mkdir(dirname(out), { recursive: true });
      await sharp(raw)
        // "attention" crops toward the busiest region - on a photo of a cup on
        // a table that is the cup. A centre crop routinely halves the subject.
        .resize(w, h, {
          fit: "cover",
          // Food and drink: crop to the busiest region, which is the plate or
          // the cup. Rooms: crop to the middle, because "busiest" in a room is
          // a picture frame on the wall rather than the seating.
          position: THEMES[theme]?.crop === "centre" ? "centre" : sharp.strategy.attention,
        })
        // No .withMetadata(), so EXIF - including any GPS - is dropped.
        .jpeg({ quality: 82, progressive: true, mozjpeg: true })
        .toFile(out);
      usedPages.add(chosen.page);
      credits.push({ rel, alt, ...chosen });
      console.log(`  ok   ${rel.padEnd(30)} ${chosen.licence.padEnd(13)} ${chosen.file.replace("File:", "").slice(0, 46)}`);
      installed = true;
      break;
    } catch (error) {
      console.log(`  ..   ${rel} - ${chosen.file.replace("File:", "").slice(0, 34)} ${error.message}, trying next`);
    }
  }

  if (!installed) {
    failures.push(rel);
    console.log(`  FAIL ${rel} - every candidate failed`);
  }
}

/* == CREDITS ===============================================================
   Not optional. CC BY and CC BY-SA are only satisfied if this exists and is
   reachable from the site. */
if (!DRY && credits.length) {
  const order = new Map(SLOTS.map(([rel], i) => [rel, i]));
  credits.sort((a, b) => (order.get(a.rel) ?? 99) - (order.get(b.rel) ?? 99));
  const manifest = credits.map((c) => ({
    file: `/images/${c.rel}`,
    alt: c.alt,
    title: c.file.replace(/^File:/, "").replace(/\.[a-z]+$/i, "").replace(/_/g, " "),
    author: c.author,
    licence: c.licence,
    licenceUrl: c.licenceUrl || "",
    source: c.page,
    attributionRequired: c.attribution,
    shareAlike: c.shareAlike,
  }));

  await writeFile(
    join(ROOT, "lib", "photo-credits.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );

  const needAttribution = manifest.filter((m) => m.attributionRequired).length;
  const shareAlike = manifest.filter((m) => m.shareAlike).length;

  console.log(`\nWrote lib/photo-credits.json - ${manifest.length} photos`);
  console.log(`  ${manifest.length - needAttribution} public domain / CC0 (no obligation)`);
  console.log(`  ${needAttribution} need attribution, of which ${shareAlike} are share-alike`);
  console.log("  These are credited on /credits, which is linked from the footer.");

  console.log("\nAlt text to keep in step with lib/site.config.ts:");
  for (const c of credits) console.log(`  ${c.rel.padEnd(30)} ${c.alt}`);
}

if (failures.length) {
  console.log(`\n${failures.length} slot(s) not filled: ${failures.join(", ")}`);
  console.log("Run `npm run placeholders` to redraw those as illustrations.");
}
