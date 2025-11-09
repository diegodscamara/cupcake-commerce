import { NextRequest, NextResponse } from 'next/server';
import { OrderController } from '@/controllers/order.controller';
import { PaymentController } from '@/controllers/payment.controller';
import { CartController } from '@/controllers/cart.controller';
import { OrderModel } from '@/models/order.model';
import { requireAuth, parseBody, handleApiError } from '@/lib/api-helpers';
import { createOrderSchema } from '@/lib/validators';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const user = await requireAuth({} as NextRequest);
    const orders = await OrderController.getOrders(user.id);
    return NextResponse.json({ orders });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await parseBody(request, createOrderSchema);

    // Create order
    const order = await OrderController.createOrder(user.id, {
      addressId: body.addressId ?? null,
      deliveryMethod: body.deliveryMethod,
      couponCode: body.couponCode ?? undefined,
    });

    // Process payment (mock)
    try {
      const paymentResult = await PaymentController.processPayment(
        order.id,
        Number(order.total)
      );

      // Update order with payment status
      await OrderModel.update(order.id, {
        paymentStatus: paymentResult.success ? 'paid' : 'failed',
        paymentMethod: paymentResult.method,
      });

      // Clear cart after successful order
      if (paymentResult.success) {
        await CartController.clearCart(user.id);
      }

      return NextResponse.json({
        orderId: order.id,
        success: true,
        payment: paymentResult,
      });
    } catch (paymentError) {
      // Payment failed, but order was created
      logger.error('Payment processing failed', paymentError, {
        orderId: order.id,
        userId: user.id,
      });

      await OrderModel.update(order.id, {
        paymentStatus: 'failed',
      });

      return NextResponse.json(
        {
          orderId: order.id,
          success: false,
          error: 'Payment processing failed. Please try again.',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    return handleApiError(error);
  }
}
