import {
  pgTable,
  text,
  uuid,
  timestamp,
  decimal,
  integer,
  boolean,
} from 'drizzle-orm/pg-core';

export const coupons = pgTable('coupons', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  discountType: text('discount_type')
    .default('percentage')
    .notNull()
    .$type<'percentage' | 'fixed'>(),
  discountValue: decimal('discount_value', {
    precision: 10,
    scale: 2,
  }).notNull(),
  minPurchase: decimal('min_purchase', { precision: 10, scale: 2 }),
  maxDiscount: decimal('max_discount', { precision: 10, scale: 2 }),
  usageLimit: integer('usage_limit'),
  usedCount: integer('used_count').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = typeof coupons.$inferInsert;
