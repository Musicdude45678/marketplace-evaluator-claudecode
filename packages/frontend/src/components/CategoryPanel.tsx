import { useState } from 'react'
import { api } from '../api/client'
import type { Category, CreateCategoryInput } from '@marketplace-evaluator/shared'

interface Props { categories: Category[]; onChange: (cats: Category[]) => void }

export function CategoryPanel({ categories, onChange }: Props) {
  const [open, setOpen]     = useState(false)
  const [saving, setSaving] = useState<string | null>(null)

  async function addCategory() {
    const cat = await api.categories.create({ name: 'New Category', hardMin: 0, prefLow: 0, prefHigh: 0, hardMax: 0 })
    onChange([...categories, cat])
    setOpen(true)
  }

  async function updateField(cat: Category, field: keyof CreateCategoryInput, value: string | number) {
    setSaving(cat.id)
    const updated = await api.categories.update(cat.id, { [field]: value })
    onChange(categories.map(c => c.id === cat.id ? updated : c))
    setSaving(null)
  }

  async function deleteCategory(id: string) {
    if (!confirm('Delete this category? Listings using it will lose their price score.')) return
    await api.categories.delete(id)
    onChange(categories.filter(c => c.id !== id))
  }

  return (
    <div className="panel">
      <div className="panel-hdr" onClick={() => setOpen(o => !o)}>
        <div className="panel-title">
          ⚙ Categories&nbsp;
          <span style={{ fontWeight: 400, fontSize: '11.5px', color: 'var(--text-m)' }}>({categories.length})</span>
        </div>
        <span className={`panel-arrow ${open ? 'open' : ''}`}>▼</span>
      </div>
      {open && (
        <div className="panel-body open">
          <div className="th-row" style={{ paddingTop: 10 }}>
            <div>Name</div><div>Min Acceptable</div><div>Preferred Low</div>
            <div>Preferred High</div><div>Max Acceptable</div><div />
          </div>
          {categories.map(cat => (
            <div className="type-row" key={cat.id}>
              {(['name', 'hardMin', 'prefLow', 'prefHigh', 'hardMax'] as const).map(f => (
                <input
                  key={f} type={f === 'name' ? 'text' : 'number'}
                  defaultValue={cat[f]} placeholder={f}
                  onBlur={e => updateField(cat, f, f === 'name' ? e.target.value : parseFloat(e.target.value) || 0)}
                />
              ))}
              <div className="type-actions">
                <button className="btn-icon del" onClick={() => deleteCategory(cat.id)}>
                  {saving === cat.id ? '…' : '✕'}
                </button>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-ghost btn-sm" onClick={addCategory}>+ Add Category</button>
            <span className="range-note">Sweet spot = Preferred Low → High. Scores taper toward Min/Max and hit zero outside the range.</span>
          </div>
        </div>
      )}
    </div>
  )
}
