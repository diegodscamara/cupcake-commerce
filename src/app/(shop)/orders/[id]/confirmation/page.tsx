import { OrderController } from '@/controllers/order.controller';
import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Package, MapPin } from 'lucide-react';
import { getShippingLabel, getShippingDescription } from '@/lib/utils/shipping';

export default async function OrderConfirmationPage({
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
    redirect('/login');
  }

  const order = await OrderController.getOrderById(id, user.id);

  if (!order) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h1 className="mb-2 text-4xl font-bold">Pedido Confirmado!</h1>
          <p className="text-muted-foreground text-lg">
            Seu pedido #{order.id.slice(0, 8).toUpperCase()} foi recebido com
            sucesso
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Detalhes do Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status do Pagamento</span>
              <Badge
                variant={
                  order.paymentStatus === 'paid' ? 'default' : 'secondary'
                }
              >
                {order.paymentStatus === 'paid' ? 'Pago' : 'Pendente'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status do Pedido</span>
              <Badge variant="outline">{order.status}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Método de Entrega</span>
              <div className="flex items-center gap-2">
                {order.deliveryMethod === 'pickup' ? (
                  <MapPin className="h-4 w-4" />
                ) : (
                  <Package className="h-4 w-4" />
                )}
                <span>{getShippingLabel(order.deliveryMethod)}</span>
              </div>
            </div>
            {order.deliveryMethod !== 'pickup' && (
              <div className="text-muted-foreground text-sm">
                {getShippingDescription(order.deliveryMethod)}
              </div>
            )}
            <div className="flex items-center justify-between border-t pt-4">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-lg font-bold">
                R$ {Number(order.total).toFixed(2).replace('.', ',')}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/orders" className="flex-1">
            <Button variant="outline" className="w-full">
              Ver Meus Pedidos
            </Button>
          </Link>
          <Link href="/products" className="flex-1">
            <Button className="w-full">Continuar Comprando</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
