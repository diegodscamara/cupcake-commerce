import { createClient } from '@/lib/supabase/server';
import { NotificationModel } from '@/models/notification.model';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Package, Tag, Info } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MarkAsReadButton } from '@/components/notifications/mark-as-read-button';

const typeIcons = {
  info: Info,
  promotion: Tag,
  order: Package,
  system: Bell,
};

const typeLabels = {
  info: 'Informação',
  promotion: 'Promoção',
  order: 'Pedido',
  system: 'Sistema',
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const notifications = await NotificationModel.findByUserId(user.id);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-bold">Notificações</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} notificação${unreadCount > 1 ? 'ões' : ''} não lida${unreadCount > 1 ? 's' : ''}`
              : 'Todas as notificações foram lidas'}
          </p>
        </div>
        {unreadCount > 0 && <MarkAsReadButton userId={user.id} />}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BellOff className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground text-lg">
              Nenhuma notificação ainda
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => {
            const Icon = typeIcons[notification.type] || typeIcons.info;

            return (
              <Card
                key={notification.id}
                className={notification.isRead ? 'opacity-75' : ''}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                        notification.type === 'promotion'
                          ? 'bg-yellow-100 text-yellow-600'
                          : notification.type === 'order'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <div className="mb-1 flex items-center gap-2">
                            <h3 className="font-semibold">
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <Badge variant="default" className="h-5">
                                Nova
                              </Badge>
                            )}
                          </div>
                          <Badge variant="outline" className="mb-2">
                            {typeLabels[notification.type]}
                          </Badge>
                        </div>
                        <span className="text-muted-foreground text-xs">
                          {format(
                            new Date(notification.createdAt),
                            "dd 'de' MMMM 'às' HH:mm",
                            { locale: ptBR }
                          )}
                        </span>
                      </div>
                      <p className="text-muted-foreground">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
