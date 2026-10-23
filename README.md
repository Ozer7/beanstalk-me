# Beanstalk Me

A *Jack and the Beanstalk* picture book starring the child in an uploaded photo. This build makes the first three pages and the About Me page, and exports them as one PDF.

Live: https://beanstalk-me.onrender.com

## How it works

1. **Upload a photo** of the child.
2. **Meet Jack.** One call turns the photo into a full-body Jack in the book's style. You check that it looks like the child, then lock it in. This picture is the **reference** for the whole book.
3. **Make the pages.** Pages 1–3 are made in order. Each page call sends the same reference and the same style line.
4. **About me.** The child's name and whatever the uploader types in.
5. **Download the PDF.** Full-bleed art with the words set on top, then About Me.

## Keeping the child the same on every page

- **One reference image.** The photo is turned into Jack once. Every page is drawn from that same Jack, never from the photo again and never from the previous page, so mistakes don't pile up from page to page.
- **One style string**, defined once in `lib/storyboard.js` and pasted word for word into every call:
  > Modern 3D animated feature — rounded forms, large expressive eyes, soft rim light.
- **Fixed descriptions** for Jack's clothes, the mother, Milky-White, the old man and the cottage, also pasted word for word wherever they appear.
- **Same picture size everywhere** (1024×1536, tall), which is also the shape of the PDF page.

## Editing instead of regenerating

Every page card has **Fix one thing**: it sends the finished page plus the reference and asks for one change ("make the beans brighter"), keeping everything else. That's cheaper and safer than rolling a whole new picture when the page is 90% right. Jack has the same button. Page 4 (the beanstalk at dawn) is already in the storyboard as an edit of page 3, so the cottage and garden carry over. It's switched off in this build.

## The words are never drawn by the model

Every prompt asks for a quiet strip where the words will go (lower third on page 1, the sky on page 2, the dark grass on page 3) and forbids any lettering. The PDF layer (`lib/pdf.js`) then:

- measures that strip and picks light or dark words, with a soft shadow band behind them, stronger when the background is busy;
- sets the story text in Fredoka, sized to fit and balanced across lines;
- adds the About Me page with Jack's portrait, the name and the typed details.

The page cards in the app preview the words the same way, and flag a page when its words strip looks busy.

## Files

| File | What's in it |
|---|---|
| `lib/storyboard.js` | Style string, Jack's outfit, the cast, and the page specs (words, scene, text zone). Pages 4–20 get added here. |
| `lib/prompts.js` | Builds the prompt for each kind of call: Jack, fix Jack, page, fix page. |
| `lib/images.js` | The one place that calls OpenAI (`images.edit`). Exactly one call per request, no retries. |
| `lib/look.js` | Measures a page's words strip (brightness, how busy it is). |
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

Web service, build `npm install`, start `npm start`. In **Environment**, set `OPENAI_API_KEY`. Optional: `IMAGE_MODEL` (default `gpt-image-2.5-flare`; `gpt-image-2.5-sunburst` is slower and OpenAI's pick for precise edits), `IMAGE_QUALITY` (pages, default `medium`), `REFERENCE_QUALITY` (Jack, default `high`).

## The API key

The key is only ever read from the environment (`OPENAI_API_KEY`). `.env` is in `.gitignore`, and the repo history has been checked: no key was ever committed.
