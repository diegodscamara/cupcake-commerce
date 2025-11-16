import { NextRequest, NextResponse } from 'next/server';
import { OrderController } from '@/controllers/order.controller';
import { requireAuth, handleApiError } from '@/lib/api-helpers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    const result = await OrderController.reorderOrder(id, user.id);

    return NextResponse.json({
      success: true,
      addedCount: result.addedCount,
      skippedCount: result.skippedCount,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
