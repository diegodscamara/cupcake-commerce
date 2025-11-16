import { cookies } from 'next/headers';
import { CupcakeModel } from '@/models/cupcake.model';

interface SessionCartItem {
  cupcakeId: string;
  quantity: number;
}

const CART_COOKIE_NAME = 'anonymous_cart';

export async function getSessionCart(): Promise<SessionCartItem[]> {
  const cookieStore = await cookies();
  const cartCookie = cookieStore.get(CART_COOKIE_NAME);

  if (!cartCookie?.value) {
    return [];
  }

  try {
    return JSON.parse(cartCookie.value) as SessionCartItem[];
  } catch {
    return [];
  }
}

export async function setSessionCart(items: SessionCartItem[]): Promise<void> {
  const cookieStore = await cookies();
  const maxAge = 60 * 60 * 24 * 30;

  cookieStore.set(CART_COOKIE_NAME, JSON.stringify(items), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/',
  });
}

export async function addToSessionCart(
  cupcakeId: string,
  quantity: number
): Promise<void> {
  const cart = await getSessionCart();
  const existingItemIndex = cart.findIndex(
    (item) => item.cupcakeId === cupcakeId
  );

  if (existingItemIndex >= 0) {
    cart[existingItemIndex].quantity += quantity;
  } else {
    cart.push({ cupcakeId, quantity });
  }

  await setSessionCart(cart);
}

export async function updateSessionCartItem(
  cupcakeId: string,
  quantity: number
): Promise<void> {
  const cart = await getSessionCart();
  const existingItemIndex = cart.findIndex(
    (item) => item.cupcakeId === cupcakeId
  );

  if (existingItemIndex >= 0) {
    if (quantity <= 0) {
      cart.splice(existingItemIndex, 1);
    } else {
      cart[existingItemIndex].quantity = quantity;
    }
  }

  await setSessionCart(cart);
}

export async function removeFromSessionCart(cupcakeId: string): Promise<void> {
  const cart = await getSessionCart();
  const filteredCart = cart.filter((item) => item.cupcakeId !== cupcakeId);
  await setSessionCart(filteredCart);
}

export async function clearSessionCart(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CART_COOKIE_NAME);
}

export async function getSessionCartWithDetails() {
  const sessionCart = await getSessionCart();

  if (sessionCart.length === 0) {
    return [];
  }

  const cupcakeIds = sessionCart.map((item) => item.cupcakeId);
  const cupcakes = await Promise.all(
    cupcakeIds.map((id) => CupcakeModel.findById(id))
  );

  return sessionCart
    .map((item) => {
      const cupcake = cupcakes.find((c) => c?.id === item.cupcakeId);
      if (!cupcake) return null;

      return {
        id: `session_${item.cupcakeId}`,
        quantity: item.quantity,
        cupcakeId: item.cupcakeId,
        cupcake,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}
