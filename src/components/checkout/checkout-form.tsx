'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { logger } from '@/lib/logger';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Address } from '@/lib/db/schema';
import type { DeliveryMethod } from '@/lib/utils/shipping';
import { getShippingLabel, getShippingDescription } from '@/lib/utils/shipping';
import { lookupCEP, formatCEP } from '@/lib/utils/cep';
import { Loader2 } from 'lucide-react';

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

interface CheckoutFormProps {
  addresses: Address[];
  items?: CartItem[];
  onDeliveryMethodChange?: (method: DeliveryMethod) => void;
  onCouponChange?: (coupon: { code: string; discount: number } | null) => void;
  shippingCost?: number;
}

export function CheckoutForm({
  addresses,
  items = [],
  onDeliveryMethodChange,
  onCouponChange,
  shippingCost = 0,
}: CheckoutFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>('standard');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [selectedAddress, setSelectedAddress] = useState<string>('new');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponData, setCouponData] = useState<{
    code: string;
    discount: number;
  } | null>(null);

  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  const handleApplyCoupon = async () => {
    setCouponError(null);
    if (!couponCode) return;

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: couponCode }),
      });

      const data = await response.json();

      if (response.ok && data.coupon) {
        const itemsSubtotal = items.reduce(
          (sum, item) => sum + Number(item.cupcake.price) * item.quantity,
          0
        );
        const subtotal = itemsSubtotal + shippingCost;

        let discount = 0;
        if (data.coupon.discountType === 'percentage') {
          discount = (subtotal * Number(data.coupon.discountValue)) / 100;
          if (data.coupon.maxDiscount) {
            discount = Math.min(discount, Number(data.coupon.maxDiscount));
          }
        } else {
          discount = Number(data.coupon.discountValue);
        }

        if (
          data.coupon.minPurchase &&
          subtotal < Number(data.coupon.minPurchase)
        ) {
          setCouponError(
            `Valor mínimo de compra: R$ ${Number(data.coupon.minPurchase)
              .toFixed(2)
              .replace('.', ',')}`
          );
          return;
        }

        setCouponApplied(true);
        setCouponData({ code: couponCode, discount });
        onCouponChange?.({ code: couponCode, discount });
      } else {
        setCouponError(data.error || 'Cupom inválido');
        setCouponApplied(false);
        setCouponData(null);
        onCouponChange?.(null);
      }
    } catch {
      setCouponError('Erro ao validar cupom');
      setCouponApplied(false);
      setCouponData(null);
      onCouponChange?.(null);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponApplied(false);
    setCouponData(null);
    setCouponError(null);
    onCouponChange?.(null);
  };

  const handleCEPChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const formatted = formatCEP(value);
    setZipCode(formatted);
    setCepError(null);

    if (value.length === 8) {
      setLoadingCEP(true);
      const cepData = await lookupCEP(value);

      if (cepData) {
        setStreet(cepData.logradouro || '');
        setCity(cepData.localidade || '');
        setState(cepData.uf || '');
        setCepError(null);
      } else {
        setCepError('CEP não encontrado');
      }
      setLoadingCEP(false);
    }
  };

  useEffect(() => {
    if (couponApplied && couponCode && couponData) {
      const itemsSubtotal = items.reduce(
        (sum, item) => sum + Number(item.cupcake.price) * item.quantity,
        0
      );
      const subtotal = itemsSubtotal + shippingCost;

      fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: couponCode }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.coupon) {
            let discount = 0;
            if (data.coupon.discountType === 'percentage') {
              discount = (subtotal * Number(data.coupon.discountValue)) / 100;
              if (data.coupon.maxDiscount) {
                discount = Math.min(discount, Number(data.coupon.maxDiscount));
              }
            } else {
              discount = Number(data.coupon.discountValue);
            }
            setCouponData({ code: couponCode, discount });
            onCouponChange?.({ code: couponCode, discount });
          }
        })
        .catch(() => {
          // Silently fail - coupon might have expired
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, shippingCost]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let addressId = selectedAddress;

      if (selectedAddress === 'new') {
        const addressResponse = await fetch('/api/addresses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            street,
            city,
            state,
            zipCode,
            isDefault: addresses.length === 0,
          }),
        });

        const addressData = await addressResponse.json();
        addressId = addressData.id;
      }

      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addressId: deliveryMethod === 'pickup' ? null : addressId,
          deliveryMethod,
          couponCode: couponApplied ? couponCode : null,
        }),
      });

      if (orderResponse.ok) {
        const data = await orderResponse.json();
        router.push(`/orders/${data.orderId}/confirmation`);
      }
    } catch (_error) {
      logger.error('Error creating order', _error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Endereço de Entrega</CardTitle>
          <CardDescription>Escolha ou cadastre um endereço</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {addresses.length > 0 && (
            <Select value={selectedAddress} onValueChange={setSelectedAddress}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um endereço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Novo endereço</SelectItem>
                {addresses.map((address) => (
                  <SelectItem key={address.id} value={address.id}>
                    {address.street}, {address.city} - {address.state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {selectedAddress === 'new' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="street">Rua</Label>
                <Input
                  id="street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado (UF)</Label>
                  <Input
                    id="state"
                    value={state}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase().slice(0, 2);
                      setState(value);
                    }}
                    maxLength={2}
                    placeholder="SP"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">CEP</Label>
                <div className="relative">
                  <Input
                    id="zipCode"
                    value={zipCode}
                    onChange={handleCEPChange}
                    placeholder="00000-000"
                    maxLength={9}
                    required
                    className={cepError ? 'border-destructive' : ''}
                  />
                  {loadingCEP && (
                    <Loader2 className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin" />
                  )}
                </div>
                {cepError && (
                  <p className="text-destructive text-sm">{cepError}</p>
                )}
                {zipCode.length === 9 && !loadingCEP && !cepError && (
                  <p className="text-muted-foreground text-xs">
                    Endereço preenchido automaticamente
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Método de Entrega</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <RadioGroup
            value={deliveryMethod}
            onValueChange={(value: DeliveryMethod) => {
              setDeliveryMethod(value);
              onDeliveryMethodChange?.(value);
            }}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="standard" id="standard" />
              <Label htmlFor="standard" className="flex-1 cursor-pointer">
                <div>
                  <p className="font-medium">{getShippingLabel('standard')}</p>
                  <p className="text-muted-foreground text-sm">
                    {getShippingDescription('standard')} - Grátis
                  </p>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="express" id="express" />
              <Label htmlFor="express" className="flex-1 cursor-pointer">
                <div>
                  <p className="font-medium">{getShippingLabel('express')}</p>
                  <p className="text-muted-foreground text-sm">
                    {getShippingDescription('express')} - R$ 15,00
                  </p>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pickup" id="pickup" />
              <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                <div>
                  <p className="font-medium">{getShippingLabel('pickup')}</p>
                  <p className="text-muted-foreground text-sm">
                    {getShippingDescription('pickup')} - Grátis
                  </p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Cupom de Desconto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!couponApplied ? (
            <div className="flex gap-2">
              <Input
                placeholder="Código do cupom"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyCoupon();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleApplyCoupon}
                disabled={!couponCode.trim()}
              >
                Aplicar
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg border bg-green-50 p-3">
              <div>
                <p className="text-sm font-medium text-green-800">
                  Cupom {couponCode} aplicado
                </p>
                {couponData && (
                  <p className="text-xs text-green-600">
                    Desconto: R${' '}
                    {couponData.discount.toFixed(2).replace('.', ',')}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveCoupon}
              >
                Remover
              </Button>
            </div>
          )}
          {couponError && (
            <p className="text-destructive text-sm">{couponError}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Método de Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="card"
                id="card"
                data-testid="payment-method-card"
                aria-labelledby="card-label"
              />
              <Label
                htmlFor="card"
                id="card-label"
                className="flex-1 cursor-pointer"
              >
                <div>
                  <p className="font-medium">Cartão de Crédito</p>
                  <p className="text-muted-foreground text-sm">
                    Visa, Mastercard ou Elo
                  </p>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="pix"
                id="pix"
                data-testid="payment-method-pix"
                aria-labelledby="pix-label"
              />
              <Label
                htmlFor="pix"
                id="pix-label"
                className="flex-1 cursor-pointer"
              >
                <div>
                  <p className="font-medium">PIX</p>
                  <p className="text-muted-foreground text-sm">
                    Transferência instantânea
                  </p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={loading || items.length === 0}
      >
        {loading ? 'Processando...' : 'Finalizar Pedido'}
      </Button>
    </form>
  );
}
