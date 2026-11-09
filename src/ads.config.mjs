// ─────────────────────────────────────────────────────────────
//  AD SLOTS — paste each banner's HTML/JS code between the backticks.
//  An empty slot renders nothing, so pages stay clean until an ad is added.
//  Every slot reserves its full height so the page never jumps while ads load
//  (that protects Google's Core Web Vitals / page experience scores).
//  Optional mobileWidth/mobileHeight + data-gb-spot-mobile swap in a smaller
//  banner on phones (screens under 500px wide).
// ─────────────────────────────────────────────────────────────
// BannerPromote embed script. Loaded once per article page; it fills every
// data-gb-spot on the page by itself. Set to '' to turn all ads off.
export const AD_SCRIPT = 'https://bannerpromote.com/embed.js.php';

export const ADS = {
  // In the article, right after the intro (before the first section). All devices.
  // A short horizontal banner, so the article clearly continues below it:
  // 468x60 on tablets and desktops, 320x50 on phones (screens under 500px).
  afterIntro: {
    width: 468,
    height: 60,
    mobileWidth: 320,
    mobileHeight: 50,
    code: `<div data-gb-spot="full-banner" data-gb-spot-mobile="mobile-banner"></div>`,
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
