import { pgTable, text, integer, real, timestamp, uuid } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  apiKey: text('api_key').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  hardMin: real('hard_min').notNull().default(0),
  prefLow: real('pref_low').notNull().default(0),
  prefHigh: real('pref_high').notNull().default(0),
  hardMax: real('hard_max').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const listings = pgTable('listings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  name: text('name').notNull().default(''),
  price: real('price'),
  conditionScore: integer('condition_score').notNull().default(2),
  riskScore: integer('risk_score').notNull().default(1),
  fitScore: integer('fit_score').notNull().default(1),
  notes: text('notes').notNull().default(''),
  listingUrl: text('listing_url').notNull().default(''),
  thumbnailUrl: text('thumbnail_url').notNull().default(''),
  fbListingId: text('fb_listing_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
