import { SITE } from '../site.config.mjs';

export function GET() {
  return new Response(
    `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap-index.xml\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
}
