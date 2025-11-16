import Link from 'next/link';
import { ProductController } from '@/controllers/product.controller';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroCarousel } from '@/components/home/hero-carousel';
import { ProductCard } from '@/components/products/product-card';
import { getCurrentUser } from '@/lib/auth/server';

export default async function HomePage() {
  const { cupcakes } = await ProductController.getProducts();
  const featuredProducts = cupcakes.slice(0, 10);
  const heroProducts = cupcakes.slice(0, 5);

  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-blue-50 via-pink-50 to-blue-100 py-12">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="mb-6 space-y-2 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-blue-900 sm:text-4xl">
                Destaques
              </h1>
              <p className="text-muted-foreground">
                Confira nossos cupcakes mais populares
              </p>
            </div>
            <HeroCarousel products={heroProducts} />
          </div>
        </section>

        <section className="container mx-auto max-w-7xl px-4 py-12">
          <div className="mb-8 space-y-2 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Nossos Produtos
            </h2>
            <p className="text-muted-foreground">
              Escolha entre nossa variedade de cupcakes artesanais
            </p>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                Nenhum produto disponível no momento.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {featuredProducts.map((cupcake) => (
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
              <div className="mt-8 text-center">
                <Link href="/products">
                  <Button size="lg">Ver Todos os Produtos</Button>
                </Link>
              </div>
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
