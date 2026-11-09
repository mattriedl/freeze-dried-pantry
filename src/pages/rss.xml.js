import rss from '@astrojs/rss';
import { SITE } from '../site.config.mjs';
import { getPublishedPosts, postUrl } from '../lib/posts.js';

export async function GET(context) {
  const posts = await getPublishedPosts();
  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site,
    items: posts.slice(0, 50).map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.pubDate,
      link: postUrl(p),
    })),
  });
}
