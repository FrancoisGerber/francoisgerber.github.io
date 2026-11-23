# Working context — Personal Site (francoisgerber.github.io)

Read this first. It captures the state of the site, the decisions taken, and the traps we already hit.
Owner: Francois Gerber (Telegram DM, English, terse — he dislikes long reports and token waste).

## What this repo is

- Astro CV + blog, published by GitHub Pages at <https://francoisgerber.github.io/>.
- Remote `git@github.com:FrancoisGerber/francoisgerber.github.io.git`, default branch `main`.
- **Nothing is public until it reaches `main`** — a pushed branch is a draft. No PRs unless asked.
- Commit on a branch off `main` unless he says otherwise; pushing `main` is what publishes.

## Stack (after the Oct 2026 dependency upgrade)

astro 7.4 · @astrojs/mdx 8.1 · @astrojs/rss 4.0 · @astrojs/sitemap 3.7 · Tailwind 4.3 via
`@tailwindcss/vite` · daisyUI 5.7 with `themes: black --default` · dayjs · @tailwindcss/typography.
Content collections use the Content Layer API (`src/content.config.ts`, `glob()` loaders).
`@astrojs/tailwind` and `tailwind.config.cjs` are gone — Tailwind config lives in `src/styles/global.css`
as `@plugin` directives.

Commands: `npm run dev -- --port 4321` (HMR), `npm run build` (Astro build **plus** CV regeneration —
see the resume section), `npm run resume` (CV only), `npx astro preview --port 4321` (preview serves the
built output — **no** hot reload).

## What was done on this branch

1. **Dependencies** moved to current majors (Astro 2 → 7, Tailwind 3 → 4, daisyUI 2 → 5), with the
   code migration: content layer API, `post.slug` → `post.id`, `render(entry)`, RSS exporting `GET`,
   two malformed `<a>` tags in the About certifications that Astro 7 rejects, `bg-opacity-90` →
   `bg-base-100/90`.
2. **Profile rewritten** to match the current work: site title/description, hero copy, About (four
   concrete paragraphs: Foundry LLM crawler → Ringier crawling platform → refinery/iRIS + OiS →
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
- Specifics over adjectives in all copy; numbers beat claims (5,000 sites/day, 12 mining sites).
- The CV is generated from `dist/`; never reintroduce a hand-mirrored copy of the content.
- Astro pages stay literal. Do not extract page copy into shared data modules or a CMS to make PDF
  generation easier - recovering the text from the compiled output is the cheaper trade.
- `README.md` is a byte-identical copy of the profile repo's README, not generated. He rejected a
  generator: two copies, edited together, verified with `diff -q`.

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

## The resume PDF - generated from the site (read this before touching it)

`public/FrancoisGerberResume.pdf` is generated output, committed so the deployed site always carries a
current copy. Nothing is mirrored by hand any more: the CV's content is read out of the compiled site.

**Pipeline**

1. `npm run build` = `astro build && node scripts/build-resume.mjs`. The script reads `dist/index.html`,
   `dist/about/index.html` and `dist/projects/index.html` and pulls, verbatim and in site order: the home
   tagline, the About summary paragraphs, Details / Education / Experience / Certifications / Skills, and
   the seven project cards (title, duration, description).
2. `resume/cv.template.html` is design only - two A4 `.page` sections (210x297mm, `display:flex`): a
   40%-wide dark sidebar (`#2e2e2e`) with the portrait, the name overlaid in white and boxed
   `ABOUT ME / CONTACT / TOP SKILLS / INTERESTS` headings, plus a 60% main column with serif uppercase
   section headings and a hairline rule. Page 1 = education, work experience, certifications, skills;
   page 2 = Enterprise Solutions. Content slots are `{{PLACEHOLDER}}`.
3. The filled HTML is written to `resume/cv.generated.html` (gitignored) for inspection, then headless
   Chrome prints it over CDP - `Page.printToPDF` with `printBackground`, `preferCSSPageSize` and zero
   margins, because the CSS `@page` size and the dark sidebar are the point. The `--print-to-pdf` CLI flag
   is not equivalent: it applies its own paper size, margins and header/footer.
4. The PDF is written to `public/FrancoisGerberResume.pdf` and copied into `dist/` after the build, so the
   deployed site carries the fresh copy. `npm run resume` runs the script alone against an existing
   `dist/`.

**What lives in the script, not on the site** (`CONFIG` in `scripts/build-resume.mjs`): contact cell,
email, LinkedIn and site links (not published on the site), the six curated top skills, and the interests
list. Top skills are matched against the site's Skills list at build time - renaming a skill on the site
fails the build instead of silently dropping it from the CV. Skill labels longer than 20 characters span
two grid columns, which reproduces the original grid exactly.

**Never edit the CV to fix content.** Change the page, run `npm run build`. `resume/cv.template.html` is
only for design changes.

**Verification** - the build ends with per-page `main overflow` / `side overflow` numbers; anything above
~1px means the A4 page is clipping content (it hides the excess silently, so the PDF still looks
plausible) and the site copy has to shrink. Then look at the pages: `pdfinfo ... | grep -E 'Pages|Page
size'` for 2 pages at 595x842 pts, and `pdftoppm -r 110 -png` to render them, and actually look. Do not
verify with `pdftotext -layout` - the sidebar column interleaves into the main column and every long
string appears "missing".

Backups of older PDFs live in `~/Documents/Resume-Backups/`.

## Open items

- **Publish**: merge `profile-refresh` into `main` when he asks — GitHub Pages then deploys.
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
