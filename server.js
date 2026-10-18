import express from "express";
import multer from "multer";
import OpenAI, { toFile } from "openai";

// ---------------------------------------------------------------------------
// Config — the API key comes ONLY from the environment (set it in Render).
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 3000;
const MODEL = process.env.IMAGE_MODEL || "gpt-image-1-mini"; // cheap model by default

if (!process.env.OPENAI_API_KEY) {
  console.warn("WARNING: OPENAI_API_KEY is not set. Image generation will fail.");
}
const openai = new OpenAI(); // reads OPENAI_API_KEY from the environment

// ---------------------------------------------------------------------------
// The two scenes. The `spec` text is sent to the model AND shown as the caption,
// so the caption is exactly what was asked for.
// ---------------------------------------------------------------------------
const SCENES = {
  planting: {
    title: "Jack is planting the seeds",
    spec:
      "Jack is planting the seeds. In the evening, Jack kneels in bare brown dirt in front of a " +
      "small thatched cottage. With one hand he drops three glowing magic beans into a small hole " +
      "he has dug in the soil. A garden trowel lies in the dirt right next to the hole. No beanstalk, " +
      "vines or tall plants anywhere — nothing has grown yet.",
  },
  climbing: {
    title: "Jack is climbing the beanstalk",
    spec:
      "Jack is climbing the beanstalk. Jack clings with both hands to a gigantic green beanstalk, " +
      "high up in the sky. The ground is far below him: his cottage and village look tiny at the " +
      "bottom of the picture. Above him, the beanstalk disappears into the clouds, where the " +
      "giant's castle can be seen.",
  },
};

// ---------------------------------------------------------------------------
// User-adjustable cartoon settings. Only whitelisted values are accepted.
// ---------------------------------------------------------------------------
const STYLES = {
  storybook: "a classic hand-painted children's storybook illustration with soft watercolor textures",
  "3d": "a polished 3D animated-movie style (soft lighting, rounded forms, expressive eyes)",
  comic: "a bold comic-book style with inked outlines and flat cel shading",
  anime: "a clean anime / Japanese animation style",
  flat: "a flat vector cartoon style with simple shapes and solid colors",
};
const PALETTES = {
  vibrant: "bright, saturated, cheerful colors",
  pastel: "soft pastel colors",
  earthy: "warm earthy, muted folk-tale colors",
  night: "cool moonlit blues and purples with warm highlights",
};
const EXAGGERATION = {
  low: "Keep proportions realistic — only a light cartoon stylization.",
  medium: "Use moderate cartoon stylization (slightly larger head and eyes) while keeping the face clearly the same person.",
  high: "Use strong caricature-style exaggeration of the person's most distinctive features, but the face must still be instantly recognizable as the same person.",
};
const OUTLINES = {
  none: "no visible outlines",
  thin: "thin, delicate outlines",
  thick: "thick, bold outlines",
};
const QUALITIES = new Set(["medium", "high"]); // "low" removed: it ignored scene details

function pick(map, key, fallback) {
  return Object.prototype.hasOwnProperty.call(map, key) ? key : fallback;
}

function buildPrompt(scene, s) {
  return [
    "Turn the person in the attached photo into a cartoon character and place them in a scene from the fairy tale 'Jack and the Beanstalk'. The person from the photo IS Jack.",
    "",
    "IDENTITY (most important): the cartoon must be clearly recognizable as the exact person in the photo. " +
      "Preserve their face shape, eye shape and eye color, eyebrows, nose, mouth and smile, ears, skin tone, " +
      "hair color, hairstyle and hair length, facial hair, glasses, freckles or other distinctive marks. " +
      "Keep their apparent age and gender presentation. Do not replace them with a generic cartoon face. " +
      "Their face should be clearly visible and turned at least partly toward the viewer.",
    "",
    `STYLE: ${STYLES[s.style]}, ${PALETTES[s.palette]}, ${OUTLINES[s.outline]}. ${EXAGGERATION[s.exaggeration]}`,
    "Dress them in simple peasant clothes appropriate to the fairy tale.",
    "",
    `SCENE (must be shown exactly): ${scene.spec}`,
    "Every element named in the SCENE must be clearly visible in the picture. Do not add story elements that the SCENE does not mention.",
    "",
    "One single image, full scene, no text, no captions, no speech bubbles, no borders.",
  ].join("\n");
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const ok = ["image/png", "image/jpeg", "image/webp"].includes(file.mimetype);
    cb(ok ? null : new Error("Please upload a PNG, JPEG or WEBP photo."), ok);
  },
});

app.use(express.static("public"));

app.get("/api/scenes", (_req, res) => {
  res.json(
    Object.entries(SCENES).map(([id, sc]) => ({ id, title: sc.title, spec: sc.spec }))
  );
});

app.get("/healthz", (_req, res) => res.send("ok"));

// ONE scene per request — exactly one API call, no loops.
app.post("/api/generate", upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No photo uploaded." });

    const sceneId = req.body.scene;
    const scene = SCENES[sceneId];
    if (!scene) return res.status(400).json({ error: "Unknown scene." });

    const settings = {
      style: pick(STYLES, req.body.style, "storybook"),
      palette: pick(PALETTES, req.body.palette, "vibrant"),
      exaggeration: pick(EXAGGERATION, req.body.exaggeration, "medium"),
      outline: pick(OUTLINES, req.body.outline, "thin"),
    };
    const quality = QUALITIES.has(req.body.quality) ? req.body.quality : "medium";

    const image = await toFile(req.file.buffer, req.file.originalname || "photo.png", {
      type: req.file.mimetype,
    });

    const result = await openai.images.edit({
      model: MODEL,
      image,
      prompt: buildPrompt(scene, settings),
      size: "1024x1024",
      quality,
    });

    const b64 = result.data?.[0]?.b64_json;
    if (!b64) throw new Error("The model returned no image.");

    res.json({
      image: `data:image/png;base64,${b64}`,
      caption: scene.spec, // caption = the scene specification that was sent
      title: scene.title,
      settings: { ...settings, quality, model: MODEL },
    });
  } catch (err) {
    console.error(err);
    const status = err.status && err.status < 500 ? err.status : 500;
    res.status(status).json({ error: err.message || "Generation failed." });
  }
});

// Multer / other errors
app.use((err, _req, res, _next) => {
  res.status(400).json({ error: err.message || "Bad request." });
});

app.listen(PORT, () => console.log(`Beanstalk Me running on port ${PORT} (model: ${MODEL})`));
