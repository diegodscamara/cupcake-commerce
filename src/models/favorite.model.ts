import { db } from '@/lib/db';
import { favorites, cupcakes } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import type { Favorite, NewFavorite } from '@/lib/db/schema';

export class FavoriteModel {
  static async findByUserId(userId: string) {
    return db
      .select({
        id: favorites.id,
        cupcakeId: favorites.cupcakeId,
        createdAt: favorites.createdAt,
        cupcake: cupcakes,
      })
      .from(favorites)
      .innerJoin(cupcakes, eq(favorites.cupcakeId, cupcakes.id))
      .where(eq(favorites.userId, userId));
  }

  static async findFavorite(
    userId: string,
    cupcakeId: string
  ): Promise<Favorite | null> {
    const result = await db
      .select()
      .from(favorites)
      .where(
        and(eq(favorites.userId, userId), eq(favorites.cupcakeId, cupcakeId))
      )
      .limit(1);
    return result[0] || null;
  }

  static async addFavorite(data: NewFavorite): Promise<Favorite> {
    const result = await db.insert(favorites).values(data).returning();
    return result[0];
  }

  static async removeFavorite(
    userId: string,
    cupcakeId: string
  ): Promise<void> {
    await db
      .delete(favorites)
      .where(
        and(eq(favorites.userId, userId), eq(favorites.cupcakeId, cupcakeId))
      );
  }

  static async isFavorite(userId: string, cupcakeId: string): Promise<boolean> {
    const favorite = await this.findFavorite(userId, cupcakeId);
    return favorite !== null;
  }
}
