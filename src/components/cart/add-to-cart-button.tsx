'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { logger } from '@/lib/logger';
import type { CartItem } from '@/lib/types/cart';

interface AddToCartButtonProps {
  cupcakeId: string;
  disabled?: boolean;
}

interface CartItemState {
  id: string;
  quantity: number;
  cupcakeId: string;
}

export function AddToCartButton({ cupcakeId, disabled }: AddToCartButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [cartItem, setCartItem] = useState<CartItemState | null>(null);

  useEffect(() => {
    const checkCartItem = async () => {
      try {
        const response = await fetch('/api/cart');
        if (response.ok) {
          const data = await response.json();
          const item = data.items.find(
            (item: CartItem) => item.cupcakeId === cupcakeId
          );
          if (item) {
            setCartItem({
              id: item.id,
              quantity: item.quantity,
              cupcakeId: item.cupcakeId,
            });
          } else {
            setCartItem(null);
          }
        }
      } catch (err) {
        logger.error('Error checking cart item', err);
      } finally {
        setChecking(false);
      }
    };

    checkCartItem();
  }, [cupcakeId]);

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cupcakeId,
          quantity: 1,
        }),
      });

      if (response.ok) {
        const cartResponse = await fetch('/api/cart');
        if (cartResponse.ok) {
          const cartData = await cartResponse.json();
          const item = cartData.items.find(
            (item: CartItem) => item.cupcakeId === cupcakeId
          );
          if (item) {
            setCartItem({
              id: item.id,
              quantity: item.quantity,
              cupcakeId: item.cupcakeId,
            });
          } else {
            setCartItem(null);
          }
        }
        toast({
          title: 'Adicionado ao carrinho',
          description: 'O produto foi adicionado ao seu carrinho.',
          variant: 'success',
        });
        router.refresh();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao adicionar ao carrinho');
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao adicionar ao carrinho';
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive',
      });
      logger.error('Error adding to cart', err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (newQuantity: number) => {
    if (!cartItem) return;

    if (newQuantity < 1) {
      await removeItem();
      return;
    }

    setLoading(true);
    try {
      const isSessionCart = cartItem.id.startsWith('session_');
      const response = await fetch('/api/cart', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(isSessionCart
            ? { cupcakeId: cartItem.cupcakeId }
            : { itemId: cartItem.id }),
          quantity: newQuantity,
        }),
      });

      if (response.ok) {
        setCartItem({ ...cartItem, quantity: newQuantity });
        router.refresh();
      } else {
        throw new Error('Erro ao atualizar quantidade');
      }
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar quantidade do item.',
        variant: 'destructive',
      });
      logger.error('Error updating cart', err);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async () => {
    if (!cartItem) return;

    setLoading(true);
    try {
      const isSessionCart = cartItem.id.startsWith('session_');
      const url = isSessionCart
        ? `/api/cart?cupcakeId=${cartItem.cupcakeId}`
        : `/api/cart?itemId=${cartItem.id}`;

      const response = await fetch(url, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCartItem(null);
        toast({
          title: 'Item removido',
          description: 'O item foi removido do carrinho.',
          variant: 'success',
        });
        router.refresh();
      } else {
        throw new Error('Erro ao remover item');
      }
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Erro ao remover item do carrinho.',
        variant: 'destructive',
      });
      logger.error('Error removing item', err);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <Button disabled className="w-full" size="lg">
        <ShoppingCart className="mr-2 h-5 w-5" />
        Carregando...
      </Button>
    );
  }

  // If item is in cart, show quantity controls
  if (cartItem) {
    return (
      <div className="flex w-full items-center justify-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => updateQuantity(cartItem.quantity - 1)}
          disabled={disabled || loading}
          className="h-10 w-10"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="min-w-8 text-center font-semibold">
          {cartItem.quantity}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => updateQuantity(cartItem.quantity + 1)}
          disabled={disabled || loading}
          className="h-10 w-10"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // If item is not in cart, show add button
  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabled || loading}
      className="w-full"
      size="lg"
    >
      <ShoppingCart className="mr-2 h-5 w-5" />
      {loading ? 'Adicionando...' : 'Adicionar ao Carrinho'}
    </Button>
  );
}
