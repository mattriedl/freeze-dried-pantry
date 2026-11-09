# Freeze Dried Pantry

Astro static site with SEO built into every page, plus an automated article pipeline.

## How it works

- **Articles** live in `src/content/posts/*.md`. The file name is the URL (`/how-to-freeze-dry-eggs/`).
- **Keyword queue**: `data/keyword-queue.json` (149 freeze-drying keywords from OpenSEO, highest priority first).
- **Auto-poster**: `.github/workflows/autopost.yml` runs hourly. `scripts/generate-post.mjs` decides on a randomized schedule whether to post this hour, writes the next article with the Claude API, runs quality checks (length, structure, keyword placement, no fake first-hand claims, no broken internal links), builds the site, commits, and pings IndexNow.
- **Cloudflare Pages** rebuilds the site on every push.

## Built-in SEO

Per-page title, meta description, canonical URL, Open Graph/Twitter tags · JSON-LD (Organization, WebSite, BlogPosting, BreadcrumbList, FAQPage, CollectionPage) · XML sitemap with lastmod · robots.txt · RSS · table of contents · category hub pages · automatic related-post internal links · IndexNow for Bing · fast static HTML with no client JavaScript.

## Settings

| Where | Name | What it does |
|---|---|---|
| `src/site.config.mjs` | `url`, `name`, `contactEmail` | Your domain and brand. Change before launch. |
| GitHub secret | `ANTHROPIC_API_KEY` | Claude API key used to write articles |
| GitHub variable | `AUTOPOST_ENABLED` | `true` turns on hourly auto-posting |
| GitHub variable | `POSTS_PER_DAY` | Average posts per day (default `1`) |
| GitHub variable | `REVIEW_MODE` | `true` opens a pull request per article instead of publishing |
| GitHub variable | `ANTHROPIC_MODEL` | Optional model override (default `claude-sonnet-5-5`) |

## Commands

```
npm run dev                         # local preview at http://localhost:4321
npm run build                       # build to dist/
npm run generate                    # write one article now (needs ANTHROPIC_API_KEY)
node scripts/generate-post.mjs --dry-run              # show the next prompt, no API call
node scripts/generate-post.mjs --keyword "how to freeze dry meat"
```

## Cloudflare Pages build settings

Framework preset: Astro · Build command: `npm run build` · Output directory: `dist` · Environment variable `NODE_VERSION=22`.
