import { NextRequest, NextResponse } from 'next/server';
import { CouponController } from '@/controllers/coupon.controller';
import { parseBody, handleApiError } from '@/lib/api-helpers';
import { validateCouponSchema } from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request, validateCouponSchema);
    const coupon = await CouponController.validateCoupon(body.code);
    return NextResponse.json({ valid: true, coupon });
  } catch (error) {
    return handleApiError(error);
  }
}
