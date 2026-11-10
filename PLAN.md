# ARMGDN — site rebuild plan

Status: approved (aesthetics swapped: Labs = plugin look, Studio = dark brutalist) · 2026-11-10

## 1. What's wrong with the current site

- Three "divisions" (Labs, Records, Studios) with no clear job each; Labs lists Lovable apps, Studios is client branding work.
- Built as static HTML with a home-made admin CMS (password hash in `script.js`, edits saved to `localStorage`, so nobody else sees them). Fragile and not secure.
- Old palette (green accent, Satoshi) doesn't match the Figma brand system (void / bone / signal red, Tinos serif marks, pixel icons).
- Your music (yondr), your products (plugins, kits, samples) and your free tools (MONITOR) are all mixed together.

## 2. New structure

One domain, `armgdnlabs.github.io`, with three clear doors. Each door has its own visual "mode", all under the same ARMGDN brand.

| Door | What lives there | Reference | Visual mode |
|---|---|---|---|
| **LABS** (home + shop) | yondr plugins, drum kits, sample packs, bundles, free drops | lawzy-world.atrumlab.com | "Plugin" UI: framed windows, pixel type, one ink colour, hard 1px frames, build-your-pack shelf |
| **STUDIO** (+ MONITOR) | Free browser tools: MONITOR now, more later | atrumlab.com | Dark brutalist; huge type; photo-filled lettering; glass pill buttons |
| **RECORDS** | Releases (yondr first), future artists, one landing page per release | claz.atrumlab.com | Paper-white and black; giant condensed type; record-sleeve presentation |

```
/                      Home: hero, featured drop, three doors, newsletter
/labs/                 Shop shelf: Plugins · Kits · Samples · Bundles · Free
/labs/<product>/       Product page: hero, audio previews, what's inside, buy
/studio/               Tool launcher (MONITOR card + upcoming slots)
/monitor/              MONITOR app (its own repo, see section 6)
/records/              Release grid + roster
/records/<release>/    Release landing page: cover, tracklist, streaming links, credits
/records/artists/<a>/  Artist page (yondr first; empty slots for signings)
/about/                ARMGDN // LABS, "The Chaos to Create", contact
```

## 3. Interaction and motion

These are rebuilt from scratch in ARMGDN's look, not copied from the reference sites.

- **Roll buttons:** on hover the label slides up and an identical copy rolls in from below. The dot in each pill grows to fill the button in signal red.
- **Scroll reveals:** sections fade and rise 24px when they enter view. Huge headings slide up line by line, clipped by a mask.
- **Photo-filled headings:** on the Studio tool rows (MONITOR. and future tools), the lettering shows a greyscale image that pans with the cursor. A row turns to colour when hovered.
- **Marquee:** a strip of category words (`plugins · kits · samples · free drops`) with a red ⊕ between words. It pauses on hover.
- **Corner marks:** crosshair ticks in section corners turn 90° when the section is hovered, a nod to the DESIGN.md "lab equipment" feel.
- **Tilt cards:** product cards tilt 4° towards the cursor, with a glare highlight.
- **Audio previews:** play from a waveform on the card, with one global player. Starting one preview stops the others.
- **Labs windows:** product windows open with a scale-in animation; a pixel progress bar shows while previews load; pack builder bars fill as you add items.
- **Records glitch band:** the release title sits in giant letters with a horizontal band of torn, displaced pixels across it. The band is rendered with MONITOR's own shader, so the label uses its own tool.
- `prefers-reduced-motion` turns all of these off.

## 4. Brand application

- Tokens: the Figma variables listed in DESIGN.md §4 (void, ink, ash, bone, signal).
- **Labs:** an ARMGDN version of the plugin look.
  - Bone background with void ink. The reference uses blue; ours uses void, with signal red for live states only.
  - Silkscreen or VT323 headings and the 30 Figma pixel icons.
  - Pricing: free / pay-what-you-want downloads, Gumroad for paid products, Patreon slot reserved for monthly drops later.
- **Studio:** Tinos for marks and display type. A wide grotesk (Archivo or Inter Display) for the big tool names, which the serif can't carry at 200px. JetBrains Mono for specs and labels.
  - MONITOR is restyled to match: dark glass panels, rounded pill controls, big grotesk headings.
- **Records:** bone paper, void black, a condensed display face for release titles, mono for credits.
- The `// LABS` tag system from Figma 15:89 marks categories everywhere.
- The Figma **Applications** page (9:45) is ignored, as you asked.

## 5. Tech

- Astro (static), deployed to GitHub Pages by an Actions workflow. Still free, with no server.
- Products and releases are Markdown/JSON files in `src/content/`. Adding a release means adding one file, with no admin page.
- The admin CMS, the password hash, the Lovable links and the old CSS are deleted.
- Checkout: free downloads direct; paid products link to Gumroad. Patreon later for monthly releases.
- Old Lovable tools are dropped.

## 6. MONITOR

- Repo renamed `armgdn-labs-monitor-fx` → `monitor`, so the app lives at `armgdnlabs.github.io/monitor/`. GitHub redirects the old repo URL. The old Pages URL dies, so I'll leave a redirect page there.
- Accuracy pass, run against effect.app side by side:
  - **Layer mix textures:** replace with higher-resolution, tileable photographic textures, and fix the default scale.
  - **Dither:** rebuild the palette settings to match effect.app (palette list, colour count, custom colours).
  - **Paper scan:** make it its own scanner model instead of a reskinned Layer mix: paper tooth, scan-bar lighting gradient, slight skew, dust, edge shadow, and the animated scan pass.
  - **Adjust effects:** add the base setting effect.app has on its adjust effects.
  - **Presets:** diff the full preset list against effect.app again and add the missing ones.
  - **Animated thumbnails:** fix cards whose hover animation doesn't play.
  - **Photos:** another curation pass on mismatched preview photos.
- UI restyle to the Studio (atrumlab-style) look, after the accuracy pass.

## 7. Order of work

1. MONITOR accuracy pass and repo rename.
2. Site scaffold: Astro, tokens, header and footer, home page, deploy.
3. Labs shelf and product template, using placeholder yondr products.
4. Records grid, release template and artist template.
5. Studio launcher, then the MONITOR restyle.
6. Delete the old setup, check every page in the browser on desktop and phone, then go live.
