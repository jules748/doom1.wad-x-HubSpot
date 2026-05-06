# PRD: DOOM in HubSpot

> Product Requirements Document. Read this end-to-end before writing any code.
> This document is the single source of truth — build the project according to this spec.

---

## 1. Goal

Build a working proof-of-concept that runs the original **DOOM (1993)** as a native **App Page** inside HubSpot, using HubSpot UI Extensions (Developer Platform 2026.03), `js-dos` v8 (WebAssembly DOSBox), and GitHub Pages.

This is a "look what's possible" demo for LinkedIn content and a HubSpot CSM team meeting. Not a production tool. The success criterion is: **launching the app from HubSpot's Marketplace icon plays a fully working DOOM in the browser, inside HubSpot's chrome.**

---

## 2. Owner & target environment

- **Owner**: Jules Bellon (jules@klakss.com), HubSpot Partner, founder of Klakss
- **GitHub repo**: <https://github.com/jules748/doom1.wad-x-HubSpot> (public, already created, currently empty except for default README)
- **GitHub Pages URL** (target): <https://jules748.github.io/doom1.wad-x-HubSpot/>
- **HubSpot portal**: `145045793` (Sales Hub Enterprise, EU/Paris/EUR)
- **Local dev environment**: Windows + VS Code + PowerShell + Claude Code
- **Working directory**: `C:\Users\jbell\doom1.wad-x-HubSpot`

---

## 3. Architecture

Three layers, three deploy targets:

```
HubSpot CRM (app.hubspot.com)
  |
  +-- App Page (React + @hubspot/ui-extensions SDK)
       |
       +-- <Iframe src="https://jules748.github.io/doom1.wad-x-HubSpot/">
            |
            +-- index.html (static HTML/CSS/JS)
                 |
                 +-- js-dos v8 runtime (loaded from CDN)
                      |
                      +-- doom.jsdos bundle (ZIP containing DOOM1.WAD + dosbox.conf)
```

| Layer | Source path | Deploys to | Via |
|-------|-------------|-----------|-----|
| Static loader | `docs/` | jules748.github.io | GitHub Actions (auto on push) |
| HubSpot extension | `hubspot-app/` | HubSpot portal 145045793 | `hs project upload` (manual) |
| DOOM bundle | `docs/doom.jsdos` | Same as static loader | Built locally via `dos.zone/studio`, committed to git |

---

## 4. Repository layout to create

```
.
+-- PRD.md                              (this file — keep at root)
+-- CLAUDE.md                           (context file for Claude Code)
+-- README.md                           (public-facing project doc — overwrite the GitHub default)
+-- SETUP.md                            (step-by-step deploy walkthrough)
+-- LICENSE                             (MIT)
+-- .gitignore
+-- .github/
|   +-- workflows/
|       +-- deploy-pages.yml            (auto-deploy /docs to Pages on push to main)
+-- docs/                               (served by GitHub Pages)
|   +-- index.html                      (js-dos loader — the iframe target)
|   +-- doom.jsdos                      (NOT created by Claude Code — Jules builds locally)
+-- hubspot-app/                        (HubSpot UI Extension project)
|   +-- hsproject.json
|   +-- src/
|       +-- app/
|           +-- app-hsmeta.json
|           +-- extensions/
|               +-- doom-page-hsmeta.json
|               +-- DoomPage.jsx
|               +-- package.json
+-- scripts/
    +-- build-bundle.md                 (instructions for building doom.jsdos)
```

---

## 5. File specifications

All file contents below are normative. Create them exactly as specified.

### 5.1 `.gitignore`

```
# Dependencies
node_modules/
.pnp
.pnp.js

# HubSpot CLI
hubspot.config.yml
.hs-cache/

# Build output
dist/
build/

# Environment
.env
.env.local
.env.*.local

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
.DS_Store
```

> Note: `docs/doom.jsdos` is NOT gitignored. We commit the shareware bundle to make GitHub Pages deploys self-contained. The shareware DOOM1.WAD is freely redistributable in original archive form.

### 5.2 `LICENSE` (MIT)

