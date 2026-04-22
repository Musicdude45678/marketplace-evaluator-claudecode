import { useState, useEffect, useCallback } from 'react'
import { api, getApiKey } from '../api/client'
import type { Category, Listing } from '@marketplace-evaluator/shared'

export function useData() {
  const [categories, setCategories] = useState<Category[]>([])
  const [listings, setListings]     = useState<Listing[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [authed, setAuthed]         = useState(!!getApiKey())

  const load = useCallback(async () => {
    if (!getApiKey()) { setLoading(false); return }
    try {
      setLoading(true); setError(null)
      const [cats, lsts] = await Promise.all([api.categories.list(), api.listings.list()])
      setCategories(cats); setListings(lsts); setAuthed(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
      if (e instanceof Error && e.message === 'Invalid API key') setAuthed(false)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])
  return { categories, setCategories, listings, setListings, loading, error, authed, setAuthed, reload: load }
}
