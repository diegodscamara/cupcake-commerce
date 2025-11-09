import { db } from '@/lib/db';
import { reviews, orders, orderItems, users } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import type { Review, NewReview } from '@/lib/db/schema';

export interface ReviewWithUser extends Review {
  user: {
    email: string;
    fullName: string | null;
  };
}

export class ReviewModel {
  static async findByCupcakeId(cupcakeId: string): Promise<ReviewWithUser[]> {
    const result = await db
      .select({
        id: reviews.id,
        userId: reviews.userId,
        cupcakeId: reviews.cupcakeId,
        orderId: reviews.orderId,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        updatedAt: reviews.updatedAt,
        user: {
          email: users.email,
          fullName: users.fullName,
        },
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.cupcakeId, cupcakeId))
      .orderBy(desc(reviews.createdAt));
    return result as ReviewWithUser[];
  }

  static async findByUserAndCupcake(
    userId: string,
    cupcakeId: string
  ): Promise<Review | null> {
    const result = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.userId, userId), eq(reviews.cupcakeId, cupcakeId)))
      .limit(1);
    return result[0] || null;
  }

  static async create(data: NewReview): Promise<Review> {
    const result = await db.insert(reviews).values(data).returning();
    return result[0];
  }

  static async verifyPurchase(
    userId: string,
    orderId: string,
    cupcakeId: string
  ): Promise<boolean> {
    const order = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
      .limit(1);

    if (order.length === 0) {
      return false;
    }

    const orderItem = await db
      .select()
      .from(orderItems)
      .where(
        and(
          eq(orderItems.orderId, orderId),
          eq(orderItems.cupcakeId, cupcakeId)
        )
      )
      .limit(1);

    return orderItem.length > 0;
  }
}
