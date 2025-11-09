import { NextRequest, NextResponse } from 'next/server';
import { CartController } from '@/controllers/cart.controller';
import { requireAuth, parseBody, handleApiError } from '@/lib/api-helpers';
import { addToCartSchema, updateCartItemSchema } from '@/lib/validators';
import { ValidationError } from '@/lib/errors';
import { z } from 'zod';

export async function GET() {
  try {
    const user = await requireAuth({} as NextRequest);
    const items = await CartController.getCartItems(user.id);
    return NextResponse.json({ items });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await parseBody(request, addToCartSchema);
    await CartController.addToCart(user.id, body.cupcakeId, body.quantity);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      throw new ValidationError('itemId is required');
    }

    // Validate UUID format
    z.string().uuid().parse(itemId);

    await CartController.removeItem(itemId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAuth(request);
    const body = await parseBody(request, updateCartItemSchema);
    await CartController.updateQuantity(body.itemId, body.quantity);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
