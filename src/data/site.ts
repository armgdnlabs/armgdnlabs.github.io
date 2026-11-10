/**
 * Everything on the site comes from these lists. Add a product, release or tool here
 * and its card and page appear on the next deploy.
 */

export type Price = { kind: "free" } | { kind: "pwyw"; suggested?: number } | { kind: "paid"; amount: number };

export interface Product {
  slug: string;
  name: string;
  /** Plugin, Drum kit, Sample pack, Bundle, Free drop. */
  type: "Plugin" | "Drum kit" | "Sample pack" | "Bundle" | "Free drop";
  /** Short spec line: "VST3 · AU", "40 one-shots · 12 loops"… */
  spec: string;
  blurb: string;
  price: Price;
  /** Gumroad (paid) or a direct download link (free / pay what you want). */
  url?: string;
  /** "soon" shows the product greyed out with no buy button. */
  status: "out" | "soon";
  bpm?: string;
  key?: string;
  contents?: { folder: string; count: number; note?: string }[];
}

export const PRODUCTS: Product[] = [
  {
    slug: "drum-kit-01",
    name: "Drum kit 01",
    type: "Drum kit",
    spec: "One-shots · loops · stems",
    blurb: "The first yondr kit. Contents and name are being finished.",
    price: { kind: "pwyw" },
    status: "soon",
    contents: [{ folder: "drums_", count: 0, note: "TBA" }, { folder: "loops_", count: 0, note: "TBA" }],
  },
  {
    slug: "sample-pack-01",
    name: "Sample pack 01",
    type: "Sample pack",
    spec: "Melodic samples with stems",
    blurb: "Melodic samples from the yondr sessions, each with its stems.",
    price: { kind: "pwyw" },
    status: "soon",
  },
  {
    slug: "plugin-01",
    name: "Plugin 01",
    type: "Plugin",
    spec: "VST3 · AU · macOS · Windows",
    blurb: "A yondr instrument in the lab. Format and name to be announced.",
    price: { kind: "paid", amount: 0 },
    status: "soon",
  },
];

export interface Tool {
  slug: string;
  name: string;
  line: string;
  url?: string;
  status: "live" | "lab";
  /** Unsplash photo id used inside the giant lettering. */
  photo: string;
  /** Unsplash username, credited under the tool. */
  by: string;
}

export const TOOLS: Tool[] = [
  { slug: "monitor", name: "Monitor", line: "GPU image and video FX. 75 effects, 117 presets, keyframes, export. Free and open source.", url: "/monitor/", status: "live", photo: "1789659822651-df282ece95f7", by: "pawel_czerwinski" },
  { slug: "next", name: "Next tool", line: "In the lab.", status: "lab", photo: "1561344640-2453889cde5b", by: "chengfengrecord" },
];

export interface Track { n: number; title: string; length?: string }
export interface Release {
  slug: string;
  title: string;
  artist: string;
  /** Single, EP, Album, Beat tape. */
  format: string;
  year: string;
  catalog: string;
  status: "out" | "soon";
  /** Cover image URL; a typographic sleeve is drawn when missing. */
  cover?: string;
  tracks: Track[];
  links?: { label: string; url: string }[];
  credits?: string[];
}

export const RELEASES: Release[] = [
  {
    slug: "agdn-001",
    title: "Untitled 001",
    artist: "yondr",
    format: "Single",
    year: "2026",
    catalog: "AGDN 001",
    status: "soon",
    tracks: [{ n: 1, title: "Title to be announced" }],
    credits: ["Produced by yondr", "Released on ARMGDN Records"],
  },
];

export interface Artist { slug: string; name: string; role: string; bio: string; links?: { label: string; url: string }[]; open?: boolean }

export const ARTISTS: Artist[] = [
  { slug: "yondr", name: "yondr", role: "Producer · founder", bio: "Producer behind ARMGDN. Plugins, kits and records under the yondr name." },
  { slug: "open", name: "Open slot", role: "Future signing", bio: "ARMGDN Records is small on purpose. Send music when submissions open.", open: true },
];

export const SOCIALS = [
  { label: "GitHub", url: "https://github.com/armgdnlabs" },
];

export const priceLabel = (p: Price) =>
  p.kind === "free" ? "Free" : p.kind === "pwyw" ? (p.suggested ? `Pay what you want · $${p.suggested}+` : "Pay what you want") : p.amount ? `$${p.amount.toFixed(2)}` : "Price TBA";
