// ---------------------------------------------------------------------------
// The image model. Every call in the app goes through editImage(), and every
// function here makes exactly ONE request to OpenAI — no loops, no retries.
// ---------------------------------------------------------------------------
import OpenAI, { toFile } from "openai";
import sharp from "sharp";
import { IMAGE_SIZE } from "./storyboard.js";

export const MODEL = process.env.IMAGE_MODEL || "gpt-image-2.5-flare";
export const PAGE_QUALITY = process.env.IMAGE_QUALITY || "medium";
// The reference is made once per book and copied onto every page, so it gets
// the most detail.
export const REFERENCE_QUALITY = process.env.REFERENCE_QUALITY || "high";
export const MOCK = process.env.MOCK_IMAGES === "1";

let client = null;
function openai() {
  client ??= new OpenAI(); // reads OPENAI_API_KEY from the environment
  return client;
}

// input_fidelity ("how hard to hold on to the input's faces") is a knob on the
// older models; gpt-image-2 and later keep high-fidelity inputs by default and
// the API says to omit it there.
function fidelityFor(model) {
  return /^gpt-image-1(\.5)?(-\d{4}|$)/.test(model) ? "high" : undefined;
}

// images: Buffers (JPEG/PNG/WEBP). Image 1 is the one being drawn from/edited.
export async function editImage({ images, prompt, quality = PAGE_QUALITY, mock }) {
  if (MOCK) return mockImage(mock);

  const files = await Promise.all(
    images.map((buf, i) => toFile(buf, `image-${i + 1}.${extOf(buf)}`, { type: mimeOf(buf) }))
  );
  const params = {
    model: MODEL,
    image: files.length === 1 ? files[0] : files,
    prompt,
    size: IMAGE_SIZE,
    quality,
    output_format: "jpeg",
    output_compression: 92,
  };
  const fidelity = fidelityFor(MODEL);
  if (fidelity) params.input_fidelity = fidelity;

  const result = await openai().images.edit(params);
  const b64 = result.data?.[0]?.b64_json;
  if (!b64) throw new Error("The image model returned no picture.");
  return Buffer.from(b64, "base64");
}

// Uploaded photo -> upright JPEG, at most 1536px. Phone photos carry their
// rotation in EXIF; .rotate() applies it so the child isn't sideways.
export async function normalizePhoto(buf) {
  return sharp(buf)
    .rotate()
    .resize({ width: 1536, height: 1536, fit: "inside", withoutEnlargement: true })
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 90 })
    .toBuffer();
}

// Turn OpenAI errors into something a person can act on.
export function friendlyError(err) {
  const msg = String(err?.error?.message || err?.message || "");
  const status = err?.status;
  if (status === 401) return [500, "The server's OpenAI key is missing or wrong (OPENAI_API_KEY)."];
  if (status === 403 && /verif/i.test(msg))
    return [500, `This OpenAI organization has to be verified to use ${MODEL} (platform.openai.com → Settings → Organization), or set IMAGE_MODEL to a model it can use.`];
  if (status === 404) return [500, `The image model "${MODEL}" isn't available to this API key.`];
  if (status === 429 && /quota|billing|credit/i.test(msg))
    return [500, "The OpenAI account is out of credit."];
  if (status === 429) return [429, "Too many pictures at once — wait a minute and try again."];
  if (status === 400 && /safety|moderation|rejected/i.test(msg))
    return [400, "OpenAI's safety check blocked this picture. Try a different photo or different wording."];
  if (status && status < 500) return [status, msg || "The image request was rejected."];
  return [500, msg || "Generating the picture failed."];
}

function mimeOf(buf) {
  if (buf[0] === 0x89 && buf[1] === 0x50) return "image/png";
  if (buf.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  return "image/jpeg";
}
function extOf(buf) {
  return { "image/png": "png", "image/webp": "webp", "image/jpeg": "jpg" }[mimeOf(buf)];
}

// ---------------------------------------------------------------------------
// MOCK_IMAGES=1: placeholder pictures, no API calls, no cost. For testing the
// flow and the PDF layout. The fake text zones are flat on purpose so the
// layout can be checked against a known light (page 2 sky) and dark (page 3
// grass) background.
// ---------------------------------------------------------------------------
const MOCK_LOOKS = {
  reference: { top: "#f3e7cf", bottom: "#eadbbd", label: "Jack (mock)" },
  1: { top: "#8a6a4a", bottom: "#5b4330", label: "Page 1 (mock)" },
  2: { top: "#bfe0f5", bottom: "#6f9e4c", label: "Page 2 (mock)" },
  3: { top: "#2c2a5e", bottom: "#141f12", label: "Page 3 (mock)" },
  4: { top: "#f2c7a5", bottom: "#3f6b34", label: "Page 4 (mock)" },
};

async function mockImage(key = "reference") {
  await new Promise((r) => setTimeout(r, 400));
  const look = MOCK_LOOKS[key] || MOCK_LOOKS.reference;
  const [w, h] = IMAGE_SIZE.split("x").map(Number);
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${look.top}"/><stop offset="1" stop-color="${look.bottom}"/>
    </linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <g transform="translate(${w / 2}, ${h * 0.52})">
      <circle cy="-260" r="120" fill="#f1c9a5"/>
      <rect x="-110" y="-140" width="220" height="300" rx="60" fill="#5f7f3a"/>
      <rect x="-90" y="150" width="70" height="200" rx="30" fill="#c8a978"/>
      <rect x="20" y="150" width="70" height="200" rx="30" fill="#c8a978"/>
    </g>
    <text x="50%" y="${h * 0.5}" font-family="sans-serif" font-size="56" fill="#ffffff"
      text-anchor="middle" opacity="0.85">${look.label}</text>
  </svg>`;
  return sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toBuffer();
}
