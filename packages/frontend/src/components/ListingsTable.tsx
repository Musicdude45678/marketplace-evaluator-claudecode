import { useState } from 'react'
import { api } from '../api/client'
import { calcListing, rankListings } from '@marketplace-evaluator/shared'
import type { Category, Listing, CreateListingInput } from '@marketplace-evaluator/shared'

interface Props { listings: Listing[]; categories: Category[]; onChange: (l: Listing[]) => void }

const COND_OPTS: [number, string][] = [[0, 'Poor (0)'], [1, 'Fair (1)'], [2, 'Good (2)'], [3, 'Excellent (3)']]
const RISK_OPTS: [number, string][] = [[0, 'High Risk (0)'], [1, 'Med Risk (1)'], [2, 'Low Risk (2)']]
const FIT_OPTS:  [number, string][] = [[0, 'No Fit (0)'], [1, 'Acceptable (1)'], [2, 'Perfect Fit (2)']]

function blankDraft(): CreateListingInput {
  return { name: '', categoryId: null, price: null, conditionScore: 2, riskScore: 1, fitScore: 1, notes: '', listingUrl: '', thumbnailUrl: '', fbListingId: null }
}

function ScoreBadge({ value, max }: { value: number | null; max: number }) {
  if (value === null) return <span className="dash">—</span>
  const p = value / max
  const cls = p >= .75 ? 'sg' : p >= .55 ? 'sb' : p >= .33 ? 'sy' : 'sr'
  return <span className={`sbadge ${cls}`}>{value}/{max}</span>
}

function RecBadge({ total }: { total: number | null }) {
  if (total === null) return <span className="dash">—</span>
  const [lbl, cls, icon] =
    total >= 9 ? ['Strong Buy', 'rg', '★'] :
    total >= 7 ? ['Good Option', 'rb', '●'] :
    total >= 5 ? ['Conditional', 'ry', '◐'] :
                 ['Skip', 'rr', '✕']
  return <span className={`rbadge ${cls}`}>{icon} {lbl}</span>
}

function RankBadge({ rank }: { rank: number | null }) {
  if (!rank) return <span className="rank rank-u">—</span>
  const cls = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : 'rank-n'
  return <span className={`rank ${cls}`}>{rank}</span>
}

