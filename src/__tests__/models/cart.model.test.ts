import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CartModel } from '@/models/cart.model';
import { db } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('CartModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findByUserId', () => {
    it('should return cart items for user', async () => {
      const mockItems = [
        {
          id: '1',
          quantity: 2,
          cupcakeId: 'cupcake-1',
          cupcake: {
            id: 'cupcake-1',
            name: 'Chocolate Cupcake',
            price: '12.90',
          },
        },
      ];

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockItems),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await CartModel.findByUserId('user-1');

      expect(result).toEqual(mockItems);
    });
  });

  describe('findItem', () => {
    it('should return cart item when found', async () => {
      const mockItem = {
        id: '1',
        userId: 'user-1',
        cupcakeId: 'cupcake-1',
        quantity: 2,
      };

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockItem]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await CartModel.findItem('user-1', 'cupcake-1');

      expect(result).toEqual(mockItem);
    });

    it('should return null when item not found', async () => {
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await CartModel.findItem('user-1', 'non-existent');

      expect(result).toBeNull();
    });
  });

  describe('addItem', () => {
    it('should add new item to cart', async () => {
      const newItem = {
        userId: 'user-1',
        cupcakeId: 'cupcake-1',
        quantity: 1,
      };

      const createdItem = {
        id: 'cart-item-1',
        ...newItem,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockInsert = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([createdItem]),
      };

      vi.mocked(db.insert).mockReturnValue(mockInsert as any);

      const result = await CartModel.addItem(newItem);

      expect(result).toEqual(createdItem);
      expect(db.insert).toHaveBeenCalled();
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', async () => {
      const updatedItem = {
        id: 'cart-item-1',
        quantity: 5,
        updatedAt: new Date(),
      };

      const mockUpdate = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([updatedItem]),
      };

      vi.mocked(db.update).mockReturnValue(mockUpdate as any);

      const result = await CartModel.updateQuantity('cart-item-1', 5);

      expect(result).toEqual(updatedItem);
      expect(db.update).toHaveBeenCalled();
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', async () => {
      const mockDelete = {
        where: vi.fn().mockResolvedValue(undefined),
      };

      vi.mocked(db.delete).mockReturnValue(mockDelete as any);

      await CartModel.removeItem('cart-item-1');

      expect(db.delete).toHaveBeenCalled();
    });
  });

  describe('clearCart', () => {
    it('should clear all items for user', async () => {
      const mockDelete = {
        where: vi.fn().mockResolvedValue(undefined),
      };

      vi.mocked(db.delete).mockReturnValue(mockDelete as any);

      await CartModel.clearCart('user-1');

      expect(db.delete).toHaveBeenCalled();
    });
  });
});
