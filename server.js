import express from "express";
import multer from "multer";
import { createRequire } from "node:module";
import path from "node:path";
import { STYLE, IMAGE_SIZE, PAGES, getPage, enabledPages } from "./lib/storyboard.js";
import {
  referencePrompt, referenceEditPrompt, pagePrompt, pageEditPrompt, cleanInstruction,
} from "./lib/prompts.js";
import {
  editImage, normalizePhoto, friendlyError, MODEL, PAGE_QUALITY, REFERENCE_QUALITY, MOCK,
} from "./lib/images.js";
import { measureTextZone } from "./lib/look.js";
import { buildBookPdf, unsupportedChars } from "./lib/pdf.js";

// The API key comes ONLY from the environment (Render → Environment).
const PORT = process.env.PORT || 3000;
if (!process.env.OPENAI_API_KEY && !MOCK) {
  console.warn("WARNING: OPENAI_API_KEY is not set. Image generation will fail.");
}

const app = express();
app.use(express.json({ limit: "40mb" }));
app.use(express.static("public"));

// The book font, served to the browser so the page previews match the PDF.
const require = createRequire(import.meta.url);
const fontDir = path.dirname(require.resolve("@fontsource/fredoka/files/fredoka-latin-600-normal.woff2"));
app.use("/fonts", express.static(fontDir, { maxAge: "30d" }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ["image/png", "image/jpeg", "image/webp"].includes(file.mimetype);
    cb(ok ? null : httpError(400, "Please upload a PNG, JPEG or WEBP photo."), ok);
  },
});

app.get("/healthz", (_req, res) => res.send("ok"));

app.get("/api/storyboard", (_req, res) => {
  res.json({
    style: STYLE,
    size: IMAGE_SIZE,
    model: MODEL,
    mock: MOCK,
    pages: PAGES.map(({ id, title, text, enabled, textZone, textSpace, editOf }) => ({
      id, title, text, enabled, textZone, textSpace, editOf: editOf ?? null,
    })),
  });
});

// Every route below makes exactly ONE image call. The browser asks for the
// pages one at a time, in order. Nothing retries automatically.

// Photo -> Jack. This picture is the reference for every page of the book.
app.post("/api/reference", upload.single("photo"), route(async (req) => {
  if (!req.file) throw httpError(400, "No photo uploaded.");
  const photo = await normalizePhoto(req.file.buffer);
  const prompt = referencePrompt();
  const image = await timed("reference", () =>
    editImage({ images: [photo], prompt, quality: REFERENCE_QUALITY, mock: "reference" }));
  return { image: dataUrl(image), photo: dataUrl(photo), prompt, model: MODEL };
}));

// Fix one thing on the reference (image 1 = reference, image 2 = the photo).
app.post("/api/reference/edit", route(async (req) => {
  const reference = imageField(req.body.reference, "reference");
  const photo = req.body.photo ? imageField(req.body.photo, "photo") : null;
  const instruction = requireInstruction(req.body.instruction);
  const prompt = referenceEditPrompt(instruction);
  const image = await timed("reference edit", () =>
    editImage({ images: photo ? [reference, photo] : [reference], prompt, quality: REFERENCE_QUALITY, mock: "reference" }));
  return { image: dataUrl(image), prompt, model: MODEL };
}));

// Make one page. Image 1 = the Jack reference — the same image for every page.
// (A page with `editOf` starts from that earlier page instead; see storyboard.)
app.post("/api/page", route(async (req) => {
  const spec = requirePage(req.body.pageId);
  const reference = imageField(req.body.reference, "reference");
  const images = [reference];
  if (spec.editOf) images.unshift(imageField(req.body.source, `page ${spec.editOf}`));
  const prompt = pagePrompt(spec);
  const image = await timed(`page ${spec.id}`, () => editImage({ images, prompt, mock: spec.id }));
  return { image: dataUrl(image), prompt, look: await measureTextZone(image, spec.textZone), model: MODEL };
}));

