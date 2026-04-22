import { useState } from 'react'
import { setApiKey } from '../api/client'

interface Props { onSubmit: () => void }

export function ApiKeyGate({ onSubmit }: Props) {
  const [key, setKey] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!key.trim()) return
    setApiKey(key.trim())
    onSubmit()
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '32px 36px', width: 340 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
          Marketplace <span style={{ color: 'var(--accent)' }}>Evaluator</span>
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-m)', marginBottom: 22 }}>Enter your API key to continue</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password" placeholder="API key" value={key}
            onChange={e => setKey(e.target.value)}
            style={{ width: '100%', marginBottom: 12 }} autoFocus
          />
          <button className="btn btn-primary" style={{ width: '100%' }} type="submit" disabled={!key.trim()}>
            Continue
          </button>
        </form>
      </div>
    </div>
  )
}
