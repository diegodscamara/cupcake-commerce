import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CartController } from '@/controllers/cart.controller';
import { CartModel } from '@/models/cart.model';
import { CupcakeModel } from '@/models/cupcake.model';

vi.mock('@/lib/db', () => ({
  db: {},
}));

vi.mock('@/models/cart.model');
vi.mock('@/models/cupcake.model');

describe('CartController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCartItems', () => {
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

      vi.mocked(CartModel.findByUserId).mockResolvedValue(mockItems as any);

      const result = await CartController.getCartItems('user-1');

      expect(result).toEqual(mockItems);
      expect(CartModel.findByUserId).toHaveBeenCalledWith('user-1');
    });
  });

  describe('addToCart', () => {
    it('should add new item to cart when item does not exist', async () => {
      const mockCupcake = {
        id: 'cupcake-1',
        name: 'Chocolate Cupcake',
        price: '12.90',
      };

      vi.mocked(CupcakeModel.findById).mockResolvedValue(mockCupcake as any);
      vi.mocked(CartModel.findItem).mockResolvedValue(null);
      vi.mocked(CartModel.addItem).mockResolvedValue({
        id: 'cart-item-1',
        userId: 'user-1',
        cupcakeId: 'cupcake-1',
        quantity: 1,
      } as any);

      await CartController.addToCart('user-1', 'cupcake-1', 1);

      expect(CupcakeModel.findById).toHaveBeenCalledWith('cupcake-1');
      expect(CartModel.findItem).toHaveBeenCalledWith('user-1', 'cupcake-1');
      expect(CartModel.addItem).toHaveBeenCalledWith({
        userId: 'user-1',
        cupcakeId: 'cupcake-1',
        quantity: 1,
      });
    });

    it('should update quantity when item already exists in cart', async () => {
      const mockCupcake = {
        id: 'cupcake-1',
        name: 'Chocolate Cupcake',
        price: '12.90',
      };

      const existingItem = {
        id: 'cart-item-1',
        userId: 'user-1',
        cupcakeId: 'cupcake-1',
        quantity: 2,
      };

      vi.mocked(CupcakeModel.findById).mockResolvedValue(mockCupcake as any);
      vi.mocked(CartModel.findItem).mockResolvedValue(existingItem as any);
      vi.mocked(CartModel.updateQuantity).mockResolvedValue({
        ...existingItem,
        quantity: 3,
      } as any);

      await CartController.addToCart('user-1', 'cupcake-1', 1);

      expect(CartModel.updateQuantity).toHaveBeenCalledWith('cart-item-1', 3);
    });

    it('should throw error when cupcake not found', async () => {
      vi.mocked(CupcakeModel.findById).mockResolvedValue(null);

      await expect(
        CartController.addToCart('user-1', 'non-existent', 1)
      ).rejects.toThrow('Cupcake with id non-existent not found');
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', async () => {
      vi.mocked(CartModel.updateQuantity).mockResolvedValue({
        id: 'cart-item-1',
        quantity: 5,
      } as any);

      const result = await CartController.updateQuantity('cart-item-1', 5);

      expect(CartModel.updateQuantity).toHaveBeenCalledWith('cart-item-1', 5);
      expect(result.quantity).toBe(5);
    });

    it('should throw error when quantity is less than 1', async () => {
      await expect(
        CartController.updateQuantity('cart-item-1', 0)
      ).rejects.toThrow('Quantity must be at least 1');
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', async () => {
      vi.mocked(CartModel.removeItem).mockResolvedValue(undefined);

      await CartController.removeItem('cart-item-1');

      expect(CartModel.removeItem).toHaveBeenCalledWith('cart-item-1');
    });
  });
});
