import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductController } from '@/controllers/product.controller';
import { CupcakeModel } from '@/models/cupcake.model';
import { CategoryModel } from '@/models/category.model';
import { ReviewModel } from '@/models/review.model';

vi.mock('@/lib/db', () => ({
  db: {},
}));

vi.mock('@/models/cupcake.model');
vi.mock('@/models/category.model');
vi.mock('@/models/review.model');

describe('ProductController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should return all products and categories when no filters', async () => {
      const mockCupcakes = [
        {
          id: 'cupcake-1',
          name: 'Chocolate Cupcake',
          price: '12.90',
        },
      ];

      const mockCategories = [
        {
          id: 'cat-1',
          name: 'Chocolate',
          slug: 'chocolate',
        },
      ];

      vi.mocked(CupcakeModel.findAll).mockResolvedValue(mockCupcakes as any);
      vi.mocked(CategoryModel.findAll).mockResolvedValue(mockCategories as any);

      const result = await ProductController.getProducts();

      expect(result.cupcakes).toEqual(mockCupcakes);
      expect(result.categories).toEqual(mockCategories);
    });

    it('should filter by category when categorySlug provided', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'Chocolate',
        slug: 'chocolate',
      };

      const mockCupcakes = [
        {
          id: 'cupcake-1',
          name: 'Chocolate Cupcake',
          categoryId: 'cat-1',
        },
      ];

      vi.mocked(CategoryModel.findBySlug).mockResolvedValue(
        mockCategory as any
      );
      vi.mocked(CupcakeModel.findByCategory).mockResolvedValue(
        mockCupcakes as any
      );
      vi.mocked(CategoryModel.findAll).mockResolvedValue([mockCategory] as any);

      await ProductController.getProducts({
        categorySlug: 'chocolate',
      });

      expect(CategoryModel.findBySlug).toHaveBeenCalledWith('chocolate');
      expect(CupcakeModel.findByCategory).toHaveBeenCalledWith('cat-1');
    });

    it('should return all products when category not found', async () => {
      const mockCupcakes = [
        {
          id: 'cupcake-1',
          name: 'Chocolate Cupcake',
        },
      ];

      vi.mocked(CategoryModel.findBySlug).mockResolvedValue(null);
      vi.mocked(CupcakeModel.findAll).mockResolvedValue(mockCupcakes as any);
      vi.mocked(CategoryModel.findAll).mockResolvedValue([]);

      await ProductController.getProducts({
        categorySlug: 'non-existent',
      });

      expect(CupcakeModel.findAll).toHaveBeenCalled();
    });

    it('should search products when search query provided', async () => {
      const mockCupcakes = [
        {
          id: 'cupcake-1',
          name: 'Chocolate Cupcake',
        },
      ];

      vi.mocked(CupcakeModel.findAll).mockResolvedValue(mockCupcakes as any);
      vi.mocked(CupcakeModel.search).mockResolvedValue(mockCupcakes as any);
      vi.mocked(CategoryModel.findAll).mockResolvedValue([]);

      const result = await ProductController.getProducts({
        search: 'chocolate',
      });

      expect(CupcakeModel.search).toHaveBeenCalledWith('chocolate');
      expect(result.cupcakes).toEqual(mockCupcakes);
    });
  });

  describe('getProductBySlug', () => {
    it('should return product with reviews and average rating', async () => {
      const mockCupcake = {
        id: 'cupcake-1',
        name: 'Chocolate Cupcake',
        slug: 'chocolate-cupcake',
        categoryId: 'cat-1',
      };

      const mockCategory = {
        id: 'cat-1',
        name: 'Chocolate',
      };

      const mockReviews = [
        { id: 'review-1', rating: 5 },
        { id: 'review-2', rating: 4 },
        { id: 'review-3', rating: 5 },
      ];

      vi.mocked(CupcakeModel.findBySlug).mockResolvedValue(mockCupcake as any);
      vi.mocked(CategoryModel.findById).mockResolvedValue(mockCategory as any);
      vi.mocked(ReviewModel.findByCupcakeId).mockResolvedValue(
        mockReviews as any
      );

      const result =
        await ProductController.getProductBySlug('chocolate-cupcake');

      expect(result).toMatchObject({
        ...mockCupcake,
        category: mockCategory,
        reviews: mockReviews,
        avgRating: (5 + 4 + 5) / 3,
      });
    });

    it('should return null when product not found', async () => {
      vi.mocked(CupcakeModel.findBySlug).mockResolvedValue(null);

      const result = await ProductController.getProductBySlug('non-existent');

      expect(result).toBeNull();
    });

    it('should calculate average rating correctly', async () => {
      const mockCupcake = {
        id: 'cupcake-1',
        name: 'Chocolate Cupcake',
        slug: 'chocolate-cupcake',
        categoryId: null,
      };

      const mockReviews = [
        { id: 'review-1', rating: 5 },
        { id: 'review-2', rating: 3 },
        { id: 'review-3', rating: 4 },
      ];

      vi.mocked(CupcakeModel.findBySlug).mockResolvedValue(mockCupcake as any);
      vi.mocked(CategoryModel.findById).mockResolvedValue(null);
      vi.mocked(ReviewModel.findByCupcakeId).mockResolvedValue(
        mockReviews as any
      );

      const result =
        await ProductController.getProductBySlug('chocolate-cupcake');

      expect(result?.avgRating).toBe(4); // (5 + 3 + 4) / 3 = 4
    });

    it('should return 0 rating when no reviews', async () => {
      const mockCupcake = {
        id: 'cupcake-1',
        name: 'Chocolate Cupcake',
        slug: 'chocolate-cupcake',
        categoryId: null,
      };

      vi.mocked(CupcakeModel.findBySlug).mockResolvedValue(mockCupcake as any);
      vi.mocked(CategoryModel.findById).mockResolvedValue(null);
      vi.mocked(ReviewModel.findByCupcakeId).mockResolvedValue([]);

      const result =
        await ProductController.getProductBySlug('chocolate-cupcake');

      expect(result?.avgRating).toBe(0);
    });
  });
});
