# Freeze Dry Club (freezedryclub.com)

Astro static site with SEO built into every page, plus an automated article pipeline.

## How it works

- **Articles** live in `src/content/posts/*.md`. The file name is the URL (`/how-to-freeze-dry-eggs/`).
- **Keyword queue**: `data/keyword-queue.json` (149 freeze-drying keywords from OpenSEO, highest priority first).
- **Auto-poster**: a scheduled Claude task opens this repo, follows `AUTOPOST.md`, writes the next article from the queue, runs `scripts/autopost.mjs check` (length, structure, keyword placement, no fake first-hand claims, no broken internal links), builds, commits, pushes and notifies Bing via IndexNow. No paid API is involved.
- **Deployment**: see below. Pushing to `main` is all it takes.

## Built-in SEO

Per-page title, meta description, canonical URL, Open Graph/Twitter tags · JSON-LD (Organization, WebSite, BlogPosting, BreadcrumbList, FAQPage, CollectionPage) · XML sitemap with lastmod · robots.txt · RSS · table of contents · category hub pages · automatic related-post internal links · IndexNow for Bing · fast static HTML with no client JavaScript.

## Settings

| Where | Name | What it does |
|---|---|---|
| `src/site.config.mjs` | `url`, `name`, `contactEmail` | Your domain and brand. Change before launch. |
| `AUTOPOST.md` | writing rules | The instructions every scheduled run follows. Edit to change tone, length or rules. |
| `data/keyword-queue.json` | `priority`, `status` | Which topic is next. Add keywords here to extend the queue. |

## Commands

```
npm run dev                         # local preview at http://localhost:4321
npm run build                       # build to dist/
node scripts/autopost.mjs next      # show the next topic and linkable articles
node scripts/autopost.mjs check <slug>
```

## Deployment

Live at https://freezedryclub.com, hosted on Matt's own Ubuntu 24.04 / Apache web server behind Cloudflare (SSL: Let's Encrypt at the origin, auto-renewing).

- The server checks this repo's `main` branch **every 2 minutes**. When it finds a new commit it pulls, runs the build (Node.js 22 on the server) and publishes `dist/`. Changes go live within about 2 minutes.
- **If a build fails, the live site stays on the last good version.** Always run `npm run build` before pushing anyway.
- `www.` and `http://` redirect to `https://freezedryclub.com`. Site-level rules (trailing-slash redirect, 404 page, caching headers, compression) live in `public/.htaccess` and deploy with the site; the Apache virtual host itself is managed on the server.
- There is no GitHub Actions deploy; nothing in this repo needs server credentials.
