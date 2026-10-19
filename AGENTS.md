# Working context — Personal Site (francoisgerber.github.io)

Read this first. It captures the state of the site, the decisions taken, and the traps we already hit.
Owner: Francois Gerber (Telegram DM, English, terse — he dislikes long reports and token waste).

## What this repo is

- Astro CV + blog, published by GitHub Pages at <https://francoisgerber.github.io/>.
- Remote `git@github.com:FrancoisGerber/francoisgerber.github.io.git`, default branch `main`.
- **Nothing is public until it reaches `main`** — a pushed branch is a draft. No PRs unless asked.
- Current work sits on branch **`profile-refresh`** (pushed, tracks origin, 10 commits ahead of main).

## Stack (after the Oct 2026 dependency upgrade)

astro 7.4 · @astrojs/mdx 8.1 · @astrojs/rss 4.0 · @astrojs/sitemap 3.7 · Tailwind 4.3 via
`@tailwindcss/vite` · daisyUI 5.7 with `themes: black --default` · dayjs · @tailwindcss/typography.
Content collections use the Content Layer API (`src/content.config.ts`, `glob()` loaders).
`@astrojs/tailwind` and `tailwind.config.cjs` are gone — Tailwind config lives in `src/styles/global.css`
as `@plugin` directives.

Commands: `npm run dev -- --port 4321` (HMR), `npm run build`, `npx astro preview --port 4321`
(preview serves the built output — **no** hot reload).

## What was done on this branch

1. **Dependencies** moved to current majors (Astro 2 → 7, Tailwind 3 → 4, daisyUI 2 → 5), with the
   code migration: content layer API, `post.slug` → `post.id`, `render(entry)`, RSS exporting `GET`,
   two malformed `<a>` tags in the About certifications that Astro 7 rejects, `bg-opacity-90` →
   `bg-base-100/90`.
2. **Profile rewritten** to match the current work: site title/description, hero copy, About (four
   concrete paragraphs: Foundry LLM crawler → Ringier crawling platform → refinery/iRIS + OiS award →
   what he does now), Ringier role description, refreshed skills. Cut CV-form noise (full names,
   gender, marital status, transport) and "passionate developer" filler.
3. **Blog emptied** — both starter posts deleted, homepage hides the section while the collection is
   empty, `.gitkeep` keeps `src/content/blog/` alive. Candidate posts live in `BLOG_IDEAS.md`
   (ten categories + "write these first" trio). Do not publish posts unasked.
4. **daisyUI 5 fixes**: `drawer-mobile` → `lg:drawer-open` (the old class left the sidebar painting as
   a full-height grey block behind the page), `bg-base-300` active marker → daisyUI's own
   `menu-active`, social links pinned to the sidebar bottom via `min-h-full` on the menu panel.
5. **Layout**: footer pinned to the bottom (`flex-1` on the content wrapper), home hero buttons
   restored to the originals (Download My Resume / Who Am I? / Subscribe on Medium), every page given
   the same title block (`src/components/PageHeader.astro`: `h1` 48px, `pb-10 mt-5`, used by About,
   Projects, Blog and Store — Store previously had no title), `main` is `w-full` so titles start at
   the same x.
6. **Home warmth**: emoji string (laptop, book, gamepad, seedling, island, coffee) inline at the start of the intro paragraph,
   `🚀` on the tagline. No palm emoji in the body text.

## Decisions worth keeping

- **Stay close to framework defaults.** He explicitly does not want one-off custom CSS or invented
  overrides; fix things with daisyUI/Astro classes and utilities, or not at all.
- The black theme must be declared (`@plugin "daisyui" { themes: black --default; }`); daisyUI 5 ships
  only light/dark otherwise and the site silently renders light.
- Page titles are all `PageHeader` — keep them identical or the pages drift again.
- Specifics over adjectives in all copy; numbers beat claims (5,000 sites/day, 12 mining sites,
  2018 award).

## Traps already hit

- Emoji carrying a zero-width joiner (e.g. the person-at-laptop glyph) inside THIS file trips the
  session-start injection check and the file is skipped — a session then has to read it manually.
  Keep ZWJ glyphs out of AGENTS.md; describe them instead.

- Deleting the last blog post deletes `src/content/blog/` and breaks the build until `.gitkeep` exists.
- `[WARN] The collection "blog" does not exist or is empty` is expected with zero posts — leave it.
- Empty collections are fine on Astro 5+, but the folder must still exist.
- `astro preview` does not hot reload; if he asks for live updates, run `npm run dev`.
- Kill dev servers by PID; a `pkill -f` pattern matches the agent's own shell command line and takes the
  session down with it (bracket a character: `pgrep -af '[a]stro preview'`).
- **Do not drive his Brave window with xdotool.** Typing URLs into the omnibox steals focus across his
  real tabs (it once landed on his Gmail). Ask him to open the URL, or use the automation browser.
- The automation browser's `capture_screenshot()` times out after the first capture; use
  `cdp("Page.captureScreenshot", format="png", clip={...})` + base64 to write a PNG instead.

## Parked: the store section

`src/pages/_store/` holds the old Astrofy store pages (`[...page].astro`, `[slug].astro`) and
`src/content/store/item1.md` is still the demo item. The underscore prefix keeps Astro from routing
them, so nothing appears on the site, in the sitemap, or in the nav — but the code stays for future
use. To bring the store back: `git mv src/pages/_store src/pages/store`, rebuild, and replace the demo
item with real ones.

## The resume PDF — how it was built (read this before touching it)

