import type { Nutrition, Per100 } from './usda'

// Packaged snacks and drinks: read the barcode from a photo, then look it up in Open Food Facts (free and open).
// https://openfoodfacts.github.io/openfoodfacts-server/api/

type Detector = { detect: (image: ImageBitmapSource) => Promise<{ rawValue: string }[]> }
type ZxingReader = { decodeFromImageUrl: (url: string) => Promise<{ getText: () => string }> }

const ZXING = 'https://cdn.jsdelivr.net/npm/@zxing/library@0.21.3/umd/index.min.js'

function loadScript(src: string) {
  if (document.querySelector(`script[src="${src}"]`)) return Promise.resolve()
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Could not load the barcode reader'))
    document.head.appendChild(script)
  })
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not open the photo'))
    img.src = src
  })
}

// Uses the phone's built-in barcode reader when it has one (Android Chrome), otherwise a small library.
export async function readBarcode(src: string): Promise<string | null> {
  const Native = (window as unknown as { BarcodeDetector?: new (opts: { formats: string[] }) => Detector }).BarcodeDetector
  if (Native) {
    try {
      const found = await new Native({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] }).detect(await loadImage(src))
      if (found[0]?.rawValue) return found[0].rawValue
    } catch {
      // Fall through to the library.
    }
  }
  try {
    await loadScript(ZXING)
    const lib = (window as unknown as { ZXing?: { BrowserMultiFormatReader: new () => ZxingReader } }).ZXing
    if (!lib) return null
    const result = await new lib.BrowserMultiFormatReader().decodeFromImageUrl(src)
    return result.getText()
  } catch {
    return null
  }
}

type OffProduct = {
  product_name?: string
  brands?: string
  serving_size?: string
  serving_quantity?: number | string
  nutriments?: Record<string, number | string | undefined>
}

export async function lookupBarcode(code: string): Promise<Nutrition | null> {
  const digits = code.replace(/\D/g, '')
  if (digits.length < 8) return null
  const fields = 'product_name,brands,serving_size,serving_quantity,nutriments'
  const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${digits}.json?fields=${fields}`)
  if (!response.ok) return null
  const data = (await response.json()) as { status?: number; product?: OffProduct }
  const product = data.product
  if (data.status !== 1 || !product?.nutriments) return null
  const n = product.nutriments
  const num = (key: string) => {
    const value = Number(n[key])
    return Number.isFinite(value) ? value : 0
  }
  const per100: Per100 = {
    calories: num('energy-kcal_100g'),
    protein: num('proteins_100g'),
    fat: num('fat_100g'),
    carbs: num('carbohydrates_100g'),
    fiber: num('fiber_100g'),
    sugar: num('sugars_100g'),
    sodium: num('sodium_100g') * 1000,
  }
  const grams = Number(product.serving_quantity) || 100
  const brand = product.brands?.split(',')[0]?.trim()
  const title = product.product_name?.trim() || 'Packaged food'
  // Skip the brand when the product name already says it ("Coca-Cola Original", not "COCA-COLA SERVICES SA/NV Coca-Cola Original").
  const brandWord = brand?.split(/\s+/)[0]?.toLowerCase()
  const name = brand && brandWord && !title.toLowerCase().includes(brandWord) ? `${brand} ${title}` : title
  const round = (value: number, digits = 0) => Math.round(value * 10 ** digits) / 10 ** digits
  const k = grams / 100
  return {
    source: 'Open Food Facts',
    name,
    match: name,
    fdcId: 0,
    grams: Math.round(grams),
    portion: product.serving_size ? `one serving (${product.serving_size})` : '100 g',
    calories: round(per100.calories * k),
    protein: round(per100.protein * k, 1),
    fat: round(per100.fat * k, 1),
    carbs: round(per100.carbs * k, 1),
    fiber: round(per100.fiber * k, 1),
    sugar: round(per100.sugar * k, 1),
    sodium: round(per100.sodium * k),
    per100,
    link: `https://world.openfoodfacts.org/product/${digits}`,
  }
}
