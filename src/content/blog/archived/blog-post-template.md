---
title: "Hello, world"
description: "A placeholder post so we can see how the blog looks: typography, header, date line and listing card."
pubDate: 2026-10-19
draft: true
lede: "One line that states the argument, rendered above the body and read first in the audio."
heroImage: "/blog/blog-post-template/blog-post-template.jpg"
---
<audio controls preload="metadata" src="/blog/blog-post-template/blog-post-template-audio.mp3" class="w-full my-4"></audio>

This is a dummy post. It exists only to check how the blog section renders, and it should be
deleted (or replaced) before anything is published.

## Why this page exists

The blog was emptied while the profile was rewritten, which left nothing to look at. A single
placeholder makes the layout observable: the title block, the date line, the divider, and the
typography scale below it.

Some things worth eyeballing:

- body copy size and line height against the rest of the site
- heading rhythm after the divider
- inline `code`, and a block below it
- how a list reads at this width

> A blockquote should look like a quotation, not like a callout box.

```python
def crawl(url: str) -> dict:
    """Pretend this is a tiny excerpt from the crawler."""
    return {"url": url, "status": 200}
```

That is the whole test.

<!--
Archived example. It lives inside the collection so it stays valid against the schema, but it
carries `draft: true` and every page filters `!data.draft`, so it is never built, listed or fed
into the RSS feed. Keep the draft flag on it.

It is the reference shape for a post and the only worked example of one:
frontmatter with title, description, pubDate, an optional lede (one line stating the argument,
rendered above the body) and heroImage, the <audio> line as the very first body element, then
## sections, a list, an inline code sample and a blockquote.

To use it: copy this file to src/content/blog/<slug>.md, put the assets in
public/blog/<slug>/ as <slug>.jpg and <slug>-audio.mp3, point heroImage and the audio src at
/blog/<slug>/<slug>.jpg and /blog/<slug>/<slug>-audio.mp3, drop the draft flag, and replace the copy.
-->

