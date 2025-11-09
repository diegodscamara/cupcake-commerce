import { NextRequest, NextResponse } from 'next/server';
import { FavoriteController } from '@/controllers/favorite.controller';
import { requireAuth, parseBody, handleApiError } from '@/lib/api-helpers';
import { z } from 'zod';

const toggleFavoriteSchema = z.object({
  cupcakeId: z.string().uuid('Invalid UUID format'),
});

export async function GET() {
  try {
    const user = await requireAuth({} as NextRequest);
    const favorites = await FavoriteController.getFavorites(user.id);
    return NextResponse.json({ favorites });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await parseBody(request, toggleFavoriteSchema);

    const result = await FavoriteController.toggleFavorite(
      user.id,
      body.cupcakeId
    );

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
