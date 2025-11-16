import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CouponController } from '@/controllers/coupon.controller';
import { CouponModel } from '@/models/coupon.model';

vi.mock('@/lib/db', () => ({
  db: {},
}));

vi.mock('@/models/coupon.model');

describe('CouponController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateCoupon', () => {
    it('should return coupon data when valid', async () => {
      const mockCoupon = {
        id: 'coupon-1',
        code: 'DISCOUNT10',
        discountType: 'percentage' as const,
        discountValue: '10',
        minPurchase: '50.00',
        maxDiscount: '30.00',
        usedCount: 5,
        usageLimit: 100,
        isActive: true,
      };

      vi.mocked(CouponModel.findByCode).mockResolvedValue(mockCoupon as any);
      vi.mocked(CouponModel.validate).mockResolvedValue({ valid: true });

      const result = await CouponController.validateCoupon('DISCOUNT10');

      expect(result).toMatchObject({
        id: 'coupon-1',
        code: 'DISCOUNT10',
        discountType: 'percentage',
        discountValue: '10',
      });
    });

    it('should throw error when coupon not found', async () => {
      vi.mocked(CouponModel.findByCode).mockResolvedValue(null);

      await expect(CouponController.validateCoupon('INVALID')).rejects.toThrow(
        'Coupon with id INVALID not found'
      );
    });

    it('should throw error when coupon is invalid', async () => {
      const mockCoupon = {
        id: 'coupon-1',
        code: 'EXPIRED',
        isActive: true,
      };

      vi.mocked(CouponModel.findByCode).mockResolvedValue(mockCoupon as any);
      vi.mocked(CouponModel.validate).mockResolvedValue({
        valid: false,
        error: 'Cupom expirado',
      });

      await expect(CouponController.validateCoupon('EXPIRED')).rejects.toThrow(
        'Cupom expirado'
      );
    });
  });
});
