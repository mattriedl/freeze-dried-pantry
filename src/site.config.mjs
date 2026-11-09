// ─────────────────────────────────────────────────────────────
//  SITE SETTINGS — the only file you need to edit before launch.
// ─────────────────────────────────────────────────────────────
export const SITE = {
  // Live domain (no trailing slash).
  url: 'https://freezedryclub.com',
  name: 'Freeze Dry Club',
  tagline: 'Home freeze drying recipes, how-tos and honest buyer guides',
  description:
    'Home freeze drying guides: step-by-step recipes for candy, fruit, eggs, meat and meals, plus freeze dryer buyer guides, fixes and storage tips.',
  author: 'The Freeze Dry Club Team',
  locale: 'en_US',
  // Optional: set once you have them.
  twitter: '',
  contactEmail: 'hello@freezedryclub.com',
  // Amazon Associates tag or similar, used by affiliate links (optional).
  affiliateTag: '',
};

// Categories drive hub pages, breadcrumbs and internal linking.
export const CATEGORIES = {
  basics: {
    name: 'Freeze Drying Basics',
    description: 'How freeze drying works, storage, shelf life and getting started.',
  },
  candy: {
    name: 'Freeze Dried Candy',
    description: 'How to freeze dry Skittles, Jolly Ranchers, taffy, marshmallows and more.',
  },
  fruit: {
    name: 'Fruit',
    description: 'Freeze drying strawberries, bananas, apples, berries and other fruit.',
  },
  vegetables: {
    name: 'Vegetables & Herbs',
    description: 'Freeze drying potatoes, tomatoes, peppers, herbs and garden harvests.',
  },
  'meat-eggs-dairy': {
    name: 'Meat, Eggs & Dairy',
    description: 'Freeze drying eggs, meat, cheese, milk, yogurt and other proteins.',
  },
  meals: {
    name: 'Meals & Desserts',
    description: 'Freeze drying soups, leftovers, ice cream and full meals.',
  },
  pets: {
    name: 'Pet Food & Treats',
    description: 'Making freeze dried dog and cat treats at home.',
  },
  machines: {
    name: 'Freeze Dryers & Gear',
    description: 'Freeze dryer buyer guides, comparisons, costs, maintenance and repair.',
  },
};
