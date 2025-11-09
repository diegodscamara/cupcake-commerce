export type DeliveryMethod = 'standard' | 'express' | 'pickup';

export interface ShippingCalculationParams {
  zipCode: string;
  deliveryMethod: DeliveryMethod;
  orderValue: number;
}

export interface ShippingResult {
  cost: number;
  estimatedDays: number;
  method: DeliveryMethod;
}

const STANDARD_SHIPPING_COST = 0;
const EXPRESS_SHIPPING_COST = 15;
const PICKUP_COST = 0;

const STANDARD_DAYS = 7;
const EXPRESS_DAYS = 3;
const PICKUP_DAYS = 0;

export async function calculateShipping(
  params: ShippingCalculationParams
): Promise<ShippingResult> {
  const { deliveryMethod, zipCode, orderValue } = params;

  if (deliveryMethod === 'pickup') {
    return {
      cost: PICKUP_COST,
      estimatedDays: PICKUP_DAYS,
      method: 'pickup',
    };
  }

  if (deliveryMethod === 'express') {
    return {
      cost: EXPRESS_SHIPPING_COST,
      estimatedDays: EXPRESS_DAYS,
      method: 'express',
    };
  }

  if (orderValue >= 100) {
    return {
      cost: STANDARD_SHIPPING_COST,
      estimatedDays: STANDARD_DAYS,
      method: 'standard',
    };
  }

  try {
    const shippingCost = await calculateShippingWithCorreios(
      zipCode,
      orderValue
    );
    return {
      cost: shippingCost,
      estimatedDays: STANDARD_DAYS,
      method: 'standard',
    };
  } catch {
    return {
      cost: STANDARD_SHIPPING_COST,
      estimatedDays: STANDARD_DAYS,
      method: 'standard',
    };
  }
}

async function calculateShippingWithCorreios(
  zipCode: string,
  orderValue: number
): Promise<number> {
  const originZipCode = '01310-100';
  const weight = 0.5;
  const length = 20;
  const width = 20;
  const height = 10;

  try {
    const response = await fetch(
      `https://viacep.com.br/ws/${zipCode.replace(/\D/g, '')}/json/`
    );
    const addressData = await response.json();

    if (addressData.erro) {
      return STANDARD_SHIPPING_COST;
    }

    const correiosResponse = await fetch(
      `https://www.correios.com.br/enviar/precificar-e-enviar/precos-e-prazos`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cepOrigem: originZipCode.replace(/\D/g, ''),
          cepDestino: zipCode.replace(/\D/g, ''),
          peso: weight,
          comprimento: length,
          largura: width,
          altura: height,
          valorDeclarado: orderValue,
          servicos: ['04014'],
        }),
      }
    );

    if (correiosResponse.ok) {
      const data = await correiosResponse.json();
      if (data?.precos?.[0]?.valor) {
        return parseFloat(data.precos[0].valor.replace(',', '.'));
      }
    }
  } catch {}

  return STANDARD_SHIPPING_COST;
}

export function getShippingLabel(method: DeliveryMethod): string {
  switch (method) {
    case 'standard':
      return 'Entrega Padrão';
    case 'express':
      return 'Entrega Expressa';
    case 'pickup':
      return 'Retirada na Loja';
    default:
      return 'Entrega';
  }
}

export function getShippingDescription(method: DeliveryMethod): string {
  switch (method) {
    case 'standard':
      return '5-7 dias úteis';
    case 'express':
      return '2-3 dias úteis';
    case 'pickup':
      return 'Retire na loja em até 1 dia útil';
    default:
      return '';
  }
}
