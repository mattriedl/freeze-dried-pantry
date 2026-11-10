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
// Categories drive hub pages, breadcrumbs and internal linking.
// seoTitle is the hub's <title>; intro paragraphs give each hub real content.
export const CATEGORIES = {
  basics: {
    name: 'Freeze Drying Basics',
    seoTitle: 'Freeze Drying Basics: How to Freeze Dry at Home',
    description: 'How freeze drying works, what you can freeze dry, storage, shelf life and getting started.',
    intro: [
      'New to home freeze drying? Start here. These guides explain how a home freeze dryer works, which foods are easiest for your first batches, and how to tell when food is truly dry.',
      'You will also find the storage side of freeze drying: Mylar bags, oxygen absorbers, shelf life and rehydrating. Getting those right is what turns a tray of crunchy food into something that lasts for years.',
    ],
  },
  candy: {
    name: 'Freeze Dried Candy',
    seoTitle: 'Freeze Dried Candy: How to Make It at Home',
    description: 'How to freeze dry Skittles, Jolly Ranchers, taffy, marshmallows and more.',
    intro: [
      'Freeze dried candy is the most fun thing a home freeze dryer makes. Warm shelves and a deep vacuum make candy puff up, crack open and turn light and crunchy, often in just a few hours.',
      'These guides cover which candy freeze dries best, the settings that make it puff instead of melt, how to store it so it stays crunchy, and what to do when a batch comes out chewy or sticky.',
    ],
  },
  fruit: {
    name: 'Fruit',
    seoTitle: 'How to Freeze Dry Fruit: Guides by Fruit',
    description: 'Freeze drying strawberries, bananas, apples, berries and other fruit.',
    intro: [
      'Fruit is one of the easiest and most rewarding things to freeze dry. It keeps its color and shape, turns crisp, and makes great snacks, smoothie add-ins and baking powders.',
      'Each guide covers prep, slicing thickness, cycle times, how to tell when the fruit is done and how to store it.',
    ],
  },
  vegetables: {
    name: 'Vegetables & Herbs',
    seoTitle: 'How to Freeze Dry Vegetables and Herbs',
    description: 'Freeze drying potatoes, tomatoes, peppers, herbs and garden harvests.',
    intro: [
      'Freeze drying is a great way to keep a garden harvest. Vegetables and herbs hold their color and flavor and rehydrate well in soups, sauces and casseroles.',
      'These guides cover which vegetables to blanch or cook first, how to cut them, cycle times and storage.',
    ],
  },
  'meat-eggs-dairy': {
    name: 'Meat, Eggs & Dairy',
    seoTitle: 'Freeze Drying Eggs, Meat and Dairy at Home',
    description: 'Freeze drying eggs, meat, cheese, milk, yogurt and other proteins.',
    intro: [
      'Eggs, meat and dairy are where home freeze drying pays off for long-term food storage. Freeze dried eggs, cooked meats and cheese are light, shelf stable and easy to rehydrate.',
      'Proteins also need the most care. Freeze drying does not kill bacteria, so these guides explain how to handle raw foods safely, which foods are too fatty to store long term, and how to rehydrate them.',
    ],
  },
  meals: {
    name: 'Meals & Desserts',
    seoTitle: 'How to Freeze Dry Meals, Leftovers and Desserts',
    description: 'Freeze drying soups, leftovers, ice cream and full meals.',
    intro: [
      'Freeze dry full meals for camping, backpacking, emergencies or easy weeknight dinners. Soups, casseroles, pasta dishes and even ice cream all work in a home freeze dryer.',
      'These guides cover portioning, tray depth, rehydrating and which ingredients shorten storage life.',
    ],
  },
  pets: {
    name: 'Pet Food & Treats',
    seoTitle: 'How to Make Freeze Dried Pet Treats at Home',
    description: 'Making freeze dried dog and cat treats at home.',
    intro: [
      'Make your own freeze dried dog and cat treats from single ingredients like chicken, liver and fish.',
      'These guides cover safe handling of raw meat, portion sizes, drying and storage. Check with your vet before changing your pet\'s diet.',
    ],
  },
  machines: {
    name: 'Freeze Dryers & Gear',
    seoTitle: 'Home Freeze Dryer Guides: Buying, Costs and Repairs',
    description: 'Freeze dryer buyer guides, comparisons, costs, maintenance and repair.',
    intro: [
      'Thinking about buying a home freeze dryer, or trying to get more out of the one you have? These guides compare freeze dryers with dehydrators, break down sizes and running costs, and cover the gear you need.',
      'You will also find maintenance and troubleshooting help, from vacuum pump oil to cycles that won\'t finish.',
    ],
  },
};
