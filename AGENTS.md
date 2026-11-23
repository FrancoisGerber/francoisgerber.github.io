# Working context — Personal Site (francoisgerber.github.io)

Owner: Francois Gerber (English, terse — short reports, no narration).

Anything visible in `src/`, `package.json` or `scripts/` is deliberately not repeated here — read the code.
This file holds only the rules, his preferences, and the traps that have already cost time.

## Rules

- Astro CV + blog, published by GitHub Pages. `main` publishes; a pushed branch is a draft.
- No push, no merge, no PR unless asked. Branch per change, commit messages in prose.
- `npm run build` green is the floor, not the proof — look at the rendered page.
- Leave the site running for review (`npm run dev -- --port 4321`, background) and kill servers by PID.

## The CV is generated

`npm run build` ends by producing `public/FrancoisGerberResume.pdf` from the compiled site. Never hand-write
CV copy and never edit the PDF: change the page and rebuild. He will ask for a website change and expect the
PDF to follow without being reminded. Contact details and the curated top skills are the only CV-only data,
and they live in `CONFIG` in `scripts/build-resume.mjs`.

## Preferences

- Stay close to framework defaults. No one-off custom CSS or invented overrides — fix it with daisyUI/Astro
  classes, or not at all.
- Astro pages stay literal. Do not extract page copy into data modules or a CMS.
- `README.md` is a byte-identical copy of `../FrancoisGerber/README.md`: edited by hand in both, never
  generated.
- Prose in his voice: concrete, numbers over adjectives, no filler openers. Specifics go in body copy; range
  and adaptability in the tagline.
- The About summary is one arc, four paragraphs at most, ~130 words — it is quoted verbatim in the CV
  sidebar. Do not restate a fact the Experience entry below it already carries.
- Do not claim awards or credentials he has not asked to advertise.

## Traps

- An emoji carrying a zero-width joiner inside this file trips the session-start injection check and the file
  gets skipped. Keep ZWJ glyphs out and describe them instead.
- Deleting the last blog post removes `src/content/blog/` and breaks the build until `.gitkeep` exists. The
  "collection does not exist or is empty" warning is expected with zero posts.
- `astro preview` does not hot reload; use `npm run dev` when he wants live edits.
- Kill dev servers by PID. A `pkill -f` pattern matches the agent's own shell command line and takes the
  session down (bracket a character: `pgrep -af '[a]stro preview'`).
- Do not drive his Brave window with xdotool — typing into the omnibox steals focus across his real tabs.
- The automation browser's `capture_screenshot()` times out after the first capture; use
  `cdp("Page.captureScreenshot", format="png", clip={...})` and decode the base64 instead.
- Don't touch the parked `_store/` pages, the empty blog collection or the dummy post unless the request is
  about them.

## Blog posts

`src/content/blog/<slug>.md`, structure and frontmatter copied from `src/content/blog/hello-world.md`. One
image (the hero, absolute path, no inline images), an audio player as the first body element above the intro,
`##` sections only. Narration is Hermes TTS (Piper, British male) converted to mp3. Topic ideas in
`BLOG_IDEAS.md`. Do not publish posts unasked.

## Open items

- `HorizontalCard` renders each project title as an `<h1>` (8 h1s on Projects). Semantic only.
- Projects/Blog titles sit ~7px left of Home because those pages scroll. Cosmetic; fixing means
  `scrollbar-gutter: stable`, a custom-CSS change he may not want.
- Older CV PDFs are kept in `~/Documents/Resume-Backups/`.
