import { createClient } from '@/lib/supabase/server';
import { OrderController } from '@/controllers/order.controller';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Circle,
  Package,
  Truck,
  Home,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getShippingLabel, getShippingDescription } from '@/lib/utils/shipping';

const statusSteps = [
  { key: 'pending', label: 'Pedido Recebido', icon: Circle },
  { key: 'processing', label: 'Preparando', icon: Package },
  { key: 'shipped', label: 'Enviado', icon: Truck },
  { key: 'delivered', label: 'Entregue', icon: Home },
];

export default async function OrderTrackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const order = await OrderController.getOrderById(id, user.id);

  if (!order) {
    notFound();
  }

  const currentStatusIndex = statusSteps.findIndex(
    (step) => step.key === order.status
  );
  const isCancelled = order.status === 'cancelled';

  const getEstimatedDeliveryDate = () => {
    if (order.status === 'delivered' || order.status === 'cancelled') {
      return null;
    }

    const createdDate = new Date(order.createdAt);
    let daysToAdd = 7;

    if (order.deliveryMethod === 'express') {
      daysToAdd = 3;
    } else if (order.deliveryMethod === 'pickup') {
      daysToAdd = 1;
    }

    const estimatedDate = new Date(createdDate);
    estimatedDate.setDate(estimatedDate.getDate() + daysToAdd);

    return estimatedDate;
  };

  const estimatedDelivery = getEstimatedDeliveryDate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link
          href={`/orders/${id}`}
          className="text-muted-foreground hover:text-foreground"
        >
          ← Voltar para detalhes do pedido
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">
          Rastreamento do Pedido #{order.id.slice(0, 8).toUpperCase()}
        </h1>
        <p className="text-muted-foreground">
          Acompanhe o status do seu pedido em tempo real
        </p>
      </div>

      <div className="mx-auto max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Status do Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            {isCancelled ? (
              <div className="flex items-center gap-4">
                <XCircle className="text-destructive h-8 w-8" />
                <div>
                  <p className="text-destructive text-lg font-semibold">
                    Pedido Cancelado
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Este pedido foi cancelado
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {statusSteps.map((step, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  const Icon = step.icon;

                  return (
                    <div key={step.key} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            isCompleted
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <Icon className="h-5 w-5" />
                          )}
                        </div>
                        {index < statusSteps.length - 1 && (
                          <div
                            className={`mt-2 h-16 w-0.5 ${
                              isCompleted ? 'bg-primary' : 'bg-muted'
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <p
                          className={`font-semibold ${
                            isCurrent ? 'text-primary' : ''
                          }`}
                        >
                          {step.label}
                        </p>
                        {isCurrent && (
                          <p className="text-muted-foreground text-sm">
                            {order.status === 'pending' &&
                              'Aguardando confirmação do pagamento'}
                            {order.status === 'processing' &&
                              'Seu pedido está sendo preparado'}
                            {order.status === 'shipped' &&
                              'Seu pedido está a caminho'}
                            {order.status === 'delivered' &&
                              'Pedido entregue com sucesso!'}
                          </p>
                        )}
                        {isCompleted && index === 0 && (
                          <p className="text-muted-foreground text-sm">
                            {format(
                              new Date(order.createdAt),
                              "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                              { locale: ptBR }
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações de Entrega</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Método de Entrega</span>
              <span className="font-medium">
                {getShippingLabel(order.deliveryMethod)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Prazo Estimado</span>
              <span>{getShippingDescription(order.deliveryMethod)}</span>
            </div>
            {estimatedDelivery && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Previsão de Entrega
                </span>
                <span className="font-medium">
                  {format(estimatedDelivery, "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </span>
              </div>
            )}
            {order.deliveryMethod === 'pickup' && (
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="font-medium text-blue-900">Retirada na Loja</p>
                <p className="text-sm text-blue-700">
                  Seu pedido estará disponível para retirada em nossa loja
                  física. Você receberá uma notificação quando estiver pronto.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status do Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge
                variant={
                  order.paymentStatus === 'paid'
                    ? 'default'
                    : order.paymentStatus === 'failed'
                      ? 'destructive'
                      : 'secondary'
                }
              >
                {order.paymentStatus === 'paid' && 'Pago'}
                {order.paymentStatus === 'pending' && 'Pendente'}
                {order.paymentStatus === 'failed' && 'Falhou'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
