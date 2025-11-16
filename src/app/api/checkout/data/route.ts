import { NextRequest, NextResponse } from 'next/server';
import { CartController } from '@/controllers/cart.controller';
import { ProfileController } from '@/controllers/profile.controller';
import { requireAuth, handleApiError } from '@/lib/api-helpers';
import { migrateSessionCartToUser } from '@/lib/utils/cart-migration';
import { ValidationError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await migrateSessionCartToUser(user.id);

    const [items, addresses] = await Promise.all([
      CartController.getCartItems(user.id),
      ProfileController.getUserAddresses(user.id),
    ]);

    if (items.length === 0) {
      throw new ValidationError('Cart is empty');
    }

    return NextResponse.json({ items, addresses });
  } catch (error) {
    return handleApiError(error);
  }
}
