import { pgTable, text, uuid, timestamp, integer } from 'drizzle-orm/pg-core';
import { users } from './users';
import { cupcakes } from './cupcakes';
import { orders } from './orders';

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  cupcakeId: uuid('cupcake_id')
    .notNull()
    .references(() => cupcakes.id, { onDelete: 'cascade' }),
  orderId: uuid('order_id').references(() => orders.id),
  rating: integer('rating').notNull().$type<1 | 2 | 3 | 4 | 5>(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
