/**
 * Zod validation schemas for API endpoints
 * Centralized validation schemas for consistent input validation
 */

import { z } from 'zod';

// UUID validation
const uuidSchema = z.string().uuid('Invalid UUID format');

// Common schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Cart schemas
export const addToCartSchema = z.object({
  cupcakeId: uuidSchema,
  quantity: z.number().int().min(1).max(100).default(1),
});

export const updateCartItemSchema = z.object({
  itemId: uuidSchema,
  quantity: z.number().int().min(1).max(100),
});

// Order schemas
export const createOrderSchema = z.object({
  addressId: z.string().uuid('Invalid UUID format').nullable().optional(),
  deliveryMethod: z.enum(['standard', 'express', 'pickup']).default('standard'),
  couponCode: z.string().nullable().optional(),
});

// Review schemas
export const createReviewSchema = z.object({
  cupcakeId: uuidSchema,
  orderId: uuidSchema.optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

// Address schemas
export const createAddressSchema = z.object({
  street: z.string().min(1).max(255),
  city: z.string().min(1).max(100),
  state: z.string().min(2).max(2),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, 'Invalid zip code format'),
  isDefault: z.boolean().default(false),
});

export const updateAddressSchema = createAddressSchema.partial();

// Profile schemas
export const updateProfileSchema = z.object({
  fullName: z.string().min(1).max(255).optional(),
  phone: z
    .string()
    .regex(/^\+?[\d\s-()]+$/, 'Invalid phone format')
    .optional(),
});

// Coupon schemas
export const validateCouponSchema = z.object({
  code: z.string().min(1).max(50),
});

// Payment schemas
export const processPaymentSchema = z.object({
  orderId: uuidSchema,
  amount: z.number().positive(),
});

// Product search schemas
export const productSearchSchema = z.object({
  categorySlug: z.string().optional(),
  search: z.string().optional(),
  ...paginationSchema.shape,
});
