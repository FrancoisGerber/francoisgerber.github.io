#!/usr/bin/env node
/**
 * Builds public/FrancoisGerberResume.pdf from the COMPILED site.
 *
 * Source of truth for the CV is the website itself: this script reads the
 * Astro output in dist/ (home, about, projects), pulls the tagline, About
 * summary, details, education, experience, certifications, skills and project
 * cards out of the rendered HTML, drops them into resume/cv.template.html and
 * prints the result to A4 PDF with headless Chrome.
 *
 * Consequence: change the pages, never the CV. `npm run build` runs this after
 * `astro build`; `npm run resume` runs it alone (requires a fresh dist/).
 *
 * Design is in resume/cv.template.html. Curated CV-only bits (contact details
 * that are not published on the site, the six top skills, interests) are in
 * CONFIG below.
 */
import { readFile, writeFile, mkdtemp, rm, stat } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import os from 'node:os';
import * as cheerio from 'cheerio';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const CONFIG = {
  // Not published on the site — keep here.
  contact: {
    cell: '+230 5823 9682',
    email: 'fagerber123@gmail.com',
    linkedin: { label: 'LinkedIn', url: 'https://www.linkedin.com/in/francois-antonie-gerber/' },
    site: { label: 'Online Profile & Blog', url: 'https://francoisgerber.github.io' },
  },
  // Curated shortlist of the site's Skills list (the site has all 28, the CV
  // sidebar only has room for six). `match` must exist on the site; `label` is
  // what gets printed.
  topSkills: [
    '.NET',
    'C#',
    'Python',
    'Palantir Foundry',
    'LLM Extraction & Prompting',
    { label: 'Web Scraping', match: 'Web Scraping (Scrapy, Playwright, Puppeteer)' },
  ],
  // The home page emoji row, spelled out.
  interests: ['Coding', 'Reading', 'Gaming', 'Gardening', 'Island life', 'Coffee'],
  // Skill labels longer than this span two grid columns in the CV.
  wideSkillChars: 20,
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const squash = (s) => String(s).replace(/\s+/g, ' ').trim();

/** Emoji and their joiners do not belong in the printed CV. */
const stripEmoji = (s) =>
  String(s)
    .replace(/[\u{1F000}-\u{1FAFF}\u{2190}-\u{21FF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

function readDist(rel) {
  const p = path.join(ROOT, 'dist', rel);
  if (!existsSync(p)) {
    throw new Error(
      `dist/${rel} is missing — the CV is built from the compiled site. Run \`npm run build\` (or \`npx astro build\`) first.`
    );
  }
  return readFileSync(p, 'utf8');
}

/** Home page: the tagline that sits under the h1. */
function extractTagline(html) {
  const $ = cheerio.load(html);
  const tagline = squash($('main h1').first().nextAll('div').first().text());
  if (!tagline) throw new Error('Could not find the home page tagline under the h1.');
  return tagline;
}

/**
 * About page. Section headings are `div.text-3xl`; the block they describe is
 * that heading's wrapper's next sibling.
 */
function extractAbout(html) {
  const $ = cheerio.load(html);

  const introEl = $('main div.text-justify').first();
  if (!introEl.length) throw new Error('Could not find the About intro paragraph block.');
  introEl.find('br').replaceWith('\n\n');
  const paragraphs = introEl
    .text()
    .split(/\n{2,}/)
    .map(squash)
    .filter(Boolean);

  const sections = {};
  $('main div.text-3xl').each((_, el) => {
    const name = squash($(el).text());
    // The heading sits in its own wrapper div; the block it labels is the
    // wrapper's next sibling.
    const holder = $(el).parent();
    const block = holder.is('main') ? $(el).next() : holder.next();
    if (name && block.length) sections[name] = block;
  });

  const timeline = (block) => {
    if (!block) return [];
    const out = [];
    block.find('.experience__data').each((_, el) => {
      const $el = $(el);
      const title = squash($el.find('h3').first().text());
      const meta = squash($el.find('span').first().text());
      const desc = squash($el.find('p').first().text());
      if (title) out.push({ title, meta, desc });
    });
    return out;
  };

  const list = (block) => {
    if (!block) return [];
    return block
      .find('li')
      .map((_, li) => squash($(li).text()))
      .get()
      .filter(Boolean);
  };

  const required = ['Details', 'Education', 'Experience', 'Certifications', 'Skills'];
  const missing = required.filter((k) => !sections[k]);
  if (missing.length) throw new Error(`About page is missing section(s): ${missing.join(', ')}`);

  const details = timeline(sections.Details);
  const locationEntry = details.find((d) => /^location$/i.test(d.title));
  if (!locationEntry) throw new Error('About page has no "Location" entry in Details.');

  return {
    paragraphs,
    location: locationEntry.meta,
    education: timeline(sections.Education),
    experience: timeline(sections.Experience),
    certifications: list(sections.Certifications),
    skills: list(sections.Skills),
  };
}

/** Projects page: every HorizontalCard is one .hero-content block. */
function extractProjects(html) {
  const $ = cheerio.load(html);
  const out = [];
  $('main .hero-content').each((_, el) => {
    const $el = $(el);
    const h1 = $el.find('h1').first();
    const title = squash(h1.clone().find('.badge').remove().end().text());
    const duration = squash($el.find('.badge-secondary').first().text());
    const desc = squash($el.find('p').first().text());
    if (title) out.push({ title, duration, desc });
  });
  if (!out.length) throw new Error('Could not find any project cards on the Projects page.');
  return out;
}

function orgBlock({ title, meta, desc }) {
  const lines = [
    '<div class="org">',
    `  <p class="title">${esc(title)}</p>`,
  ];
  if (meta) lines.push(`  <p class="meta">${esc(meta)}</p>`);
  if (desc) lines.push(`  <p>${esc(desc)}</p>`);
  lines.push('</div>');
  return lines.join('\n');
}

function buildHtml({ tagline, about, projects, template }) {
  const topSkills = CONFIG.topSkills.map((s) =>
    typeof s === 'string' ? { label: s, match: s } : { label: s.label, match: s.match || s.label }
  );
  const missing = topSkills.filter((s) => !about.skills.includes(s.match));
  if (missing.length) {
    throw new Error(
      `Top skill(s) no longer on the site's Skills list: ${missing.map((s) => s.match).join(' | ')} — update CONFIG.topSkills in scripts/build-resume.mjs.`
    );
  }

  const contact = [
    `<p>Location: ${esc(about.location)}</p>`,
    `<p>Cell: ${esc(CONFIG.contact.cell)}</p>`,
    `<p>Email: ${esc(CONFIG.contact.email)}</p>`,
    `<p><a href="${esc(CONFIG.contact.linkedin.url)}">${esc(CONFIG.contact.linkedin.label)}</a></p>`,
    `<p><a href="${esc(CONFIG.contact.site.url)}">${esc(CONFIG.contact.site.label)}</a></p>`,
  ].join('\n        ');

  const skills = about.skills
    .map((s) => {
      const wide = s.length > CONFIG.wideSkillChars ? ' class="wide"' : '';
      return `<div${wide}>${esc(s)}</div>`;
    })
    .join('');

  const projectsHtml = projects
    .map((p) =>
      [
        '<div class="proj">',
        `  <h4>${esc(p.title)}</h4>`,
        p.duration ? `  <p class="dur">${esc(p.duration)}</p>` : '',
        `  <p>${esc(p.desc)}</p>`,
        '</div>',
      ]
        .filter(Boolean)
        .join('\n')
    )
    .join('\n\n    ');

  const values = {
    TAGLINE: esc(stripEmoji(tagline)),
    ABOUT: about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('\n        '),
    CONTACT: contact,
    TOP_SKILLS: topSkills.map((s) => `<li>${esc(s.label)}</li>`).join('\n          '),
    INTERESTS: CONFIG.interests.map((s) => `<li>${esc(s)}</li>`).join('\n          '),
    EDUCATION: about.education.map(orgBlock).join('\n    '),
    EXPERIENCE: about.experience.map(orgBlock).join('\n    '),
    CERTIFICATIONS: about.certifications.map((c) => `<li>${esc(c)}</li>`).join('\n      '),
    SKILLS: skills,
    PROJECTS: projectsHtml,
  };

  let html = template;
  for (const [key, value] of Object.entries(values)) {
    if (!html.includes(`{{${key}}}`)) throw new Error(`Template has no {{${key}}} placeholder.`);
    html = html.split(`{{${key}}}`).join(value);
  }
  const leftover = html.match(/\{\{[A-Z_]+\}\}/g);
  if (leftover) throw new Error(`Unfilled template placeholder(s): ${leftover.join(', ')}`);
  return html;
}

/* ------------------------------ printing ------------------------------ */

function findChrome() {
  const names = [
    'google-chrome-stable',
    'google-chrome',
    'chromium',
    'chromium-browser',
    'brave-browser',
    'brave',
    'microsoft-edge',
  ];
  for (const name of names) {
    try {
      const p = execFileSync('which', [name], { encoding: 'utf8' }).trim();
      if (p && existsSync(p)) return p;
    } catch {
      /* not installed */
    }
  }
  for (const p of [
    '/usr/bin/google-chrome-stable',
    '/opt/google/chrome/chrome',
    '/usr/bin/brave-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ]) {
    if (existsSync(p)) return p;
  }
  return null;
}

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.listeners = new Map();
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(`${msg.error.message} (${msg.error.code})`));
        else resolve(msg.result);
      } else if (msg.method) {
        const set = this.listeners.get(msg.method);
        if (set) [...set].forEach((fn) => fn(msg.params));
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  once(method) {
    return new Promise((resolve) => {
      const fn = (params) => {
        this.listeners.get(method).delete(fn);
        resolve(params);
      };
      if (!this.listeners.has(method)) this.listeners.set(method, new Set());
      this.listeners.get(method).add(fn);
    });
  }
  close() {
    try {
      this.ws.close();
    } catch {
      /* already gone */
    }
  }
}

async function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', () => reject(new Error('Could not open the Chrome devtools socket')), {
      once: true,
    });
  });
  return new CDP(ws);
}

