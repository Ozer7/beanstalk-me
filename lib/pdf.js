// ---------------------------------------------------------------------------
// The PDF layer. The model only ever draws art; all words are set here, in a
// real font, so they are always spelled right and always readable.
// ---------------------------------------------------------------------------
import fs from "node:fs";
import { createRequire } from "node:module";
import { PDFDocument, rgb, degrees } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import sharp from "sharp";
import { woffToSfnt } from "./woff.js";
import { measureTextZone } from "./look.js";

// 6 x 9 in, the same 2:3 shape as the 1024x1536 art, so the art fills the page.
export const PAGE_W = 432;
export const PAGE_H = 648;

const require = createRequire(import.meta.url);
const fontFile = (weight) =>
  woffToSfnt(fs.readFileSync(require.resolve(`@fontsource/fredoka/files/fredoka-latin-${weight}-normal.woff`)));
const FONT_BYTES = { regular: fontFile(400), medium: fontFile(500), bold: fontFile(600) };
const GLYPHS = fontkit.create(FONT_BYTES.regular);

const C = {
  cream: rgb(1, 0.969, 0.91),
  ink: rgb(0.165, 0.118, 0.078),
  night: rgb(0.05, 0.04, 0.03),
  paper: rgb(0.969, 0.945, 0.89),
  leaf: rgb(0.173, 0.361, 0.157),
  muted: rgb(0.435, 0.404, 0.345),
  line: rgb(0.886, 0.839, 0.741),
};
const BEAN_COLOURS = ["#c8473a", "#e0a526", "#4f9a3a", "#3c78c2", "#7e4fb3"];

// Characters the book font can't draw (e.g. Hebrew, emoji). The server checks
// the About Me fields with this before building, instead of printing boxes.
export function unsupportedChars(str) {
  const bad = new Set();
  for (const ch of String(str ?? "")) {
    if (/\s/.test(ch)) continue;
    if (!GLYPHS.hasGlyphForCodePoint(ch.codePointAt(0))) bad.add(ch);
  }
  return [...bad];
}

/**
 * pages:     [{ spec, image }]  spec from storyboard.js, image = Buffer
 * reference: Buffer (the Jack reference, used on the About Me page)
 * child:     { name, age, likes, food, growUp, more }
 */
export async function buildBookPdf({ pages, reference, child }) {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const fonts = {
    regular: await pdf.embedFont(FONT_BYTES.regular, { subset: true }),
    medium: await pdf.embedFont(FONT_BYTES.medium, { subset: true }),
    bold: await pdf.embedFont(FONT_BYTES.bold, { subset: true }),
  };

  pdf.setTitle(`Jack and the Beanstalk, starring ${child.name}`);
  pdf.setAuthor("Beanstalk Me");
  pdf.setSubject(`A picture book starring ${child.name}`);
  pdf.setCreator("Beanstalk Me (MCON 368)");
  pdf.setLanguage("en-US");

  for (const p of pages) await addStoryPage(pdf, fonts, p);
  await addAboutMePage(pdf, fonts, reference, child);
  return Buffer.from(await pdf.save());
}

// ---------------------------------------------------------------------------
// Story pages: full-bleed art, then a soft shadow band, then the words.
// ---------------------------------------------------------------------------
async function addStoryPage(pdf, fonts, { spec, image }) {
  const page = pdf.addPage([PAGE_W, PAGE_H]);
  const zone = spec.textZone;
  const look = spec.text ? await measureTextZone(image, zone) : null;
  const art = await embedImage(pdf, look ? await withShadowBand(image, zone, look) : image);

  // Cover the whole page (anything outside the page box is cropped).
  const scale = Math.max(PAGE_W / art.width, PAGE_H / art.height);
  const w = art.width * scale;
  const h = art.height * scale;
  page.drawImage(art, { x: (PAGE_W - w) / 2, y: (PAGE_H - h) / 2, width: w, height: h });

  if (!spec.text) return;
  const zoneH = PAGE_H * zone.fraction;
  const light = look.ink === "light";

  // Words: largest size that fits, lines balanced so there is no lonely last word.
  const font = fonts.bold;
  const maxW = PAGE_W - 2 * 40;
  let fit;
  for (let size = 30; size >= 15; size--) {
    const lines = balancedWrap(spec.text, font, size, maxW);
    const lineH = size * 1.22;
    fit = { size, lines, lineH };
    if (lines.length <= 4 && lines.length * lineH <= zoneH * 0.7) break;
  }
  const blockH = fit.lines.length * fit.lineH;
  const fromEdge = zoneH * 0.46; // block centre, measured from the page edge
  const centreY = zone.edge === "bottom" ? fromEdge : PAGE_H - fromEdge;
  const top = centreY + blockH / 2;

  fit.lines.forEach((line, i) => {
    const y = top - fit.lineH * i - (fit.lineH + fit.size * 0.7) / 2;
    const x = (PAGE_W - font.widthOfTextAtSize(line, fit.size)) / 2;
    page.drawText(line, {
      x: x + 0.9, y: y - 0.9, size: fit.size, font,
      color: light ? C.night : C.cream, opacity: light ? 0.45 : 0.6,
    });
    page.drawText(line, { x, y, size: fit.size, font, color: light ? C.cream : C.ink });
  });
}

