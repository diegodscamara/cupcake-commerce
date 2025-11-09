'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Heart } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  cupcakeId: string;
  className?: string;
}

export function FavoriteButton({ cupcakeId, className }: FavoriteButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setChecking(false);
          return;
        }

        const response = await fetch(`/api/favorites/${cupcakeId}`);
        if (response.ok) {
          const data = await response.json();
          setIsFavorite(data.isFavorite);
        }
      } catch (err) {
        logger.error('Error checking favorite status', err);
      } finally {
        setChecking(false);
      }
    };

    checkFavorite();
  }, [cupcakeId]);

  const handleToggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setLoading(true);
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cupcakeId }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.favorited);
        toast({
          title: data.favorited
            ? 'Adicionado aos favoritos'
            : 'Removido dos favoritos',
          description: data.favorited
            ? 'O produto foi adicionado aos seus favoritos.'
            : 'O produto foi removido dos seus favoritos.',
          variant: 'success',
        });
        router.refresh();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao favoritar produto');
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao favoritar produto';
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive',
      });
      logger.error('Error toggling favorite', err);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={loading}
      className={cn('hover:bg-transparent', className)}
      aria-label={
        isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'
      }
    >
      <Heart
        className={cn(
          'h-5 w-5 transition-colors',
          isFavorite
            ? 'fill-red-500 text-red-500'
            : 'text-gray-400 hover:text-red-500'
        )}
      />
    </Button>
  );
}
