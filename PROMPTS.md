# Prompts

The exact prompts the app sends, generated from `lib/storyboard.js` and `lib/prompts.js` (`npm run prompts`). Paste them into the OpenAI Playground (Images) to test by hand before changing the code.

**Settings the app uses:** model `gpt-image-2.5-flare`, size `1024x1536`, quality `high` for Jack and `medium` for pages, JPEG output.

**The style line, word for word in every call:**

> Modern 3D animated feature — rounded forms, large expressive eyes, soft rim light.

## How to run them in the Playground

1. **Jack.** Attach the child's photo, paste the Jack prompt, generate. Download the picture you like best — that file is the reference.
2. **Pages.** For each page, attach *only* the reference (not the photo), paste the page prompt, generate.
3. **Compare.** Put Jack and pages 1–3 side by side. Same face? Same hair? Same clothes? Does the text area stay empty?
4. **Fix one thing.** Attach the page as image 1 and the reference as image 2, and use the fix template with one change.

## 1. Jack (photo → reference)

Image 1: the child's photo.

```text
Character reference portrait for a picture book: Jack and the Beanstalk.

IMAGE 1 is a photo of a real child. That child plays Jack on every page of the book. Turn the child into an animated character.

LIKENESS — the most important rule: anyone who knows this child must recognize them instantly. Keep their face shape, eye shape and eye colour, eyebrows, nose, mouth, ears, skin tone, freckles or other marks, hair colour, hair texture, hairstyle and hair length, and glasses if they wear them. Keep their apparent age, and body proportions right for that age. Stylize the child's real features — do not replace them with a generic cartoon face.

STYLE: Modern 3D animated feature — rounded forms, large expressive eyes, soft rim light.

OUTFIT: Jack wears a loose cream linen shirt with the sleeves rolled to the elbows, a moss-green wool vest, a brown leather belt, patched tan knee-length trousers, and scuffed brown ankle boots. This replaces whatever the child wears in the photo.

POSE AND FRAMING: full body, standing straight and facing the viewer, arms relaxed at the sides, a calm, friendly expression with the mouth closed. The face is evenly lit from the front. The figure fills most of the picture's height, with a little space above the head and below the boots.

BACKGROUND: a plain, softly lit warm-cream backdrop with nothing else in it.

RULES: exactly one person. No text, letters, numbers, logos or watermarks.
```

## Page 1: The empty cupboard

Image 1: the Jack reference. Words printed by the PDF afterwards: Jack and his mother had nothing left to sell but Milky-White.

```text
Picture-book illustration: Jack and the Beanstalk, page 1 of 20 — "The empty cupboard".

IMAGE 1 is the character reference for Jack. Jack in this picture is exactly that person: same face shape, eyes, eyebrows, nose, mouth, ears, skin tone, hair colour, hairstyle and hair length, same glasses and facial hair if he has them, same age and body proportions, same outfit.
IMAGE 2 is Jack's character sheet: the same Jack from the front, at three-quarter angles and in profile, and with several expressions. When Jack turns his head or shows a feeling on this page, copy how his face looks from that angle and with that feeling in IMAGE 2.
Use the reference images for Jack only — not their plain backgrounds, layouts or standing poses.

STYLE: Modern 3D animated feature — rounded forms, large expressive eyes, soft rim light.

JACK'S OUTFIT, the same on every page: a loose cream linen shirt with the sleeves rolled to the elbows, a moss-green wool vest, a brown leather belt, patched tan knee-length trousers, and scuffed brown ankle boots.

ALSO IN THIS PICTURE (each looks the same on every page it appears on):
- Jack's mother — a slim woman in her thirties with a kind, tired face; her skin tone and hair colour match Jack's; her hair is tucked under a faded blue headscarf; she wears a patched grey-blue dress and a cream apron
- Milky-White, the cow — a gentle, bony white cow with a pale pink nose, soft brown eyes, short curved horns and a small brass bell on a rope collar
- the cottage — a small, crooked stone cottage with a mossy thatched roof, a round blue wooden front door and two small square windows

SCENE: inside the cottage — a bare, poor kitchen. A wall cupboard stands wide open and is completely empty. A cold fireplace, a bare wooden table, a single stool. Jack's mother stands on the left beside the empty cupboard, worried. The round front door in the back wall is open, and through it we see Milky-White standing in the sunny yard outside.
JACK: right of centre, facing the viewer — the full face is visible and lit from the front — with the eyes turned toward the mother on the left.
JACK'S EXPRESSION: worried but brave: eyebrows raised and drawn together a little, eyes soft, a small brave closed-mouth smile. Make Jack's expression big and easy to read, like a character in an animated feature, but change only the eyebrows, eyes and mouth: face shape, nose, ears, hair, glasses and facial hair (if any) stay exactly as in the references.
LIGHT AND COLOUR: soft morning light falls on Jack's face from the front. Warm, muted, earthy colours: worn wood, grey stone, faded cloth.
SPACE FOR THE WORDS: keep the bottom third of the picture quiet and simple — plain, empty floorboards. No people, faces, hands, important objects or busy detail there. The words of the page are printed over that area later.

RULES: Jack appears exactly once. No text anywhere — no letters, numbers, signs, labels, captions or speech bubbles. One full-bleed picture, no border or frame.
```