async function printToPdf(htmlPath, outPath) {
  const bin = findChrome();
  if (!bin) return { ok: false, reason: 'no Chrome/Chromium binary found' };

  const profile = await mkdtemp(path.join(os.tmpdir(), 'cv-chrome-'));
  const proc = spawn(
    bin,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-sync',
      '--force-device-scale-factor=1',
      `--user-data-dir=${profile}`,
      '--remote-debugging-port=0',
      'about:blank',
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] }
  );
  let stderr = '';
  proc.stderr.on('data', (d) => {
    stderr += d.toString();
  });

  const cleanup = async () => {
    try {
      proc.kill('SIGTERM');
    } catch {
      /* already dead */
    }
    await sleep(150);
    await rm(profile, { recursive: true, force: true }).catch(() => {});
  };

  try {
    const portFile = path.join(profile, 'DevToolsActivePort');
    let port = null;
    for (let i = 0; i < 200; i++) {
      if (existsSync(portFile)) {
        const line = (await readFile(portFile, 'utf8')).split('\n')[0].trim();
        if (line) {
          port = Number(line);
          break;
        }
      }
      if (proc.exitCode !== null) throw new Error(`Chrome exited early:\n${stderr}`);
      await sleep(100);
    }
    if (!port) throw new Error(`Chrome never opened a debugging port.\n${stderr}`);

    const url = pathToFileURL(htmlPath).href;
    const res = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, {
      method: 'PUT',
    });
    if (!res.ok) throw new Error(`Chrome refused to open a tab: HTTP ${res.status}`);
    const target = await res.json();

    const cdp = await connect(target.webSocketDebuggerUrl);
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Emulation.setEmulatedMedia', { media: 'print' });

    const evaluate = async (expression) => {
      const r = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.text || 'evaluation failed');
      return r.result.value;
    };

    // Wait for load + images (the portrait) before measuring or printing.
    for (let i = 0; i < 100; i++) {
      const ready = await evaluate(
        `document.readyState === 'complete' && [...document.images].every(i => i.complete && i.naturalWidth > 0)`
      );
      if (ready) break;
      await sleep(100);
    }

    const layout = JSON.parse(
      await evaluate(`(() => {
        const px2mm = 25.4 / 96;
        return JSON.stringify([...document.querySelectorAll('.page')].map((p, i) => {
          const page = p.getBoundingClientRect();
          const main = p.querySelector('.main');
          const side = p.querySelector('.side');
          const sideBody = p.querySelector('.side-body');
          const mainRect = main ? main.getBoundingClientRect() : page;
          const bodyRect = sideBody ? sideBody.getBoundingClientRect() : page;
          return {
            page: i + 1,
            heightMm: +(page.height * px2mm).toFixed(1),
            mainOverflowPx: Math.round(Math.max(0, mainRect.bottom - page.bottom)),
            sideOverflowPx: Math.round(
              Math.max(0, side ? side.scrollHeight - side.clientHeight : 0, bodyRect.bottom - page.bottom)
            ),
          };
        }));
      })()`)
    );

    const { data } = await cdp.send('Page.printToPDF', {
      printBackground: true,
      preferCSSPageSize: true,
      scale: 1,
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
    });
    await writeFile(outPath, Buffer.from(data, 'base64'));
    cdp.close();
    await cleanup();
    return { ok: true, layout };
  } catch (err) {
    await cleanup();
    throw err;
  }
}

