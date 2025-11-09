import { db } from '@/lib/db';
import { coupons } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import type { Coupon } from '@/lib/db/schema';

export class CouponModel {
  static async findByCode(code: string): Promise<Coupon | null> {
    const result = await db
      .select()
      .from(coupons)
      .where(and(eq(coupons.code, code), eq(coupons.isActive, true)))
      .limit(1);
    return result[0] || null;
  }

  static async validate(
    coupon: Coupon
  ): Promise<{ valid: boolean; error?: string }> {
    // Check expiration
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return { valid: false, error: 'Cupom expirado' };
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, error: 'Cupom esgotado' };
    }

    return { valid: true };
  }

  static async incrementUsage(id: string): Promise<void> {
    const coupon = await db
      .select()
      .from(coupons)
      .where(eq(coupons.id, id))
      .limit(1);
    if (coupon[0]) {
      await db
        .update(coupons)
        .set({ usedCount: coupon[0].usedCount + 1, updatedAt: new Date() })
        .where(eq(coupons.id, id));
    }
  }
}
