import type {
  Category, Listing,
  CreateCategoryInput, UpdateCategoryInput,
  CreateListingInput, UpdateListingInput,
} from '@marketplace-evaluator/shared'

const API_KEY_STORAGE = 'me_api_key'

export function getApiKey(): string { return localStorage.getItem(API_KEY_STORAGE) ?? '' }
export function setApiKey(key: string) { localStorage.setItem(API_KEY_STORAGE, key) }

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-API-Key': getApiKey() },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? 'Request failed')
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  categories: {
    list:   ()                                   => req<Category[]>('GET',    '/categories'),
    create: (data: CreateCategoryInput)          => req<Category> ('POST',   '/categories', data),
    update: (id: string, data: UpdateCategoryInput) => req<Category>('PUT',  `/categories/${id}`, data),
    delete: (id: string)                         => req<void>     ('DELETE', `/categories/${id}`),
  },
  listings: {
    list:   ()                                  => req<Listing[]>('GET',    '/listings'),
    create: (data: CreateListingInput)          => req<Listing>  ('POST',   '/listings', data),
    update: (id: string, data: UpdateListingInput) => req<Listing>('PUT',   `/listings/${id}`, data),
    delete: (id: string)                        => req<void>     ('DELETE', `/listings/${id}`),
  },
}
