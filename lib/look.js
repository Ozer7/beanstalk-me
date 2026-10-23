import sharp from "sharp";

// Measure the strip of the picture where the page's words will sit, so the
// PDF can pick light-on-dark or dark-on-light text and decide how much of a
// shadow band the words need. Also flags strips the model filled with detail.
export async function measureTextZone(image, zone) {
  const { width, height } = await sharp(image).metadata();
  const h = Math.max(1, Math.round(height * zone.fraction));
  const top = zone.edge === "top" ? 0 : height - h;
  const { channels } = await sharp(image)
    .extract({ left: 0, top, width, height: h })
    .removeAlpha()
    .stats();

  const [r, g, b] = channels.map((c) => c.mean / 255);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const detail = channels.slice(0, 3).reduce((s, c) => s + c.stdev, 0) / 3 / 255;

  return {
    ink: luminance > 0.5 ? "dark" : "light", // colour of the words
    luminance: round(luminance),
    detail: round(detail),
    busy: detail > 0.2, // lots going on where the words go
  };
}

function round(n) {
  return Math.round(n * 1000) / 1000;
}
