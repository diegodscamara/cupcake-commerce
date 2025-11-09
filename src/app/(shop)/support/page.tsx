'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function SupportPage() {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mock email sending - just simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: 'Mensagem enviada',
        description: 'Obrigado pelo seu contato! Responderemos em breve.',
        variant: 'success',
      });

      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      toast({
        title: 'Erro ao enviar mensagem',
        description: 'Ocorreu um erro ao enviar sua mensagem. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold">Contato e Suporte</h1>

      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Email</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">contato@cupcakeshop.com.br</p>
            <p className="text-muted-foreground text-sm">
              Responderemos em até 24 horas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Telefone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">+55 11 3000-0000</p>
            <p className="text-muted-foreground text-sm">
              De segunda a sexta, 9h-18h
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Entre em Contato</CardTitle>
          <CardDescription>
            Envie sua dúvida, sugestão ou problema. Estamos aqui para ajudar!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Assunto</Label>
              <Input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Mensagem'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
