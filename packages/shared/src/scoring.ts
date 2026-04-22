import type { Category, Listing, PriceScoreResult, ListingCalc } from './types'

export function calcPriceScore(price: number, cat: Category): PriceScoreResult {
  const { hardMin, prefLow, prefHigh, hardMax } = cat
  if (price < hardMin || price > hardMax) return { score: 0, zone: 'outside' }
  if (price >= prefLow && price <= prefHigh) return { score: 5, zone: 'sweet' }
  if (price < prefLow) {
    const r = (price - hardMin) / (prefLow - hardMin)
    return { score: round1(1 + r * 3), zone: r < 0.2 ? 'hard-edge' : 'taper-low' }
  }
  const r = (price - prefHigh) / (hardMax - prefHigh)
  return { score: round1(4 - r * 3), zone: r > 0.8 ? 'hard-edge' : 'taper-high' }
}

export function calcListing(listing: Listing, category: Category | null): ListingCalc {
  if (!category || listing.price === null) {
    return { priceScore: null, total: null, valueRatio: null, recommendation: 'incomplete' }
  }
  const { score: priceScore } = calcPriceScore(listing.price, category)
  const total = round1(priceScore + listing.conditionScore + listing.riskScore + listing.fitScore)
  const valueRatio = listing.price > 0 ? round2(total / (listing.price / 1000)) : null
  return { priceScore, total, valueRatio, recommendation: toRecommendation(total) }
}

export function toRecommendation(total: number | null): ListingCalc['recommendation'] {
  if (total === null) return 'incomplete'
  if (total >= 9) return 'strong-buy'
  if (total >= 7) return 'good'
  if (total >= 5) return 'conditional'
  return 'skip'
}

export function rankListings<T extends Listing & { calc: ListingCalc }>(
  listings: T[]
): Array<T & { rank: number | null }> {
  const scored = listings.filter(l => l.calc.total !== null)
  scored.sort((a, b) => {
    const td = (b.calc.total ?? 0) - (a.calc.total ?? 0)
    return td !== 0 ? td : (b.calc.valueRatio ?? 0) - (a.calc.valueRatio ?? 0)
  })
  const rankMap = new Map(scored.map((l, i) => [l.id, i + 1]))
  return listings.map(l => ({ ...l, rank: rankMap.get(l.id) ?? null }))
}

function round1(n: number): number { return Math.round(n * 10) / 10 }
function round2(n: number): number { return Math.round(n * 100) / 100 }
