import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FavoriteController } from '@/controllers/favorite.controller';
import { FavoriteModel } from '@/models/favorite.model';
import { CupcakeModel } from '@/models/cupcake.model';
import { NotFoundError } from '@/lib/errors';

vi.mock('@/lib/db', () => ({
  db: {},
}));

vi.mock('@/models/favorite.model');
vi.mock('@/models/cupcake.model');

describe('FavoriteController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getFavorites', () => {
    it('should return favorites for user', async () => {
      const mockFavorites = [
        {
          id: 'fav-1',
          cupcakeId: 'cupcake-1',
          createdAt: new Date(),
          cupcake: {
            id: 'cupcake-1',
            name: 'Chocolate Cupcake',
            price: '12.90',
          },
        },
      ];

      vi.mocked(FavoriteModel.findByUserId).mockResolvedValue(
        mockFavorites as any
      );

      const result = await FavoriteController.getFavorites('user-1');

      expect(result).toEqual(mockFavorites);
      expect(FavoriteModel.findByUserId).toHaveBeenCalledWith('user-1');
    });
  });

  describe('toggleFavorite', () => {
    it('should add favorite when not favorited', async () => {
      const mockCupcake = {
        id: 'cupcake-1',
        name: 'Chocolate Cupcake',
        price: '12.90',
      };

      vi.mocked(CupcakeModel.findById).mockResolvedValue(mockCupcake as any);
      vi.mocked(FavoriteModel.findFavorite).mockResolvedValue(null);
      vi.mocked(FavoriteModel.addFavorite).mockResolvedValue({
        id: 'fav-1',
        userId: 'user-1',
        cupcakeId: 'cupcake-1',
        createdAt: new Date(),
      } as any);

      const result = await FavoriteController.toggleFavorite(
        'user-1',
        'cupcake-1'
      );

      expect(result).toEqual({ favorited: true });
      expect(CupcakeModel.findById).toHaveBeenCalledWith('cupcake-1');
      expect(FavoriteModel.findFavorite).toHaveBeenCalledWith(
        'user-1',
        'cupcake-1'
      );
      expect(FavoriteModel.addFavorite).toHaveBeenCalledWith({
        userId: 'user-1',
        cupcakeId: 'cupcake-1',
      });
    });

    it('should remove favorite when already favorited', async () => {
      const mockCupcake = {
        id: 'cupcake-1',
        name: 'Chocolate Cupcake',
        price: '12.90',
      };

      const mockFavorite = {
        id: 'fav-1',
        userId: 'user-1',
        cupcakeId: 'cupcake-1',
        createdAt: new Date(),
      };

      vi.mocked(CupcakeModel.findById).mockResolvedValue(mockCupcake as any);
      vi.mocked(FavoriteModel.findFavorite).mockResolvedValue(
        mockFavorite as any
      );
      vi.mocked(FavoriteModel.removeFavorite).mockResolvedValue();

      const result = await FavoriteController.toggleFavorite(
        'user-1',
        'cupcake-1'
      );

      expect(result).toEqual({ favorited: false });
      expect(CupcakeModel.findById).toHaveBeenCalledWith('cupcake-1');
      expect(FavoriteModel.findFavorite).toHaveBeenCalledWith(
        'user-1',
        'cupcake-1'
      );
      expect(FavoriteModel.removeFavorite).toHaveBeenCalledWith(
        'user-1',
        'cupcake-1'
      );
    });

    it('should throw NotFoundError when cupcake does not exist', async () => {
      vi.mocked(CupcakeModel.findById).mockResolvedValue(null);

      await expect(
        FavoriteController.toggleFavorite('user-1', 'invalid-cupcake')
      ).rejects.toThrow(NotFoundError);

      expect(CupcakeModel.findById).toHaveBeenCalledWith('invalid-cupcake');
      expect(FavoriteModel.findFavorite).not.toHaveBeenCalled();
    });
  });

  describe('checkFavorite', () => {
    it('should return true when favorite exists', async () => {
      vi.mocked(FavoriteModel.isFavorite).mockResolvedValue(true);

      const result = await FavoriteController.checkFavorite(
        'user-1',
        'cupcake-1'
      );

      expect(result).toBe(true);
      expect(FavoriteModel.isFavorite).toHaveBeenCalledWith(
        'user-1',
        'cupcake-1'
      );
    });

    it('should return false when favorite does not exist', async () => {
      vi.mocked(FavoriteModel.isFavorite).mockResolvedValue(false);

      const result = await FavoriteController.checkFavorite(
        'user-1',
        'cupcake-1'
      );

      expect(result).toBe(false);
      expect(FavoriteModel.isFavorite).toHaveBeenCalledWith(
        'user-1',
        'cupcake-1'
      );
    });
  });
});
