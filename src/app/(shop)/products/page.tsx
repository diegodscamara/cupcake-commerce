import { ProductController } from '@/controllers/product.controller';
import { SearchFilterWrapper } from '@/components/products/search-filter-wrapper';
import { ProductSort } from '@/components/products/product-sort';
import { ProductPagination } from '@/components/products/product-pagination';
import { ProductCard } from '@/components/products/product-card';
import { EmptySearch } from '@/components/ui/empty-state';
import { getCurrentUser } from '@/lib/auth/server';
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

  const user = await getCurrentUser();

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
              <ProductCard
                key={cupcake.id}
                id={cupcake.id}
                slug={cupcake.slug}
                name={cupcake.name}
                description={cupcake.description}
                price={cupcake.price}
                imageUrl={cupcake.imageUrl}
                stock={cupcake.stock}
                userId={user?.id}
              />
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
