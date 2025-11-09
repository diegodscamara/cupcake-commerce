'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Loader2 } from 'lucide-react';

interface ReorderButtonProps {
  orderId: string;
}

export function ReorderButton({ orderId }: ReorderButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleReorder = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/orders/${orderId}/reorder`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao reordenar');
      }

      const data = await response.json();

      toast({
        title: 'Itens adicionados ao carrinho',
        description: `${data.addedCount} item(ns) foram adicionados ao seu carrinho.`,
        variant: 'success',
      });

      router.push('/cart');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao adicionar itens ao carrinho';
      toast({
        title: 'Erro ao reordenar',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleReorder}
      disabled={loading}
      variant="outline"
      className="w-full"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Adicionando...
        </>
      ) : (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reordenar
        </>
      )}
    </Button>
  );
}
