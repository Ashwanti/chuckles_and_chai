/**
 * Rasterises public/favicon.svg into the PNG touch icon.
 *
 *   npm run icons
 *
 * Deriving it from the SVG guarantees the tab icon and the home-screen icon
 * are the same artwork - if the bean mark is ever redrawn, only favicon.svg
 * needs editing.
 */

import { join } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

await sharp(join(ROOT, "public", "favicon.svg"), { density: 384 })
  .resize(180, 180)
  .png({ compressionLevel: 9 })
  .toFile(join(ROOT, "public", "images", "apple-touch-icon.png"));

console.log("make-icons: wrote public/images/apple-touch-icon.png (180x180)");
