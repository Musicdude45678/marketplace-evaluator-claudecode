import { calcListing, rankListings } from '@marketplace-evaluator/shared'
import type { Category, Listing } from '@marketplace-evaluator/shared'

interface Props { listings: Listing[]; categories: Category[] }

export function Summary({ listings, categories }: Props) {
  const getCat = (id: string | null) => categories.find(c => c.id === id) ?? null
  const enriched = listings.map(l => ({ ...l, calc: calcListing(l, getCat(l.categoryId)) }))
  const ranked = rankListings(enriched).filter(l => l.calc.total !== null)

  if (!ranked.length) return (
    <div className="summary">
      <div className="s-card"><div className="s-label">★ Best Overall</div><div className="s-value s-empty">—</div><div className="s-meta">Add listings to compare</div></div>
      <div className="s-card"><div className="s-label">◈ Best Value</div><div className="s-value s-empty">—</div><div className="s-meta">Add listings to compare</div></div>
      <div className="s-card"><div className="s-label">Overview</div><div className="s-value s-empty">{listings.length} listing{listings.length !== 1 ? 's' : ''}</div><div className="s-meta">None scored yet</div></div>
    </div>
  )

  const best   = ranked[0]
  const bestV  = [...ranked].sort((a, b) => (b.calc.valueRatio ?? 0) - (a.calc.valueRatio ?? 0))[0]
  const skip   = ranked.filter(l => (l.calc.total ?? 0) < 5).length

  return (
    <div className="summary">
      <div className="s-card green">
        <div className="s-label">★ Best Overall</div>
        <div className="s-value">{best.name || 'Unnamed'}</div>
        <div className="s-meta">Score {best.calc.total}/12 · R{(best.price ?? 0).toLocaleString('en-ZA')}</div>
      </div>
      <div className="s-card blue">
        <div className="s-label">◈ Best Value</div>
        <div className="s-value">{bestV.name || 'Unnamed'}</div>
        <div className="s-meta">Ratio {bestV.calc.valueRatio} · R{(bestV.price ?? 0).toLocaleString('en-ZA')}</div>
      </div>
      <div className="s-card">
        <div className="s-label">Overview</div>
        <div className="s-value">{ranked.length} scored · {skip} skip</div>
        <div className="s-meta">{listings.length - ranked.length} incomplete · {ranked.length - skip} worth considering</div>
      </div>
    </div>
  )
}
