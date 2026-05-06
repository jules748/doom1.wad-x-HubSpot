# DOOM in HubSpot

> "It runs DOOM" - the universal benchmark for any programmable surface.
> If HubSpot UI Extensions can run DOOM, they can run anything your team actually needs.

A proof-of-concept that runs the original **DOOM (1993)** as a native **App Page** inside HubSpot CRM, using HubSpot UI Extensions (Developer Platform 2026.03), js-dos v8 (WebAssembly DOSBox), and GitHub Pages.

Built for LinkedIn content and a HubSpot CSM team demo. Not a production tool.

---

## Architecture

```
HubSpot CRM (app.hubspot.com)
  |
  +-- App Page (React + @hubspot/ui-extensions SDK)
       |
       +-- <Iframe src="https://jules748.github.io/doom1.wad-x-HubSpot/">
            |
            +-- index.html (static HTML/CSS/JS on GitHub Pages)
                 |
                 +-- js-dos v8 runtime (loaded from CDN)
                      |
                      +-- doom.jsdos bundle (ZIP: DOOM1.WAD + dosbox.conf)
```

| Layer | Source | Deploys to | How |
|-------|--------|-----------|-----|
| Static loader | `docs/` | GitHub Pages | GitHub Actions on push |
| HubSpot extension | `hubspot-app/` | HubSpot portal 145045793 | `hs project upload` |
| DOOM bundle | `docs/doom.jsdos` | GitHub Pages | Built locally, committed |

---

## Repository layout

```
.
+-- docs/                        GitHub Pages root
|   +-- index.html               js-dos loader (iframe target)
|   +-- doom.jsdos               DOOM bundle (not in repo — build locally)
+-- hubspot-app/                 HubSpot UI Extension project
|   +-- hsproject.json
|   +-- src/app/
|       +-- app-hsmeta.json
|       +-- extensions/
|           +-- doom-page-hsmeta.json
|           +-- DoomPage.jsx
|           +-- package.json
+-- scripts/
|   +-- build-bundle.md          How to build doom.jsdos
+-- .github/workflows/
    +-- deploy-pages.yml         Auto-deploy docs/ to GitHub Pages
```

---

## Quick start

See [SETUP.md](SETUP.md) for the full step-by-step walkthrough.

High-level:
1. Build `doom.jsdos` locally (see `scripts/build-bundle.md`)
2. Enable GitHub Pages (repo Settings -> Pages -> Source: GitHub Actions)
3. Push to `main` - Actions deploys automatically
4. `npm install -g @hubspot/cli@latest && cd hubspot-app && hs init`
5. `cd src/app/extensions && npm install && cd ../../.. && hs project upload --account=145045793`
6. Install the app in HubSpot, open via Marketplace icon, click "Launch DOOM"

---

## Requirements

- HubSpot portal with **Sales Hub Enterprise** or **Service Hub Enterprise** (App Pages are an Enterprise feature)
- HubSpot developer account (free) linked to the portal
- HubSpot CLI: `npm install -g @hubspot/cli@latest`
- Node.js >= 18
- The DOOM shareware archive (`doom19s.zip`) to build the bundle

---

## Legal

- **DOOM (1993)**: the shareware `DOOM1.WAD` (Episode 1) is freely redistributable under id Software's shareware license. This project does not include or distribute the WAD file - you build the bundle yourself from the shareware archive.
- **js-dos**: MIT License, copyright Alexander Guryanov (caiiiycuk).
- **HubSpot UI Extensions SDK**: copyright HubSpot Inc.
- This project is MIT licensed. Not affiliated with id Software, ZeniMax, Microsoft, or HubSpot.

---

## Author

Jules Bellon - [klakss.com](https://klakss.com) - jules@klakss.com

MIT License
