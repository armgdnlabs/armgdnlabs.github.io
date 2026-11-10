/**
 * All site content. Add an item here and its card and page appear on the next deploy.
 * Nothing is sold through the site itself: paid items link to Gumroad, free and
 * pay-what-you-want items link to their download page.
 */

export type Price = { kind: "free" } | { kind: "pwyw"; suggested?: number } | { kind: "paid"; amount?: number };
export type Shelf = "plugin" | "kit" | "sample" | "bundle" | "free";

export interface Item {
  slug: string;
  name: string;
  shelf: Shelf;
  /** One line under the name: "Rhythmic glitch engine", "Drum kit"… */
  kind: string;
  /** Formats or contents: "VST3 · AU · macOS · Windows", "40 one-shots · 12 loops"… */
  spec: string;
  blurb: string;
  price: Price;
  /** Gumroad (paid) or download page (free / pay what you want). Leave empty until it's out. */
  url?: string;
  status: "out" | "soon";
  features?: string[];
  contents?: { folder: string; count?: number; note?: string }[];
  /** Cover image URL; a generated cover is drawn when missing. */
  cover?: string;
  /** Hue (0–360) for the generated cover. */
  hue?: number;
}

export const ITEMS: Item[] = [
  {
    slug: "plugin-01",
    name: "Plugin 01",
    shelf: "plugin",
    kind: "Instrument / effect",
    spec: "VST3 · AU · macOS · Windows",
    blurb: "The first ARMGDN plugin is on the bench. Name, format and sound to be announced.",
    price: { kind: "pwyw" },
    status: "soon",
    features: ["Free or pay what you want at launch", "VST3 and AU", "Free updates"],
    hue: 0,
  },
  {
    slug: "kit-01",
    name: "Kit 01",
    shelf: "kit",
    kind: "Drum kit",
    spec: "One-shots · loops · stems",
    blurb: "A drum kit from the ARMGDN sessions. Contents are being finished.",
    price: { kind: "paid" },
    status: "soon",
    contents: [{ folder: "drums_" }, { folder: "loops_" }, { folder: "fx_" }],
    hue: 18,
  },
  {
    slug: "samples-01",
    name: "Samples 01",
    shelf: "sample",
    kind: "Sample pack",
    spec: "Melodic samples with stems",
    blurb: "Melodic samples, each with its stems. Contents are being finished.",
    price: { kind: "paid" },
    status: "soon",
    contents: [{ folder: "samples_" }, { folder: "stems_" }],
    hue: 210,
  },
  {
    slug: "free-drop-01",
    name: "Free drop 01",
    shelf: "free",
    kind: "Free sounds",
    spec: "One-shots for the mailing list",
    blurb: "Free sounds for people on the list. Sign up and it arrives in your inbox on release.",
    price: { kind: "free" },
    status: "soon",
    hue: 120,
  },
];

export interface Tool { slug: string; name: string; line: string; url: string; status: "live" | "lab"; features: string[] }
export const TOOLS: Tool[] = [
  {
    slug: "monitor",
    name: "Monitor",
    line: "GPU image and video FX in the browser. Stack effects, animate them, export. Free and open source.",
    url: "/labs/monitor/",
    status: "live",
    features: ["75 effects", "117 presets", "Keyframes and modulators", "Image and video export", "No account, no watermark", "Open source"],
  },
];

/** Email signup (Buttondown, Kit…). Leave empty and the form says the list opens soon. */
export const NEWSLETTER_ACTION = "";

export const FOLLOW = [
  { label: "GitHub", url: "https://github.com/armgdnlabs" },
];
/** The producer behind ARMGDN, linked once in the footer. */
export const YONDR = { label: "yondr", url: "" };

export const SHELVES: Record<Shelf, { title: string; plural: string }> = {
  plugin: { title: "Plugins", plural: "plugins" },
  kit: { title: "Kits", plural: "kits" },
  sample: { title: "Samples", plural: "sample packs" },
  bundle: { title: "Bundles", plural: "bundles" },
  free: { title: "Free", plural: "free drops" },
};

export const priceLabel = (p: Price) =>
  p.kind === "free" ? "Free" : p.kind === "pwyw" ? (p.suggested ? `Pay what you want · $${p.suggested}+` : "Pay what you want") : p.amount ? `$${p.amount.toFixed(2)}` : "Price at launch";

export const itemHref = (i: Item) => (i.shelf === "plugin" ? `/labs/${i.slug}/` : `/sounds/${i.slug}/`);
