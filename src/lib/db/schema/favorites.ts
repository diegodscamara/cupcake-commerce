import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { cupcakes } from './cupcakes';

export const favorites = pgTable('favorites', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  cupcakeId: uuid('cupcake_id')
    .notNull()
    .references(() => cupcakes.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;