`public/FrancoisGerberResume.pdf` is **generated**, never hand-edited. Source of truth for the CV is
`resume/FrancoisGerberResume.html`; the portrait is `resume/assets/portrait.jpg`.

**Pipeline**

1. Edit `resume/FrancoisGerberResume.html`. Layout is two A4 `.page` sections (210×297mm, `display:flex`):
   a 40%-wide dark sidebar (`#2e2e2e`) with the portrait, the name overlaid in white and boxed
   `ABOUT ME / CONTACT / TOP SKILLS / INTERESTS` headings, plus a 60% main column with serif uppercase
   section headings and a hairline rule. Page 1 = education, work experience, certifications, skills;
   page 2 = Enterprise Solutions.
2. Serve the folder: `python3 -m http.server 8099` **inside `resume/`** (background), because the page
   references `assets/portrait.jpg` relatively.
3. Print with the automation browser:
   `cdp("Page.printToPDF", printBackground=True, preferCSSPageSize=True)`, base64-decode into
   `public/FrancoisGerberResume.pdf`.
4. Kill the server **by PID** (`kill <pid>`); never `pkill -f "http.server"` — the pattern matches the
   agent's own shell command line and takes the session down.
5. `npm run build` then check the PDF itself: `pdfinfo` for the page count, `pdftoppm -r 110 -png` to
   render pages, and **look at the images** — clipping at the page edge is invisible in the HTML and
   obvious in the render.

**Content is mirrored from the site by hand — keep it that way**

There is deliberately no generator: the CV text was copied from the site source so the two agree, but
nothing keeps them in sync. When either changes, re-copy and re-verify:

- project cards → `src/pages/projects.astro` (title, `desc`, `badge`; all seven, Source Rewards included)
- experience → `src/pages/about.astro` `<TimeLineElement>` title/subtitle/desc, using the site's exact
  date strings ("2022 to present · Ringier South Africa")
- skills → the 28-item `<ul class="list-disc md:columns-5 …">` list, exact labels (the long ones span
  two grid columns via `.wide`)
- certifications → the About page's list; contact/education → the same page
- sidebar "About me" → the **home intro** sentences (`index.astro`), not the full About paragraphs — the
  owner explicitly does not want the long About text in the PDF

Verification that actually catches drift: compare whitespace-insensitively
(`re.sub(r'\s+','',text)`) between each site string and the CV source. Do **not** verify against
`pdftotext -layout` — the sidebar column interleaves into the main column's lines and every long string
appears "missing".

**Design notes** (this layout is the owner's preference — it replaces the old PDF's look, which was
extracted with `pdfimages` and studied page by page):

- A4, margin 0, two sections of exactly 297mm; anything longer clips silently.
- Page 1 body 8.4pt / page 2 8.15pt; project entries carry no role line (the site cards have none).
- Fonts: Georgia for section and project headings, system sans for body — matches the old CV.
- Backups of previous PDFs live in `~/Documents/Resume-Backups/`.

## Open items

- **Publish**: merge `profile-refresh` into `main` when he asks — GitHub Pages then deploys.
- `public/FrancoisGerberResume.pdf` is still the old CV and now disagrees with the site copy.
- Projects/Blog titles sit ~7px left of Home/Store because those pages scroll (scrollbar gutter).
  Cosmetic; fixing means `scrollbar-gutter: stable`, which is a custom-CSS change he may not want.
- `HorizontalCard` renders each project title as an `<h1>` (8 h1s on Projects). Semantic only.
- Backlog menu: tune nav font/pill to match the pre-upgrade look, if he ever wants it.

## Repo conventions

- Branch per change off `main`; commit messages in prose describing the change.
- `npm run build` green is the floor, not the proof — check the rendered page too.
- Push only when asked; never open a PR unless asked.

## Blog post structure — follow this exactly

Every post is `src/content/blog/<slug>.md`. One image only (the hero), never an inline image, and an
audio player as the **first element of the body**, above the intro paragraph.

```markdown
---
title: "Post title"
description: "One sentence that shows on the listing card and in the RSS feed."
pubDate: 2026-10-19
heroImage: "/blog/<slug>.jpg"
---
<audio controls preload="metadata" src="/blog/<slug>-audio.mp3" class="w-full my-4"></audio>

Opening paragraph — no heading above it, no greeting, no "in this post I will".

## Section heading

Body copy. Short paragraphs.

## Another section

More body copy.
```

Rules:

- **Exactly one image**: the `heroImage` file in `public/blog/`, referenced by absolute path. It renders
  as the listing thumbnail and as the banner above the title. No `![]()` inline images, no second file.
- **Audio comes first in the body** — the `<audio …>` line sits directly under the frontmatter, above
  the first paragraph. Keep the attributes as written (`controls preload="metadata"` +
  `class="w-full my-4"`); the file is `public/blog/<slug>-audio.mp3`.
- **Producing the audio**: narrate the post text with Hermes TTS (Piper, British male — `text_to_speech`
  in the default profile), then convert for the web:
  `ffmpeg -y -v error -i <tts.ogg> -codec:a libmp3lame -b:a 64k -ar 44100 public/blog/<slug>-audio.mp3`.
  Strip markdown from the script and skip code blocks; read headings as plain sentences.
- **Structure below the intro**: `##` sections only (the post title is the `h1`), no `#` in the body.
- **Listing/index** picks posts up from frontmatter alone; nothing else to register.
- Full working example: `src/content/blog/hello-world.md` (dummy — delete or replace before publishing).
