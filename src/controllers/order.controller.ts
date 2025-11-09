import { OrderModel } from '@/models/order.model';
import { CartModel } from '@/models/cart.model';
import { CouponModel } from '@/models/coupon.model';
import { AddressModel } from '@/models/address.model';
import { NotFoundError, ValidationError } from '@/lib/errors';
import { orders, orderItems, cartItems } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { NewOrder, NewOrderItem } from '@/lib/db/schema';
import { db } from '@/lib/db';
import { calculateShipping, type DeliveryMethod } from '@/lib/utils/shipping';

export class OrderController {
  static async getOrders(userId: string) {
    return OrderModel.findByUserId(userId);
  }

  static async getOrderById(orderId: string, userId: string) {
    const order = await OrderModel.findById(orderId);
    if (!order || order.userId !== userId) {
      throw new NotFoundError('Order', orderId);
    }
    return order;
  }

  static async createOrder(
    userId: string,
    data: {
      addressId: string | null;
      deliveryMethod: DeliveryMethod;
      couponCode?: string | null;
    }
  ) {
    // Get cart items
    const userCartItems = await CartModel.findByUserId(userId);
    if (userCartItems.length === 0) {
      throw new ValidationError('Cart is empty');
    }

    // Validate stock for all items before creating order
    for (const item of userCartItems) {
      if (item.cupcake.stock < item.quantity) {
        throw new ValidationError(
          `Produto "${item.cupcake.name}" não possui estoque suficiente. Disponível: ${item.cupcake.stock} unidades, solicitado: ${item.quantity} unidades.`
        );
      }
    }

    // Verify address (not required for pickup)
    let address = null;
    if (data.addressId && data.deliveryMethod !== 'pickup') {
      address = await AddressModel.findById(data.addressId);
      if (!address || address.userId !== userId) {
        throw new NotFoundError('Address', data.addressId);
      }
    }

    // Calculate subtotal (without shipping)
    const itemsSubtotal = userCartItems.reduce(
      (sum, item) => sum + Number(item.cupcake.price) * item.quantity,
      0
    );

    // Calculate shipping cost
    let shippingCost = 0;
    if (data.deliveryMethod !== 'pickup' && address) {
      const shipping = await calculateShipping({
        zipCode: address.zipCode,
        deliveryMethod: data.deliveryMethod,
        orderValue: itemsSubtotal,
      });
      shippingCost = shipping.cost;
    }

    const subtotal = itemsSubtotal + shippingCost;

    // Apply coupon if provided
    let discount = 0;
    if (data.couponCode) {
      const coupon = await CouponModel.findByCode(data.couponCode);
      if (coupon) {
        const validation = await CouponModel.validate(coupon);
        if (
          validation.valid &&
          coupon.minPurchase &&
          subtotal >= Number(coupon.minPurchase)
        ) {
          if (coupon.discountType === 'percentage') {
            discount = (subtotal * Number(coupon.discountValue)) / 100;
            if (coupon.maxDiscount) {
              discount = Math.min(discount, Number(coupon.maxDiscount));
            }
          } else {
            discount = Number(coupon.discountValue);
          }
          await CouponModel.incrementUsage(coupon.id);
        }
      }
    }

    const total = subtotal - discount;

    // Create order and items within a transaction
    // This ensures atomicity: if any step fails, everything is rolled back
    const order = await db.transaction(async (tx) => {
      // Create order
      const orderData: NewOrder = {
        userId,
        addressId: data.addressId || null,
        deliveryMethod: data.deliveryMethod,
        subtotal: subtotal.toString(),
        discount: discount.toString(),
        total: total.toString(),
        status: 'pending',
        paymentStatus: 'pending',
      };

      const [newOrder] = await tx.insert(orders).values(orderData).returning();

      // Create order items
      const itemsData: NewOrderItem[] = userCartItems.map((item) => ({
        orderId: newOrder.id,
        cupcakeId: item.cupcakeId,
        quantity: item.quantity,
        price: item.cupcake.price,
      }));

      await tx.insert(orderItems).values(itemsData);

      // Clear cart within transaction
      await tx.delete(cartItems).where(eq(cartItems.userId, userId));

      return newOrder;
    });

    return order;
  }

  static async cancelOrder(orderId: string, userId: string) {
    const order = await OrderModel.findById(orderId);
    if (!order || order.userId !== userId) {
      throw new NotFoundError('Order', orderId);
    }

    if (order.status !== 'pending' && order.status !== 'processing') {
      throw new ValidationError(
        `Order cannot be cancelled. Current status: ${order.status}`
      );
    }

    return OrderModel.update(orderId, { status: 'cancelled' });
  }

  static async reorderOrder(orderId: string, userId: string) {
    const order = await OrderModel.findById(orderId);
    if (!order || order.userId !== userId) {
      throw new NotFoundError('Order', orderId);
    }

    const items = await OrderModel.getOrderItems(orderId);
    const { CartController } = await import('@/controllers/cart.controller');
    const { CupcakeModel } = await import('@/models/cupcake.model');

    let addedCount = 0;
    let skippedCount = 0;

    for (const item of items) {
      const cupcake = await CupcakeModel.findById(item.cupcake.id);
      if (!cupcake || cupcake.stock === 0) {
        skippedCount++;
        continue;
      }

      const quantityToAdd = Math.min(item.quantity, cupcake.stock);
      try {
        await CartController.addToCart(userId, item.cupcake.id, quantityToAdd);
        addedCount++;
      } catch (error) {
        skippedCount++;
      }
    }

    return {
      addedCount,
      skippedCount,
    };
  }
}
