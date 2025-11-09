'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

interface NotificationPreferencesProps {
  userId: string;
  preferences: {
    promotionsEnabled: boolean;
    orderUpdatesEnabled: boolean;
  };
}

export function NotificationPreferences({
  userId: _userId,
  preferences: initialPreferences,
}: NotificationPreferencesProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState(initialPreferences);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (
    key: 'promotionsEnabled' | 'orderUpdatesEnabled'
  ) => {
    const newValue = !preferences[key];
    const preferenceLabel =
      key === 'promotionsEnabled'
        ? 'Promoções e Ofertas'
        : 'Atualizações de Pedidos';
    setPreferences((prev) => ({ ...prev, [key]: newValue }));
    setLoading(true);

    try {
      const response = await fetch('/api/profile/notification-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [key]: newValue,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao atualizar preferências');
      }

      toast({
        title: 'Preferências atualizadas',
        description: `${preferenceLabel} ${
          newValue ? 'ativadas' : 'desativadas'
        } com sucesso.`,
        variant: 'success',
      });

      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Erro ao atualizar preferências de notificações';
      toast({
        title: 'Erro ao atualizar preferências',
        description: message,
        variant: 'destructive',
      });
      logger.error('Error updating notification preferences', err);
      setPreferences((prev) => ({ ...prev, [key]: !newValue }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferências de Notificações</CardTitle>
        <CardDescription>
          Escolha quais notificações você deseja receber
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="promotions">Promoções e Ofertas</Label>
            <p className="text-muted-foreground text-sm">
              Receba notificações sobre promoções e ofertas especiais
            </p>
          </div>
          <Switch
            id="promotions"
            checked={preferences.promotionsEnabled}
            onCheckedChange={() => handleToggle('promotionsEnabled')}
            disabled={loading}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="order-updates">Atualizações de Pedidos</Label>
            <p className="text-muted-foreground text-sm">
              Receba notificações sobre o status dos seus pedidos
            </p>
          </div>
          <Switch
            id="order-updates"
            checked={preferences.orderUpdatesEnabled}
            onCheckedChange={() => handleToggle('orderUpdatesEnabled')}
            disabled={loading}
          />
        </div>
      </CardContent>
    </Card>
  );
}
