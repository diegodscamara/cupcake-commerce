import {
  pgTable,
  text,
  uuid,
  timestamp,
  decimal,
  integer,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { addresses } from './addresses';
import { cupcakes } from './cupcakes';

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  addressId: uuid('address_id').references(() => addresses.id, {
    onDelete: 'set null',
  }),
  status: text('status')
    .default('pending')
    .notNull()
    .$type<'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>(),
  deliveryMethod: text('delivery_method')
    .default('standard')
    .notNull()
    .$type<'standard' | 'express' | 'pickup'>(),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  discount: decimal('discount', { precision: 10, scale: 2 })
    .default('0')
    .notNull(),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  paymentStatus: text('payment_status')
    .default('pending')
    .notNull()
    .$type<'pending' | 'paid' | 'failed'>(),
  paymentMethod: text('payment_method').$type<'card' | 'pix'>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  cupcakeId: uuid('cupcake_id')
    .notNull()
    .references(() => cupcakes.id),
  quantity: integer('quantity').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
