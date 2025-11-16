import { NextRequest, NextResponse } from 'next/server';
import { ReviewController } from '@/controllers/review.controller';
import { requireAuth, parseBody, handleApiError } from '@/lib/api-helpers';
import { createReviewSchema } from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await parseBody(request, createReviewSchema);

    const review = await ReviewController.createReview(user.id, {
      cupcakeId: body.cupcakeId,
      orderId: body.orderId,
      rating: body.rating as 1 | 2 | 3 | 4 | 5,
      comment: body.comment,
    });

    return NextResponse.json({ review });
  } catch (error) {
    return handleApiError(error);
  }
}
