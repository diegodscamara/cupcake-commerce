import { ReviewModel } from '@/models/review.model';
import { ValidationError } from '@/lib/errors';

export class ReviewController {
  static async createReview(
    userId: string,
    data: {
      cupcakeId: string;
      orderId?: string;
      rating: 1 | 2 | 3 | 4 | 5;
      comment?: string;
    }
  ) {
    // Check if user already reviewed this cupcake
    const existingReview = await ReviewModel.findByUserAndCupcake(
      userId,
      data.cupcakeId
    );
    if (existingReview) {
      throw new ValidationError(
        'You have already reviewed this product. You can only submit one review per product.'
      );
    }

    // Verify purchase if orderId provided
    if (data.orderId) {
      const verified = await ReviewModel.verifyPurchase(
        userId,
        data.orderId,
        data.cupcakeId
      );
      if (!verified) {
        throw new ValidationError(
          'You must purchase this cupcake before reviewing'
        );
      }
    }

    return ReviewModel.create({
      userId,
      cupcakeId: data.cupcakeId,
      orderId: data.orderId || null,
      rating: data.rating,
      comment: data.comment || null,
    });
  }

  static async getCupcakeReviews(cupcakeId: string) {
    return ReviewModel.findByCupcakeId(cupcakeId);
  }
}
