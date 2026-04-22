export interface Category {
  id: string
  userId: string
  name: string
  hardMin: number
  prefLow: number
  prefHigh: number
  hardMax: number
  createdAt: string
}

export interface Listing {
  id: string
  userId: string
  categoryId: string | null
  name: string
  price: number | null
  conditionScore: number
  riskScore: number
  fitScore: number
  notes: string
  listingUrl: string
  thumbnailUrl: string
  fbListingId: string | null
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  name: string
  apiKey: string
  createdAt: string
}

export interface PriceScoreResult {
  score: number
  zone: 'sweet' | 'taper-low' | 'taper-high' | 'hard-edge' | 'outside'
}

export interface ListingCalc {
  priceScore: number | null
  total: number | null
  valueRatio: number | null
  recommendation: 'strong-buy' | 'good' | 'conditional' | 'skip' | 'incomplete'
}

export type CreateListingInput = Omit<Listing, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
export type UpdateListingInput = Partial<CreateListingInput>
export type CreateCategoryInput = Omit<Category, 'id' | 'userId' | 'createdAt'>
export type UpdateCategoryInput = Partial<CreateCategoryInput>
