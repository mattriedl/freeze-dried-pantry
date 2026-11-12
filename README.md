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

Live at https://freezedryclub.com, served by **Cloudflare Workers** (static assets) straight from Cloudflare's network.

- On every push to `main`, GitHub Actions (`.github/workflows/deploy-cloudflare.yml`) runs `npm run build` and `wrangler deploy`, publishing `dist/` (needs the repository secret `CLOUDFLARE_API_TOKEN`). Changes go live within about 2 to 3 minutes. **If a build fails, the live site stays on the last good version.** Always run `npm run build` before pushing anyway.
- Settings: `wrangler.jsonc` (pages at `/slug/`, `/slug` redirects there, unknown addresses get `404.html` with a 404 status). Response headers: `public/_headers`. `www.` and `http://` redirect to `https://freezedryclub.com` through Cloudflare rules.
- `public/.htaccess` is only for the old Apache server, which is kept as a fallback; `public/.assetsignore` stops Cloudflare publishing it.
- `.github/workflows/cloudflare-domain.yml` shows which address the domain points to, switches it to the Worker, or rolls it back to the web server.
