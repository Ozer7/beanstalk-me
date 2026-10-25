# Beanstalk Me

A *Jack and the Beanstalk* picture book starring the child in an uploaded photo. This build makes the first three pages and the About Me page, and exports them as one PDF.

Live: https://storybook.bluebid.online (also https://beanstalk-storybook.onrender.com)

The previous homework, the two-scene version (planting the seeds, climbing the beanstalk), is on the [`two-scenes`](https://github.com/Ozer7/beanstalk-me/tree/two-scenes) branch and still runs at https://beanstalk.bluebid.online.

## How it works

1. **Who's the star?** Upload a photo and type the child's name.
2. **Meet Jack.** One call turns the photo into a full-body Jack in the book's style. You check that it looks like the child (or fix one thing), then approve him. A second call draws his **character sheet**: the same Jack from four angles and with four expressions. The app shows Jack and lets you flip through the other views with arrows.
3. **The pages.** Pages 1–3 are drawn at the same time, each from the same two references and the same style line, and shown in the order of the story. After each page, a vision model checks it against that page's checklist (for example, exactly five beans) and the app offers a one-click fix for anything wrong.
4. **About me.** The name and whatever the uploader types in, with a live preview of the page.
5. **Read it, then download.** A full-screen reader shows the book exactly as the PDF lays it out, then the PDF downloads.

The book is saved in the browser (IndexedDB), so a refresh doesn't lose it.

## Keeping the child the same on every page

- **One reference, plus his character sheet.** The photo is turned into Jack once. Every page is drawn from that same Jack and his sheet, never from the photo again and never from the previous page, so mistakes don't pile up from page to page. The sheet shows the model what his face looks like turned and with feelings, which is where likeness used to slip.
- **Expressions are spelled out** per page (eyebrows, eyes, mouth), and every prompt says an expression may not change his face, glasses or hair.
- **One style string**, defined once in `lib/storyboard.js` and pasted word for word into every call:
  > Modern 3D animated feature — rounded forms, large expressive eyes, soft rim light.
- **Fixed descriptions** for Jack's clothes, the mother, Milky-White, the old man and the cottage, also pasted word for word wherever they appear.
- **Same picture size everywhere** (1024×1536, tall), which is also the shape of the PDF page.

## Choosing the model

Default: `gpt-image-2.5-sunburst` at high quality. I compared it with `gpt-image-2.5-flare` on pages 2 and 3 with the same Jack and the same prompts. Both got the five beans right, but Sunburst kept the face and beard closer to the reference and followed the scene more closely (the beans fly out over the garden on page 3). The price per picture is the same; Sunburst is slower (about 36 s per page vs 23 s).

## Editing instead of regenerating

Every page card has **Fix one thing**: it sends the finished page plus the reference and asks for one change ("make the beans brighter"), keeping everything else. That's cheaper and safer than rolling a whole new picture when the page is 90% right. Jack has the same button. Page 4 (the beanstalk at dawn) is already in the storyboard as an edit of page 3, so the cottage and garden carry over. It's switched off in this build.

## The words are never drawn by the model

Every prompt asks for a quiet strip where the words will go (lower third on page 1, the sky on page 2, the dark grass on page 3) and forbids any lettering. The PDF layer (`lib/pdf.js`) then:

- measures the exact box where the words will print and picks light or dark words, with a soft shadow band behind them that gets stronger only when something sits under the words;
- sets the story text in Fredoka, sized to fit and balanced across lines;
- adds the About Me page with Jack's portrait, the name and the typed details.

The page cards in the app preview the words the same way, and flag a page when a person or object sits under its words (the busiest cell of the words box has a lot of edges; a clean sky doesn't).

## Files

| File | What's in it |
|---|---|
| `lib/storyboard.js` | Style string, Jack's outfit, the cast, and the page specs (words, scene, text zone). Pages 4–20 get added here. |
| `lib/prompts.js` | Builds the prompt for each kind of call: Jack, fix Jack, character sheet, page, fix page. |
| `lib/images.js` | The one place that draws pictures (`images.edit`). Exactly one call per request, no retries. |
| `lib/check.js` | The page check: one vision-model call per page that answers the page's checklist. |
| `lib/layout.js` | Where the words go on each page: size, line breaks, the box they cover. Used by both the PDF and the check below. |
| `lib/look.js` | Measures the picture under the words (brightness, whether something is in the way). |
| `lib/pdf.js` | Builds the PDF. |
| `server.js` | Express routes. |
| `public/index.html` | The app. |
| `PROMPTS.md` | The exact prompts, for pasting into the OpenAI Playground. Regenerate with `npm run prompts`. |
| `to-do.md` | What still needs work. |

## Run it locally

```bash
npm install
cp .env.example .env     # put your OpenAI key in .env; git ignores it
npm run dev              # http://localhost:3000
```

No key, or don't want to spend credit? `npm run mock` uses placeholder pictures and makes no API calls. `npm test` runs the whole pipeline in mock mode and writes a sample PDF.

## Deploy (Render)

Web service, build `npm install`, start `npm start`. In **Environment**, set `OPENAI_API_KEY`. Optional: `IMAGE_MODEL` (default `gpt-image-2.5-sunburst`; `gpt-image-2.5-flare` is faster), `IMAGE_QUALITY` (pages, default `high`), `REFERENCE_QUALITY` (Jack and his sheet, default `high`), `CHECK_MODEL` (the page check, default `gpt-5.4-mini`).

## The API key

The key is only ever read from the environment (`OPENAI_API_KEY`). `.env` is in `.gitignore`, and the repo history has been checked: no key was ever committed.
