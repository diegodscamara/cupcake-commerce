import {
  pgTable,
  text,
  uuid,
  timestamp,
  decimal,
  integer,
  boolean,
} from 'drizzle-orm/pg-core';
import { categories } from './categories';

export const cupcakes = pgTable('cupcakes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  imageUrl: text('image_url'),
  categoryId: uuid('category_id').references(() => categories.id),
  stock: integer('stock').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Cupcake = typeof cupcakes.$inferSelect;
export type NewCupcake = typeof cupcakes.$inferInsert;
