// Where students log meals from. The team will finalize this list; add a place here and it shows up in logging.
export type Place = { id: string; label: string; kind: 'dining' | 'chain' | 'other' }

export const PLACES: Place[] = [
  { id: 'evk', label: "Everybody's Kitchen", kind: 'dining' },
  { id: 'parkside', label: 'Parkside', kind: 'dining' },
  { id: 'village', label: 'USC Village Dining Hall', kind: 'dining' },
  { id: 'starbucks', label: 'Starbucks', kind: 'chain' },
  { id: 'chipotle', label: 'Chipotle', kind: 'chain' },
  { id: 'home', label: 'Home', kind: 'other' },
  { id: 'elsewhere', label: 'Somewhere else', kind: 'other' },
]

export function placeLabel(id: string | null | undefined) {
  return PLACES.find(place => place.id === id)?.label ?? null
}
