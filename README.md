# ARMGDN

**The Chaos to Create.** Plugins, kits and samples by yondr; free creative tools; records.

Live at **https://armgdnlabs.github.io**

| Section | What | Look |
|---|---|---|
| **Labs** `/labs/` | yondr plugins, drum kits, sample packs. Free, pay what you want, or Gumroad | Pixel "plugin" windows on bone |
| **Studio** `/studio/` | Free browser tools: [Monitor](https://armgdnlabs.github.io/monitor/) and what comes next | Dark, giant photo-filled type |
| **Records** `/records/` | Releases, roster, artist pages | Paper and black, condensed type |

## Editing content

Everything comes from `src/data/site.ts`:

- **Add a product:** append to `PRODUCTS`. Set `status: "out"` and `url` (Gumroad link for paid, a download link for free or pay-what-you-want) to switch on its buy button.
- **Add a release:** append to `RELEASES` (tracks, links, credits, optional `cover` image URL). Without a cover, a typographic sleeve is drawn.
- **Add an artist:** append to `ARTISTS`.
- **Add a tool:** append to `TOOLS`.

Push to `main` and GitHub Actions rebuilds the site.

## Develop

```bash
npm install
npm run dev
```

Astro, no client framework. Motion lives in `src/scripts/site.ts`; tokens in `src/styles/base.css` mirror the ARMGDN Figma brand system.
