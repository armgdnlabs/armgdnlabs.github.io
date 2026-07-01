# ARMGDN

> 𝖄𝖔𝖓𝖉𝖗 & ARMGDN — Music. Tools. Art.

Home base for the ARMGDN universe.

## Structure

```
armgdnlabs.github.io/
├── index.html          → Main hub
├── styles.css          → Shared design system
├── script.js           → Shared JS (theme toggle, interactions)
├── labs/               → ARMGDN Labs — browser tools for producers
├── records/            → ARMGDN Records — music releases
└── studios/            → ARMGDN Studios — art & visual design
```

## Design system
- **Fonts:** Share Tech Mono (terminal/display) + Space Grotesk (body/UI)
- **Accent:** Phosphor green `#39ff87` (dark) / `#007a3a` (light)
- **Vibe:** Terminalcore · Y2K · Discman era · Synth-wave · Indie cyberpunk
- **Hosting:** GitHub Pages — `armgdnlabs.github.io`

## Add a new tool
1. Create a folder: `labs/tool-name/`
2. Add `index.html` — link `../styles.css` and `../script.js`
3. Add a row to the tools list in `index.html` and `labs/index.html`
4. Commit and push — GitHub Pages deploys automatically

## Migrate from Lovable / Base44
1. Export / sync project to a new GitHub repo (`armgdnlabs/tool-name`)
2. Check if it runs as a static app
3. If static: copy into `labs/tool-name/` here, or keep as standalone repo and link from Labs
4. If needs backend: keep on original host, add entry row in Labs directory pointing to the live URL