// ---------------------------------------------------------------------------
// About Me: the last page. Jack's portrait, the child's name, and what the
// uploader typed in.
// ---------------------------------------------------------------------------
const DETAIL_FIELDS = [
  ["age", "Age"],
  ["likes", "Favorite thing to do"],
  ["food", "Favorite food"],
  ["growUp", "When I grow up"],
];

async function addAboutMePage(pdf, fonts, reference, child) {
  const page = pdf.addPage([PAGE_W, PAGE_H]);
  const M = 48; // side margin
  const contentW = PAGE_W - 2 * M;

  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: C.paper });
  page.drawRectangle({
    x: 16, y: 16, width: PAGE_W - 32, height: PAGE_H - 32,
    borderColor: C.line, borderWidth: 1.2,
  });

  // --- measure the details first; the portrait takes whatever room is left ---
  const labelSize = 9.5;
  const valueSize = 13.5;
  const labelW = 122;
  const valueW = contentW - labelW - 10;
  const rows = DETAIL_FIELDS.filter(([k]) => child[k]).map(([k, label]) => ({
    label: label.toUpperCase(),
    lines: wrap(child[k], fonts.regular, valueSize, valueW),
  }));
  const rowsH = rows.reduce((s, r) => s + r.lines.length * valueSize * 1.28 + 8, 0);

  let moreSize = 13;
  let moreLines = [];
  if (child.more) {
    for (; moreSize >= 10; moreSize -= 0.5) {
      moreLines = child.more.split(/\n+/).flatMap((para) => wrap(para, fonts.regular, moreSize, contentW));
      if (moreLines.length * moreSize * 1.38 <= 140) break;
    }
  }
  const moreH = moreLines.length ? 12 + moreLines.length * moreSize * 1.38 : 0;

  const fixedH = 44 + 40 + 24 + 14 + 16 + 36 + 20 + 16 + 44; // margins, title, beans, name, tagline, footer
  const cardH = Math.max(130, Math.min(250, PAGE_H - fixedH - rowsH - moreH));

  // --- title + five magic beans ---
  let y = PAGE_H - 44;
  centred(page, "About Me", fonts.bold, 34, y - 30, C.leaf);
  y -= 40;
  drawBeans(page, PAGE_W / 2, y - 12);
  y -= 24 + 14;

  // --- Jack's portrait card ---
  const card = await pdf.embedPng(await portraitCard(reference));
  const cardW = (cardH * card.width) / card.height;
  page.drawImage(card, { x: (PAGE_W - cardW) / 2, y: y - cardH, width: cardW, height: cardH });
  y -= cardH + 16;

  // --- name + tagline ---
  const nameSize = fitSize(child.name, fonts.bold, 30, contentW, 16);
  centred(page, child.name, fonts.bold, nameSize, y - nameSize * 0.85, C.ink);
  y -= 36;
  centred(page, "starring as Jack", fonts.medium, 12.5, y - 12, C.muted);
  y -= 20 + 16;

  // --- details ---
  for (const row of rows) {
    page.drawText(row.label, {
      x: M, y: y - valueSize + 1.5, size: labelSize, font: fonts.bold, color: C.leaf,
    });
    row.lines.forEach((line, i) => {
      page.drawText(line, {
        x: M + labelW + 10, y: y - valueSize - i * valueSize * 1.28,
        size: valueSize, font: fonts.regular, color: C.ink,
      });
    });
    y -= row.lines.length * valueSize * 1.28 + 8;
  }
  if (moreLines.length) {
    y -= 12;
    moreLines.forEach((line, i) => {
      page.drawText(line, {
        x: M, y: y - moreSize - i * moreSize * 1.38, size: moreSize, font: fonts.regular, color: C.ink,
      });
    });
  }

  centred(page, "Made with Beanstalk Me", fonts.medium, 8.5, 28, C.muted);
}

