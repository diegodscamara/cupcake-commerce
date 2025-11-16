import { CartModel } from '@/models/cart.model';
import { CupcakeModel } from '@/models/cupcake.model';
import { NotFoundError, ValidationError } from '@/lib/errors';

export class CartController {
  static async getCartItems(userId: string) {
    return CartModel.findByUserId(userId);
  }

  static async addToCart(userId: string, cupcakeId: string, quantity: number) {
    // Check if cupcake exists
    const cupcake = await CupcakeModel.findById(cupcakeId);
    if (!cupcake) {
      throw new NotFoundError('Cupcake', cupcakeId);
    }

    // Check stock availability
    if (cupcake.stock < quantity) {
      throw new ValidationError(
        `Estoque insuficiente. Disponível: ${cupcake.stock} unidades`
      );
    }

    // Check if item already exists in cart
    const existingItem = await CartModel.findItem(userId, cupcakeId);

    if (existingItem) {
      // Check if new total quantity exceeds stock
      const newQuantity = existingItem.quantity + quantity;
      if (cupcake.stock < newQuantity) {
        throw new ValidationError(
          `Estoque insuficiente. Disponível: ${cupcake.stock} unidades. Você já tem ${existingItem.quantity} no carrinho.`
        );
      }
      // Update quantity
      return CartModel.updateQuantity(existingItem.id, newQuantity);
    } else {
      // Add new item
      return CartModel.addItem({
        userId,
        cupcakeId,
        quantity,
      });
    }
  }

  static async updateQuantity(itemId: string, quantity: number) {
    if (quantity < 1) {
      throw new ValidationError('Quantity must be at least 1');
    }

    // Get cart item to check cupcake stock
    const cartItem = await CartModel.findById(itemId);
    if (!cartItem) {
      throw new NotFoundError('Cart item', itemId);
    }

    // Check cupcake stock
    const cupcake = await CupcakeModel.findById(cartItem.cupcakeId);
    if (!cupcake) {
      throw new NotFoundError('Cupcake', cartItem.cupcakeId);
    }

    // Check stock availability
    if (cupcake.stock < quantity) {
      throw new ValidationError(
        `Estoque insuficiente. Disponível: ${cupcake.stock} unidades`
      );
    }

    return CartModel.updateQuantity(itemId, quantity);
  }

  static async removeItem(itemId: string) {
    return CartModel.removeItem(itemId);
  }

  static async clearCart(userId: string) {
    return CartModel.clearCart(userId);
  }
}
