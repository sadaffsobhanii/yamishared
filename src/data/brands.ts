import type { Profile } from '../types'

export type Product = {
  generic: string
  brandName: string
  price: number
  keys: string[]
}

export const PRODUCTS: Product[] = [
  {
    generic: 'cottage cheese',
    brandName: 'Good Culture 2% Low-Fat Classic Cottage Cheese',
    price: 4.99,
    keys: ['cottage cheese'],
  },
  {
    generic: 'Greek yogurt',
    brandName: 'Chobani Nonfat Plain Greek Yogurt',
    price: 5.49,
    keys: ['greek yogurt', 'yogurt'],
  },
  {
    generic: 'eggs',
    brandName: 'Vital Farms Pasture-Raised Eggs',
    price: 6.49,
    keys: ['eggs', 'egg'],
  },
  {
    generic: 'oat milk',
    brandName: 'Oatly Original Oatmilk',
    price: 4.99,
    keys: ['oat milk', 'oatmilk'],
  },
  {
    generic: 'overnight oats',
    brandName: "Bob's Red Mill Old Fashioned Rolled Oats",
    price: 5.29,
    keys: ['overnight oats', 'rolled oats', 'oats'],
  },
  {
    generic: 'gluten-free oats',
    brandName: "Bob's Red Mill Gluten Free Rolled Oats",
    price: 6.99,
    keys: ['gluten-free oats', 'gluten free oats'],
  },
  {
    generic: 'bananas',
    brandName: 'Dole Bananas',
    price: 1.49,
    keys: ['bananas', 'banana'],
  },
  {
    generic: 'dark chocolate',
    brandName: 'Ghirardelli Intense Dark Chocolate Squares',
    price: 5.79,
    keys: ['dark chocolate', 'chocolate'],
  },
  {
    generic: 'baby spinach',
    brandName: 'Organic Girl Baby Spinach',
    price: 4.99,
    keys: ['baby spinach', 'spinach'],
  },
  {
    generic: 'fresh berries',
    brandName: "Driscoll's Blueberries",
    price: 4.99,
    keys: ['fresh berries', 'berries', 'blueberries', 'frozen berries'],
  },
  {
    generic: 'herbal tea',
    brandName: 'Traditional Medicinals Organic Peppermint Tea',
    price: 5.99,
    keys: ['herbal tea', 'tea'],
  },
  {
    generic: 'lemons',
    brandName: 'Sunkist Lemons',
    price: 3.49,
    keys: ['lemons', 'lemon'],
  },
  {
    generic: 'olive oil',
    brandName: 'California Olive Ranch Extra Virgin Olive Oil',
    price: 9.99,
    keys: ['olive oil'],
  },
  {
    generic: 'firm tofu',
    brandName: 'Nasoya Organic Firm Tofu',
    price: 2.79,
    keys: ['firm tofu', 'tofu'],
  },
  {
    generic: 'apples',
    brandName: 'Envy Apples',
    price: 5.99,
    keys: ['apples', 'apple'],
  },
  {
    generic: 'whole-grain bread',
    brandName: "Dave's Killer Bread 21 Whole Grains and Seeds",
    price: 5.99,
    keys: ['whole-grain bread', 'whole grain bread', 'bread'],
  },
  {
    generic: 'whole-grain pita',
    brandName: "Joseph's Flax, Oat Bran & Whole Wheat Pita Bread",
    price: 4.49,
    keys: ['whole-grain pita', 'pita'],
  },
  {
    generic: 'peanut butter',
    brandName: 'Santa Cruz Organic Dark Roasted Creamy Peanut Butter',
    price: 6.99,
    keys: ['peanut butter'],
  },
  {
    generic: 'sunflower seed butter',
    brandName: 'SunButter No Sugar Added Sunflower Butter',
    price: 7.49,
    keys: ['sunflower seed butter', 'sunflower butter', 'sunbutter'],
  },
  {
    generic: 'gluten-free bread',
    brandName: 'Canyon Bakehouse Heritage Style Honey White',
    price: 6.79,
    keys: ['gluten-free bread', 'gluten free bread'],
  },
  {
    generic: 'corn tortillas',
    brandName: 'La Banderita Yellow Corn Tortillas',
    price: 2.99,
    keys: ['corn tortillas'],
  },
  {
    generic: 'tortillas',
    brandName: 'Mission Soft Taco Flour Tortillas',
    price: 3.29,
    keys: ['tortillas', 'flour tortillas'],
  },
  {
    generic: 'hummus',
    brandName: 'Sabra Classic Hummus',
    price: 4.49,
    keys: ['hummus'],
  },
  {
    generic: 'dried lentils',
    brandName: "Bob's Red Mill Green Lentils",
    price: 3.49,
    keys: ['dried lentils', 'lentils'],
  },
]

