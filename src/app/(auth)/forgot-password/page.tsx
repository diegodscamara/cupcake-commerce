'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <Link href="/" className="flex items-center justify-center gap-2">
            <span className="text-3xl">🧁</span>
            <span className="text-2xl font-semibold">Cupcake Commerce</span>
          </Link>

          <Card>
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl">Email Enviado</CardTitle>
              <CardDescription>Verifique sua caixa de entrada</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Enviamos um link de recuperação de senha para {email}. Verifique
                sua caixa de entrada e siga as instruções.
              </p>
            </CardContent>
            <CardFooter className="pt-6">
              <Link href="/login" className="w-full">
                <Button className="w-full">Voltar para Login</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Link href="/" className="flex items-center justify-center gap-2">
          <span className="text-3xl">🧁</span>
          <span className="text-2xl font-semibold">Cupcake Commerce</span>
        </Link>

        <Card>
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl">Recuperar Senha</CardTitle>
            <CardDescription>
              Digite seu email para receber um link de recuperação
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleResetPassword}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-6">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
              </Button>
              <div className="text-muted-foreground text-center text-sm">
                <Link href="/login" className="text-primary hover:underline">
                  Voltar para Login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
