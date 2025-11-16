import { CartController } from '@/controllers/cart.controller';
import { getSessionCartWithDetails } from '@/lib/utils/cart-session';
import { getCurrentUser } from '@/lib/auth/server';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CartItemQuantity } from '@/components/cart/cart-item-quantity';
import { CartItemDelete } from '@/components/cart/cart-item-delete';
import {
  ShoppingBag,
  Package,
  Shield,
  CreditCard,
  Store,
  MoveRight,
} from 'lucide-react';

async function getCartItems() {
  const user = await getCurrentUser();

  if (user) {
    return CartController.getCartItems(user.id);
  } else {
    return getSessionCartWithDetails();
  }
}

export default async function CartPage() {
  const cartItems = await getCartItems();

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.cupcake.price) * item.quantity,
    0
  );

  const shippingThreshold = 200;
  const shipping = subtotal >= shippingThreshold ? 0 : 15.99;
  const total = subtotal + shipping;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Seu Carrinho de Compras
        </h1>
        <p className="text-muted-foreground">
          {cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'} no seu
          carrinho •{' '}
          <span className="text-foreground font-semibold">
            R$ {subtotal.toFixed(2).replace('.', ',')}
          </span>
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex-1 space-y-6">
          {cartItems.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingBag className="text-muted-foreground/50 mb-4 size-12" />
                <h3 className="text-lg font-medium">Seu carrinho está vazio</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Adicione alguns itens para começar
                </p>
                <Link href="/products" className="mt-4">
                  <Button variant="outline" className="cursor-pointer">
                    Continuar Comprando
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            cartItems.map((item) => (
              <Card key={item.id} className="gap-0 overflow-hidden py-0">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative h-auto w-full sm:w-40">
                    {item.cupcake.imageUrl ? (
                      <Image
                        src={item.cupcake.imageUrl}
                        alt={item.cupcake.name}
                        width={160}
                        height={144}
                        className="h-36 w-full object-cover object-center"
                      />
                    ) : (
                      <div className="bg-muted flex h-36 w-full items-center justify-center text-4xl">
                        🧁
                      </div>
                    )}
                  </div>

                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-foreground text-lg font-medium">
                          {item.cupcake.name}
                        </h3>
                        {item.cupcake.description && (
                          <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                            {item.cupcake.description}
                          </p>
                        )}
                      </div>
                      <CartItemDelete
                        itemId={item.id}
                        cupcakeId={item.cupcakeId}
                      />
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <CartItemQuantity
                        itemId={item.id}
                        cupcakeId={item.cupcakeId}
                        quantity={item.quantity}
                        maxQuantity={item.cupcake.stock}
                      />

                      <div className="text-end">
                        <p className="text-lg font-semibold">
                          R${' '}
                          {(Number(item.cupcake.price) * item.quantity)
                            .toFixed(2)
                            .replace('.', ',')}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          R${' '}
                          {Number(item.cupcake.price)
                            .toFixed(2)
                            .replace('.', ',')}{' '}
                          cada
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <CardFooter className="bg-muted/20 border-t px-4 !py-2">
                  <div className="text-muted-foreground flex items-center text-sm">
                    <Package className="me-2 size-4" />
                    <span>
                      {item.cupcake.stock > 0
                        ? 'Em estoque • Entrega em 2-4 dias úteis'
                        : 'Esgotado'}
                    </span>
                  </div>
                </CardFooter>
              </Card>
            ))
          )}
        </div>

        <div className="w-full space-y-4 lg:w-96">
          <Card className="sticky top-4 gap-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frete</span>
                  <span className={shipping === 0 ? 'text-green-600' : ''}>
                    {shipping === 0
                      ? 'Grátis'
                      : `R$ ${shipping.toFixed(2).replace('.', ',')}`}
                  </span>
                </div>
                {subtotal < shippingThreshold && (
                  <p className="text-muted-foreground text-xs">
                    Faltam R${' '}
                    {(shippingThreshold - subtotal)
                      .toFixed(2)
                      .replace('.', ',')}{' '}
                    para frete grátis
                  </p>
                )}
              </div>

              <Separator className="my-2" />

              <div className="flex items-center justify-between text-base font-medium">
                <span>Total</span>
                <div className="text-end">
                  <p className="text-xl font-bold">
                    R$ {total.toFixed(2).replace('.', ',')}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    incluindo impostos, se aplicável
                  </p>
                </div>
              </div>

              <Link href="/checkout" className="block">
                <Button
                  size="lg"
                  className="mt-4 w-full cursor-pointer text-base font-medium"
                  disabled={cartItems.length === 0}
                >
                  <ShoppingBag className="me-2 size-5" />
                  Finalizar Compra
                </Button>
              </Link>

              <div className="text-muted-foreground flex items-center justify-center gap-2 text-xs">
                <CreditCard className="size-3.5" />
                <span>Pagamento seguro com criptografia SSL</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-dashed py-4">
            <CardContent className="px-4">
              <div className="flex items-start gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <Shield className="size-5" />
                </div>
                <div>
                  <h4 className="font-medium">Checkout Seguro</h4>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Suas informações de pagamento estão criptografadas e
                    seguras.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Link href="/products" className="block">
            <Button variant="outline" className="w-full cursor-pointer">
              <Store className="me-2 size-4" />
              Continuar Comprando
              <MoveRight className="ms-2 size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
