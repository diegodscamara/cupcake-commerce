import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrderModel } from '@/models/order.model';
import { db } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

describe('OrderModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findByUserId', () => {
    it('should return orders for user', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          userId: 'user-1',
          status: 'pending',
          total: '50.00',
        },
        {
          id: 'order-2',
          userId: 'user-1',
          status: 'delivered',
          total: '75.00',
        },
      ];

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockOrders),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await OrderModel.findByUserId('user-1');

      expect(result).toEqual(mockOrders);
    });
  });

  describe('findById', () => {
    it('should return order when found', async () => {
      const mockOrder = {
        id: 'order-1',
        userId: 'user-1',
        status: 'pending',
        total: '50.00',
      };

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockOrder]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await OrderModel.findById('order-1');

      expect(result).toEqual(mockOrder);
    });

    it('should return null when order not found', async () => {
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await OrderModel.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new order', async () => {
      const newOrder = {
        userId: 'user-1',
        addressId: 'address-1',
        deliveryMethod: 'standard' as const,
        subtotal: '50.00',
        discount: '0.00',
        total: '50.00',
        status: 'pending' as const,
        paymentStatus: 'pending' as const,
      };

      const createdOrder = {
        id: 'order-1',
        ...newOrder,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockInsert = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([createdOrder]),
      };

      vi.mocked(db.insert).mockReturnValue(mockInsert as any);

      const result = await OrderModel.create(newOrder);

      expect(result).toEqual(createdOrder);
      expect(db.insert).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update order', async () => {
      const updatedOrder = {
        id: 'order-1',
        status: 'processing' as const,
        updatedAt: new Date(),
      };

      const mockUpdate = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([updatedOrder]),
      };

      vi.mocked(db.update).mockReturnValue(mockUpdate as any);

      const result = await OrderModel.update('order-1', {
        status: 'processing',
      });

      expect(result).toEqual(updatedOrder);
      expect(db.update).toHaveBeenCalled();
    });
  });

  describe('getOrderItems', () => {
    it('should return order items', async () => {
      const mockItems = [
        {
          id: 'item-1',
          quantity: 2,
          price: '12.90',
          cupcake: {
            id: 'cupcake-1',
            name: 'Chocolate Cupcake',
          },
        },
      ];

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockItems),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await OrderModel.getOrderItems('order-1');

      expect(result).toEqual(mockItems);
    });
  });

  describe('createOrderItems', () => {
    it('should create order items', async () => {
      const newItems = [
        {
          orderId: 'order-1',
          cupcakeId: 'cupcake-1',
          quantity: 2,
          price: '12.90',
        },
      ];

      const createdItems = [
        {
          id: 'item-1',
          ...newItems[0],
          createdAt: new Date(),
        },
      ];

      const mockInsert = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue(createdItems),
      };

      vi.mocked(db.insert).mockReturnValue(mockInsert as any);

      const result = await OrderModel.createOrderItems(newItems);

      expect(result).toEqual(createdItems);
      expect(db.insert).toHaveBeenCalled();
    });
  });
});
