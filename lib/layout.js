// ---------------------------------------------------------------------------
// Where a page's words go. Shared by the PDF (which draws them) and by the
// picture check in look.js (which needs to know exactly which part of the
// picture the words will cover), so both always agree.
// ---------------------------------------------------------------------------
import fs from "node:fs";
import { createRequire } from "node:module";
import fontkit from "@pdf-lib/fontkit";
import { woffToSfnt } from "./woff.js";

// 6 x 9 in, the same 2:3 shape as the 1024x1536 art, so the art fills the page.
export const PAGE_W = 432;
export const PAGE_H = 648;

const require = createRequire(import.meta.url);
const fontFile = (weight) =>
  woffToSfnt(fs.readFileSync(require.resolve(`@fontsource/fredoka/files/fredoka-latin-${weight}-normal.woff`)));
export const FONT_BYTES = { regular: fontFile(400), medium: fontFile(500), bold: fontFile(600) };

const WORDS_FONT = fontkit.create(FONT_BYTES.bold);
export const GLYPHS = fontkit.create(FONT_BYTES.regular);

// Same measurement pdf-lib uses for an embedded font.
export function wordsWidth(text, size) {
  const { glyphs } = WORDS_FONT.layout(text);
  const units = glyphs.reduce((s, g) => s + g.advanceWidth, 0);
  return (units * size) / WORDS_FONT.unitsPerEm;
}

const SIDE = 40; // page margin either side of the words

/**
 * Lay out a story page's words: the largest size that fits the text zone,
 * lines balanced so there is no lonely last word.
 * Returns PDF coordinates (origin bottom-left) for each line, plus `box`:
 * the area the words cover, as fractions of the page measured from the top-left.
 */
export function layoutWords(spec) {
  const zone = spec.textZone;
  const zoneH = PAGE_H * zone.fraction;
  const maxW = PAGE_W - 2 * SIDE;

  let fit;
  for (let size = 30; size >= 15; size--) {
    const lines = balancedWrap(spec.text, wordsWidth, size, maxW);
    const lineH = size * 1.22;
    fit = { size, lines, lineH };
    if (lines.length <= 4 && lines.length * lineH <= zoneH * 0.7) break;
  }

  const blockH = fit.lines.length * fit.lineH;
  const fromEdge = zoneH * 0.46; // block centre, measured from the page edge
  const centreY = zone.edge === "bottom" ? fromEdge : PAGE_H - fromEdge;
  const top = centreY + blockH / 2;

  const lines = fit.lines.map((text, i) => {
    const width = wordsWidth(text, fit.size);
    return {
      text,
      width,
      x: (PAGE_W - width) / 2,
      y: top - fit.lineH * i - (fit.lineH + fit.size * 0.7) / 2,
    };
  });
  const widest = Math.max(...lines.map((l) => l.width));

  return {
    size: fit.size,
    lines,
    box: {
      left: (PAGE_W - widest) / 2 / PAGE_W,
      right: (PAGE_W + widest) / 2 / PAGE_W,
      top: (PAGE_H - top) / PAGE_H,
      bottom: (PAGE_H - (top - blockH)) / PAGE_H,
    },
  };
}

// ---------------------------------------------------------------------------
// Wrapping. widthOf(text, size) -> width in points.
// ---------------------------------------------------------------------------
export function wrap(text, widthOf, size, maxW) {
  const words = String(text).trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const tryLine = line ? `${line} ${word}` : word;
    if (widthOf(tryLine, size) <= maxW) {
      line = tryLine;
      continue;
    }
    if (line) lines.push(line);
    line = word;
    // A single word wider than the line: break it.
    while (widthOf(line, size) > maxW && line.length > 1) {
      let cut = line.length - 1;
      while (cut > 1 && widthOf(line.slice(0, cut), size) > maxW) cut--;
      lines.push(line.slice(0, cut));
      line = line.slice(cut);
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Same number of lines as a greedy wrap, but as even as possible.
export function balancedWrap(text, widthOf, size, maxW) {
  const greedy = wrap(text, widthOf, size, maxW);
  if (greedy.length < 2) return greedy;
  let lo = maxW * 0.4, hi = maxW;
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    if (wrap(text, widthOf, size, mid).length <= greedy.length) hi = mid;
    else lo = mid;
  }
  return wrap(text, widthOf, size, hi);
}
