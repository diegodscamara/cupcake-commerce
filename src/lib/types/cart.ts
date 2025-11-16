export interface CartItem {
  id: string;
  quantity: number;
  cupcakeId: string;
  cupcake: {
    id: string;
    name: string;
    price: string;
    imageUrl: string | null;
    description?: string | null;
    stock?: number;
  };
}

export interface SessionCartItem {
  cupcakeId: string;
  quantity: number;
}
