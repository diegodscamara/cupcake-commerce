import { getCurrentUser } from '@/lib/auth/server';
import { OrderController } from '@/controllers/order.controller';
import { OrderModel } from '@/models/order.model';
import { AddressModel } from '@/models/address.model';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CancelOrderButton } from '@/components/order/cancel-order-button';
import { ReorderButton } from '@/components/order/reorder-button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

async function getOrder(orderId: string) {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  try {
    const order = await OrderController.getOrderById(orderId, user.id);
    const items = await OrderModel.getOrderItems(orderId);
    const address = order.addressId
      ? await AddressModel.findById(order.addressId)
      : null;

    return {
      ...order,
      items,
      address,
    };
  } catch {
    return null;
  }
}

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  processing: 'Processando',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

const paymentStatusLabels: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  failed: 'Falhou',
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  const canCancel = order.status === 'pending' || order.status === 'processing';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link
          href="/orders"
          className="text-muted-foreground hover:text-foreground"
        >
          ← Voltar para pedidos
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">
          Pedido #{order.id.slice(0, 8)}
        </h1>
        <p className="text-muted-foreground">
          Realizado em{' '}
          {format(
            new Date(order.createdAt),
            "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
            {
              locale: ptBR,
            }
          )}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Itens do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="bg-muted relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                    {item.cupcake.imageUrl ? (
                      <Image
                        src={item.cupcake.imageUrl}
                        alt={item.cupcake.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl">
                        🧁
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.cupcake.name}</h3>
                    <p className="text-muted-foreground text-sm">
                      Qtd: {item.quantity} x R${' '}
                      {Number(item.price).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  <p className="font-semibold">
                    R${' '}
                    {(Number(item.price) * item.quantity)
                      .toFixed(2)
                      .replace('.', ',')}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {order.address && (
            <Card>
              <CardHeader>
                <CardTitle>Endereço de Entrega</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{order.address.street}</p>
                <p>
                  {order.address.city}, {order.address.state} -{' '}
                  {order.address.zipCode}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge
                    variant={
                      order.status === 'delivered'
                        ? 'default'
                        : order.status === 'cancelled'
                          ? 'destructive'
                          : 'secondary'
                    }
                  >
                    {statusLabels[order.status]}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pagamento</span>
                  <Badge
                    variant={
                      order.paymentStatus === 'paid'
                        ? 'default'
                        : order.paymentStatus === 'failed'
                          ? 'destructive'
                          : 'secondary'
                    }
                  >
                    {paymentStatusLabels[order.paymentStatus]}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entrega</span>
                  <span>
                    {order.deliveryMethod === 'express'
                      ? 'Expressa'
                      : order.deliveryMethod === 'pickup'
                        ? 'Retirada na Loja'
                        : 'Padrão'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <Link
                    href={`/orders/${order.id}/track`}
                    className="text-primary hover:underline"
                  >
                    Rastrear Pedido →
                  </Link>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>
                    R$ {Number(order.subtotal).toFixed(2).replace('.', ',')}
                  </span>
                </div>
                {Number(order.discount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Desconto</span>
                    <span>
                      - R$ {Number(order.discount).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>
                    R$ {Number(order.total).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <ReorderButton orderId={order.id} />
                {canCancel && <CancelOrderButton orderId={order.id} />}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
