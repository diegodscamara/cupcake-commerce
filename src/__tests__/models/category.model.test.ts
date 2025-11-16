import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CategoryModel } from '@/models/category.model';
import { db } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
  },
}));

describe('CategoryModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      const mockCategories = [
        {
          id: '1',
          name: 'Chocolate',
          slug: 'chocolate',
          description: 'Chocolate cupcakes',
        },
        {
          id: '2',
          name: 'Vanilla',
          slug: 'vanilla',
          description: 'Vanilla cupcakes',
        },
      ];

      const mockSelect = {
        from: vi.fn().mockResolvedValue(mockCategories),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await CategoryModel.findAll();

      expect(result).toEqual(mockCategories);
      expect(db.select).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return category when found', async () => {
      const mockCategory = {
        id: '1',
        name: 'Chocolate',
        slug: 'chocolate',
        description: 'Chocolate cupcakes',
      };

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockCategory]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await CategoryModel.findById('1');

      expect(result).toEqual(mockCategory);
    });

    it('should return null when category not found', async () => {
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await CategoryModel.findById('999');

      expect(result).toBeNull();
    });
  });

  describe('findBySlug', () => {
    it('should return category by slug', async () => {
      const mockCategory = {
        id: '1',
        name: 'Chocolate',
        slug: 'chocolate',
        description: 'Chocolate cupcakes',
      };

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockCategory]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await CategoryModel.findBySlug('chocolate');

      expect(result).toEqual(mockCategory);
    });

    it('should return null when slug not found', async () => {
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await CategoryModel.findBySlug('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new category', async () => {
      const newCategory = {
        name: 'Fruit',
        slug: 'fruit',
        description: 'Fruit cupcakes',
      };

      const createdCategory = {
        id: '3',
        ...newCategory,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockInsert = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([createdCategory]),
      };

      vi.mocked(db.insert).mockReturnValue(mockInsert as any);

      const result = await CategoryModel.create(newCategory);

      expect(result).toEqual(createdCategory);
      expect(db.insert).toHaveBeenCalled();
    });
  });
});
