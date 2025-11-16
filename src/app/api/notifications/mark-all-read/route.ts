import { NextRequest, NextResponse } from 'next/server';
import { NotificationModel } from '@/models/notification.model';
import { requireAuth, handleApiError } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await NotificationModel.markAllAsRead(user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
