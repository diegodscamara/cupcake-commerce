import { NextRequest, NextResponse } from 'next/server';
import { ProfileController } from '@/controllers/profile.controller';
import { requireAuth, handleApiError } from '@/lib/api-helpers';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    await ProfileController.deleteAddress(user.id, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
