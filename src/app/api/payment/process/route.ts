import { NextRequest, NextResponse } from 'next/server';
import { PaymentController } from '@/controllers/payment.controller';
import { parseBody, handleApiError } from '@/lib/api-helpers';
import { processPaymentSchema } from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request, processPaymentSchema);
    const result = await PaymentController.processPayment(
      body.orderId,
      body.amount
    );
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
