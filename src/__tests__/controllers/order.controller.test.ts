import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrderController } from '@/controllers/order.controller';
import { OrderModel } from '@/models/order.model';
import { CartModel } from '@/models/cart.model';
import { CouponModel } from '@/models/coupon.model';
import { AddressModel } from '@/models/address.model';

const mockOrderFromTransaction = {
  id: 'order-1',
  userId: 'user-1',
  addressId: 'address-1',
  subtotal: '25.80',
  discount: '0.00',
  total: '25.80',
  status: 'pending',
  paymentStatus: 'pending',
};

vi.mock('@/lib/db', () => ({
  db: {
    transaction: vi.fn(async (callback: any) => {
      // Mock transaction - just execute the callback with a mock tx object
      const mockTx = {
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockOrderFromTransaction]),
          }),
        }),
        delete: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      };
      return callback(mockTx);
    }),
  },
}));

vi.mock('@/models/order.model');
vi.mock('@/models/cart.model');
vi.mock('@/models/coupon.model');
vi.mock('@/models/address.model');

describe('OrderController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getOrders', () => {
    it('should return orders for user', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          userId: 'user-1',
          status: 'pending',
          total: '50.00',
        },
      ];

      vi.mocked(OrderModel.findByUserId).mockResolvedValue(mockOrders as any);

      const result = await OrderController.getOrders('user-1');

      expect(result).toEqual(mockOrders);
      expect(OrderModel.findByUserId).toHaveBeenCalledWith('user-1');
    });
  });

  describe('createOrder', () => {
    it('should create order successfully', async () => {
      const mockCartItems = [
        {
          id: 'cart-item-1',
          quantity: 2,
          cupcakeId: 'cupcake-1',
          cupcake: {
            id: 'cupcake-1',
            name: 'Chocolate Cupcake',
            price: '12.90',
          },
        },
      ];

      const mockAddress = {
        id: 'address-1',
        userId: 'user-1',
        street: '123 Main St',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '12345-678',
      };

      const mockOrder = {
        id: 'order-1',
        userId: 'user-1',
        addressId: 'address-1',
        subtotal: '25.80',
        discount: '0.00',
        total: '25.80',
        status: 'pending',
        paymentStatus: 'pending',
      };

      vi.mocked(CartModel.findByUserId).mockResolvedValue(mockCartItems as any);
      vi.mocked(AddressModel.findById).mockResolvedValue(mockAddress as any);
      vi.mocked(OrderModel.create).mockResolvedValue(mockOrder as any);
      vi.mocked(OrderModel.createOrderItems).mockResolvedValue([]);
      vi.mocked(CartModel.clearCart).mockResolvedValue(undefined);

      const result = await OrderController.createOrder('user-1', {
        addressId: 'address-1',
        deliveryMethod: 'standard',
      });

      expect(result).toEqual(mockOrderFromTransaction);
      expect(CartModel.findByUserId).toHaveBeenCalledWith('user-1');
      expect(AddressModel.findById).toHaveBeenCalledWith('address-1');
    });

    it('should throw error when cart is empty', async () => {
      vi.mocked(CartModel.findByUserId).mockResolvedValue([]);

      await expect(
        OrderController.createOrder('user-1', {
          addressId: 'address-1',
          deliveryMethod: 'standard',
        })
      ).rejects.toThrow('Cart is empty');
    });

    it('should throw error when address is invalid', async () => {
      const mockCartItems = [
        {
          id: 'cart-item-1',
          quantity: 2,
          cupcakeId: 'cupcake-1',
          cupcake: { id: 'cupcake-1', price: '12.90' },
        },
      ];

      vi.mocked(CartModel.findByUserId).mockResolvedValue(mockCartItems as any);
      vi.mocked(AddressModel.findById).mockResolvedValue(null);

      await expect(
        OrderController.createOrder('user-1', {
          addressId: 'invalid-address',
          deliveryMethod: 'standard',
        })
      ).rejects.toThrow('Address with id invalid-address not found');
    });

    it('should apply coupon discount when valid', async () => {
      const mockCartItems = [
        {
          id: 'cart-item-1',
          quantity: 2,
          cupcakeId: 'cupcake-1',
          cupcake: { id: 'cupcake-1', price: '50.00' },
        },
      ];

      const mockAddress = {
        id: 'address-1',
        userId: 'user-1',
        street: '123 Main St',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '12345-678',
      };

      const mockCoupon = {
        id: 'coupon-1',
        code: 'DISCOUNT10',
        discountType: 'percentage' as const,
        discountValue: '10',
        minPurchase: '50.00',
        usedCount: 0,
        usageLimit: 100,
        isActive: true,
      };

      vi.mocked(CartModel.findByUserId).mockResolvedValue(mockCartItems as any);
      vi.mocked(AddressModel.findById).mockResolvedValue(mockAddress as any);
      vi.mocked(CouponModel.findByCode).mockResolvedValue(mockCoupon as any);
      vi.mocked(CouponModel.validate).mockResolvedValue({ valid: true });
      vi.mocked(CouponModel.incrementUsage).mockResolvedValue(undefined);
      vi.mocked(OrderModel.create).mockResolvedValue({
        id: 'order-1',
        total: '90.00',
      } as any);
      vi.mocked(OrderModel.createOrderItems).mockResolvedValue([]);
      vi.mocked(CartModel.clearCart).mockResolvedValue(undefined);

      await OrderController.createOrder('user-1', {
        addressId: 'address-1',
        deliveryMethod: 'standard',
        couponCode: 'DISCOUNT10',
      });

      expect(CouponModel.findByCode).toHaveBeenCalledWith('DISCOUNT10');
      expect(CouponModel.incrementUsage).toHaveBeenCalled();
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order when status is pending', async () => {
      const mockOrder = {
        id: 'order-1',
        userId: 'user-1',
        status: 'pending' as const,
      };

      vi.mocked(OrderModel.findById).mockResolvedValue(mockOrder as any);
      vi.mocked(OrderModel.update).mockResolvedValue({
        ...mockOrder,
        status: 'cancelled',
      } as any);

      const result = await OrderController.cancelOrder('order-1', 'user-1');

      expect(result.status).toBe('cancelled');
    });

    it('should throw error when order cannot be cancelled', async () => {
      const mockOrder = {
        id: 'order-1',
        userId: 'user-1',
        status: 'delivered' as const,
      };

      vi.mocked(OrderModel.findById).mockResolvedValue(mockOrder as any);

      await expect(
        OrderController.cancelOrder('order-1', 'user-1')
      ).rejects.toThrow('Order cannot be cancelled');
    });
  });
});
