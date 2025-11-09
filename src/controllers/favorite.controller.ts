import { FavoriteModel } from '@/models/favorite.model';
import { CupcakeModel } from '@/models/cupcake.model';
import { NotFoundError } from '@/lib/errors';

export class FavoriteController {
  static async getFavorites(userId: string) {
    return FavoriteModel.findByUserId(userId);
  }

  static async toggleFavorite(userId: string, cupcakeId: string) {
    const cupcake = await CupcakeModel.findById(cupcakeId);
    if (!cupcake) {
      throw new NotFoundError('Cupcake', cupcakeId);
    }

    const existingFavorite = await FavoriteModel.findFavorite(
      userId,
      cupcakeId
    );

    if (existingFavorite) {
      await FavoriteModel.removeFavorite(userId, cupcakeId);
      return { favorited: false };
    } else {
      await FavoriteModel.addFavorite({
        userId,
        cupcakeId,
      });
      return { favorited: true };
    }
  }

  static async checkFavorite(userId: string, cupcakeId: string) {
    return FavoriteModel.isFavorite(userId, cupcakeId);
  }
}
