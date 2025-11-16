import { getCurrentUser } from '@/lib/auth/server';
import { OrderController } from '@/controllers/order.controller';
import { OrdersTable } from '@/components/orders/orders-table';
import { EmptyOrders } from '@/components/ui/empty-state';
import { redirect } from 'next/navigation';

async function getOrders() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?redirect=/orders');
  }

  const orders = await OrderController.getOrders(user.id);
  return orders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold sm:text-4xl">Meus Pedidos</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Visualize e gerencie todos os seus pedidos
        </p>
      </div>

      {orders.length === 0 ? <EmptyOrders /> : <OrdersTable orders={orders} />}
    </div>
  );
}
