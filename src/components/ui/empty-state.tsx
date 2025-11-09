import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Heart, Package, Search } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center px-4 py-12 text-center">
        <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          {icon}
        </div>
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-sm text-sm">
          {description}
        </p>
        {action && (
          <Link href={action.href}>
            <Button>{action.label}</Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

export function EmptyCart() {
  return (
    <EmptyState
      icon={<ShoppingCart className="text-muted-foreground h-8 w-8" />}
      title="Seu carrinho está vazio"
      description="Adicione produtos ao carrinho para continuar comprando."
      action={{
        label: 'Continuar Comprando',
        href: '/products',
      }}
    />
  );
}

export function EmptyFavorites() {
  return (
    <EmptyState
      icon={<Heart className="text-muted-foreground h-8 w-8" />}
      title="Nenhum favorito ainda"
      description="Adicione produtos aos seus favoritos para encontrá-los facilmente depois."
      action={{
        label: 'Explorar Produtos',
        href: '/products',
      }}
    />
  );
}

export function EmptyOrders() {
  return (
    <EmptyState
      icon={<Package className="text-muted-foreground h-8 w-8" />}
      title="Nenhum pedido encontrado"
      description="Você ainda não realizou nenhum pedido. Comece a comprar agora!"
      action={{
        label: 'Ver Produtos',
        href: '/products',
      }}
    />
  );
}

export function EmptySearch() {
  return (
    <EmptyState
      icon={<Search className="text-muted-foreground h-8 w-8" />}
      title="Nenhum produto encontrado"
      description="Tente ajustar seus filtros ou buscar por outros termos."
    />
  );
}
