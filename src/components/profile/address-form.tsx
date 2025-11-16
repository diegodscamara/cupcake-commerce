'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/hooks/use-toast';
import type { Address } from '@/lib/db/schema';
import { logger } from '@/lib/logger';
import { Trash2, Loader2 } from 'lucide-react';
import { lookupCEP, formatCEP } from '@/lib/utils/cep';

interface AddressFormProps {
  addresses: Address[];
}

export function AddressForm({ addresses }: AddressFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          street,
          city,
          state,
          zipCode,
          isDefault: addresses.length === 0,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao adicionar endereço');
      }

      toast({
        title: 'Endereço adicionado',
        description: 'O endereço foi adicionado com sucesso.',
        variant: 'success',
      });

      router.refresh();
      setStreet('');
      setCity('');
      setState('');
      setZipCode('');
      setCepError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao adicionar endereço';
      toast({
        title: 'Erro ao adicionar endereço',
        description: message,
        variant: 'destructive',
      });
      logger.error('Error adding address', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (addressId: string) => {
    setConfirmDeleteId(addressId);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return;

    setDeletingId(confirmDeleteId);

    try {
      const response = await fetch(`/api/addresses/${confirmDeleteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao excluir endereço');
      }

      toast({
        title: 'Endereço excluído',
        description: 'O endereço foi excluído com sucesso.',
        variant: 'success',
      });

      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao excluir endereço';
      toast({
        title: 'Erro ao excluir endereço',
        description: message,
        variant: 'destructive',
      });
      logger.error('Error deleting address', err);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmDeleteId(null);
        }}
        title="Excluir Endereço"
        description="Tem certeza que deseja excluir este endereço? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />

      {addresses.map((address) => (
        <Card key={address.id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium">{address.street}</p>
                <p className="text-muted-foreground text-sm">
                  {address.city}, {address.state} - {address.zipCode}
                </p>
                {address.isDefault && (
                  <span className="text-primary mt-2 inline-block text-xs">
                    Padrão
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteClick(address.id)}
                disabled={deletingId === address.id}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
        <h3 className="font-semibold">Adicionar Novo Endereço</h3>
        <div className="space-y-2">
          <Label htmlFor="street">Rua</Label>
          <Input
            id="street"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">Estado (UF)</Label>
            <Input
              id="state"
              value={state}
              onChange={(e) => {
                const value = e.target.value.toUpperCase().slice(0, 2);
                setState(value);
              }}
              maxLength={2}
              placeholder="SP"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="zipCode">CEP</Label>
          <div className="relative">
            <Input
              id="zipCode"
              value={zipCode}
              onChange={async (e) => {
                const value = e.target.value.replace(/\D/g, '');
                const formatted = formatCEP(value);
                setZipCode(formatted);
                setCepError(null);

                if (value.length === 8) {
                  setLoadingCEP(true);
                  const cepData = await lookupCEP(value);

                  if (cepData) {
                    setStreet(cepData.logradouro || '');
                    setCity(cepData.localidade || '');
                    setState(cepData.uf || '');
                    setCepError(null);
                  } else {
                    setCepError('CEP não encontrado');
                  }
                  setLoadingCEP(false);
                }
              }}
              placeholder="00000-000"
              maxLength={9}
              required
              className={cepError ? 'border-destructive' : ''}
            />
            {loadingCEP && (
              <Loader2 className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin" />
            )}
          </div>
          {cepError && <p className="text-destructive text-sm">{cepError}</p>}
          {zipCode.length === 9 && !loadingCEP && !cepError && (
            <p className="text-muted-foreground text-xs">
              Endereço preenchido automaticamente
            </p>
          )}
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Adicionando...' : 'Adicionar Endereço'}
        </Button>
      </form>
    </div>
  );
}
