import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { FavoriteButton } from '@/components/product/favorite-button';
import type { ProductCardProps } from '@/lib/types/product';

interface ProductCardComponentProps extends ProductCardProps {
  userId?: string | null;
}

export function ProductCard({
  id,
  slug,
  name,
  description,
  price,
  imageUrl,
  stock,
  showFavorite = true,
  showStock = true,
  userId,
}: ProductCardComponentProps) {
  return (
    <article key={id} data-testid="product-card" className="group">
      <Card className="group relative flex h-full flex-col overflow-hidden py-0 transition-shadow hover:shadow-lg">
        <Link href={`/products/${slug}`} className="block">
          <div className="bg-muted relative aspect-square w-full overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-4xl">
                🧁
              </div>
            )}
            {userId && showFavorite && (
              <div className="absolute top-2 right-2">
                <FavoriteButton cupcakeId={id} />
              </div>
            )}
          </div>
        </Link>
        <CardContent className="flex flex-1 flex-col p-4">
          <Link href={`/products/${slug}`}>
            <CardTitle className="mb-2 line-clamp-2">{name}</CardTitle>
            <CardDescription className="mb-4 line-clamp-2 text-sm">
              {description}
            </CardDescription>
          </Link>
          <div className="mt-auto space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold">
                R$ {Number(price).toFixed(2).replace('.', ',')}
              </span>
              {showStock &&
                (stock > 0 ? (
                  <Badge variant="default">Em estoque</Badge>
                ) : (
                  <Badge variant="secondary">Esgotado</Badge>
                ))}
            </div>
            <AddToCartButton cupcakeId={id} disabled={stock === 0} />
          </div>
        </CardContent>
      </Card>
    </article>
  );
}