```
MIT License

Copyright (c) 2026 Jules Bellon / Klakss

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

This project includes references to and integration with:
- DOOM (1993), (c) id Software / ZeniMax / Microsoft. The shareware DOOM1.WAD
  is freely redistributable under id Software's shareware license.
- js-dos, (c) Alexander Guryanov (caiiiycuk), MIT License.
- HubSpot UI Extensions SDK, (c) HubSpot Inc.

This project is not affiliated with, endorsed by, or sponsored by id Software,
ZeniMax, Microsoft, HubSpot, or any other rights holder.
```

### 5.3 `.github/workflows/deploy-pages.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
    paths:
      - "docs/**"
      - ".github/workflows/deploy-pages.yml"
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: "./docs"

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 5.4 `docs/index.html`

The static loader page served by GitHub Pages. This is what runs inside the iframe. It must:

- Load `js-dos` v8 from the official CDN (`https://v8.js-dos.com/latest/js-dos.css` and `js-dos.js`)
- Show a click-to-start overlay (mandatory for browser autoplay policy AND keyboard focus capture)
- After click, boot DOOM by calling `Dos(element, { url: "./doom.jsdos" })`
- Allow bundle URL override via `?bundle=URL` query param
- Show a fallback error message if the bundle is missing
- Expose a `postMessage` bridge so the parent (HubSpot extension) can send `doom:pause`, `doom:resume`, `doom:mute`, `doom:unmute`
- Emit `doom:ready` to parent on load
- Use HubSpot orange (`#ff7a59`) and DOOM red (`#cc0000`) for branding
- Be mobile-unfriendly and that's fine (App Pages are desktop)

Full HTML contents:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DOOM in HubSpot</title>

  <link rel="stylesheet" href="https://v8.js-dos.com/latest/js-dos.css" />
  <script src="https://v8.js-dos.com/latest/js-dos.js"></script>

  <style>
    :root {
      --hubspot-orange: #ff7a59;
      --doom-red: #cc0000;
      --bg: #1a1a1a;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      height: 100%; width: 100%;
      background: var(--bg);
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif;
      overflow: hidden;
    }
    #start-screen {
      position: fixed; inset: 0;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      background: var(--bg);
      cursor: pointer;
      z-index: 100;
      transition: opacity 0.3s ease;
    }
    #start-screen h1 {
      font-size: clamp(2rem, 6vw, 4rem);
      letter-spacing: 0.1em;
      color: var(--doom-red);
      text-shadow: 0 0 20px rgba(204, 0, 0, 0.5);
      margin-bottom: 1rem;
    }
    #start-screen p {
      font-size: 1rem;
      color: #ccc;
      margin-bottom: 2rem;
    }
    #start-button {
      background: var(--hubspot-orange);
      color: #fff;
      border: none;
      padding: 1rem 2.5rem;
      font-size: 1.1rem;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    #start-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(255, 122, 89, 0.3);
    }
    #start-screen.hidden { opacity: 0; pointer-events: none; }
    #dos { width: 100%; height: 100%; }
    .footer-credit {
      position: fixed; bottom: 8px; right: 12px;
      font-size: 11px; color: #666;
      z-index: 50; pointer-events: none;
    }
    .footer-credit a { color: #888; pointer-events: auto; }
    #error-screen {
      display: none;
      padding: 2rem;
      max-width: 600px;
      margin: 4rem auto;
      background: #2a2a2a;
      border-left: 4px solid var(--doom-red);
      border-radius: 4px;
    }
    #error-screen.visible { display: block; }
    #error-screen h2 { color: var(--doom-red); margin-bottom: 1rem; }
    #error-screen code {
      background: #000;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: "Courier New", monospace;
    }
  </style>
