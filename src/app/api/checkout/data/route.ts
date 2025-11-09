import { NextRequest, NextResponse } from 'next/server';
import { CartController } from '@/controllers/cart.controller';
import { ProfileController } from '@/controllers/profile.controller';
import { requireAuth, handleApiError } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const [items, addresses] = await Promise.all([
      CartController.getCartItems(user.id),
      ProfileController.getUserAddresses(user.id),
    ]);

    if (items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    return NextResponse.json({ items, addresses });
  } catch (error) {
    return handleApiError(error);
  }
}
