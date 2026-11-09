import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import { SITE } from './src/site.config.mjs';

// lastmod for each article, read from its frontmatter, so search engines recrawl updated pages.
const lastmod = {};
for (const f of fs.existsSync('src/content/posts') ? fs.readdirSync('src/content/posts') : []) {
  const src = fs.readFileSync(`src/content/posts/${f}`, 'utf8');
  const d = src.match(/^updatedDate:\s*(.+)$/m)?.[1] ?? src.match(/^pubDate:\s*(.+)$/m)?.[1];
  if (d) lastmod[f.replace(/\.md$/, '')] = new Date(d.replace(/"/g, '')).toISOString();
}

export default defineConfig({
  site: SITE.url,
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      serialize(item) {
        const slug = new URL(item.url).pathname.replace(/^\/|\/$/g, '');
        if (lastmod[slug]) item.lastmod = lastmod[slug];
        return item;
      },
    }),
  ],
  markdown: {
    shikiConfig: { theme: 'github-light' },
  },
});
