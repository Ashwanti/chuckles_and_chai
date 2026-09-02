/**
 * Fills any EMPTY image slot with a plain branded panel.
 *
 *   npm run placeholders          only slots that have no file yet
 *   npm run placeholders -- --all redraw every slot
 *
 * WHY THIS IS DELIBERATELY BORING
 * `npm run photos` is the real answer: it installs openly-licensed photographs
 * of the right subject from Wikimedia Commons. This script exists for the
 * handful of slots that search can fail to fill, and for a fresh clone that
 * has not run the fetcher yet — a missing file under public/images is a 404 in
 * the middle of the page, which is worse than an obviously blank panel.
 *
 * It draws a tinted ground, a hairline frame and the slot's own label. It does
 * NOT draw a fake photograph of food, because a stylised illustration of a cup
 * is exactly the kind of thing that quietly survives to launch. This one does
 * not: it looks unfinished, on purpose.
 *
 * The slot list is read straight out of fetch-photos.mjs, so the two can never
 * drift apart.
 */

import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const IMAGES = join(ROOT, "public", "images");
const ALL = process.argv.includes("--all");

/* Palette lifted from app/globals.css so the panels sit inside the page
   rather than shouting at it. */
const PAPER = "#F4EDE1";
const RULE = "#DCCFBB";
const INK = "#8A7A72";

/**
 * Parses the SLOTS table out of fetch-photos.mjs.
 *
 * Reading the file rather than importing it keeps this script free of the
 * fetcher's network code — importing that module would run its searches.
 */
async function slots() {
  const source = await readFile(join(ROOT, "scripts", "fetch-photos.mjs"), "utf8");
  const table = source.slice(source.indexOf("const SLOTS = ["), source.indexOf("/* == HTTP"));
  const rows = [...table.matchAll(/\["([^"]+)",\s*(\d+),\s*(\d+),\s*"[^"]+",\s*\d+,\s*"([^"]*)"/g)];
  return rows.map((m) => ({ rel: m[1], w: Number(m[2]), h: Number(m[3]), alt: m[4] }));
}

const exists = (path) =>
  access(path).then(
    () => true,
    () => false,
  );

const escape = (value) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function panel({ w, h, alt }) {
  // Scale the furniture with the slot so a 1080px tile and a 1920px hero look
  // like the same design rather than the same numbers.
  const unit = Math.min(w, h);
  const inset = Math.round(unit * 0.06);
  const label = Math.max(11, Math.round(unit * 0.032));
  const mark = Math.round(unit * 0.13);
  const cx = w / 2;
  const cy = h / 2 - unit * 0.03;

  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <rect width="${w}" height="${h}" fill="${PAPER}"/>
  <rect x="${inset}" y="${inset}" width="${w - inset * 2}" height="${h - inset * 2}"
        fill="none" stroke="${RULE}" stroke-width="1.5"/>
  <g stroke="${INK}" stroke-width="${Math.max(1.5, mark * 0.075)}" fill="none" stroke-linecap="round" opacity=".55">
    <circle cx="${cx}" cy="${cy}" r="${mark}"/>
    <path d="M${cx - mark * 0.45} ${cy + mark * 0.05} h${mark * 0.9} l-${mark * 0.13} ${mark * 0.6}
             a${mark * 0.22} ${mark * 0.22} 0 0 1 -${mark * 0.22} ${mark * 0.17}
             h-${mark * 0.22} a${mark * 0.22} ${mark * 0.22} 0 0 1 -${mark * 0.22} -${mark * 0.17} z"/>
    <path d="M${cx - mark * 0.2} ${cy - mark * 0.45} c-${mark * 0.14} ${mark * 0.16} ${mark * 0.14} ${mark * 0.24} 0 ${mark * 0.4}"/>
    <path d="M${cx + mark * 0.2} ${cy - mark * 0.45} c-${mark * 0.14} ${mark * 0.16} ${mark * 0.14} ${mark * 0.24} 0 ${mark * 0.4}"/>
  </g>
  <text x="${cx}" y="${cy + mark + label * 2.1}" text-anchor="middle"
        font-family="Inter, 'Segoe UI', Arial, sans-serif" font-size="${label}"
        font-weight="600" letter-spacing="${label * 0.14}" fill="${INK}">PHOTO TO COME</text>
  <text x="${cx}" y="${cy + mark + label * 3.7}" text-anchor="middle"
        font-family="Inter, 'Segoe UI', Arial, sans-serif" font-size="${label * 0.82}"
        fill="${INK}" opacity=".75">${escape(alt)}</text>
</svg>`);
}

const list = await slots();
if (list.length === 0) throw new Error("no slots parsed from fetch-photos.mjs");

let written = 0;
for (const slot of list) {
  const out = join(IMAGES, slot.rel);
  if (!ALL && (await exists(out))) continue;
  await mkdir(dirname(out), { recursive: true });
  await sharp(panel(slot))
    .jpeg({ quality: 86, progressive: true, mozjpeg: true })
    .toFile(out);
  written += 1;
  console.log(`  drew ${slot.rel.padEnd(30)} ${slot.w}x${slot.h}`);
}

if (written === 0) {
  console.log(`make-placeholders: all ${list.length} slots already have a file. --all redraws them.`);
} else {
  console.log(`\nmake-placeholders: wrote ${written} of ${list.length} slots.`);
  console.log("Run `npm run photos` to replace them with real, openly-licensed photographs.");
}

/* The apple touch icon is not in SLOTS - it is derived from favicon.svg by
   scripts/make-icons.mjs - but a fresh clone needs it to exist before the
   first build, or the manifest points at nothing. */
const touch = join(IMAGES, "apple-touch-icon.png");
if (ALL || !(await exists(touch))) {
  await mkdir(IMAGES, { recursive: true });
  await sharp(join(ROOT, "public", "favicon.svg"), { density: 384 })
    .resize(180, 180)
    .png({ compressionLevel: 9 })
    .toFile(touch);
  console.log("  drew images/apple-touch-icon.png            180x180");
}

await writeFile(join(IMAGES, ".gitkeep"), "", "utf8");