function includesTerm(haystack: string, needle: string) {
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`\\b${escaped}\\b`, 'i').test(haystack)
}

export function matchProduct(text: string): Product | null {
  const q = text.toLowerCase().trim()
  let best: Product | null = null
  let bestLen = 0
  for (const product of PRODUCTS) {
    if (product.generic === 'gluten-free oats' && /\bgluten[- ]free oats\b/i.test(q)) {
      return product
    }
    for (const key of product.keys) {
      if (includesTerm(q, key) && key.length > bestLen) {
        best = product
        bestLen = key.length
      }
    }
  }
  if (best?.generic === 'overnight oats' && /gluten[- ]free oats/i.test(q)) {
    return PRODUCTS.find((product) => product.generic === 'gluten-free oats') ?? best
  }
  return best
}

type StoreRecord = {
  label: string
  home: string | null
  search: ((query: string) => string) | null
}

const enc = encodeURIComponent

const STORE_DIRECTORY: { names: string[]; store: StoreRecord }[] = [
  {
    names: ['target'],
    store: {
      label: 'Target',
      home: 'https://www.target.com/',
      search: (query) => `https://www.target.com/s?searchTerm=${enc(query)}`,
    },
  },
  {
    names: ['walmart'],
    store: {
      label: 'Walmart',
      home: 'https://www.walmart.com/',
      search: (query) => `https://www.walmart.com/search?q=${enc(query)}`,
    },
  },
  {
    names: ['whole foods', 'wholefoods'],
    store: {
      label: 'Whole Foods',
      home: 'https://www.wholefoodsmarket.com/',
      search: (query) => `https://www.wholefoodsmarket.com/search?text=${enc(query)}`,
    },
  },
  {
    names: ["trader joe's", 'trader joes', 'trader joe'],
    store: {
      label: "Trader Joe's",
      home: 'https://www.traderjoes.com/',
      search: (query) => `https://www.traderjoes.com/home/search?q=${enc(query)}`,
    },
  },
  {
    names: ['kroger'],
    store: {
      label: 'Kroger',
      home: 'https://www.kroger.com/',
      search: (query) => `https://www.kroger.com/search?query=${enc(query)}`,
    },
  },
  {
    names: ['costco'],
    store: {
      label: 'Costco',
      home: 'https://www.costco.com/',
      search: (query) => `https://www.costco.com/s?keyword=${enc(query)}`,
    },
  },
  {
    names: ['safeway'],
    store: {
      label: 'Safeway',
      home: 'https://www.safeway.com/',
      search: (query) => `https://www.safeway.com/shop/search-results.html?q=${enc(query)}`,
    },
  },
  {
    names: ['my local grocery store', 'local grocery store'],
    store: { label: 'your local store', home: null, search: null },
  },
]

export function resolveStore(profile: Profile): StoreRecord {
  const typed = profile.shopStoreCustom.trim()
  const chosen = (typed || profile.shopStore).toLowerCase()
  const found = STORE_DIRECTORY.find((entry) => entry.names.some((name) => chosen === name || chosen.includes(name)))
  if (found) {
    if (typed && found.store.label !== 'your local store') return found.store
    if (!typed) return found.store
  }
  if (typed) return { label: typed, home: null, search: null }
  return { label: 'your store', home: null, search: null }
}

export function productSearchUrl(profile: Profile, brandName: string): string | null {
  return resolveStore(profile).search?.(brandName) ?? null
}

export function orderUrl(profile: Profile, instacartConnected: boolean): string | null {
  if (instacartConnected) return 'https://www.instacart.com/'
  return resolveStore(profile).home
}

export function formatPrice(price: number) {
  return `$${price.toFixed(2)}`
}
