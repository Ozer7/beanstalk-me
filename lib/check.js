// ---------------------------------------------------------------------------
// The page check. After a page is drawn, a vision model looks at it once and
// answers the page's checklist (from storyboard.js) plus the rules every page
// shares. Image models miscount small things like beans, and this is how the
// app notices instead of the reader. One call per page, no retries; if the
// check itself fails, the page is still returned, just without a check.
// ---------------------------------------------------------------------------
import OpenAI from "openai";
import { MOCK } from "./images.js";

export const CHECK_MODEL = process.env.CHECK_MODEL || "gpt-5.4-mini";

let client = null;
const openai = () => (client ??= new OpenAI());

const ZONE_WORDS = { 2: "half", 3: "third", 4: "quarter" };

// The checklist for one page: the shared rules first, then the page's own.
export function checklist(spec) {
  const zone = `${spec.textZone.edge} ${ZONE_WORDS[Math.round(1 / spec.textZone.fraction)] || "part"}`;
  return [
    {
      id: "one-jack",
      check:
        "Jack — the person in the cream shirt and moss-green vest — appears exactly once",
      fix: "Show Jack only once in the picture.",
    },
    {
      id: "no-text",
      check: "there are no letters, words or numbers drawn anywhere in the picture",
      fix: "Remove every letter, word and number from the picture.",
    },
    {
      id: "words-area",
      check: `the ${zone} of the picture is plain background with no faces, people or important objects in it`,
      fix: `Keep the ${zone} of the picture plain: ${spec.textSpace}.`,
    },
    ...(spec.checks || []).map((c, i) => ({ id: `page-${i + 1}`, ...c })),
  ];
}

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["results"],
  properties: {
    results: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "ok", "seen"],
        properties: {
          id: { type: "string" },
          ok: { type: "boolean" },
          seen: { type: "string", description: "What you actually see, in a few words." },
        },
      },
    },
  },
};

/**
 * Returns { model, problems: [{ id, check, seen, fix }] } or null if the check
 * couldn't run. An empty `problems` list means the page passed.
 */
export async function checkPage(image, spec) {
  const items = checklist(spec);
  if (MOCK) return { model: "mock", problems: [] };

  const prompt = [
    `This is page ${spec.id} of a children's picture book, Jack and the Beanstalk: "${spec.title}".`,
    "Look carefully at the picture and answer each statement with ok = true only if it is clearly true.",
    "When a statement is about a count, count the items one by one and give the number in `seen`.",
    "",
    ...items.map((c) => `- [${c.id}] ${c.check}`),
  ].join("\n");

  try {
    const res = await openai().responses.create({
      model: CHECK_MODEL,
      reasoning: { effort: "low" },
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            {
              type: "input_image",
              detail: "high",
              image_url: `data:image/jpeg;base64,${image.toString("base64")}`,
            },
          ],
        },
      ],
      text: { format: { type: "json_schema", name: "page_check", schema: SCHEMA, strict: true } },
    });
    const { results } = JSON.parse(res.output_text);
    const byId = new Map(results.map((r) => [r.id, r]));
    const problems = items
      .filter((c) => byId.get(c.id) && byId.get(c.id).ok === false)
      .map((c) => ({ id: c.id, check: c.check, seen: byId.get(c.id).seen, fix: c.fix }));
    return { model: CHECK_MODEL, problems };
  } catch (err) {
    console.error(`page check failed (${CHECK_MODEL}):`, err?.message || err);
    return null;
  }
}