</head>
<body>
  <div id="start-screen" role="button" tabindex="0">
    <h1>DOOM</h1>
    <p>Running inside HubSpot via UI Extensions</p>
    <button id="start-button">Click to Play</button>
  </div>

  <div id="dos"></div>

  <div id="error-screen">
    <h2>Bundle not found</h2>
    <p>Drop your <code>doom.jsdos</code> bundle in the <code>/docs</code> folder and redeploy.</p>
    <p style="margin-top: 1rem; font-size: 0.9rem; color: #999;">
      See <code>scripts/build-bundle.md</code> in the repo for instructions.
    </p>
  </div>

  <div class="footer-credit">
    Powered by <a href="https://js-dos.com" target="_blank" rel="noopener">js-dos</a>
  </div>

  <script>
    const params = new URLSearchParams(window.location.search);
    const BUNDLE_URL = params.get("bundle") || "./doom.jsdos";

    const startScreen = document.getElementById("start-screen");
    const errorScreen = document.getElementById("error-screen");
    const dosContainer = document.getElementById("dos");

    let dosInstance = null;

    async function bootDoom() {
      startScreen.classList.add("hidden");
      try {
        const head = await fetch(BUNDLE_URL, { method: "HEAD" });
        if (!head.ok) throw new Error("Bundle returned " + head.status);

        dosInstance = Dos(dosContainer, {
          url: BUNDLE_URL,
          theme: "dark",
          autoStart: true,
          backend: "dosboxX",
        });

        setTimeout(function () { startScreen.remove(); }, 400);
      } catch (err) {
        console.error("[DoomLoader] Failed to boot:", err);
        startScreen.remove();
        errorScreen.classList.add("visible");
      }
    }

    startScreen.addEventListener("click", bootDoom);
    startScreen.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        bootDoom();
      }
    });

    window.addEventListener("message", function (event) {
      if (!dosInstance) return;
      const type = event.data && event.data.type;
      switch (type) {
        case "doom:pause": dosInstance.setPause && dosInstance.setPause(true); break;
        case "doom:resume": dosInstance.setPause && dosInstance.setPause(false); break;
        case "doom:mute": dosInstance.setVolume && dosInstance.setVolume(0); break;
        case "doom:unmute": dosInstance.setVolume && dosInstance.setVolume(1); break;
      }
    });

    if (window.parent) {
      window.parent.postMessage({ type: "doom:ready" }, "*");
    }
  </script>
</body>
</html>
```

### 5.5 `hubspot-app/hsproject.json`

```json
{
  "name": "hubspot-doom",
  "srcDir": "src",
  "platformVersion": "2026.03"
}
```

### 5.6 `hubspot-app/src/app/app-hsmeta.json`

```json
{
  "name": "DOOM in HubSpot",
  "description": "An App Page that runs the original DOOM (1993) inside HubSpot via UI Extensions and js-dos.",
  "uid": "doom-app",
  "type": "app",
  "auth": {
    "type": "static",
    "redirectUrls": [],
    "requiredScopes": [],
    "optionalScopes": [],
    "conditionallyRequiredScopes": []
  },
  "support": {
    "supportEmail": "jules@klakss.com",
    "documentationUrl": "https://github.com/jules748/doom1.wad-x-HubSpot",
    "supportUrl": "https://github.com/jules748/doom1.wad-x-HubSpot/issues"
  },
  "extensions": {
    "crm": {
      "appPages": [
        { "file": "extensions/doom-page-hsmeta.json" }
      ]
    }
  },
  "distribution": "private"
}
```

### 5.7 `hubspot-app/src/app/extensions/doom-page-hsmeta.json`

```json
{
  "type": "app-page",
  "uid": "doom-page",
  "config": {
    "name": "DOOM",
    "description": "Play the original DOOM (1993) inside HubSpot. For demonstration purposes only.",
    "entrypoint": "DoomPage.jsx",
    "isHomePage": true
  }
}
```

### 5.8 `hubspot-app/src/app/extensions/package.json`

```json
{
  "name": "doom-page-extension",
  "version": "1.0.0",
  "description": "DOOM running inside a HubSpot App Page",
  "private": true,
  "dependencies": {
    "@hubspot/ui-extensions": "latest",
    "react": "^18.2.0"
  }
}
```

### 5.9 `hubspot-app/src/app/extensions/DoomPage.jsx`

The React component for the App Page. Uses HubSpot UI Extensions SDK components only (Flex, Box, Tile, Heading, Button, Iframe, Divider, Text). The iframe sandbox flags must include `allow-scripts`, `allow-same-origin`, `allow-pointer-lock`, `allow-popups`. The DOOM_LOADER_URL is hardcoded to the production GitHub Pages URL.

```jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Flex,
  Box,
  Text,
  Heading,
  Button,
  Tile,
  Divider,
  Iframe,
  hubspot,
} from "@hubspot/ui-extensions";

const DOOM_LOADER_URL = "https://jules748.github.io/doom1.wad-x-HubSpot/";