// Fix one thing on a page: same picture, one change (image 1 = page, image 2 = reference).
app.post("/api/page/edit", route(async (req) => {
  const spec = requirePage(req.body.pageId);
  const pageImage = imageField(req.body.image, `page ${spec.id}`);
  const reference = imageField(req.body.reference, "reference");
  const instruction = requireInstruction(req.body.instruction);
  const prompt = pageEditPrompt(spec, instruction);
  const image = await timed(`page ${spec.id} edit`, () =>
    editImage({ images: [pageImage, reference], prompt, mock: spec.id }));
  return { image: dataUrl(image), prompt, look: await measureTextZone(image, spec.textZone), model: MODEL };
}));

// Build the PDF: the pages in order, then About Me.
app.post("/api/book", async (req, res) => {
  try {
    const child = cleanChild(req.body.child);
    const reference = imageField(req.body.reference, "reference");
    const given = new Map((req.body.pages || []).map((p) => [Number(p.id), p.image]));
    const pages = enabledPages().map((spec) => {
      if (!given.get(spec.id)) throw httpError(400, `Page ${spec.id} isn't made yet.`);
      return { spec, image: imageField(given.get(spec.id), `page ${spec.id}`) };
    });
    const pdf = await buildBookPdf({ pages, reference, child });
    const slug = child.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "book";
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="jack-and-the-beanstalk-${slug}.pdf"`);
    res.send(pdf);
  } catch (err) {
    sendError(res, err);
  }
});

// Multer and other errors
app.use((err, _req, res, _next) => sendError(res, err));

app.listen(PORT, () =>
  console.log(`Beanstalk Me on port ${PORT} · model ${MODEL} · pages ${PAGE_QUALITY} · reference ${REFERENCE_QUALITY}${MOCK ? " · MOCK IMAGES" : ""}`)
);

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
function route(fn) {
  return async (req, res) => {
    try {
      res.json(await fn(req));
    } catch (err) {
      sendError(res, err);
    }
  };
}

function sendError(res, err) {
  if (err.expose) return res.status(err.status).json({ error: err.message });
  if (err instanceof multer.MulterError) return res.status(400).json({ error: err.message });
  console.error(err);
  const [status, message] = friendlyError(err);
  res.status(status).json({ error: message });
}

function httpError(status, message) {
  return Object.assign(new Error(message), { status, expose: true });
}

async function timed(label, fn) {
  const t = Date.now();
  const out = await fn();
  console.log(`${label}: ${((Date.now() - t) / 1000).toFixed(1)}s`);
  return out;
}

function requirePage(id) {
  const spec = getPage(id);
  if (!spec) throw httpError(400, "Unknown page.");
  if (!spec.enabled) throw httpError(400, `Page ${spec.id} isn't in this build yet.`);
  return spec;
}

function requireInstruction(raw) {
  const instruction = cleanInstruction(raw);
  if (instruction.length < 3) throw httpError(400, "Say what to change.");
  return instruction;
}

function imageField(value, what) {
  const m = /^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/s.exec(String(value || ""));
  if (!m) throw httpError(400, `Missing or invalid ${what} image.`);
  return Buffer.from(m[2], "base64");
}

function dataUrl(buf) {
  const mime = buf[0] === 0x89 && buf[1] === 0x50 ? "image/png" : "image/jpeg";
  return `data:${mime};base64,${buf.toString("base64")}`;
}

const CHILD_FIELDS = { name: 40, age: 20, likes: 60, food: 60, growUp: 60, more: 400 };

function cleanChild(raw = {}) {
  const child = {};
  for (const [key, max] of Object.entries(CHILD_FIELDS)) {
    let v = String(raw[key] ?? "").trim();
    v = key === "more" ? v.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n") : v.replace(/\s+/g, " ");
    child[key] = v.slice(0, max);
  }
  if (!child.name) throw httpError(400, "Type the child's name for the About Me page.");
  const bad = unsupportedChars(Object.values(child).join(""));
  if (bad.length) {
    throw httpError(400, `The book's font can't print ${bad.slice(0, 6).join(" ")} yet. Please use English letters on the About Me page.`);
  }
  return child;
}
