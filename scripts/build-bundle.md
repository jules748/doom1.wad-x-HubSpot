# How to build doom.jsdos

This document explains how to create the `docs/doom.jsdos` bundle that GitHub Pages serves to js-dos.

---

## What is doom.jsdos?

`doom.jsdos` is a ZIP archive (with a `.jsdos` extension) that js-dos v8 downloads and mounts as a virtual DOS filesystem. It contains:

- `DOOM1.WAD` - the game data file (shareware version)
- `DOOM.EXE` - the DOOM executable
- `dosbox.conf` - DOSBox configuration with an `[autoexec]` section that launches the game automatically

When js-dos loads the bundle, DOSBox-X boots, mounts the archive contents as drive C:, and executes the autoexec commands, which start DOOM.

---

## Option A: dos.zone Studio (recommended)

The visual Studio at dos.zone handles the dosbox.conf and bundle packaging automatically.

1. Go to https://dos.zone/studio/
2. Click "New" or drag `DOOM1.WAD` onto the page
3. The Studio should auto-detect DOOM and pre-fill the configuration
4. Click "Export" (or "Download bundle")
5. Save the result as `docs/doom.jsdos` in this repository

Then commit and push:

```powershell
git add docs/doom.jsdos
git commit -m "Add doom.jsdos bundle"
git push origin main
```

GitHub Actions will redeploy GitHub Pages automatically.

---

## Option B: Manual ZIP

If you prefer to build the bundle by hand:

1. Create a working folder, e.g. `C:\doom-bundle\`
2. Place `DOOM1.WAD` and `DOOM.EXE` in that folder
3. Create `dosbox.conf` in the same folder with this content:

```ini
[autoexec]
mount c .
c:
DOOM.EXE
exit
```

4. Select all three files (`DOOM1.WAD`, `DOOM.EXE`, `dosbox.conf`) and create a ZIP archive
5. Rename the `.zip` file to `doom.jsdos`
6. Move the file to `docs/doom.jsdos`

---

## Where to get DOOM1.WAD

The shareware version of DOOM (Episode 1) is freely redistributable. Look for the original shareware archive:

- Filename: `doom19s.zip`
- SHA1 of the archive: `8D0FBBBEBA5ECB692A99F97E55DFB5365CFE5B77`
- `DOOM1.WAD` inside the archive: file size 4,196,020 bytes, SHA1 `5B2E249B9C5133EC987B3EA77596381DC0D6BC1D`

Verify the hash before use to confirm you have the correct shareware release.

---

## Legality note

The **shareware** `DOOM1.WAD` (Episode 1: Knee-Deep in the Dead) is freely redistributable under id Software's original shareware distribution license. id Software explicitly allowed and encouraged copying and distribution of the shareware version.

**Do NOT use `DOOM2.WAD`, `DOOM.WAD` (retail), or any other commercial WAD file.** Those are copyrighted and their distribution is not licensed. Committing a commercial WAD to a public repository would be a copyright violation.

This project only uses and references the shareware WAD.
