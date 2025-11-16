import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CupcakeModel } from '@/models/cupcake.model';
import { db } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

describe('CupcakeModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all active cupcakes', async () => {
      const mockCupcakes = [
        {
          id: '1',
          name: 'Chocolate Cupcake',
          slug: 'chocolate-cupcake',
          price: '12.90',
          stock: 10,
          isActive: true,
        },
      ];

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockCupcakes),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await CupcakeModel.findAll();

      expect(result).toEqual(mockCupcakes);
    });
  });

  describe('findBySlug', () => {
    it('should return cupcake by slug', async () => {
      const mockCupcake = {
        id: '1',
        name: 'Chocolate Cupcake',
        slug: 'chocolate-cupcake',
        price: '12.90',
        stock: 10,
        isActive: true,
      };

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockCupcake]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await CupcakeModel.findBySlug('chocolate-cupcake');

      expect(result).toEqual(mockCupcake);
    });

    it('should return null when cupcake not found', async () => {
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await CupcakeModel.findBySlug('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('search', () => {
    it('should search cupcakes by name or description', async () => {
      const mockCupcakes = [
        {
          id: '1',
          name: 'Chocolate Cupcake',
          slug: 'chocolate-cupcake',
          price: '12.90',
          stock: 10,
          isActive: true,
        },
      ];

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockCupcakes),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await CupcakeModel.search('chocolate');

      expect(result).toEqual(mockCupcakes);
    });
  });
});
