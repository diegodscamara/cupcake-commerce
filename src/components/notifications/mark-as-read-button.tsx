'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';

interface MarkAsReadButtonProps {
  userId: string;
}

export function MarkAsReadButton({ userId: _userId }: MarkAsReadButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      logger.error('Error marking notifications as read', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleMarkAllAsRead} disabled={loading} variant="outline">
      {loading ? 'Marcando...' : 'Marcar todas como lidas'}
    </Button>
  );
}
