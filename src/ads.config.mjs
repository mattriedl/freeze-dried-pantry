// ─────────────────────────────────────────────────────────────
//  AD SLOTS — paste each banner's HTML/JS code between the backticks.
//  An empty slot renders nothing, so pages stay clean until an ad is added.
//  Every slot reserves its full height so the page never jumps while ads load
//  (that protects Google's Core Web Vitals / page experience scores).
// ─────────────────────────────────────────────────────────────
// BannerPromote embed script. Loaded once per article page; it fills every
// data-gb-spot on the page by itself. Set to '' to turn all ads off.
export const AD_SCRIPT = 'https://bannerpromote.com/embed.js.php';

export const ADS = {
  // In the article, right after the intro (before the first section). All devices.
  afterIntro: {
    width: 300,
    height: 250,
    code: `<div data-gb-spot="medium-rectangle"></div>`,
  },
  // In the middle of the article (before the 4th section). All devices.
  midArticle: {
    width: 300,
    height: 250,
    code: `<div data-gb-spot="medium-rectangle"></div>`,
  },
  // Desktop sidebar, under "On this page". Hidden on phones and tablets.
  sidebar: {
    width: 300,
    height: 250,
    code: `<div data-gb-spot="medium-rectangle"></div>`,
  },
};
