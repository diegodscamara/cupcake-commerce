'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { logger } from '@/lib/logger';

interface CartItemActionsProps {
  itemId: string;
  quantity: number;
}

export function CartItemActions({ itemId, quantity }: CartItemActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const updateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) {
      await removeItem();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/cart', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          quantity: newQuantity,
        }),
      });

      if (response.ok) {
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
    setLoading(true);
    try {
      const response = await fetch(`/api/cart?itemId=${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
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

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => updateQuantity(quantity - 1)}
        disabled={loading}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="w-8 text-center">{quantity}</span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => updateQuantity(quantity + 1)}
        disabled={loading}
      >
        <Plus className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={removeItem}
        disabled={loading}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
