import { NextRequest, NextResponse } from 'next/server';
import { CartController } from '@/controllers/cart.controller';
import { getOptionalAuth, parseBody, handleApiError } from '@/lib/api-helpers';
import { addToCartSchema, updateCartItemSchema } from '@/lib/validators';
import { ValidationError } from '@/lib/errors';
import { z } from 'zod';
import {
  getSessionCartWithDetails,
  addToSessionCart,
  updateSessionCartItem,
  removeFromSessionCart,
} from '@/lib/utils/cart-session';

export async function GET() {
  try {
    const user = await getOptionalAuth();

    if (user) {
      const items = await CartController.getCartItems(user.id);
      return NextResponse.json({ items });
    } else {
      const items = await getSessionCartWithDetails();
      return NextResponse.json({ items });
    }
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getOptionalAuth();
    const body = await parseBody(request, addToCartSchema);

    if (user) {
      await CartController.addToCart(user.id, body.cupcakeId, body.quantity);
    } else {
      await addToSessionCart(body.cupcakeId, body.quantity);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getOptionalAuth();
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const cupcakeId = searchParams.get('cupcakeId');

    if (!itemId && !cupcakeId) {
      throw new ValidationError('itemId or cupcakeId is required');
    }

    if (user) {
      if (!itemId) {
        throw new ValidationError('itemId is required for authenticated users');
      }
      z.string().uuid().parse(itemId);
      await CartController.removeItem(itemId);
    } else {
      if (!cupcakeId) {
        throw new ValidationError('cupcakeId is required for anonymous users');
      }
      await removeFromSessionCart(cupcakeId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getOptionalAuth();
    const body = await parseBody(request, updateCartItemSchema);

    if (user) {
      if (!body.itemId) {
        throw new ValidationError('itemId is required for authenticated users');
      }
      await CartController.updateQuantity(body.itemId, body.quantity);
    } else {
      if (!body.cupcakeId) {
        throw new ValidationError('cupcakeId is required for anonymous users');
      }
      await updateSessionCartItem(body.cupcakeId, body.quantity);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
