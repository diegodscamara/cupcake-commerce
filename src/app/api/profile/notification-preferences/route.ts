import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, parseBody, handleApiError } from '@/lib/api-helpers';
import { UserModel } from '@/models/user.model';
import { z } from 'zod';

const updateNotificationPreferencesSchema = z.object({
  promotionsEnabled: z.boolean().optional(),
  orderUpdatesEnabled: z.boolean().optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await parseBody(request, updateNotificationPreferencesSchema);

    await UserModel.update(user.id, body);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
