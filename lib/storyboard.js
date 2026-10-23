// ---------------------------------------------------------------------------
// The book bible. Everything that must stay the same across the whole book
// lives here, written once, and is pasted word-for-word into every prompt.
// ---------------------------------------------------------------------------

// The style for the whole book. Never edited per page, never changed mid-book.
export const STYLE =
  "Modern 3D animated feature — rounded forms, large expressive eyes, soft rim light.";

// Every picture (the Jack reference and every page) is the same tall 2:3 shape,
// which is also the shape of the PDF page (6 x 9 in). Tall leaves room for the
// beanstalk pages later in the book.
export const IMAGE_SIZE = "1024x1536";

// Jack's clothes, identical on every page.
export const JACK_OUTFIT =
  "a loose cream linen shirt with the sleeves rolled to the elbows, a moss-green wool vest, " +
  "a brown leather belt, patched tan knee-length trousers, and scuffed brown ankle boots";

// The rest of the cast and the recurring places. Only Jack has a reference
// image, so these fixed descriptions are what keep them consistent.
export const CAST = {
  mother:
    "Jack's mother — a slim woman in her thirties with a kind, tired face; her skin tone and hair " +
    "colour match Jack's; her hair is tucked under a faded blue headscarf; she wears a patched " +
    "grey-blue dress and a cream apron",
  cow:
    "Milky-White, the cow — a gentle, bony white cow with a pale pink nose, soft brown eyes, short " +
    "curved horns and a small brass bell on a rope collar",
  oldMan:
    "the old man — small, stooped and cheerful, with a long white beard, a battered pointed green " +
    "hat, a patched brown cloak and a crooked walking stick",
  cottage:
    "the cottage — a small, crooked stone cottage with a mossy thatched roof, a round blue wooden " +
    "front door and two small square windows",
};

// ---------------------------------------------------------------------------
// Pages. Add pages 4–20 by adding entries; nothing else has to change.
//
//   text       the words printed on the page (by the PDF layer, never the model)
//   textZone   where the words go: { edge: "top" | "bottom", fraction }
//   textSpace  what fills that zone in the picture, so it stays quiet
//   cast       keys of CAST that appear on the page
//   editOf     optional: build this page by editing an earlier page's picture
//              instead of starting fresh from the reference (same place,
//              one thing changed — e.g. page 4 is page 3 the next morning)
// ---------------------------------------------------------------------------
export const PAGES = [
  {
    id: 1,
    title: "The empty cupboard",
    text: "Jack and his mother had nothing left to sell but Milky-White.",
    enabled: true,
    cast: ["mother", "cow", "cottage"],
    scene:
      "inside the cottage — a bare, poor kitchen. A wall cupboard stands wide open and is " +
      "completely empty. A cold fireplace, a bare wooden table, a single stool. Jack's mother " +
      "stands on the left beside the empty cupboard, worried. The round front door in the back " +
      "wall is open, and through it we see Milky-White standing in the sunny yard outside.",
    jack:
      "right of centre, facing the viewer — the full face is visible and lit from the front — " +
      "with the eyes turned toward the mother on the left. Expression: worried, but brave.",
    light:
      "soft morning light falls on Jack's face from the front. Warm, muted, earthy colours: " +
      "worn wood, grey stone, faded cloth.",
    textZone: { edge: "bottom", fraction: 1 / 3 },
    textSpace: "plain, empty floorboards",
  },
  {
    id: 2,
    title: "The trade",
    text: "“Five magic beans,” said the old man. “For one cow.”",
    enabled: true,
    cast: ["oldMan", "cow"],
    scene:
      "a dirt road through green fields on the way to market, with a small market town far " +
      "away on the horizon. The old man stands at the side of the road holding out an open palm " +
      "toward Jack. In the palm are exactly five shiny beans, each a different colour: red, gold, " +
      "green, blue and purple. Milky-White stands just behind Jack, on a rope that Jack holds.",
    jack:
      "in three-quarter view, turned toward the old man, so most of the face is still visible — " +
      "both eyes showing. Jack holds Milky-White's rope in one hand and stares at the beans, " +
      "curious and tempted. Same clothes as on page 1.",
    light:
      "bright, clear late-morning daylight. Fresh greens, warm earth tones and a soft blue sky.",
    textZone: { edge: "top", fraction: 1 / 3 },
    textSpace:
      "open sky, calm and pale blue with only a few faint wisps of cloud. Nothing reaches up into " +
      "it: no birds, trees, rooftops, hills or heads",
  },
  {
    id: 3,
    title: "Out the window",
    text: "“Beans!” she cried. And out the window they went.",
    enabled: true,
    cast: ["mother", "cottage"],
    scene:
      "outside the cottage at dusk. Jack's mother leans out of an open, lit window, flinging a " +
      "handful of beans away. The five coloured beans scatter through the air and fall onto a " +
      "bare patch of garden soil beside the cottage, with open sky above that patch. Jack stands " +
      "in the open front doorway, watching.",
    jack:
      "standing in the open front doorway, full figure and smaller in the frame, the face " +
      "clearly visible and lit warmly from inside the cottage, watching the beans fly. " +
      "Expression: dismayed.",
    light:
      "dusk: a deep blue-violet evening sky with the first stars; warm orange light glows from " +
      "the cottage's door and window. A clearly darker, cooler palette than the daytime pages.",
    textZone: { edge: "bottom", fraction: 1 / 3 },
    textSpace: "dark, shadowy grass in the front garden, simple and low in contrast",
  },
  {
    // Not in this build. Written down so pages 1–3 leave room for it: page 3
    // keeps a bare patch of soil with open sky above it, and page 4 is made by
    // editing page 3, so the cottage and garden stay the same.
    id: 4,
    title: "The beanstalk at dawn",
    text: null, // storyboard text not written yet
    enabled: false,
    editOf: 3,
    cast: ["cottage"],
    scene:
      "the next morning at dawn. From the bare patch of soil where the beans fell, a gigantic " +
      "beanstalk has grown overnight: a thick, twisting green stalk with huge leaves that climbs " +
      "out of the top of the picture into the clouds.",
    jack:
      "standing in the doorway in the same place as before, looking up at the beanstalk in " +
      "amazement.",
    light: "dawn: a pale gold and pink sky, soft cool morning light.",
    textZone: { edge: "bottom", fraction: 1 / 4 },
    textSpace: "dewy grass in the front garden, simple and low in contrast",
  },
];

// The two scenes from the last build. They become pages once the full
// 20-page storyboard says where they go.
export const LATER_SCENES = {
  planting:
    "Jack kneels in bare brown dirt in front of the cottage in the evening. With one hand Jack " +
    "drops a few glowing magic beans into a small hole dug in the soil; the other hand holds a " +
    "small garden trowel. Nothing has grown yet: no beanstalk, vines or sprouts.",
  climbing:
    "Jack clings with both hands to a gigantic green beanstalk, high up among the clouds. At the " +
    "top of the picture the beanstalk reaches the clouds, where the giant's castle stands. Far " +
    "below, the ground is a patchwork of fields where the cottage looks tiny.",
};

export function getPage(id) {
  return PAGES.find((p) => p.id === Number(id));
}

export function enabledPages() {
  return PAGES.filter((p) => p.enabled);
}