## Page 2: The trade

Image 1: the Jack reference. Words printed by the PDF afterwards: “Five magic beans,” said the old man. “For one cow.”

```text
Picture-book illustration: Jack and the Beanstalk, page 2 of 20 — "The trade".

IMAGE 1 is the character reference for Jack. Jack in this picture is exactly that person: same face shape, eyes, eyebrows, nose, mouth, ears, skin tone, hair colour, hairstyle and hair length, same glasses and facial hair if he has them, same age and body proportions, same outfit.
IMAGE 2 is Jack's character sheet: the same Jack from the front, at three-quarter angles and in profile, and with several expressions. When Jack turns his head or shows a feeling on this page, copy how his face looks from that angle and with that feeling in IMAGE 2.
Use the reference images for Jack only — not their plain backgrounds, layouts or standing poses.

STYLE: Modern 3D animated feature — rounded forms, large expressive eyes, soft rim light.

JACK'S OUTFIT, the same on every page: a loose cream linen shirt with the sleeves rolled to the elbows, a moss-green wool vest, a brown leather belt, patched tan knee-length trousers, and scuffed brown ankle boots.

ALSO IN THIS PICTURE (each looks the same on every page it appears on):
- the old man — small, stooped and cheerful, with a long white beard, a battered pointed green hat, a patched brown cloak and a crooked walking stick
- Milky-White, the cow — a gentle, bony white cow with a pale pink nose, soft brown eyes, short curved horns and a small brass bell on a rope collar

SCENE: a dirt road through green fields on the way to market, with a small market town far away on the horizon. The old man stands at the side of the road and holds his open palm out toward Jack at Jack's chest height, near the middle of the picture. In the palm lie exactly FIVE big, shiny beans, each about the size of a walnut, in one row with a gap between each: one red, one gold, one green, one blue, one purple — five clearly different colours, none touching, none hidden by fingers. There are no other beans anywhere in the picture. Milky-White stands just behind Jack, on a rope that Jack holds.
JACK: in three-quarter view: Jack's body and head are turned about 45 degrees toward the old man, with both eyes and most of the face still visible. Jack holds Milky-White's rope in one hand and looks at the beans in the old man's palm. Same clothes as on page 1.
JACK'S EXPRESSION: amazed and delighted: eyebrows up, eyes wide and shining, a big open-mouthed smile. Make Jack's expression big and easy to read, like a character in an animated feature, but change only the eyebrows, eyes and mouth: face shape, nose, ears, hair, glasses and facial hair (if any) stay exactly as in the references.
LIGHT AND COLOUR: bright, clear late-morning daylight. Fresh greens, warm earth tones and a soft blue sky.
SPACE FOR THE WORDS: keep the top third of the picture quiet and simple — open sky, calm and pale blue with only a few faint wisps of cloud. Nothing reaches up into it: no birds, trees, rooftops, hills, heads, hats or horns. Frame the characters from a little further back so the tops of all their heads sit well below the top third. No people, faces, hands, important objects or busy detail there. The words of the page are printed over that area later.

RULES: Jack appears exactly once. No text anywhere — no letters, numbers, signs, labels, captions or speech bubbles. One full-bleed picture, no border or frame.
```

