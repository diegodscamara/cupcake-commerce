import { createClient } from '@/lib/supabase/server';
import { FavoriteController } from '@/controllers/favorite.controller';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { FavoriteButton } from '@/components/product/favorite-button';
import { EmptyFavorites } from '@/components/ui/empty-state';

export default async function FavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const favorites = await FavoriteController.getFavorites(user.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold sm:text-3xl">Meus Favoritos</h1>

      {favorites.length === 0 ? (
        <EmptyFavorites />
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
          {favorites.map((favorite) => (
            <Card
              key={favorite.id}
              className="group relative flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg"
            >
              <Link href={`/products/${favorite.cupcake.slug}`}>
                <div className="bg-muted relative aspect-square w-full overflow-hidden">
                  {favorite.cupcake.imageUrl ? (
                    <Image
                      src={favorite.cupcake.imageUrl}
                      alt={favorite.cupcake.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl">
                      🧁
                    </div>
                  )}
                </div>
              </Link>
              <div className="absolute top-2 right-2">
                <FavoriteButton cupcakeId={favorite.cupcakeId} />
              </div>
              <CardContent className="flex flex-1 flex-col p-4">
                <Link href={`/products/${favorite.cupcake.slug}`}>
                  <h3 className="mb-1 font-semibold text-gray-900">
                    {favorite.cupcake.name}
                  </h3>
                  <CardDescription className="mb-2 line-clamp-2 text-sm">
                    {favorite.cupcake.description}
                  </CardDescription>
                </Link>
                <div className="mt-auto space-y-2">
                  <span className="text-lg font-bold text-gray-900">
                    R${' '}
                    {Number(favorite.cupcake.price)
                      .toFixed(2)
                      .replace('.', ',')}
                  </span>
                  <div className="pt-2">
                    <AddToCartButton
                      cupcakeId={favorite.cupcakeId}
                      disabled={favorite.cupcake.stock === 0}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
