# To do

What still needs work in this build (pages 1–3 + About Me).

## What my test books showed, and where it stands
- **Page 2 had the wrong number of beans** (six in my first book, four in my second, while the words say "Five magic beans"). The beans were tiny. Now the prompt asks for five big beans in a row with gaps between them, and an automatic check counts them after the page is drawn and offers a one-click fix. In a side-by-side test both models then drew exactly five. Image models still miscount sometimes, so the check matters.
- **Page 3: Jack's face drifted** when he was small, turned away and in the dark. Now he stands large in the doorway facing the reader, and every page also gets a **character sheet** (Jack from four angles and with four expressions) as a second reference. In testing his face, glasses and beard held on page 3.
- **Expressions came out odd** ("tempted" became a sly side-eye). Each page now spells out the expression (eyebrows, eyes, mouth) and the prompt says expressions may not change his face.
- **Page 3: the beans fell in a straight line down the wall.** The prompt now asks for a loose spray out over the garden. Sunburst follows this; Flare still tends to keep them near the wall.
- **Only tested with my own photo, an adult.** The book is for kids, so it needs a few different kids' photos.

## Model
- **Switched to `gpt-image-2.5-sunburst` at high quality** after testing it against `gpt-image-2.5-flare` with the same Jack. Sunburst held the face better and followed the scene more closely. Same price per picture, but slower: about 36 seconds per page instead of 23. A whole book (Jack, sheet, three pages) now takes about 2–3 minutes and costs about 25–30¢.
- **The automatic check uses `gpt-5.4-mini`** and can be wrong too. In testing it called plain grass "not plain", so the "is the words' area clear" question now comes from measuring the pixels instead. A real head or object under the words still gets flagged.

## Faces and characters
- **Only Jack has reference images.** The mother, Milky-White and the old man are kept the same by fixed text descriptions. They matched in my tests, but nothing guarantees it. Next step: a cast sheet like Jack's.
- **The character sheet adds one more picture per book** (about 30 seconds and 5¢). Worth it for likeness, but it's the slowest part before the pages start.

## Words on the page
- **The quiet area for the words isn't guaranteed.** The prompt asks for it and the app warns when something is there, but it doesn't move the words.
- **The "something is under the words" check is tuned on two books.** Clear sky, floorboards and grass scored at most 0.012; heads and walls 0.045+; the cutoff is 0.03.
- **The story always says "Jack" and "his."** It doesn't use the child's own name or pronouns.
- **About Me only prints English letters.** A Hebrew name is refused instead of printed. Needs the Hebrew font and right-to-left layout.

## Not built yet
- **Page 4, the beanstalk at dawn.** It's in the storyboard as an edit of page 3 but switched off, and its words aren't written. Pages 5–20 aren't in the storyboard yet, including the planting and climbing scenes from the last homework.

## App
- **The book is saved only in this browser.** A refresh keeps it now, but it can't move to another device, and clearing site data deletes it.
- **No spending limit.** Anyone with the link can make books on my OpenAI key. Needs a per-visitor limit or a daily cap.
- **Three pages are drawn at once.** That's much faster, but it's three big requests at the same time on Render's free instance, which could run out of memory with bigger pictures.
- **Slow first visit.** The free Render server sleeps when idle and takes about a minute to wake up.
- **Print quality.** The art is 1024×1536 on a 6×9 in page (about 170 dpi). Fine on screen, soft if printed.
