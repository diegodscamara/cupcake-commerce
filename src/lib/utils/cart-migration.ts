import { CartController } from '@/controllers/cart.controller';
import { getSessionCart, clearSessionCart } from '@/lib/utils/cart-session';

export async function migrateSessionCartToUser(userId: string): Promise<void> {
  const sessionCart = await getSessionCart();

  if (sessionCart.length === 0) {
    return;
  }

  for (const item of sessionCart) {
    try {
      await CartController.addToCart(userId, item.cupcakeId, item.quantity);
    } catch (error) {
      console.error(`Failed to migrate cart item ${item.cupcakeId}:`, error);
    }
  }

  await clearSessionCart();
}
