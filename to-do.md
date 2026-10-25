# To do

What still needs work in this build (pages 1–3 + About Me).

## From my first real test book
- **Only tested with my own photo, an adult.** The face, glasses and outfit held on all three pages, but the book is for kids. Needs a few different kids' photos.
- **Page 2 had six beans, not five** (two gold ones), while the words say "Five magic beans." The prompt now lists the beans one by one in a row. Image models still miscount, so check every book and use Fix one thing if it's wrong.
- **Page 2: Jack faced the camera** instead of the three-quarter view the storyboard asks for. The prompt now says 45 degrees, not facing the camera. Not rechecked with a real photo yet.
- **Page 3: Jack looked at the camera** instead of watching the beans. The prompt now turns his head toward the window. Turning the face away may make the likeness harder to hold on the smallest, darkest page, so this needs rechecking.
- **Page 2: heads reached into the sky** where the words go. The words still fit above them, but the prompt now asks for the characters to be framed from further back. Check they don't end up too small.

## Faces and characters
- **Only Jack has a reference image.** The mother, Milky-White and the old man are kept the same only by fixed text descriptions. They matched in my first test, but nothing guarantees it. Next step: a reference image for the cast.
- **Haven't compared models side by side yet.** Default is `gpt-image-2.5-flare` (fast). `gpt-image-2.5-sunburst` might hold faces better on page 3. Test both in the Playground with the same photo.

## Words on the page
- **The quiet area for the words isn't guaranteed.** The prompt asks for it, and the PDF adds a shadow band and picks light or dark words, but if the model puts a head in that area, the words still go on top of it. The app only warns ("looks busy"); it doesn't move the words.
- **The "busy" check is tuned on one book.** It now looks only at the box where the words print, split into a grid, and flags it if any cell has a lot of edges. On my test book, clear sky, floorboards and grass scored at most 0.012 and heads or walls 0.045+, so the cutoff is 0.03. Needs more books to confirm.
- **The story text always says "Jack" and "his."** It doesn't use the child's own name or pronouns.
- **About Me only prints English letters.** A name typed in Hebrew is refused instead of printed. Needs the Hebrew font plus right-to-left layout.

## Not built yet
- **Page 4, the beanstalk at dawn.** It's in the storyboard as an edit of page 3 (same cottage, next morning) but switched off, and its words aren't written. Pages 5–20 aren't in the storyboard yet, including the planting and climbing scenes from the last build.

## App
- **Nothing is saved.** Jack and the pages only live in the browser tab. A refresh loses the book.
- **No spending limit.** Anyone with the link can make books on my OpenAI key. Needs a per-visitor limit or a daily cap.
- **Slow on the free Render plan.** Each picture takes a while, pages are made one at a time, and the server sleeps when idle (first visit can take about a minute to wake up).
- **Print quality.** The art is 1024×1536 on a 6×9 in page (about 170 dpi). Fine on screen, soft if printed. The newer models can make bigger pictures, at a higher cost.
