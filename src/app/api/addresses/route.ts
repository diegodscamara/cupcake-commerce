import { NextRequest, NextResponse } from 'next/server';
import { ProfileController } from '@/controllers/profile.controller';
import { requireAuth, parseBody, handleApiError } from '@/lib/api-helpers';
import { createAddressSchema } from '@/lib/validators';

export async function GET() {
  try {
    const user = await requireAuth({} as NextRequest);
    const addresses = await ProfileController.getUserAddresses(user.id);
    return NextResponse.json({ addresses });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await parseBody(request, createAddressSchema);

    const newAddress = await ProfileController.createAddress(user.id, {
      street: body.street,
      city: body.city,
      state: body.state,
      zipCode: body.zipCode,
      isDefault: body.isDefault,
    });

    return NextResponse.json({ id: newAddress.id });
  } catch (error) {
    return handleApiError(error);
  }
}