## Page 3: Out the window

Image 1: the Jack reference. Words printed by the PDF afterwards: “Beans!” she cried. And out the window they went.

```text
Picture-book illustration: Jack and the Beanstalk, page 3 of 20 — "Out the window".

IMAGE 1 is the character reference for Jack. Jack in this picture is exactly that person: same face shape, eyes, eyebrows, nose, mouth, ears, skin tone, hair colour, hairstyle and hair length, same glasses and facial hair if he has them, same age and body proportions, same outfit.
IMAGE 2 is Jack's character sheet: the same Jack from the front, at three-quarter angles and in profile, and with several expressions. When Jack turns his head or shows a feeling on this page, copy how his face looks from that angle and with that feeling in IMAGE 2.
Use the reference images for Jack only — not their plain backgrounds, layouts or standing poses.

STYLE: Modern 3D animated feature — rounded forms, large expressive eyes, soft rim light.

JACK'S OUTFIT, the same on every page: a loose cream linen shirt with the sleeves rolled to the elbows, a moss-green wool vest, a brown leather belt, patched tan knee-length trousers, and scuffed brown ankle boots.

ALSO IN THIS PICTURE (each looks the same on every page it appears on):
- Jack's mother — a slim woman in her thirties with a kind, tired face; her skin tone and hair colour match Jack's; her hair is tucked under a faded blue headscarf; she wears a patched grey-blue dress and a cream apron
- the cottage — a small, crooked stone cottage with a mossy thatched roof, a round blue wooden front door and two small square windows

SCENE: the front of the cottage at dusk, seen from the garden. Jack's mother leans out of an open, lit window on the right and flings a handful of beans out over the garden. Exactly five beans — one red, one gold, one green, one blue, one purple — fly out away from the cottage in a wide, loose spray, each big enough to see clearly, heading down toward a bare patch of garden soil in the middle of the picture, with open sky above that patch. They do not run down the wall in a line.
JACK: standing in the open front doorway on the left, large in the frame: from head to boots he fills about half of the picture's height, and his boots sit just above the bottom third. He faces the viewer, with his face lit warmly and evenly from inside the cottage so every feature is clear. Only his eyes look up toward the flying beans. One hand is raised to his cheek.
JACK'S EXPRESSION: shocked: eyebrows high, eyes wide, mouth open in a round "oh no!". Make Jack's expression big and easy to read, like a character in an animated feature, but change only the eyebrows, eyes and mouth: face shape, nose, ears, hair, glasses and facial hair (if any) stay exactly as in the references.
LIGHT AND COLOUR: dusk: a deep blue-violet evening sky with the first stars; warm orange light glows from the cottage's door and window. A clearly darker, cooler palette than the daytime pages.
SPACE FOR THE WORDS: keep the bottom third of the picture quiet and simple — dark, shadowy grass in the front garden, simple and low in contrast. No people, faces, hands, important objects or busy detail there. The words of the page are printed over that area later.

RULES: Jack appears exactly once. No text anywhere — no letters, numbers, signs, labels, captions or speech bubbles. One full-bleed picture, no border or frame.
```

## Fix one thing on a page

Image 1: the page. Image 2: the Jack reference. (Example: page 1.)

