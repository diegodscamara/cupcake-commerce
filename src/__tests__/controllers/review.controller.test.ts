import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReviewController } from '@/controllers/review.controller';
import { ReviewModel } from '@/models/review.model';

vi.mock('@/lib/db', () => ({
  db: {},
}));

vi.mock('@/models/review.model');

describe('ReviewController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createReview', () => {
    it('should create review successfully', async () => {
      const mockReview = {
        id: 'review-1',
        userId: 'user-1',
        cupcakeId: 'cupcake-1',
        rating: 5,
        comment: 'Great cupcake!',
      };

      vi.mocked(ReviewModel.verifyPurchase).mockResolvedValue(true);
      vi.mocked(ReviewModel.create).mockResolvedValue(mockReview as any);

      const result = await ReviewController.createReview('user-1', {
        cupcakeId: 'cupcake-1',
        orderId: 'order-1',
        rating: 5,
        comment: 'Great cupcake!',
      });

      expect(result).toEqual(mockReview);
      expect(ReviewModel.verifyPurchase).toHaveBeenCalledWith(
        'user-1',
        'order-1',
        'cupcake-1'
      );
      expect(ReviewModel.create).toHaveBeenCalled();
    });

    it('should create review without orderId', async () => {
      const mockReview = {
        id: 'review-1',
        userId: 'user-1',
        cupcakeId: 'cupcake-1',
        rating: 4,
      };

      vi.mocked(ReviewModel.create).mockResolvedValue(mockReview as any);

      const result = await ReviewController.createReview('user-1', {
        cupcakeId: 'cupcake-1',
        rating: 4,
      });

      expect(result).toEqual(mockReview);
      expect(ReviewModel.verifyPurchase).not.toHaveBeenCalled();
    });

    it('should throw error when purchase not verified', async () => {
      vi.mocked(ReviewModel.verifyPurchase).mockResolvedValue(false);

      await expect(
        ReviewController.createReview('user-1', {
          cupcakeId: 'cupcake-1',
          orderId: 'order-1',
          rating: 5,
        })
      ).rejects.toThrow('You must purchase this cupcake before reviewing');
    });
  });

  describe('getCupcakeReviews', () => {
    it('should return reviews for cupcake', async () => {
      const mockReviews = [
        {
          id: 'review-1',
          userId: 'user-1',
          cupcakeId: 'cupcake-1',
          rating: 5,
        },
        {
          id: 'review-2',
          userId: 'user-2',
          cupcakeId: 'cupcake-1',
          rating: 4,
        },
      ];

      vi.mocked(ReviewModel.findByCupcakeId).mockResolvedValue(
        mockReviews as any
      );

      const result = await ReviewController.getCupcakeReviews('cupcake-1');

      expect(result).toEqual(mockReviews);
      expect(ReviewModel.findByCupcakeId).toHaveBeenCalledWith('cupcake-1');
    });
  });
});
