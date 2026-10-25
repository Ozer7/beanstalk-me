// ---------------------------------------------------------------------------
// Cut Jack's character sheet into its separate views, so the app can show one
// at a time. The model lays the sheet out as 4 views on top and 4 close-ups
// below, but not on an exact grid (the full-body row is usually taller, and
// the gap under the boots can be only ~1% of the height), so the cuts are found
// from the picture: a pixel counts as "something" when its colour differs from
// that row's backdrop; the emptiest band of rows between the rows is the split,
// then the emptiest columns between the views in each row.
// ---------------------------------------------------------------------------
import sharp from "sharp";

export const VIEW_LABELS = [
  ["Front", "Three-quarter view", "Side view", "Three-quarter view, other side"],
  ["Smiling", "Worried", "Amazed", "Shocked"],
];

const W = 768; // analysis width (high enough that a 1% gap is several rows)
const DIFF = 45; // colour distance (sum over R, G, B) that counts as "something"

export async function sheetViews(sheet, debug = null) {
  const meta = await sharp(sheet).metadata();
  const H = Math.round((W * meta.height) / meta.width);
  const { data } = await sharp(sheet).resize(W, H, { fit: "fill" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });

  // Each row's backdrop colour: the median of its 16 leftmost and rightmost pixels.
  const bg = [];
  for (let y = 0; y < H; y++) {
    const sample = [];
    for (let x = 0; x < 16; x++) sample.push(x, W - 1 - x);
    bg.push([0, 1, 2].map((c) => median(sample.map((x) => data[(y * W + x) * 3 + c]))));
  }
  const ink = (x, y) => {
    const i = (y * W + x) * 3, b = bg[y];
    return Math.abs(data[i] - b[0]) + Math.abs(data[i + 1] - b[1]) + Math.abs(data[i + 2] - b[2]) > DIFF ? 1 : 0;
  };

  // Split between the rows: the emptiest rows between 35% and 80% of the height.
  const rowInk = Array.from({ length: H }, (_, y) => { let n = 0; for (let x = 0; x < W; x++) n += ink(x, y); return n; });
  const split = emptiest(rowInk, Math.round(H * 0.35), Math.round(H * 0.8));
  if (debug) Object.assign(debug, { W, H, split, meta: { w: meta.width, h: meta.height, ch: meta.channels, fmt: meta.format, space: meta.space }, len: data.length, rows: rowInk.filter((_, i) => i % 10 === 0), bg0: bg[0], bgMid: bg[Math.round(H / 2)] });
  const rows = [[0, split], [split, H]];

  const views = [];
  for (let r = 0; r < 2; r++) {
    const [y0, y1] = rows[r];
    const colInk = Array.from({ length: W }, (_, x) => { let n = 0; for (let y = y0; y < y1; y++) n += ink(x, y); return n; });
    const cuts = [0];
    for (const at of [0.25, 0.5, 0.75]) cuts.push(emptiest(colInk, Math.round(W * (at - 0.1)), Math.round(W * (at + 0.1))));
    cuts.push(W);
    for (let c = 0; c < 4; c++) views.push({ row: r, col: c, label: VIEW_LABELS[r][c], box: tighten(ink, cuts[c], cuts[c + 1], y0, y1) });
  }

  const sx = meta.width / W, sy = meta.height / H;
  return Promise.all(
    views.map(async (v) => {
      const left = Math.max(0, Math.floor(v.box.x0 * sx));
      const top = Math.max(0, Math.floor(v.box.y0 * sy));
      const width = Math.max(1, Math.min(meta.width - left, Math.ceil((v.box.x1 - v.box.x0) * sx)));
      const height = Math.max(1, Math.min(meta.height - top, Math.ceil((v.box.y1 - v.box.y0) * sy)));
      const buf = await sharp(sheet).extract({ left, top, width, height }).jpeg({ quality: 88 }).toBuffer();
      return { label: v.label, row: v.row, col: v.col, image: `data:image/jpeg;base64,${buf.toString("base64")}` };
    })
  );
}

function median(a) {
  const s = [...a].sort((x, y) => x - y);
  return s[Math.floor(s.length / 2)];
}

// Middle of the widest run of the emptiest positions in [from, to).
function emptiest(profile, from, to) {
  let min = Infinity;
  for (let i = from; i < to; i++) min = Math.min(min, profile[i]);
  const limit = min + Math.max(2, min * 0.15);
  let best = [from, from], run = null;
  for (let i = from; i < to; i++) {
    if (profile[i] <= limit) { run = run ? [run[0], i] : [i, i]; if (run[1] - run[0] > best[1] - best[0]) best = run; }
    else run = null;
  }
  return Math.round((best[0] + best[1]) / 2);
}

// Shrink a cell to the part with something in it (ignoring stray specks), plus a margin.
function tighten(ink, x0, x1, y0, y1) {
  const rows = [], cols = [];
  for (let y = y0; y < y1; y++) { let n = 0; for (let x = x0; x < x1; x++) n += ink(x, y); rows.push(n); }
  for (let x = x0; x < x1; x++) { let n = 0; for (let y = y0; y < y1; y++) n += ink(x, y); cols.push(n); }
  const span = (p, min) => { let a = p.findIndex((n) => n >= min), b = p.length - 1 - [...p].reverse().findIndex((n) => n >= min); return a < 0 ? [0, p.length - 1] : [a, b]; };
  const [ry0, ry1] = span(rows, 3), [cx0, cx1] = span(cols, 3);
  const tx0 = x0 + cx0, tx1 = x0 + cx1, ty0 = y0 + ry0, ty1 = y0 + ry1;
  const m = Math.round(Math.max(tx1 - tx0, ty1 - ty0) * 0.05);
  return { x0: Math.max(x0, tx0 - m), x1: Math.min(x1, tx1 + m + 1), y0: Math.max(y0, ty0 - m), y1: Math.min(y1, ty1 + m + 1) };
}
