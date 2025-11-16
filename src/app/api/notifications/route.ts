import { NextRequest, NextResponse } from 'next/server';
import { NotificationModel } from '@/models/notification.model';
import { requireAuth, handleApiError } from '@/lib/api-helpers';

export async function GET() {
  try {
    const user = await requireAuth({} as NextRequest);
    const notifications = await NotificationModel.findByUserId(user.id);
    return NextResponse.json({ notifications });
  } catch (error) {
    return handleApiError(error);
  }
}