hubspot.extend(({ context }) => <DoomPage context={context} />);

const DoomPage = ({ context }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === "doom:ready") {
        setIframeReady(true);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <Flex direction="column" gap="md">
      <Tile>
        <Flex direction="row" justify="between" align="center">
          <Box>
            <Heading>DOOM</Heading>
            <Text variant="microcopy">
              The original 1993 first-person shooter, running inside HubSpot
              via UI Extensions + js-dos (WebAssembly DOSBox).
            </Text>
          </Box>
          <Flex direction="row" gap="sm">
            {!isPlaying ? (
              <Button variant="primary" onClick={() => setIsPlaying(true)}>
                Launch DOOM
              </Button>
            ) : (
              <Button variant="destructive" onClick={() => setIsPlaying(false)}>
                Stop
              </Button>
            )}
          </Flex>
        </Flex>
      </Tile>

      {isPlaying && (
        <Tile>
          <Flex direction="column" gap="sm">
            <Text format={{ fontWeight: "demibold" }}>
              {iframeReady ? "Loaded - click the iframe to play" : "Loading WASM runtime..."}
            </Text>
            <Text variant="microcopy">
              Controls: arrow keys to move - Ctrl to fire - Space to open doors - Esc for menu
            </Text>
            <Box>
              <Iframe
                src={DOOM_LOADER_URL}
                height={600}
                width="100%"
                title="DOOM"
                sandbox={[
                  "allow-scripts",
                  "allow-same-origin",
                  "allow-pointer-lock",
                  "allow-popups",
                ]}
                allow="autoplay; gamepad; fullscreen"
              />
            </Box>
          </Flex>
        </Tile>
      )}

      {!isPlaying && (
        <Tile>
          <Flex direction="column" gap="md">
            <Heading>About this app</Heading>
            <Text>
              This is a proof-of-concept demonstrating what's possible with
              HubSpot's UI Extensions platform. The full DOOM engine runs in
              your browser as WebAssembly, embedded in an Iframe component
              within a native HubSpot App Page.
            </Text>
            <Divider />
            <Heading>Stack</Heading>
            <Text>- HubSpot UI Extensions (Developer Platform 2026.03)</Text>
            <Text>- React + @hubspot/ui-extensions SDK</Text>
            <Text>- js-dos v8 (WebAssembly DOSBox)</Text>
            <Text>- DOOM shareware (id Software, 1993)</Text>
            <Text>- Hosted on GitHub Pages</Text>
            <Divider />
            <Heading>Why?</Heading>
            <Text>
              Because "It runs DOOM" is the universal benchmark for any
              programmable surface. If HubSpot UI Extensions can run DOOM,
              they can run anything your team actually needs.
            </Text>
            <Box>
              <Text variant="microcopy">
                Built by Jules Bellon - klakss.com - Portal {context?.portal?.id}
              </Text>
            </Box>
          </Flex>
        </Tile>
      )}
    </Flex>
  );
};
```

### 5.10 `scripts/build-bundle.md`

Instructions for Jules to build `doom.jsdos` locally. Claude Code, please write a markdown doc that explains:

1. **What the bundle is**: a ZIP archive (with `.jsdos` extension) containing `DOOM1.WAD`, `DOOM.EXE`, and a `dosbox.conf` autoexec.
2. **Two ways to build it**:
   - **Option A (recommended)**: Use the visual Studio at <https://dos.zone/studio/>. Drag `DOOM1.WAD` in, accept the auto-detected DOOM config, click Export, drop the result at `docs/doom.jsdos`.
   - **Option B (manual)**: Create a folder with `DOOM1.WAD`, `DOOM.EXE`, and a `dosbox.conf` containing `[autoexec]` / `mount c .` / `c:` / `DOOM.EXE` / `exit`. Zip it and rename to `doom.jsdos`.
3. **Where to get DOOM1.WAD**: from the shareware archive `doom19s.zip` (widely available — search for the SHA1 `5B2E249B9C5133EC987B3EA77596381DC0D6BC1D` to verify integrity, file size 4,196,020 bytes).
4. **Legality note**: shareware DOOM1.WAD is freely redistributable; commercial DOOM2.WAD is not — do NOT use the retail version.

### 5.11 `README.md`, `SETUP.md`, `CLAUDE.md`

After all code files are in place, generate three documentation files. Their content is described in section 7.

---

## 6. Deployment workflow (manual steps Jules will run)

### 6.1 Build and commit the DOOM bundle

```
# Jules manually:
# 1. Visit https://dos.zone/studio/
# 2. Drag DOOM1.WAD into the page
# 3. Accept defaults, export doom.jsdos
# 4. Save to C:\Users\jbell\doom1.wad-x-HubSpot\docs\doom.jsdos
```

### 6.2 First commit and push

```powershell
git add .
git commit -m "Initial: DOOM in HubSpot scaffold"
git push origin main
```

### 6.3 Enable GitHub Pages

GitHub repo Settings -> Pages -> Source: "GitHub Actions". The workflow at `.github/workflows/deploy-pages.yml` will run automatically on push.

After ~1 minute, visit <https://jules748.github.io/doom1.wad-x-HubSpot/>. The "Click to Play" overlay should appear, and clicking it should boot DOOM.

### 6.4 Install HubSpot CLI and authenticate

```powershell
npm install -g @hubspot/cli@latest
cd hubspot-app
hs init
# Browser opens - log in - select developer account containing portal 145045793
```

### 6.5 Install extension dependencies

```powershell
cd hubspot-app/src/app/extensions
npm install
cd ../../../..
```

### 6.6 Upload to HubSpot

```powershell
cd hubspot-app
hs project upload --account=145045793
```

CLI prints a URL after deploy. Open it, click "Install app".

### 6.7 Test in HubSpot

In HubSpot: Marketplace icon (left nav) -> Recently visited apps -> "DOOM in HubSpot" -> click "Launch DOOM".

---

## 7. Generated documentation files

### 7.1 `README.md`

Public-facing project doc. Replace the GitHub default README. Should include:
- Project tagline ("It runs DOOM" benchmark applied to HubSpot)
- ASCII architecture diagram (3 layers as in section 3)
- Repository layout section
- Quick start (link to SETUP.md)
- Requirements (Sales/Service Hub Enterprise, HubSpot dev account, CLI, Node 18+)
- Legal note about DOOM/js-dos licenses
- Author credit (Jules Bellon, klakss.com, MIT license)

Keep it punchy. This is what people see when the LinkedIn post drives traffic to the repo.

### 7.2 `SETUP.md`

Step-by-step deployment walkthrough. Five phases:
1. **Build DOOM bundle** -> link to `scripts/build-bundle.md`
2. **GitHub Pages enablement** -> repo Settings, push, verify URL works in browser
3. **HubSpot CLI auth** -> `npm install -g @hubspot/cli@latest`, `hs init`
4. **Deploy to HubSpot** -> `npm install` in extensions/, `hs project upload`
5. **Test in HubSpot** -> Marketplace icon, install, launch

Include a Troubleshooting section covering: "App Pages not available" (need Enterprise), "Iframe blank" (sandbox/CSP), "Keyboard not captured" (must click iframe), "Audio silent" (autoplay policy), "platform version error" (CLI too old).

### 7.3 `CLAUDE.md`

Context file for future Claude Code sessions. Should mirror the structure of this PRD but in a more operational tone. Include:
- Project overview (1 paragraph)
- Architecture diagram
- Repository structure
- Conventions (HubSpot UI Extensions naming, platform version, SDK package, file conventions)
- Workflow with Claude Code (clone, install, iterate, deploy)
- Common tasks (add difficulty selector, FPS stats, port to Company record, swap to Freedoom)
- Things to NOT do (commit retail WAD, change platform version, remove click-to-start, push secrets)
- Status checklist

The status checklist should track these items:
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

---

## 8. Conventions and gotchas

### HubSpot UI Extensions (2026.03)

- **Platform version is mandatory**: `2026.03` in `hsproject.json`. Older versions don't support App Pages.
- **SDK package**: `@hubspot/ui-extensions` (single unified package, not the older `@hubspot/ui-extensions-react`).
- **File naming**: `*-hsmeta.json` for config files (new in 2026.03+).
- **App Page registration**: in `app-hsmeta.json` under `extensions.crm.appPages[]`. The page itself is declared in its own `*-hsmeta.json` with `type: "app-page"` and `isHomePage: true`.
- **Entry point**: the `entrypoint` field in the extension config is a path relative to `src/app/extensions/`.
- **Enterprise feature**: App Pages require Sales Hub Enterprise or Service Hub Enterprise on the target portal. Portal 145045793 has this.

### Static loader

- **Click-to-start overlay is mandatory** for two reasons: browser autoplay policy (audio needs a user gesture) and keyboard focus capture (without it, arrow keys scroll the parent page).
- **Bundle URL** must be relative (`./doom.jsdos`) for the GitHub Pages deploy to work, but is overridable via `?bundle=URL`.
- **No build step**: `docs/index.html` is plain HTML/CSS/JS, served as-is. js-dos is loaded from CDN.

### React component

- **No external HTTP calls** from `DoomPage.jsx` - everything happens inside the iframe.
- **Iframe sandbox flags** are deliberate: `allow-pointer-lock` is needed for FPS games, `allow-same-origin` is needed for postMessage to work.
- **No emojis or non-ASCII characters** anywhere in code or strings - keep everything ASCII to avoid Windows PowerShell encoding issues.

### Things to NOT do

- Do NOT commit a non-shareware DOOM WAD (DOOM2.WAD, Final Doom, etc.). Distribution is not licensed.
- Do NOT change `platformVersion` to `2025.x`. App Pages aren't supported.
- Do NOT remove the click-to-start overlay. Browser autoplay will silently break audio.
- Do NOT add `allow-top-navigation` to the iframe sandbox. Not needed; security smell.
- Do NOT push secrets. `hubspot.config.yml` is gitignored.

---

## 9. Acceptance criteria

The project is "done" when ALL of these are true:

1. `git status` shows clean working tree on `main` branch
2. GitHub Pages deploy is green (check Actions tab)
3. `https://jules748.github.io/doom1.wad-x-HubSpot/` loads, shows "Click to Play", and after clicking, DOOM boots and is playable with keyboard
4. `hs project upload --account=145045793` succeeds with no errors
5. The app appears in HubSpot under Marketplace icon -> Recently visited apps
6. Clicking "Launch DOOM" inside the App Page loads the iframe and DOOM is playable inside HubSpot
7. README.md, SETUP.md, CLAUDE.md, LICENSE all exist and are well-formed
8. No `YOUR_GITHUB_USERNAME` or other placeholders remain anywhere in the codebase