/* -------------------------------- main -------------------------------- */

const templatePath = path.join(ROOT, 'resume', 'cv.template.html');
const generatedHtml = path.join(ROOT, 'resume', 'cv.generated.html');
const publicPdf = path.join(ROOT, 'public', 'FrancoisGerberResume.pdf');
const distPdf = path.join(ROOT, 'dist', 'FrancoisGerberResume.pdf');

async function main() {
  const tagline = extractTagline(readDist('index.html'));
  const about = extractAbout(readDist(path.join('about', 'index.html')));
  const projects = extractProjects(readDist(path.join('projects', 'index.html')));
  const template = await readFile(templatePath, 'utf8');

  const html = buildHtml({ tagline, about, projects, template });
  await writeFile(generatedHtml, html);

  console.log(`resume: ${about.experience.length} experience entries, ${projects.length} projects, ${about.skills.length} skills`);

  const result = await printToPdf(generatedHtml, publicPdf);
  if (!result.ok) {
    console.warn(
      `resume: SKIPPED PDF — ${result.reason}. public/FrancoisGerberResume.pdf is untouched (last committed copy).`
    );
    return 0;
  }

  const overflow = result.layout.filter((p) => p.mainOverflowPx > 1 || p.sideOverflowPx > 1);
  for (const p of result.layout) {
    console.log(
      `resume: page ${p.page} ${p.heightMm}mm  main overflow ${p.mainOverflowPx}px  side overflow ${p.sideOverflowPx}px`
    );
  }
  if (overflow.length) {
    console.error(
      `resume: CONTENT CLIPPED on page ${overflow.map((p) => p.page).join(', ')} — the A4 page hides the excess silently. Shorten the source text on the site.`
    );
  }

  if (existsSync(path.join(ROOT, 'dist'))) {
    await writeFile(distPdf, await readFile(publicPdf));
  }

  const size = (await stat(publicPdf)).size;
  console.log(`resume: wrote public/FrancoisGerberResume.pdf (${(size / 1024).toFixed(0)} KB)`);
  return overflow.length ? 1 : 0;
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error(`resume: FAILED — ${err.message}`);
    process.exit(1);
  });
