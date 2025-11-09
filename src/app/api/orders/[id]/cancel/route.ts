import { NextRequest, NextResponse } from 'next/server';
import { OrderController } from '@/controllers/order.controller';
import { requireAuth, handleApiError } from '@/lib/api-helpers';
import { z } from 'zod';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    // Validate UUID format
    z.string().uuid().parse(id);

    await OrderController.cancelOrder(id, user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
