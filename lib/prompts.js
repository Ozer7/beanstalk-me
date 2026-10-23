// ---------------------------------------------------------------------------
// Prompt builders. Each image call gets one of these. The STYLE line, Jack's
// outfit and the cast descriptions come from storyboard.js and are pasted in
// word-for-word every time, so nothing about the look drifts between calls.
// ---------------------------------------------------------------------------
import { STYLE, JACK_OUTFIT, CAST, getPage } from "./storyboard.js";

const STYLE_LINE = `STYLE: ${STYLE}`;

const NO_TEXT =
  "No text anywhere — no letters, numbers, signs, labels, captions or speech bubbles. " +
  "One full-bleed picture, no border or frame.";

const SAME_JACK =
  "same face, eyes, eyebrows, nose, mouth, skin tone, hair colour, hairstyle and hair length, " +
  "same age and body proportions, same outfit";

function zoneName(zone) {
  const part = { 2: "half", 3: "third", 4: "quarter" }[Math.round(1 / zone.fraction)] || "part";
  return `${zone.edge} ${part}`;
}

function header(page) {
  return `Picture-book illustration: Jack and the Beanstalk, page ${page.id} of 20 — "${page.title}".`;
}

function castBlock(page) {
  if (!page.cast?.length) return [];
  return [
    "ALSO IN THIS PICTURE (each looks the same on every page it appears on):",
    ...page.cast.map((key) => `- ${CAST[key]}`),
    "",
  ];
}

function wordsBlock(page) {
  return (
    `SPACE FOR THE WORDS: keep the ${zoneName(page.textZone)} of the picture quiet and simple — ` +
    `${page.textSpace}. No people, faces, hands, important objects or busy detail there. ` +
    "The words of the page are printed over that area later."
  );
}

// 1) Photo -> Jack. Made once per book; the result is the reference for every page.
export function referencePrompt() {
  return [
    "Character reference portrait for a picture book: Jack and the Beanstalk.",
    "",
    "IMAGE 1 is a photo of a real child. That child plays Jack on every page of the book. " +
      "Turn the child into an animated character.",
    "",
    "LIKENESS — the most important rule: anyone who knows this child must recognize them instantly. " +
      "Keep their face shape, eye shape and eye colour, eyebrows, nose, mouth, ears, skin tone, " +
      "freckles or other marks, hair colour, hair texture, hairstyle and hair length, and glasses " +
      "if they wear them. Keep their apparent age, and body proportions right for that age. " +
      "Stylize the child's real features — do not replace them with a generic cartoon face.",
    "",
    STYLE_LINE,
    "",
    `OUTFIT: Jack wears ${JACK_OUTFIT}. This replaces whatever the child wears in the photo.`,
    "",
    "POSE AND FRAMING: full body, standing straight and facing the viewer, arms relaxed at the " +
      "sides, a calm, friendly expression with the mouth closed. The face is evenly lit from the " +
      "front. The figure fills most of the picture's height, with a little space above the head " +
      "and below the boots.",
    "",
    "BACKGROUND: a plain, softly lit warm-cream backdrop with nothing else in it.",
    "",
    "RULES: exactly one person. No text, letters, numbers, logos or watermarks.",
  ].join("\n");
}

// 2) Fix one thing on the reference. Image 1 = current reference, image 2 = the photo.
export function referenceEditPrompt(instruction) {
  return [
    "Edit IMAGE 1, the character reference portrait of Jack for a picture book. " +
      "IMAGE 2 is the original photo of the child, for likeness only.",
    "",
    `CHANGE ONLY THIS: ${instruction}`,
    "",
    "Keep everything else exactly as it is: the same child, face, hair, outfit, pose, framing, " +
      "lighting and plain background.",
    "",
    STYLE_LINE,
    "",
    "RULES: exactly one person. No text, letters, numbers, logos or watermarks.",
  ].join("\n");
}

// 3) Make a page. Normally image 1 = the Jack reference (the only image sent).
//    A page with `editOf` is made from an earlier page instead:
//    image 1 = that page, image 2 = the Jack reference.
export function pagePrompt(pageOrId) {
  const page = typeof pageOrId === "object" ? pageOrId : getPage(pageOrId);
  const fromPage = page.editOf ? getPage(page.editOf) : null;

  const images = fromPage
    ? [
        `IMAGE 1 is page ${fromPage.id} of this book ("${fromPage.title}"). Make this page by editing it: ` +
          "keep the same camera position, the same cottage, garden and surroundings. " +
          `What changes: ${page.scene}`,
        "",
        `IMAGE 2 is the character reference for Jack. Jack must match it: ${SAME_JACK}.`,
      ]
    : [
        `IMAGE 1 is the character reference for Jack. Jack in this picture is exactly that child: ${SAME_JACK}. ` +
          "Only the pose, the expression and the camera angle change. Use image 1 for Jack only — " +
          "not its plain background or its standing pose.",
      ];

  return [
    header(page),
    "",
    ...images,
    "",
    STYLE_LINE,
    "",
    `JACK'S OUTFIT, the same on every page: ${JACK_OUTFIT}.`,
    "",
    ...castBlock(page),
    ...(fromPage ? [] : [`SCENE: ${page.scene}`]),
    `JACK: ${page.jack}`,
    `LIGHT AND COLOUR: ${page.light}`,
    wordsBlock(page),
    "",
    `RULES: Jack appears exactly once. ${NO_TEXT}`,
  ].join("\n");
}

// 4) Fix one thing on a finished page. Image 1 = the page, image 2 = the Jack reference.
export function pageEditPrompt(pageOrId, instruction) {
  const page = typeof pageOrId === "object" ? pageOrId : getPage(pageOrId);
  return [
    `Edit IMAGE 1. It is page ${page.id} of a picture book: Jack and the Beanstalk — "${page.title}".`,
    "",
    `CHANGE ONLY THIS: ${instruction}`,
    "",
    "Keep everything else in image 1 exactly as it is: the composition, camera angle, characters, " +
      "poses, setting, lighting and colours. If the change touches Jack, Jack must still match " +
      `IMAGE 2, the character reference: ${SAME_JACK}.`,
    "",
    STYLE_LINE,
    "",
    `SPACE FOR THE WORDS: the ${zoneName(page.textZone)} of the picture must stay quiet and simple — ` +
      `${page.textSpace}.`,
    "",
    `RULES: Jack appears exactly once. ${NO_TEXT}`,
  ].join("\n");
}

// Free-text instructions from the UI: one line, bounded length.
export function cleanInstruction(raw) {
  return String(raw ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 300);
}
