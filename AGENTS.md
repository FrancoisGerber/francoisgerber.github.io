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
6. **Home warmth**: emoji string `🧑‍💻 📖 🎮 🌱 🏝️ ☕` inline at the start of the intro paragraph,
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
