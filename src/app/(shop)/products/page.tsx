import { ProductController } from '@/controllers/product.controller';
import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { SearchFilterWrapper } from '@/components/products/search-filter-wrapper';
import { ProductSort } from '@/components/products/product-sort';
import { ProductPagination } from '@/components/products/product-pagination';
import { FavoriteButton } from '@/components/product/favorite-button';
import { EmptySearch } from '@/components/ui/empty-state';
import { createClient } from '@/lib/supabase/server';
import type { SortOption } from '@/models/cupcake.model';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    search?: string;
    page?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const sort = (params.sort as SortOption) || 'name';

  const {
    cupcakes: cupcakesList,
    categories: categoriesList,
    pagination,
  } = await ProductController.getProducts({
    categorySlug: params.category,
    search: params.search,
    page,
    limit: 12,
    sort,
  });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Nossos Cupcakes
        </h1>
        <p className="text-muted-foreground">
          Escolha entre nossa variedade de cupcakes artesanais
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchFilterWrapper
          categories={categoriesList}
          defaultCategory={params.category}
          defaultSearch={params.search}
        />
        <ProductSort defaultSort={sort} />
      </div>

      {cupcakesList.length === 0 ? (
        <EmptySearch />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cupcakesList.map((cupcake) => (
              <article key={cupcake.id} data-testid="product-card">
                <Card className="group relative flex h-full flex-col overflow-hidden py-0 transition-shadow hover:shadow-lg">
                  <Link href={`/products/${cupcake.slug}`} className="block">
                    <div className="bg-muted relative aspect-square w-full overflow-hidden">
                      {cupcake.imageUrl ? (
                        <Image
                          src={cupcake.imageUrl}
                          alt={cupcake.name}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-4xl">
                          🧁
                        </div>
                      )}
                      {user && (
                        <div className="absolute top-2 right-2">
                          <FavoriteButton cupcakeId={cupcake.id} />
                        </div>
                      )}
                    </div>
                  </Link>
                  <CardContent className="flex flex-1 flex-col p-4">
                    <Link href={`/products/${cupcake.slug}`}>
                      <CardTitle className="mb-2 line-clamp-2">
                        {cupcake.name}
                      </CardTitle>
                      <CardDescription className="mb-4 line-clamp-2 text-sm">
                        {cupcake.description}
                      </CardDescription>
                    </Link>
                    <div className="mt-auto space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold">
                          R${' '}
                          {Number(cupcake.price).toFixed(2).replace('.', ',')}
                        </span>
                        {cupcake.stock > 0 ? (
                          <Badge variant="default">Em estoque</Badge>
                        ) : (
                          <Badge variant="secondary">Esgotado</Badge>
                        )}
                      </div>
                      <AddToCartButton
                        cupcakeId={cupcake.id}
                        disabled={cupcake.stock === 0}
                      />
                    </div>
                  </CardContent>
                </Card>
              </article>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8">
              <ProductPagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
              />
            </div>
          )}

          {pagination && (
            <div className="text-muted-foreground mt-4 text-center text-sm">
              Mostrando {cupcakesList.length} de {pagination.total} produtos
            </div>
          )}
        </>
      )}
    </div>
  );
}
