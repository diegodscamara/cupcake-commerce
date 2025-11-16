import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CouponModel } from '@/models/coupon.model';
import { db } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
  },
}));

describe('CouponModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findByCode', () => {
    it('should return coupon when found', async () => {
      const mockCoupon = {
        id: 'coupon-1',
        code: 'DISCOUNT10',
        discountType: 'percentage' as const,
        discountValue: '10',
        isActive: true,
      };

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockCoupon]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await CouponModel.findByCode('DISCOUNT10');

      expect(result).toEqual(mockCoupon);
    });

    it('should return null when coupon not found', async () => {
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await CouponModel.findByCode('INVALID');

      expect(result).toBeNull();
    });
  });

  describe('validate', () => {
    it('should return valid for active coupon', async () => {
      const coupon = {
        id: 'coupon-1',
        code: 'DISCOUNT10',
        expiresAt: null,
        usageLimit: 100,
        usedCount: 5,
        isActive: true,
      };

      const result = await CouponModel.validate(coupon as any);

      expect(result.valid).toBe(true);
    });

    it('should return invalid for expired coupon', async () => {
      const coupon = {
        id: 'coupon-1',
        code: 'EXPIRED',
        expiresAt: new Date('2020-01-01'),
        usageLimit: 100,
        usedCount: 5,
        isActive: true,
      };

      const result = await CouponModel.validate(coupon as any);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Cupom expirado');
    });

    it('should return invalid when usage limit reached', async () => {
      const coupon = {
        id: 'coupon-1',
        code: 'LIMITED',
        expiresAt: null,
        usageLimit: 10,
        usedCount: 10,
        isActive: true,
      };

      const result = await CouponModel.validate(coupon as any);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Cupom esgotado');
    });
  });

  describe('incrementUsage', () => {
    it('should increment coupon usage count', async () => {
      const mockCoupon = {
        id: 'coupon-1',
        usedCount: 5,
      };

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockCoupon]),
      };

      const mockUpdate = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);
      vi.mocked(db.update).mockReturnValue(mockUpdate as any);

      await CouponModel.incrementUsage('coupon-1');

      expect(db.update).toHaveBeenCalled();
    });
  });
});