export function ListingsTable({ listings, categories, onChange }: Props) {
  const [draft, setDraft]         = useState<CreateListingInput>(blankDraft())
  const [sortByRank, setSortByRank] = useState(false)

  const getCat   = (id: string | null) => categories.find(c => c.id === id) ?? null
  const hintText = (catId: string | null) => {
    const c = getCat(catId)
    return c ? `Sweet spot R${c.prefLow.toLocaleString()} – R${c.prefHigh.toLocaleString()}` : 'Select a category first'
  }

  const enriched = listings.map(l => ({ ...l, calc: calcListing(l, getCat(l.categoryId)) }))
  const ranked   = rankListings(enriched)
  const displayed = sortByRank ? [...ranked].sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999)) : ranked

  async function addDraft() {
    if (!draft.name.trim()) return
    const l = await api.listings.create(draft)
    onChange([...listings, l])
    setDraft(blankDraft())
  }

  async function update(id: string, patch: Partial<Listing>) {
    const updated = await api.listings.update(id, patch)
    onChange(listings.map(l => l.id === id ? updated : l))
  }

  async function remove(id: string) {
    await api.listings.delete(id)
    onChange(listings.filter(l => l.id !== id))
  }

  async function clear(id: string) {
    await update(id, { name: '', price: null, conditionScore: 2, riskScore: 1, fitScore: 1, notes: '', listingUrl: '', thumbnailUrl: '' })
  }

  const draftCalc = calcListing(draft as unknown as Listing, getCat(draft.categoryId ?? null))

  function Selects(opts: [number, string][], val: number, onChange: (v: number) => void) {
    return (
      <select value={val} onChange={e => onChange(parseInt(e.target.value))}>
        {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    )
  }

  return (
    <div className="table-wrap">
      <div className="table-toolbar">
        <div>
          <span className="table-title">Listings</span>
          {listings.length > 0 && <span className="listing-count">{listings.length} listing{listings.length !== 1 ? 's' : ''}</span>}
        </div>
        <div className="toolbar-right">
          <button className={`btn btn-ghost btn-sm ${sortByRank ? 'sort-active' : ''}`} onClick={() => setSortByRank(s => !s)}>
            ⇅ {sortByRank ? 'Sorted by Rank' : 'Sort by Rank'}
          </button>
        </div>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>#</th><th>Name</th><th>Category</th><th>Price (R)</th>
              <th>Condition /3</th><th>Risk /2</th><th>Fit /2</th>
              <th>Notes</th><th>Link</th>
              <th>Price /5</th><th>Total /12</th><th>Value Ratio</th><th>Recommendation</th><th />
            </tr>
          </thead>
          <tbody>
            {displayed.map(l => (
              <tr key={l.id}>
                <td><RankBadge rank={l.rank} /></td>
                <td><input type="text" defaultValue={l.name} placeholder="Item name" onBlur={e => update(l.id, { name: e.target.value })} /></td>
                <td>
                  <select defaultValue={l.categoryId ?? ''} onChange={e => update(l.id, { categoryId: e.target.value || null })}>
                    <option value="">— Category —</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </td>
                <td>
                  <input type="number" defaultValue={l.price ?? ''} placeholder="0" min="0"
                    onBlur={e => update(l.id, { price: e.target.value ? parseFloat(e.target.value) : null })} />
                  <div className="price-hint">{hintText(l.categoryId)}</div>
                </td>
                <td>{Selects(COND_OPTS, l.conditionScore, v => update(l.id, { conditionScore: v }))}</td>
                <td>{Selects(RISK_OPTS, l.riskScore,      v => update(l.id, { riskScore: v }))}</td>
                <td>{Selects(FIT_OPTS,  l.fitScore,       v => update(l.id, { fitScore: v }))}</td>
                <td><input type="text" defaultValue={l.notes} placeholder="Notes" onBlur={e => update(l.id, { notes: e.target.value })} /></td>
                <td>
                  <input type="url" defaultValue={l.listingUrl} placeholder="Paste link…"
                    onBlur={e => update(l.id, { listingUrl: e.target.value })} />
                  {l.listingUrl && <a className="url-link" href={l.listingUrl} target="_blank" rel="noopener">↗ Open</a>}
                </td>
                <td><ScoreBadge value={l.calc.priceScore} max={5} /></td>
                <td><ScoreBadge value={l.calc.total} max={12} /></td>
                <td><ScoreBadge value={l.calc.valueRatio} max={10} /></td>
                <td><RecBadge total={l.calc.total} /></td>
                <td>
                  <div className="act">
                    <button className="btn-icon clr" onClick={() => clear(l.id)} title="Clear">↺</button>
                    <button className="btn-icon del" onClick={() => remove(l.id)} title="Delete">✕</button>
                  </div>
                </td>
              </tr>
            ))}

            {/* Draft row */}
            <tr className="draft-row">
              <td><span className="rank rank-u" style={{ fontSize: 16, color: 'var(--accent)' }}>+</span></td>
              <td><input type="text" value={draft.name} placeholder="Item name" onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} /></td>
              <td>
                <select value={draft.categoryId ?? ''} onChange={e => setDraft(d => ({ ...d, categoryId: e.target.value || null }))}>
                  <option value="">— Category —</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </td>
              <td>
                <input type="number" value={draft.price ?? ''} placeholder="0" min="0"
                  onChange={e => setDraft(d => ({ ...d, price: e.target.value ? parseFloat(e.target.value) : null }))} />
                <div className="price-hint">{hintText(draft.categoryId ?? null)}</div>
              </td>
              <td>{Selects(COND_OPTS, draft.conditionScore, v => setDraft(d => ({ ...d, conditionScore: v })))}</td>
              <td>{Selects(RISK_OPTS, draft.riskScore,      v => setDraft(d => ({ ...d, riskScore: v })))}</td>
              <td>{Selects(FIT_OPTS,  draft.fitScore,       v => setDraft(d => ({ ...d, fitScore: v })))}</td>
              <td><input type="text" value={draft.notes} placeholder="Notes" onChange={e => setDraft(d => ({ ...d, notes: e.target.value }))} /></td>
              <td><input type="url" value={draft.listingUrl} placeholder="Paste link…" onChange={e => setDraft(d => ({ ...d, listingUrl: e.target.value }))} /></td>
              <td><ScoreBadge value={draftCalc.priceScore} max={5} /></td>
              <td><ScoreBadge value={draftCalc.total} max={12} /></td>
              <td><ScoreBadge value={draftCalc.valueRatio} max={10} /></td>
              <td><RecBadge total={draftCalc.total} /></td>
              <td>
                <button className="btn btn-primary btn-sm" onClick={addDraft} disabled={!draft.name.trim()}>✓ Add</button>
              </td>
            </tr>
          </tbody>
        </table>

        {listings.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No listings yet</h3>
            <p>Fill in the row above to add your first listing</p>
          </div>
        )}
      </div>

      <div className="legend">
        <span className="legend-item"><span className="legend-dot" style={{ background: 'var(--green)' }} />Strong Buy ≥ 9</span>
        <span className="legend-item"><span className="legend-dot" style={{ background: 'var(--blue)' }} />Good Option ≥ 7</span>
        <span className="legend-item"><span className="legend-dot" style={{ background: 'var(--yellow)' }} />Conditional ≥ 5</span>
        <span className="legend-item"><span className="legend-dot" style={{ background: 'var(--red)' }} />Skip &lt; 5</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-m)' }}>Max score: 12 (5 price + 3 condition + 2 risk + 2 fit)</span>
      </div>
    </div>
  )
}
