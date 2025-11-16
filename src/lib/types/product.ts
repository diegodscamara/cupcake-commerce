export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  stock: number;
  categoryId: string | null;
}

export interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  stock: number;
  showFavorite?: boolean;
  showStock?: boolean;
}
