import { db } from '@/lib/db';
import { orders, orderItems, cupcakes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { Order, NewOrder, OrderItem, NewOrderItem } from '@/lib/db/schema';

export class OrderModel {
  static async findByUserId(userId: string): Promise<Order[]> {
    return db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(orders.createdAt);
  }

  static async findById(id: string): Promise<Order | null> {
    const result = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);
    return result[0] || null;
  }

  static async create(data: NewOrder): Promise<Order> {
    const result = await db.insert(orders).values(data).returning();
    return result[0];
  }

  static async update(
    id: string,
    data: Partial<Omit<Order, 'id' | 'createdAt'>>
  ): Promise<Order> {
    const result = await db
      .update(orders)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return result[0];
  }

  static async getOrderItems(orderId: string) {
    return db
      .select({
        id: orderItems.id,
        quantity: orderItems.quantity,
        price: orderItems.price,
        cupcake: cupcakes,
      })
      .from(orderItems)
      .innerJoin(cupcakes, eq(orderItems.cupcakeId, cupcakes.id))
      .where(eq(orderItems.orderId, orderId));
  }

  static async createOrderItems(items: NewOrderItem[]): Promise<OrderItem[]> {
    const result = await db.insert(orderItems).values(items).returning();
    return result;
  }
}
