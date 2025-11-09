import { NextRequest, NextResponse } from 'next/server';
import { ProfileController } from '@/controllers/profile.controller';
import { requireAuth, parseBody, handleApiError } from '@/lib/api-helpers';
import { updateProfileSchema } from '@/lib/validators';

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await parseBody(request, updateProfileSchema);

    await ProfileController.updateProfile(user.id, {
      fullName: body.fullName,
      phone: body.phone,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
