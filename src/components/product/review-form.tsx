'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Star } from 'lucide-react';
import { logger } from '@/lib/logger';

interface ReviewFormProps {
  cupcakeId: string;
  orderId?: string;
}

export function ReviewForm({ cupcakeId, orderId }: ReviewFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cupcakeId,
          orderId,
          rating,
          comment,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: 'Não autenticado',
            description: 'Você precisa estar logado para enviar uma avaliação.',
            variant: 'destructive',
          });
          logger.error('User not authenticated');
          return;
        }
        const error = await response.json();
        throw new Error(error.error || 'Erro ao enviar avaliação');
      }

      toast({
        title: 'Avaliação enviada',
        description: 'Obrigado pela sua avaliação!',
        variant: 'success',
      });

      router.refresh();
      setComment('');
      setRating(5);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao enviar avaliação';
      toast({
        title: 'Erro ao enviar avaliação',
        description: message,
        variant: 'destructive',
      });
      logger.error('Error submitting review', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Avaliação</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="focus:outline-none"
            >
              <Star
                className={`h-6 w-6 ${
                  star <= rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="comment">Comentário (opcional)</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar Avaliação'}
      </Button>
    </form>
  );
}
