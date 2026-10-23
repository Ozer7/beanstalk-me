// Writes PROMPTS.md: the exact prompts the app sends, ready to paste into the
// OpenAI Playground. Run `npm run prompts` after changing lib/storyboard.js or
// lib/prompts.js so the sheet never drifts from the code.
import fs from "node:fs";
import { STYLE, IMAGE_SIZE, PAGES } from "../lib/storyboard.js";
import { referencePrompt, referenceEditPrompt, pagePrompt, pageEditPrompt } from "../lib/prompts.js";
import { MODEL, PAGE_QUALITY, REFERENCE_QUALITY } from "../lib/images.js";

const block = (text) => "```text\n" + text + "\n```";
const built = PAGES.filter((p) => p.enabled);
const later = PAGES.filter((p) => !p.enabled);

const md = `# Prompts

The exact prompts the app sends, generated from \`lib/storyboard.js\` and \`lib/prompts.js\` (\`npm run prompts\`). Paste them into the OpenAI Playground (Images) to test by hand before changing the code.

**Settings the app uses:** model \`${MODEL}\`, size \`${IMAGE_SIZE}\`, quality \`${REFERENCE_QUALITY}\` for Jack and \`${PAGE_QUALITY}\` for pages, JPEG output.

**The style line, word for word in every call:**

> ${STYLE}

## How to run them in the Playground

1. **Jack.** Attach the child's photo, paste the Jack prompt, generate. Download the picture you like best — that file is the reference.
2. **Pages.** For each page, attach *only* the reference (not the photo), paste the page prompt, generate.
3. **Compare.** Put Jack and pages 1–3 side by side. Same face? Same hair? Same clothes? Does the text area stay empty?
4. **Fix one thing.** Attach the page as image 1 and the reference as image 2, and use the fix template with one change.

## 1. Jack (photo → reference)

Image 1: the child's photo.

${block(referencePrompt())}

${built
  .map(
    (p) => `## Page ${p.id}: ${p.title}

Image 1: the Jack reference. Words printed by the PDF afterwards: ${p.text}

${block(pagePrompt(p))}`
  )
  .join("\n\n")}

## Fix one thing on a page

Image 1: the page. Image 2: the Jack reference. (Example: page ${built[0].id}.)

${block(pageEditPrompt(built[0], "<one change>"))}

## Fix one thing on Jack

Image 1: the Jack reference. Image 2: the child's photo.

${block(referenceEditPrompt("<one change>"))}

${later
  .map(
    (p) => `## Not built yet: page ${p.id}, ${p.title}

Made by editing page ${p.editOf} rather than from scratch. Image 1: page ${p.editOf}. Image 2: the Jack reference.

${block(pagePrompt(p))}`
  )
  .join("\n\n")}
`;

fs.writeFileSync(new URL("../PROMPTS.md", import.meta.url), md);
console.log("Wrote PROMPTS.md");
