const MAP: [RegExp, string[]][] = [
  [/burrito/, ['Rice', 'Black beans', 'Salsa']],
  [/taco/, ['Salsa', 'Greens']],
  [/guacamole/, ['Avocado']],
  [/broccoli/, ['Broccoli']],
  [/cauliflower/, ['Cauliflower']],
  [/cucumber/, ['Cucumber']],
  [/pepper/, ['Bell pepper']],
  [/strawberry/, ['Strawberries']],
  [/banana/, ['Banana']],
  [/\borange\b/, ['Orange']],
  [/lemon/, ['Lemon']],
  [/pineapple/, ['Pineapple']],
  [/apple|granny smith/, ['Apple']],
  [/cabbage/, ['Cabbage']],
  [/mushroom/, ['Mushroom']],
  [/corn|ear, spike/, ['Corn']],
  [/pizza/, ['Pizza']],
  [/hotdog|hot dog/, ['Hot dog']],
  [/cheeseburger|hamburger/, ['Cheeseburger']],
  [/bagel/, ['Bagel']],
  [/pretzel/, ['Pretzel']],
  [/carbonara|spaghetti|pasta/, ['Noodles']],
  [/ice cream/, ['Ice cream']],
  [/espresso|coffee/, ['Coffee']],
  [/soup/, ['Broth']],
  [/meat loaf|meatloaf|potpie/, ['Chicken']],
  [/mashed potato|potato/, ['Potato']],
  [/chocolate/, ['Chocolate']],
  [/french loaf|dough/, ['Toast']],
  [/salad|greens/, ['Greens']],
  [/\brice\b/, ['Rice']],
  [/\begg\b/, ['Egg']],
  [/yogurt/, ['Greek yogurt']],
  [/sushi/, ['Rice']],
  [/chicken/, ['Chicken']],
  [/tofu/, ['Tofu']],
]

const NOT_FOOD = /plate|cup|mug|bowl|napkin|fork|spoon|knife|table|person|jersey|notebook|monitor|screen|keyboard|phone|bottle|can|tray/

type Prediction = { className: string; probability: number }
type Net = { classify: (img: HTMLImageElement, topk?: number) => Promise<Prediction[]> }

let netPromise: Promise<Net> | null = null

function loadScript(src: string) {
  const existing = document.querySelector(`script[src="${src}"]`)
  if (existing) return Promise.resolve()
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Could not load the photo reader'))
    document.head.appendChild(script)
  })
}

function getNet() {
  if (!netPromise) {
    netPromise = (async () => {
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js')
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.1/dist/mobilenet.min.js')
      const mobilenet = (window as unknown as { mobilenet?: { load: (opts: { version: number; alpha: number }) => Promise<Net> } }).mobilenet
      if (!mobilenet) throw new Error('Photo reader did not start')
      return mobilenet.load({ version: 2, alpha: 1 })
    })().catch(error => {
      netPromise = null
      throw error
    })
  }
  return netPromise
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not open the photo'))
    img.src = src
  })
}

function pretty(className: string) {
  const word = className.split(',')[0].trim()
  return word.replace(/\b\w/g, letter => letter.toUpperCase())
}

export function foodsFromPredictions(predictions: Prediction[]) {
  const found: string[] = []
  for (const prediction of predictions) {
    if (prediction.probability < 0.05) continue
    const name = prediction.className.toLowerCase()
    if (NOT_FOOD.test(name)) continue
    for (const [pattern, items] of MAP) {
      if (!pattern.test(name)) continue
      for (const item of items) {
        if (!found.includes(item)) found.push(item)
      }
    }
  }
  if (!found.length) {
    const top = predictions.find(prediction => prediction.probability >= 0.15 && !NOT_FOOD.test(prediction.className.toLowerCase()))
    if (top) found.push(pretty(top.className))
  }
  return found.slice(0, 5)
}

export async function labelPhoto(src: string) {
  const net = await getNet()
  const img = await loadImage(src)
  const predictions = await net.classify(img, 5)
  const items = foodsFromPredictions(predictions)
  const top = predictions[0]
  const name = top && top.probability >= 0.12 && !NOT_FOOD.test(top.className.toLowerCase()) ? pretty(top.className) : 'Your meal'
  return { items, name }
}
