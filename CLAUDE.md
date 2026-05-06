# CLAUDE.md - Context for Claude Code

This file gives Claude Code the operational context needed to work on this project without re-reading the full PRD.

---

## Project overview

This repo runs the original DOOM (1993) as a native App Page inside HubSpot CRM. It uses HubSpot UI Extensions (Developer Platform 2026.03) to render a React component containing an Iframe that points to a static GitHub Pages site. The GitHub Pages site uses js-dos v8 (WebAssembly DOSBox) to load and run a `doom.jsdos` bundle containing the DOOM shareware files. The whole stack is a proof-of-concept demo for LinkedIn and a HubSpot CSM team meeting.

Owner: Jules Bellon (jules@klakss.com), HubSpot Partner, Klakss. Portal: 145045793 (Sales Hub Enterprise, EU/Paris).

---

## Architecture

```
HubSpot CRM (app.hubspot.com)
  |
  +-- App Page (React + @hubspot/ui-extensions SDK)
       |
       +-- <Iframe src="https://jules748.github.io/doom1.wad-x-HubSpot/">
            |
            +-- index.html (static, no build step)
                 |
                 +-- js-dos v8 (CDN)
                      |
                      +-- doom.jsdos (committed to docs/)
```

---

## Repository structure

```
.
+-- PRD.md                           Full product requirements document
+-- CLAUDE.md                        This file
+-- README.md                        Public-facing project doc
+-- SETUP.md                         Step-by-step deploy walkthrough
+-- LICENSE                          MIT
+-- .gitignore
+-- .github/workflows/
|   +-- deploy-pages.yml             Auto-deploy docs/ to GitHub Pages on push to main
+-- docs/                            Served by GitHub Pages
|   +-- index.html                   js-dos loader page (iframe target)
|   +-- doom.jsdos                   DOOM bundle (NOT in git initially - built locally)
+-- hubspot-app/                     HubSpot UI Extension project root
|   +-- hsproject.json               platformVersion: "2026.03"
|   +-- src/app/
|       +-- app-hsmeta.json          App registration (name, uid, appPages ref)
|       +-- extensions/
|           +-- doom-page-hsmeta.json   type: "app-page", isHomePage: true
|           +-- DoomPage.jsx            React component - the App Page UI
|           +-- package.json            @hubspot/ui-extensions + react deps
+-- scripts/
    +-- build-bundle.md              Manual instructions for building doom.jsdos
```

---

## Conventions

- **Platform version**: always `"2026.03"` in `hsproject.json`. Never downgrade - App Pages were introduced in this version.
- **SDK package**: `@hubspot/ui-extensions` (unified package). Do NOT use `@hubspot/ui-extensions-react` (deprecated).
- **Config files**: named `*-hsmeta.json` (new naming convention in 2026.03+).
- **App Page registration**: declared in `app-hsmeta.json` under `extensions.crm.appPages[]`, with the page detail in its own `*-hsmeta.json` with `type: "app-page"`.
- **No build step for docs/**: `index.html` is plain HTML/CSS/JS. js-dos loads from CDN. No webpack, no bundler.
- **No external HTTP calls from DoomPage.jsx**: all game logic happens inside the iframe on GitHub Pages.
- **ASCII only in code and strings**: avoids Windows PowerShell encoding issues.

---

## Working with Claude Code

Typical workflow:

```powershell
# 1. Clone (already done)
# 2. Install extension deps
cd hubspot-app/src/app/extensions && npm install && cd ../../../..
# 3. Edit DoomPage.jsx or index.html
# 4. Test GitHub Pages locally by opening docs/index.html in a browser
# 5. Upload to HubSpot
cd hubspot-app && hs project upload --account=145045793
# 6. Commit and push (triggers GitHub Pages redeploy)
git add . && git commit -m "..." && git push origin main
```

Ask Jules before running any command that modifies state: git push, hs project upload, npm install.

---

## Common tasks

**Add a difficulty selector before launch**
Add a `<select>` or radio group in `DoomPage.jsx` before the Iframe renders. Pass the selected difficulty as a query param to `DOOM_LOADER_URL` (e.g. `?skill=2`). In `index.html`, read the `skill` param and pass it to DOSBox via the dosbox.conf autoexec (e.g. `DOOM.EXE -skill 2`). This requires rebuilding the `doom.jsdos` bundle with a parameterized `dosbox.conf`.

**Add FPS / stats overlay**
js-dos v8 exposes a `ci` (command interface) on the Dos instance. After boot, call `dosInstance.layers` or listen to frame events. Display stats in a `<div>` overlay in `index.html`.

**Port to a Company record sidebar**
Create a new `*-hsmeta.json` with `type: "crm-card"` and `objectTypes: [{"name": "companies"}]`. Register it in `app-hsmeta.json` under `extensions.crm.cards[]`. The Iframe approach is identical.

**Swap to Freedoom (open-source replacement)**
Replace `DOOM1.WAD` with `freedoom1.wad` from the Freedoom project (https://freedoom.github.io/). Rebuild the bundle. No legal concerns - Freedoom is BSD licensed.

---

## Things to NOT do

- **Do NOT commit a non-shareware WAD** (DOOM2.WAD, retail DOOM.WAD, Final Doom, etc.). Distribution is not licensed.
- **Do NOT change platformVersion to 2025.x**. App Pages are not supported in older versions.
- **Do NOT remove the click-to-start overlay** in `index.html`. Browser autoplay policy will silently break audio, and arrow keys will scroll the parent page instead of moving in DOOM.
- **Do NOT add `allow-top-navigation` to the iframe sandbox**. Not needed; security smell.
- **Do NOT push `hubspot.config.yml`**. It contains your HubSpot personal access token. It is gitignored.
- **Do NOT add emojis or non-ASCII characters** to any code or string values.

---

## Status checklist

- [ ] Project scaffolded
- [ ] doom.jsdos built and placed in docs/
- [ ] GitHub Pages enabled
- [ ] First push triggers successful Pages deploy
- [ ] DOOM playable at GitHub Pages URL
- [ ] HubSpot CLI authenticated to portal 145045793
- [ ] Extension dependencies installed
- [ ] First hs project upload succeeds
- [ ] App installed on portal 145045793
- [ ] DOOM playable inside HubSpot via Marketplace icon
- [ ] Screenshot/video recorded for LinkedIn