```text
Edit IMAGE 1. It is page 1 of a picture book: Jack and the Beanstalk — "The empty cupboard".

CHANGE ONLY THIS: <one change>

Keep everything else in image 1 exactly as it is: the composition, camera angle, characters, poses, setting, lighting and colours. If the change touches Jack, Jack must still match IMAGE 2 (Jack's reference) and IMAGE 3 (his character sheet): same face shape, eyes, eyebrows, nose, mouth, ears, skin tone, hair colour, hairstyle and hair length, same glasses and facial hair if he has them, same age and body proportions, same outfit.

STYLE: Modern 3D animated feature — rounded forms, large expressive eyes, soft rim light.

SPACE FOR THE WORDS: the bottom third of the picture must stay quiet and simple — plain, empty floorboards.

RULES: Jack appears exactly once. No text anywhere — no letters, numbers, signs, labels, captions or speech bubbles. One full-bleed picture, no border or frame.
```

## Fix one thing on Jack

Image 1: the Jack reference. Image 2: the child's photo.

```text
Edit IMAGE 1, the character reference portrait of Jack for a picture book. IMAGE 2 is the original photo of the child, for likeness only.

CHANGE ONLY THIS: <one change>

Keep everything else exactly as it is: the same child, face, hair, outfit, pose, framing, lighting and plain background.

STYLE: Modern 3D animated feature — rounded forms, large expressive eyes, soft rim light.

RULES: exactly one person. No text, letters, numbers, logos or watermarks.
```

## Not built yet: page 4, The beanstalk at dawn

Made by editing page 3 rather than from scratch. Image 1: page 3. Image 2: the Jack reference.

```text
Picture-book illustration: Jack and the Beanstalk, page 4 of 20 — "The beanstalk at dawn".

IMAGE 1 is page 3 of this book ("Out the window"). Make this page by editing it: keep the same camera position, the same cottage, garden and surroundings. What changes: the next morning at dawn. From the bare patch of soil where the beans fell, a gigantic beanstalk has grown overnight: a thick, twisting green stalk with huge leaves that climbs out of the top of the picture into the clouds.

IMAGE 2 is the character reference for Jack. Jack in this picture is exactly that person: same face shape, eyes, eyebrows, nose, mouth, ears, skin tone, hair colour, hairstyle and hair length, same glasses and facial hair if he has them, same age and body proportions, same outfit.
IMAGE 3 is Jack's character sheet: the same Jack from the front, at three-quarter angles and in profile, and with several expressions. When Jack turns his head or shows a feeling on this page, copy how his face looks from that angle and with that feeling in IMAGE 3.
Use the reference images for Jack only — not their plain backgrounds, layouts or standing poses.

STYLE: Modern 3D animated feature — rounded forms, large expressive eyes, soft rim light.

JACK'S OUTFIT, the same on every page: a loose cream linen shirt with the sleeves rolled to the elbows, a moss-green wool vest, a brown leather belt, patched tan knee-length trousers, and scuffed brown ankle boots.

ALSO IN THIS PICTURE (each looks the same on every page it appears on):
- the cottage — a small, crooked stone cottage with a mossy thatched roof, a round blue wooden front door and two small square windows

JACK: standing in the doorway in the same place as before, looking up at the beanstalk.
JACK'S EXPRESSION: astonished: eyebrows high, eyes wide, mouth open in a huge smile. Make Jack's expression big and easy to read, like a character in an animated feature, but change only the eyebrows, eyes and mouth: face shape, nose, ears, hair, glasses and facial hair (if any) stay exactly as in the references.
LIGHT AND COLOUR: dawn: a pale gold and pink sky, soft cool morning light.
SPACE FOR THE WORDS: keep the bottom quarter of the picture quiet and simple — dewy grass in the front garden, simple and low in contrast. No people, faces, hands, important objects or busy detail there. The words of the page are printed over that area later.

RULES: Jack appears exactly once. No text anywhere — no letters, numbers, signs, labels, captions or speech bubbles. One full-bleed picture, no border or frame.
```
