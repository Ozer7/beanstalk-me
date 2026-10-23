# To do

What still needs work in this build (pages 1–3 + About Me).

## Faces and characters
- **Page 3 is the riskiest page for Jack's face.** Jack is small, in a doorway, at dusk, so there are the fewest pixels and the darkest light to hold the likeness. Needs testing with several different kids' photos, not just one.
- **Only Jack has a reference image.** The mother, Milky-White and the old man are kept the same only by fixed text descriptions, so the mother on page 3 can come out different from page 1. Next step: a second reference image for the cast.
- **Haven't compared models side by side yet.** Default is `gpt-image-2.5-flare` (fast). `gpt-image-2.5-sunburst` might hold faces better on page 3. Test both in the Playground with the same photo.

## Words on the page
- **The quiet strip for the words isn't guaranteed.** The prompt asks for it and the PDF adds a shadow band and picks light or dark text, but if the model puts a head or the cow in that strip, the words still go on top of it. The app only warns ("looks busy"); it doesn't move the words.
- **The "busy" warning threshold (detail > 0.2) is a guess.** It needs tuning on real pages.
- **The story text always says "Jack" and "his."** It doesn't use the child's own name or pronouns.
- **About Me only prints English letters.** A name typed in Hebrew is refused instead of printed. Needs the Hebrew font plus right-to-left layout.

## Not built yet
- **Page 4, the beanstalk at dawn.** It's in the storyboard as an edit of page 3 (same cottage, next morning) but switched off, and its words aren't written. Pages 5–20 aren't in the storyboard yet, including the planting and climbing scenes from the last build.

## App
- **Nothing is saved.** Jack and the pages only live in the browser tab. A refresh loses the book.
- **No spending limit.** Anyone with the link can make books on my OpenAI key. Needs a per-visitor limit or a daily cap.
- **Slow on the free Render plan.** Each picture takes a while, pages are made one at a time, and the server sleeps when idle (first visit can take about a minute to wake up).
- **Print quality.** The art is 1024×1536 on a 6×9 in page (about 170 dpi). Fine on screen, soft if printed. The newer models can make bigger pictures, at a higher cost.
