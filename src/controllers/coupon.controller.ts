import { CouponModel } from '@/models/coupon.model';
import { NotFoundError, ValidationError } from '@/lib/errors';

export class CouponController {
  static async validateCoupon(code: string) {
    const coupon = await CouponModel.findByCode(code);
    if (!coupon) {
      throw new NotFoundError('Coupon', code);
    }

    const validation = await CouponModel.validate(coupon);
    if (!validation.valid) {
      throw new ValidationError(validation.error || 'Cupom inválido');
    }

    return {
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minPurchase: coupon.minPurchase,
      maxDiscount: coupon.maxDiscount,
    };
  }
}