---

## 10. Order of operations for Claude Code

When building this project, follow this order:

1. **Read this PRD end-to-end** before writing anything
2. **Verify environment**: confirm Node.js >= 18, git, gh CLI (optional) are installed
3. **Create the file structure** as specified in section 4
4. **Write all files** according to section 5 (use the exact contents provided where given verbatim; generate the docs in section 7 according to specs)
5. **Verify no placeholders**: grep for `YOUR_GITHUB_USERNAME`, `TODO`, `FIXME`
6. **Stop and ask Jules to manually build `doom.jsdos`** (it cannot be automated - requires DOOM1.WAD which is not in the repo)
7. **Once the bundle is in `docs/`**, do the first commit and push
8. **Walk Jules through enabling GitHub Pages** in the repo Settings UI
9. **After Pages deploys successfully**, walk Jules through HubSpot CLI auth and the first `hs project upload`
10. **Update the CLAUDE.md status checklist** as each step completes

Ask before each command that modifies state (git push, hs project upload, npm install). Don't run them silently.

---

## 11. References

- HubSpot UI Extensions overview: <https://developers.hubspot.com/docs/platform/ui-extensions-overview>
- HubSpot Spring 2026 Spotlight (App Pages release notes): <https://developers.hubspot.com/changelog/spring-2026-spotlight>
- HubSpot UI components reference: <https://developers.hubspot.com/docs/reference/ui-components/standard-components>
- js-dos v8 API: <https://js-dos.com/dos-api.html>
- js-dos bundle format: <https://js-dos.com/jsdos-bundle.html>
- js-dos Studio (visual bundle builder): <https://dos.zone/studio/>
- DOOM shareware archive specs: filename `doom19s.zip`, SHA1 `8D0FBBBEBA5ECB692A99F97E55DFB5365CFE5B77`

End of PRD.
