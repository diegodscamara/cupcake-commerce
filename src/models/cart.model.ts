import { db } from '@/lib/db';
import { cartItems, cupcakes } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import type { CartItem, NewCartItem } from '@/lib/db/schema';

export class CartModel {
  static async findByUserId(userId: string) {
    return db
      .select({
        id: cartItems.id,
        quantity: cartItems.quantity,
        cupcakeId: cartItems.cupcakeId,
        cupcake: cupcakes,
      })
      .from(cartItems)
      .innerJoin(cupcakes, eq(cartItems.cupcakeId, cupcakes.id))
      .where(eq(cartItems.userId, userId));
  }

  static async findById(itemId: string) {
    const result = await db
      .select({
        id: cartItems.id,
        quantity: cartItems.quantity,
        cupcakeId: cartItems.cupcakeId,
        cupcake: cupcakes,
      })
      .from(cartItems)
      .innerJoin(cupcakes, eq(cartItems.cupcakeId, cupcakes.id))
      .where(eq(cartItems.id, itemId))
      .limit(1);
    return result[0] || null;
  }

  static async findItem(
    userId: string,
    cupcakeId: string
  ): Promise<CartItem | null> {
    const result = await db
      .select()
      .from(cartItems)
      .where(
        and(eq(cartItems.userId, userId), eq(cartItems.cupcakeId, cupcakeId))
      )
      .limit(1);
    return result[0] || null;
  }

  static async addItem(data: NewCartItem): Promise<CartItem> {
    const result = await db.insert(cartItems).values(data).returning();
    return result[0];
  }

  static async updateQuantity(
    itemId: string,
    quantity: number
  ): Promise<CartItem> {
    const result = await db
      .update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(cartItems.id, itemId))
      .returning();
    return result[0];
  }

  static async removeItem(itemId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, itemId));
  }

  static async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }
}
