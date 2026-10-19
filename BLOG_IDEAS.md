# Blog ideas

Candidate posts for the blog, grouped by category. Nothing here is published yet.
Ordered roughly by how much a technical reader (and a hiring manager) rewards it.

Source material: Hades/Olympus (LLM crawling in Palantir Foundry, 2026), Artemis/Apollo
(dynamic crawling platform at Ringier, 4 years), iRIS (refinery modernisation, 3 years),
Source Rewards, Operational Intelligence Suite (2018 health & safety software award),
Gokedex (Go), TicTacToe (C#), Sudoku.

## 1. Technical deep-dives

- How we crawl 5,000 company websites a day — and what the LLM actually does
  (identification vs extraction vs pagination, and the cost per page)
- Pagination is the hard part: teaching a model to find the next page
- Where prompts still lose to CSS selectors, and where they win

## 2. How I built X

- Rewriting a precious metals refinery's legacy apps into one platform (iRIS:
  PLCs, scales, label printers, engravers, one database)
- Over-engineering Tic-Tac-Toe to learn C# — what abstraction actually bought me
- A crawling platform that non-developers configure: pipelines as user-generated content

## 3. Post-mortems / lessons

- Four years of Artemis/Apollo: what I would rebuild and what I would keep
- The week a pipeline silently dropped a market (pick a real incident, name the fix)
- What broke when the volume went from hundreds to thousands of sites a day

## 4. Stack comparisons I have actually run in production

- Scrapy vs Playwright vs Puppeteer for 5,000 sites (all three, same fleet)
- Palantir Foundry pipelines vs a plain Python job runner: when the platform earns it
- Eight years of .NET full stack, then Python: what transferred and what did not

## 5. Learning in public

- Learning Go by building Gokedex
- MCSD in 2015 vs a 2025 certificate: what a certification is actually worth
- Prompt engineering as a software discipline, not a trick

## 6. Career reflections

- From mining software in Lydenburg to job-market data in Zurich — the domain jumps
- What got me from "the Angular guy" to owning a platform
- Moving to Mauritius and working across time zones (only if comfortable being personal)

## 7. Opinion / industry

- LLM extraction vs hand-written selectors: when each is worth it (four years of evidence)
- Marketplaces run on scraped data — the legal and ethical lines I have had to respect
- Why "it works on 10 sites" is the most dangerous sentence in crawling

## 8. Explainers

- What a data pipeline actually does, explained with a refinery
- Near-realtime crawling: from a URL list to a stakeholder dashboard
- What an LLM cannot do with a web page (yet)

## 9. Talks, papers, open source

- The 2018 health & safety software award: what the OiS did and what it taught me about
  monitoring sensors in the field
- Write-up of the Sudoku app (local-storage only, no backend) as a small-software piece
- Gokedex README as a post: consuming a public API properly, with caching and errors

## 10. Personal / professional-adjacent

- Keep the two existing themes (reading, goals) but publish them below the technical work
- Gardening and long-running systems (a weak analogy, used carefully, once)
- How I run my own homelab: Ollama, Open WebUI, Hermes agents, Piper TTS

## Write these first (highest value per hour)

1. How we crawl 5,000 websites a day (deep-dive, unique experience)
2. Scrapy vs Playwright vs Puppeteer for 5,000 sites (search traffic, defensible)
3. What a data pipeline actually does, explained with a refinery (broadest audience)

Rule: one post per project, written from what actually happened. Three good posts beat
twenty thin ones.

## Notes

- The site tagline and About page were updated to match the current work (Python, Foundry,
  LLM crawling) rather than the older "web and mobile developer" framing.
- Resume PDF in `public/FrancoisGerberResume.pdf` is a separate artefact and still needs to
  agree with the site.
