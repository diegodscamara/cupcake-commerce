'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Eye, Search } from 'lucide-react';
import type { Order } from '@/lib/db/schema';

interface OrdersTableProps {
  orders: Order[];
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

const deliveryMethodLabels: Record<string, string> = {
  standard: 'Padrão',
  express: 'Expressa',
  pickup: 'Retirada',
};

export function OrdersTable({ orders }: OrdersTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === 'all' || order.status === statusFilter;
      const matchesPayment =
        paymentFilter === 'all' || order.paymentStatus === paymentFilter;

      // Enhanced search: by ID, date, or total
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm === '' ||
        order.id.toLowerCase().includes(searchLower) ||
        order.id.slice(0, 8).toLowerCase().includes(searchLower) ||
        format(new Date(order.createdAt), 'dd/MM/yyyy', { locale: ptBR })
          .toLowerCase()
          .includes(searchLower) ||
        format(new Date(order.createdAt), 'dd-MM-yyyy', { locale: ptBR })
          .toLowerCase()
          .includes(searchLower) ||
        Number(order.total).toFixed(2).replace('.', ',').includes(searchLower);

      return matchesStatus && matchesPayment && matchesSearch;
    });
  }, [orders, statusFilter, paymentFilter, searchTerm]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getPaymentVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar por ID, data ou valor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="processing">Processando</SelectItem>
              <SelectItem value="shipped">Enviado</SelectItem>
              <SelectItem value="delivered">Entregue</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="paid">Pago</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="failed">Falhou</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground mb-2">
            {orders.length === 0
              ? 'Você ainda não fez nenhum pedido.'
              : 'Nenhum pedido encontrado com os filtros selecionados.'}
          </p>
          {orders.length > 0 && searchTerm && (
            <p className="text-muted-foreground text-sm">
              Tente ajustar os filtros ou buscar por outro termo.
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID do Pedido</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Entrega</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    {format(
                      new Date(order.createdAt),
                      "dd/MM/yyyy 'às' HH:mm",
                      {
                        locale: ptBR,
                      }
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)}>
                      {statusLabels[order.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPaymentVariant(order.paymentStatus)}>
                      {paymentStatusLabels[order.paymentStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {deliveryMethodLabels[order.deliveryMethod]}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    R$ {Number(order.total).toFixed(2).replace('.', ',')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalhes
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {filteredOrders.length > 0 && (
        <div className="text-muted-foreground text-sm">
          Mostrando {filteredOrders.length} de {orders.length} pedido
          {orders.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
