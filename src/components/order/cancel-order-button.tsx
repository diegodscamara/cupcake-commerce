'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

interface CancelOrderButtonProps {
  orderId: string;
}

export function CancelOrderButton({ orderId }: CancelOrderButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
      });

      if (response.ok) {
        toast({
          title: 'Pedido cancelado',
          description: 'O pedido foi cancelado com sucesso.',
          variant: 'success',
        });
        router.refresh();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao cancelar pedido');
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao cancelar pedido';
      toast({
        title: 'Erro ao cancelar pedido',
        description: message,
        variant: 'destructive',
      });
      logger.error('Error cancelling order', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Cancelar Pedido"
        description="Tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita."
        confirmText="Cancelar Pedido"
        cancelText="Voltar"
        onConfirm={handleCancel}
        variant="destructive"
      />
      <Button
        variant="destructive"
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Cancelando...' : 'Cancelar Pedido'}
      </Button>
    </>
  );
}
