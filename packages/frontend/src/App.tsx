import { useState } from 'react'
import { useData } from './hooks/useData'
import { ApiKeyGate } from './components/ApiKeyGate'
import { CategoryPanel } from './components/CategoryPanel'
import { ListingsTable } from './components/ListingsTable'
import { Summary } from './components/Summary'
import { setApiKey } from './api/client'

export function App() {
  const { categories, setCategories, listings, setListings, loading, error, authed, setAuthed, reload } = useData()
  const [theme, setTheme] = useState<'dark' | 'light'>(
    () => (localStorage.getItem('me_theme') as 'dark' | 'light') ?? 'dark'
  )

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('me_theme', next)
    document.documentElement.classList.toggle('light', next === 'light')
  }

  if (!authed) return <ApiKeyGate onSubmit={() => { setAuthed(true); reload() }} />

  return (
    <>
      <div className="header">
        <div>
          <h1>Marketplace <em>Evaluator</em></h1>
          <div className="header-sub">Score second-hand listings — price · condition · risk · fit</div>
        </div>
        <div className="header-actions">
          <button className="btn btn-ghost" onClick={() => { setApiKey(''); setAuthed(false) }}>⎋ Logout</button>
          <button className="btn-theme" onClick={toggleTheme}>{theme === 'dark' ? '☀' : '🌙'}</button>
        </div>
      </div>

      {loading && <div style={{ color: 'var(--text-m)', padding: '20px 0' }}>Loading…</div>}
      {error   && <div style={{ color: 'var(--red)',    padding: '12px 0' }}>Error: {error}</div>}

      {!loading && (
        <>
          <Summary listings={listings} categories={categories} />
          <CategoryPanel categories={categories} onChange={setCategories} />
          <ListingsTable listings={listings} categories={categories} onChange={setListings} />
        </>
      )}
    </>
  )
}
