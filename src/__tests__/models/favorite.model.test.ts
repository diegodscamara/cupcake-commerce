import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FavoriteModel } from '@/models/favorite.model';
import { db } from '@/lib/db';
import { favorites, cupcakes } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('FavoriteModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findByUserId', () => {
    it('should return favorites with cupcakes for user', async () => {
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

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockFavorites),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await FavoriteModel.findByUserId('user-1');

      expect(result).toEqual(mockFavorites);
      expect(db.select).toHaveBeenCalled();
      expect(mockSelect.from).toHaveBeenCalledWith(favorites);
      expect(mockSelect.innerJoin).toHaveBeenCalledWith(
        cupcakes,
        eq(favorites.cupcakeId, cupcakes.id)
      );
      expect(mockSelect.where).toHaveBeenCalledWith(
        eq(favorites.userId, 'user-1')
      );
    });
  });

  describe('findFavorite', () => {
    it('should return favorite when exists', async () => {
      const mockFavorite = {
        id: 'fav-1',
        userId: 'user-1',
        cupcakeId: 'cupcake-1',
        createdAt: new Date(),
      };

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockFavorite]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await FavoriteModel.findFavorite('user-1', 'cupcake-1');

      expect(result).toEqual(mockFavorite);
      expect(db.select).toHaveBeenCalled();
      expect(mockSelect.from).toHaveBeenCalledWith(favorites);
      expect(mockSelect.where).toHaveBeenCalledWith(
        and(
          eq(favorites.userId, 'user-1'),
          eq(favorites.cupcakeId, 'cupcake-1')
        )
      );
      expect(mockSelect.limit).toHaveBeenCalledWith(1);
    });

    it('should return null when favorite does not exist', async () => {
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await FavoriteModel.findFavorite('user-1', 'cupcake-1');

      expect(result).toBeNull();
    });
  });

  describe('addFavorite', () => {
    it('should add favorite and return it', async () => {
      const newFavorite = {
        userId: 'user-1',
        cupcakeId: 'cupcake-1',
      };

      const mockFavorite = {
        id: 'fav-1',
        ...newFavorite,
        createdAt: new Date(),
      };

      const mockInsert = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockFavorite]),
      };

      vi.mocked(db.insert).mockReturnValue(mockInsert as any);

      const result = await FavoriteModel.addFavorite(newFavorite);

      expect(result).toEqual(mockFavorite);
      expect(db.insert).toHaveBeenCalledWith(favorites);
      expect(mockInsert.values).toHaveBeenCalledWith(newFavorite);
      expect(mockInsert.returning).toHaveBeenCalled();
    });
  });

  describe('removeFavorite', () => {
    it('should remove favorite', async () => {
      const mockDelete = {
        where: vi.fn().mockResolvedValue(undefined),
      };

      vi.mocked(db.delete).mockReturnValue(mockDelete as any);

      await FavoriteModel.removeFavorite('user-1', 'cupcake-1');

      expect(db.delete).toHaveBeenCalledWith(favorites);
      expect(mockDelete.where).toHaveBeenCalledWith(
        and(
          eq(favorites.userId, 'user-1'),
          eq(favorites.cupcakeId, 'cupcake-1')
        )
      );
    });
  });

  describe('isFavorite', () => {
    it('should return true when favorite exists', async () => {
      const mockFavorite = {
        id: 'fav-1',
        userId: 'user-1',
        cupcakeId: 'cupcake-1',
        createdAt: new Date(),
      };

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockFavorite]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await FavoriteModel.isFavorite('user-1', 'cupcake-1');

      expect(result).toBe(true);
    });

    it('should return false when favorite does not exist', async () => {
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await FavoriteModel.isFavorite('user-1', 'cupcake-1');

      expect(result).toBe(false);
    });
  });
});
