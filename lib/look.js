import sharp from "sharp";
import { layoutWords } from "./layout.js";

// How much of the picture around the words to check, as a fraction of the page.
const PAD_X = 0.04;
const PAD_Y = 0.03;

// The area is scored as a grid of cells, and the busiest cell decides, so one
// head poking into a wide strip of sky still counts. Measured on a real book:
// under clear sky, floorboards and dark grass the busiest cell scores at most
// 0.012; with a head, a hat, the cottage wall or the kitchen shelves under the
// words it scores 0.045 or more.
const GRID = { cols: 8, rows: 3 };
const BUSY_EDGES = 0.03;

/**
 * Look at the part of the picture the page's words will cover (the exact box
 * from layout.js, plus a little margin) and report:
 *   ink        "light" or "dark" — the word colour that reads best there
 *   luminance  0–1, average brightness there
 *   detail     average edge density there: how much changes from pixel to
 *              pixel. A smooth sky gradient scores near 0; faces score high.
 *   busiest    edge density of the busiest grid cell
 *   busy       true if a person or object sits under the words
 */
export async function measureTextZone(image, spec) {
  const { width, height } = await sharp(image).metadata();
  const { box } = layoutWords(spec);
  const x0 = Math.max(0, box.left - PAD_X), x1 = Math.min(1, box.right + PAD_X);
  const y0 = Math.max(0, box.top - PAD_Y), y1 = Math.min(1, box.bottom + PAD_Y);
  const region = {
    left: Math.round(x0 * width),
    top: Math.round(y0 * height),
    width: Math.max(2, Math.round((x1 - x0) * width)),
    height: Math.max(2, Math.round((y1 - y0) * height)),
  };

  // Brightness: average over the area, in linear-ish sRGB weights.
  const { channels } = await sharp(image).extract(region).removeAlpha().stats();
  const [r, g, b] = channels.map((c) => c.mean / 255);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  // Edges: shrink to a fixed width so the score doesn't depend on resolution,
  // then average the difference between each pixel and its neighbours.
  const W = 256;
  const H = Math.max(2, Math.round((W * region.height) / region.width));
  const { data } = await sharp(image)
    .extract(region)
    .resize(W, H, { fit: "fill" })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const cells = GRID.cols * GRID.rows;
  const diff = new Array(cells).fill(0);
  const count = new Array(cells).fill(0);
  for (let y = 0; y < H; y++) {
    const row = Math.min(GRID.rows - 1, Math.floor((y / H) * GRID.rows));
    for (let x = 0; x < W; x++) {
      const c = row * GRID.cols + Math.min(GRID.cols - 1, Math.floor((x / W) * GRID.cols));
      const v = data[y * W + x];
      if (x + 1 < W) { diff[c] += Math.abs(v - data[y * W + x + 1]); count[c]++; }
      if (y + 1 < H) { diff[c] += Math.abs(v - data[(y + 1) * W + x]); count[c]++; }
    }
  }
  const total = diff.reduce((a, b) => a + b, 0) / count.reduce((a, b) => a + b, 0) / 255;
  const busiest = Math.max(...diff.map((d, i) => (count[i] ? d / count[i] / 255 : 0)));

  return {
    ink: luminance > 0.5 ? "dark" : "light",
    luminance: round(luminance),
    detail: round(total),
    busiest: round(busiest),
    busy: busiest > BUSY_EDGES,
  };
}

function round(n) {
  return Math.round(n * 10000) / 10000;
}
