import { NextRequest, NextResponse } from 'next/server';
import { FavoriteController } from '@/controllers/favorite.controller';
import { requireAuth, handleApiError } from '@/lib/api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cupcakeId: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { cupcakeId } = await params;

    const isFavorite = await FavoriteController.checkFavorite(
      user.id,
      cupcakeId
    );

    return NextResponse.json({ isFavorite });
  } catch (error) {
    return handleApiError(error);
  }
}
