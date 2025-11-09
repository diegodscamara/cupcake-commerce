'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckoutForm } from '@/components/checkout/checkout-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import type { DeliveryMethod } from '@/lib/utils/shipping';
import { calculateShipping } from '@/lib/utils/shipping';
import type { Address } from '@/lib/db/schema';

interface CartItem {
  id: string;
  quantity: number;
  cupcake: {
    id: string;
    name: string;
    price: string;
    imageUrl: string | null;
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>('standard');
  const [shippingCost, setShippingCost] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/checkout/data');
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          router.push('/cart');
          return;
        }

        const data = await response.json();
        setItems(data.items);
        setAddresses(data.addresses);
        if (data.addresses.length > 0) {
          setSelectedAddress(data.addresses[0]);
        }
      } catch {
        router.push('/cart');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  useEffect(() => {
    async function updateShipping() {
      if (!selectedAddress || items.length === 0) return;

      const subtotal = items.reduce(
        (sum, item) => sum + Number(item.cupcake.price) * item.quantity,
        0
      );

      const result = await calculateShipping({
        zipCode: selectedAddress.zipCode,
        deliveryMethod,
        orderValue: subtotal,
      });

      setShippingCost(result.cost);
    }

    updateShipping();
  }, [deliveryMethod, selectedAddress, items]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Skeleton className="mb-8 h-10 w-64" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="mb-4 h-10 w-full" />
            <Skeleton className="mb-4 h-64 w-full" />
            <Skeleton className="mb-4 h-64 w-full" />
            <Skeleton className="mb-4 h-64 w-full" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const itemsSubtotal = items.reduce(
    (sum, item) => sum + Number(item.cupcake.price) * item.quantity,
    0
  );

  const subtotal = itemsSubtotal + shippingCost;
  const total = subtotal - couponDiscount;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Finalizar Compra
        </h1>
        <p className="text-muted-foreground">
          Revise seus itens e complete seu pedido
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CheckoutForm
            addresses={addresses}
            items={items}
            shippingCost={shippingCost}
            onDeliveryMethodChange={setDeliveryMethod}
            onCouponChange={(coupon) => {
              setCouponDiscount(coupon?.discount || 0);
            }}
          />
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-4 gap-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="bg-muted relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                      {item.cupcake.imageUrl ? (
                        <Image
                          src={item.cupcake.imageUrl}
                          alt={item.cupcake.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-2xl">
                          🧁
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {item.cupcake.name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Qtd: {item.quantity} x R${' '}
                        {Number(item.cupcake.price)
                          .toFixed(2)
                          .replace('.', ',')}
                      </p>
                    </div>
                    <p className="text-sm font-semibold whitespace-nowrap">
                      R${' '}
                      {(Number(item.cupcake.price) * item.quantity)
                        .toFixed(2)
                        .replace('.', ',')}
                    </p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Subtotal dos itens
                  </span>
                  <span>R$ {itemsSubtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                {shippingCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frete</span>
                    <span>R$ {shippingCost.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm font-medium text-green-600">
                    <span>Desconto</span>
                    <span>
                      - R$ {couponDiscount.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
