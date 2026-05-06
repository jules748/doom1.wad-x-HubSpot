# SETUP: Deploy DOOM in HubSpot

Step-by-step deployment walkthrough. Follow the phases in order.

---

## Phase 1 - Build the DOOM bundle

The `doom.jsdos` bundle is not included in the repository. You must build it locally.

See [`scripts/build-bundle.md`](scripts/build-bundle.md) for full instructions. Summary:

1. Get the DOOM shareware archive `doom19s.zip` (SHA1: `8D0FBBBEBA5ECB692A99F97E55DFB5365CFE5B77`)
2. Go to https://dos.zone/studio/
3. Drag `DOOM1.WAD` onto the page, accept the auto-detected config, click Export
4. Save the result to `docs/doom.jsdos`

Once the file is in place, commit it:

```powershell
git add docs/doom.jsdos
git commit -m "Add doom.jsdos bundle"
```

---

## Phase 2 - GitHub Pages enablement

1. Push to the `main` branch:

```powershell
git push origin main
```

2. In the GitHub repo, go to **Settings -> Pages**
3. Under "Source", select **GitHub Actions**
4. The workflow at `.github/workflows/deploy-pages.yml` will trigger automatically on the next push

5. Verify the deploy:
   - Go to the **Actions** tab in the repo
   - Wait for the "Deploy to GitHub Pages" workflow to show a green checkmark
   - Visit https://jules748.github.io/doom1.wad-x-HubSpot/
   - The page should show the "DOOM / Click to Play" overlay
   - Click the button - DOOM should boot in a few seconds

---

## Phase 3 - HubSpot CLI authentication

Install the HubSpot CLI if you haven't already:

```powershell
npm install -g @hubspot/cli@latest
```

Authenticate and connect to your developer account:

```powershell
cd hubspot-app
hs init
```

A browser window will open. Log in with your HubSpot credentials and select the developer account that contains portal `145045793`.

This creates a `hubspot.config.yml` file locally (it is gitignored - do not commit it).

---

## Phase 4 - Deploy to HubSpot

Install extension dependencies:

```powershell
cd hubspot-app/src/app/extensions
npm install
cd ../../../..
```

Upload the project to HubSpot:

```powershell
cd hubspot-app
hs project upload --account=145045793
```

The CLI will print a URL after a successful deploy. Open it and click **Install app** to install it on portal `145045793`.

---

## Phase 5 - Test in HubSpot

1. Open HubSpot at app.hubspot.com
2. Click the **Marketplace** icon in the left navigation bar
3. Under "Recently visited apps", find **DOOM in HubSpot**
4. Click the app to open the App Page
5. Click **Launch DOOM**
6. The iframe loads GitHub Pages, then DOOM boots
7. Click inside the iframe to capture keyboard focus
8. Play DOOM

---

## Troubleshooting

**"App Pages not available" or the app type is not recognized**
App Pages require Sales Hub Enterprise or Service Hub Enterprise. Confirm portal `145045793` has an active Enterprise subscription.

**Iframe is blank or shows a loading spinner that never resolves**
- Check the browser console for CSP or sandbox errors
- Confirm GitHub Pages is deployed and https://jules748.github.io/doom1.wad-x-HubSpot/ loads in a standalone tab
- Verify the `sandbox` flags in `DoomPage.jsx` include `allow-scripts` and `allow-same-origin`

**Keyboard input not captured (arrow keys scroll the page instead of moving in DOOM)**
You must click directly inside the iframe before using the keyboard. The click-to-start overlay in `index.html` helps establish initial focus, but after HubSpot renders the page you need one more click inside the iframe frame.

**No audio / audio is silent**
Browser autoplay policy blocks audio without a user gesture. The click-to-start overlay in `index.html` handles this - do not remove it. If audio is still silent after clicking Play, click inside the iframe once more.

**"platform version" error during `hs project upload`**
Your HubSpot CLI is too old. Run `npm install -g @hubspot/cli@latest` to update, then retry.

**`hs init` fails or does not open a browser**
Try `hs auth` instead. If behind a corporate proxy, set `HTTP_PROXY` / `HTTPS_PROXY` environment variables.
