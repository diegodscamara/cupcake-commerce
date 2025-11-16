'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Minus, Plus } from 'lucide-react';
import { logger } from '@/lib/logger';

interface CartItemQuantityProps {
  itemId: string;
  cupcakeId?: string;
  quantity: number;
  maxQuantity?: number;
}

export function CartItemQuantity({
  itemId,
  cupcakeId,
  quantity,
  maxQuantity,
}: CartItemQuantityProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const updateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) {
      return;
    }

    if (maxQuantity && newQuantity > maxQuantity) {
      toast({
        title: 'Erro',
        description: `Quantidade máxima disponível: ${maxQuantity}`,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const isSessionCart = itemId.startsWith('session_');
      const response = await fetch('/api/cart', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(isSessionCart && cupcakeId ? { cupcakeId } : { itemId }),
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

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="size-8 cursor-pointer"
        onClick={() => updateQuantity(quantity - 1)}
        disabled={loading || quantity <= 1}
      >
        <Minus className="size-3" />
      </Button>
      <span className="w-8 text-center text-sm font-medium">{quantity}</span>
      <Button
        variant="outline"
        size="icon"
        className="size-8 cursor-pointer"
        onClick={() => updateQuantity(quantity + 1)}
        disabled={loading || (maxQuantity ? quantity >= maxQuantity : false)}
      >
        <Plus className="size-3" />
      </Button>
    </div>
  );
}
