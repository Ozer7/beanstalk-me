// ---------------------------------------------------------------------------
// Cut Jack's character sheet into its separate views, so the app can show one
// at a time. The model lays the sheet out as 4 views on top and 4 close-ups
// below, but not on an exact grid (the full-body row is usually taller), so
// the cuts are found from the picture: the emptiest band of rows between the
// two rows, then the emptiest columns between the views in each row.
// ---------------------------------------------------------------------------
import sharp from "sharp";

export const VIEW_LABELS = [
  ["Front", "Three-quarter view", "Side view", "Three-quarter view, other side"],
  ["Smiling", "Worried", "Amazed", "Shocked"],
];

const W = 384; // analysis width

export async function sheetViews(sheet) {
  const meta = await sharp(sheet).metadata();
  const H = Math.round((W * meta.height) / meta.width);
  const { data } = await sharp(sheet).resize(W, H, { fit: "fill" }).greyscale().raw().toBuffer({ resolveWithObject: true });

  // Background: the median of the border pixels (the plain backdrop).
  const border = [];
  for (let x = 0; x < W; x++) border.push(data[x], data[(H - 1) * W + x]);
  for (let y = 0; y < H; y++) border.push(data[y * W], data[y * W + W - 1]);
  border.sort((a, b) => a - b);
  const bg = border[Math.floor(border.length / 2)];
  const ink = (x, y) => (Math.abs(data[y * W + x] - bg) > 22 ? 1 : 0);

  // Split between the rows: emptiest rows between 30% and 75% of the height.
  const rowInk = Array.from({ length: H }, (_, y) => { let n = 0; for (let x = 0; x < W; x++) n += ink(x, y); return n; });
  const split = emptiest(rowInk, Math.round(H * 0.3), Math.round(H * 0.75));
  const rows = [[0, split], [split, H]];

  const views = [];
  for (let r = 0; r < 2; r++) {
    const [y0, y1] = rows[r];
    const colInk = Array.from({ length: W }, (_, x) => { let n = 0; for (let y = y0; y < y1; y++) n += ink(x, y); return n; });
    const cuts = [0];
    for (const at of [0.25, 0.5, 0.75]) cuts.push(emptiest(colInk, Math.round(W * (at - 0.1)), Math.round(W * (at + 0.1))));
    cuts.push(W);
    for (let c = 0; c < 4; c++) {
      const box = tighten(ink, cuts[c], cuts[c + 1], y0, y1);
      views.push({ row: r, col: c, label: VIEW_LABELS[r][c], box });
    }
  }

  const sx = meta.width / W, sy = meta.height / H;
  return Promise.all(
    views.map(async (v) => {
      const left = Math.max(0, Math.floor(v.box.x0 * sx));
      const top = Math.max(0, Math.floor(v.box.y0 * sy));
      const width = Math.min(meta.width - left, Math.ceil((v.box.x1 - v.box.x0) * sx));
      const height = Math.min(meta.height - top, Math.ceil((v.box.y1 - v.box.y0) * sy));
      const buf = await sharp(sheet).extract({ left, top, width, height }).jpeg({ quality: 88 }).toBuffer();
      return { label: v.label, row: v.row, col: v.col, image: `data:image/jpeg;base64,${buf.toString("base64")}` };
    })
  );
}

// Middle of the widest run of the emptiest positions in [from, to).
function emptiest(profile, from, to) {
  let min = Infinity;
  for (let i = from; i < to; i++) min = Math.min(min, profile[i]);
  const limit = min + Math.max(1, min * 0.15);
  let best = [from, from], run = null;
  for (let i = from; i < to; i++) {
    if (profile[i] <= limit) { run = run ? [run[0], i] : [i, i]; if (run[1] - run[0] > best[1] - best[0]) best = run; }
    else run = null;
  }
  return Math.round((best[0] + best[1]) / 2);
}

// Shrink a cell to the part with something in it, plus a margin.
function tighten(ink, x0, x1, y0, y1) {
  let tx0 = x1, tx1 = x0, ty0 = y1, ty1 = y0;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    if (ink(x, y)) { if (x < tx0) tx0 = x; if (x > tx1) tx1 = x; if (y < ty0) ty0 = y; if (y > ty1) ty1 = y; }
  }
  if (tx1 <= tx0 || ty1 <= ty0) return { x0, x1, y0, y1 };
  const m = Math.round(Math.max(tx1 - tx0, ty1 - ty0) * 0.06);
  return { x0: Math.max(x0, tx0 - m), x1: Math.min(x1, tx1 + m + 1), y0: Math.max(y0, ty0 - m), y1: Math.min(y1, ty1 + m + 1) };
}
