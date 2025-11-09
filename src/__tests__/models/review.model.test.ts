import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReviewModel } from '@/models/review.model';
import { db } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
  },
}));

describe('ReviewModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findByCupcakeId', () => {
    it('should return reviews for cupcake', async () => {
      const mockReviews = [
        {
          id: 'review-1',
          userId: 'user-1',
          cupcakeId: 'cupcake-1',
          rating: 5,
          comment: 'Great!',
        },
        {
          id: 'review-2',
          userId: 'user-2',
          cupcakeId: 'cupcake-1',
          rating: 4,
          comment: 'Good',
        },
      ];

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockReviews),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await ReviewModel.findByCupcakeId('cupcake-1');

      expect(result).toEqual(mockReviews);
    });
  });

  describe('create', () => {
    it('should create a new review', async () => {
      const newReview = {
        userId: 'user-1',
        cupcakeId: 'cupcake-1',
        orderId: 'order-1',
        rating: 5 as const,
        comment: 'Excellent cupcake!',
      };

      const createdReview = {
        id: 'review-1',
        ...newReview,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockInsert = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([createdReview]),
      };

      vi.mocked(db.insert).mockReturnValue(mockInsert as any);

      const result = await ReviewModel.create(newReview);

      expect(result).toEqual(createdReview);
      expect(db.insert).toHaveBeenCalled();
    });
  });

  describe('verifyPurchase', () => {
    it('should return true when user purchased cupcake', async () => {
      const mockOrder = [
        {
          id: 'order-1',
          userId: 'user-1',
        },
      ];

      const mockOrderItem = [
        {
          id: 'item-1',
          orderId: 'order-1',
          cupcakeId: 'cupcake-1',
        },
      ];

      const mockSelectOrder = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockOrder),
      };

      const mockSelectItem = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockOrderItem),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(mockSelectOrder as any)
        .mockReturnValueOnce(mockSelectItem as any);

      const result = await ReviewModel.verifyPurchase(
        'user-1',
        'order-1',
        'cupcake-1'
      );

      expect(result).toBe(true);
    });

    it('should return false when order not found', async () => {
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await ReviewModel.verifyPurchase(
        'user-1',
        'non-existent',
        'cupcake-1'
      );

      expect(result).toBe(false);
    });

    it('should return false when cupcake not in order', async () => {
      const mockOrder = [
        {
          id: 'order-1',
          userId: 'user-1',
        },
      ];

      const mockSelectOrder = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockOrder),
      };

      const mockSelectItem = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(mockSelectOrder as any)
        .mockReturnValueOnce(mockSelectItem as any);

      const result = await ReviewModel.verifyPurchase(
        'user-1',
        'order-1',
        'cupcake-1'
      );

      expect(result).toBe(false);
    });
  });
});
