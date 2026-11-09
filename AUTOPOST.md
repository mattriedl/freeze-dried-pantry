# Autopost instructions (for the scheduled Claude session)

You are publishing ONE new article to this Astro site. Work in the repo root. Do every step; don't ask questions. If something blocks you, stop and report what happened.

## 1. Pick the topic

```
npm ci
node scripts/autopost.mjs next
```

This prints the topic (keyword, secondary keywords, category, type, slug), the file to create, the `pubDate` to use, and the existing articles you may link to. If it prints `{"empty": true}`, the queue is empty: report that and stop.

## 2. Write the article

Create the file it named, e.g. `src/content/posts/<slug>.md`, in exactly this format:

```markdown
---
title: "Under 60 characters, primary keyword near the start"
description: "130-155 characters, includes the primary keyword and the payoff."
keyword: "<topic.keyword>"
secondaryKeywords: ["<each>", "<secondary keyword>"]
category: "<topic.category>"
type: "<topic.type>"
pubDate: <pubDate from step 1, unquoted>
faq:
  - q: "Question people also search for?"
    a: "Direct answer in 1-3 sentences."
---
Body in Markdown starts here (no H1).
```

Use double-quoted strings and escape any inner double quotes with `\"`. Include 4-6 FAQ entries.

**Goal:** be the single most useful page on the internet for the primary keyword, so it earns and keeps a top Google and Bing ranking.

**Content rules**
- Answer the searcher's main question in the first 2-3 sentences, plainly. No throat-clearing intro.
- Cover what the searcher needs next, as relevant: prep, settings or method, how to tell it's done, storage and shelf life, common mistakes, troubleshooting, variations.
- Be specific and practical: quantities, tray loading, thickness, approximate cycle times as ranges, signs of incomplete drying. Note that times vary by machine, load and humidity.
- Food safety is non-negotiable. Follow USDA and manufacturer guidance. Flag high-fat and high-sugar foods that store poorly, how raw meat and eggs must be handled and cooked, and that freeze drying does not kill pathogens. Never give medical, infant-feeding or health-treatment advice.
- Do not invent personal experiences, tests, quotes, statistics, studies, prices or product specs you aren't sure of. Never write "I tested", "we tried", "in my kitchen". Use "typically", "usually", "about" for estimates. For prices give rough ranges and tell readers to check current prices.
- If the keyword reads like a shopping term ("freeze dried X"), write for someone who wants to make it at home, and briefly cover store-bought vs homemade.
- Never mention being an AI. Avoid filler: "delve", "game-changer", "unlock", "elevate", "in today's world", "it's important to note".
- Clear, friendly American English, about an 8th-grade reading level. Short paragraphs (1-3 sentences). Bullet lists, and one comparison or settings table where it genuinely helps.

**SEO rules**
- No H1 in the body. Use 5-9 descriptive `##` sections with `###` where useful. Put the primary keyword (or a close variant) in the first 100 words and in at least one `##`.
- Work secondary keywords in naturally. Never stuff keywords.
- Add 2-5 internal links to articles from `linkableArticles`, using their exact `url` and descriptive anchor text. Never invent internal URLs. No external links.
- Don't repeat the FAQ in the body (no "FAQ" section; the site renders it from frontmatter).
- Length: 1,300-2,200 words of body for how-to and guide topics; up to 2,500 for comparisons and buyer guides. Depth over padding.

## 3. Check it

```
node scripts/autopost.mjs check <slug>
```

If it prints `FAIL`, fix every listed problem and run it again. After two failed fix attempts, run `node scripts/autopost.mjs fail <slug> "<reason>"`, delete the article file, commit only `data/`, push, and report.

Then read your article once as an editor: is every claim accurate and safe? Fix anything you're unsure of by softening or removing it.

## 4. Build, finalize, publish

```
npm run build
node scripts/autopost.mjs finalize <slug>
git add src/content/posts data
git commit -m "Publish: <title>"
git push origin main
```

Never push if the build fails. If the push is rejected, `git pull --rebase origin main` and push again.

## 5. Notify search engines

Skip this step if `src/site.config.mjs` still has `example` in its `url`.

Otherwise wait about 3 minutes for Cloudflare to deploy, then submit the new URL with the OpenSEO `submit_indexnow_urls` tool if it's available. If not, run `node scripts/indexnow.mjs /<slug>/`. If both fail, note it and move on.

## 6. Report

Reply with the article title, its URL path, word count, and anything that went wrong.
