'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';

interface CartItemDeleteProps {
  itemId: string;
  className?: string;
}

export function CartItemDelete({ itemId, className }: CartItemDeleteProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

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
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        'text-muted-foreground hover:bg-destructive/10 hover:text-destructive size-8 cursor-pointer',
        className
      )}
      onClick={removeItem}
      disabled={loading}
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
