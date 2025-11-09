'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/db/schema';
import { logger } from '@/lib/logger';

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(user.fullName || '');
  const [phone, setPhone] = useState(user.phone || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          phone,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Perfil atualizado',
          description: 'Suas informações foram salvas com sucesso.',
          variant: 'success',
        });
        router.refresh();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao atualizar perfil');
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao atualizar perfil';
      toast({
        title: 'Erro ao atualizar perfil',
        description: message,
        variant: 'destructive',
      });
      logger.error('Error updating profile', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={user.email} disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fullName">Nome Completo</Label>
        <Input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar Alterações'}
      </Button>
    </form>
  );
}