// A soft shadow band behind the words, painted into the art: strongest at the
// page edge, fading out toward the middle of the picture. Dark band under light
// words, light band under dark words; busier backgrounds get a stronger band.
async function withShadowBand(image, zone, look) {
  const { width, height } = await sharp(image).metadata();
  const zh = Math.round(height * zone.fraction);
  const light = look.ink === "light";
  const strength = Math.min((light ? 0.34 : 0.36) + Math.max(0, look.detail - 0.08) * 1.8, 0.72);
  const colour = light ? "#0d0a08" : "#fff7e8";
  const stops = Array.from({ length: 13 }, (_, i) => {
    const t = i / 12; // 0 = page edge, 1 = inner edge of the zone
    const fade = t < 0.55 ? 1 : 1 - smoothstep((t - 0.55) / 0.45);
    return `<stop offset="${t.toFixed(3)}" stop-color="${colour}" stop-opacity="${(strength * fade).toFixed(3)}"/>`;
  }).join("");
  const [y1, y2] = zone.edge === "bottom" ? [1, 0] : [0, 1];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs><linearGradient id="g" x1="0" y1="${y1}" x2="0" y2="${y2}">${stops}</linearGradient></defs>
    <rect x="0" y="${zone.edge === "bottom" ? height - zh : 0}" width="${width}" height="${zh}" fill="url(#g)"/>
  </svg>`;
  return sharp(image).composite([{ input: Buffer.from(svg) }]).jpeg({ quality: 92 }).toBuffer();
}

// Jack reference as a rounded, framed card with a soft shadow (PNG, transparent).
async function portraitCard(reference) {
  const w = 600, h = 900, pad = 16, r = 30, sh = 26;
  const W = w + 2 * pad + 2 * sh;
  const H = h + 2 * pad + 2 * sh;
  const img = await sharp(reference).resize(w, h, { fit: "cover" }).jpeg({ quality: 90 }).toBuffer();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}">
    <defs>
      <filter id="blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="11"/></filter>
      <clipPath id="clip"><rect x="${sh + pad}" y="${sh + pad}" width="${w}" height="${h}" rx="${r - 10}"/></clipPath>
    </defs>
    <rect x="${sh}" y="${sh + 10}" width="${w + 2 * pad}" height="${h + 2 * pad}" rx="${r}" fill="#3b2a18" opacity="0.3" filter="url(#blur)"/>
    <rect x="${sh}" y="${sh}" width="${w + 2 * pad}" height="${h + 2 * pad}" rx="${r}" fill="#fffdf7"/>
    <image x="${sh + pad}" y="${sh + pad}" width="${w}" height="${h}" clip-path="url(#clip)"
      xlink:href="data:image/jpeg;base64,${img.toString("base64")}"/>
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

function drawBeans(page, cx, cy) {
  BEAN_COLOURS.forEach((hex, i) => {
    const x = cx + (i - 2) * 19;
    const tilt = [-28, 14, -10, 22, -18][i];
    page.drawEllipse({ x, y: cy, xScale: 7, yScale: 4.4, rotate: degrees(tilt), color: hexColour(hex) });
    page.drawEllipse({ x: x - 2, y: cy + 1.4, xScale: 2.2, yScale: 1.1, rotate: degrees(tilt), color: rgb(1, 1, 1), opacity: 0.55 });
  });
}

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------
function wrap(text, font, size, maxW) {
  const words = String(text).trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const tryLine = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(tryLine, size) <= maxW) {
      line = tryLine;
      continue;
    }
    if (line) lines.push(line);
    line = word;
    // A single word wider than the line: break it.
    while (font.widthOfTextAtSize(line, size) > maxW && line.length > 1) {
      let cut = line.length - 1;
      while (cut > 1 && font.widthOfTextAtSize(line.slice(0, cut), size) > maxW) cut--;
      lines.push(line.slice(0, cut));
      line = line.slice(cut);
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Same number of lines as a greedy wrap, but as even as possible.
function balancedWrap(text, font, size, maxW) {
  const greedy = wrap(text, font, size, maxW);
  if (greedy.length < 2) return greedy;
  let lo = maxW * 0.4, hi = maxW;
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    if (wrap(text, font, size, mid).length <= greedy.length) hi = mid;
    else lo = mid;
  }
  return wrap(text, font, size, hi);
}

function fitSize(text, font, size, maxW, min) {
  while (size > min && font.widthOfTextAtSize(text, size) > maxW) size -= 1;
  return size;
}

function centred(page, text, font, size, y, color) {
  page.drawText(text, { x: (PAGE_W - font.widthOfTextAtSize(text, size)) / 2, y, size, font, color });
}

async function embedImage(pdf, buf) {
  return buf[0] === 0x89 && buf[1] === 0x50 ? pdf.embedPng(buf) : pdf.embedJpg(buf);
}

function smoothstep(t) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

function hexColour(hex) {
  const n = parseInt(hex.slice(1), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}
