import { ProductController } from '@/controllers/product.controller';
import { ReviewModel } from '@/models/review.model';
import { getCurrentUser } from '@/lib/auth/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { ReviewForm } from '@/components/product/review-form';
import { FavoriteButton } from '@/components/product/favorite-button';
import { ProductShare } from '@/components/product/product-share';
import { ProductImageLightbox } from '@/components/product/product-image-lightbox';
import { Star } from 'lucide-react';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await ProductController.getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Produto não encontrado',
    };
  }

  const description =
    product.description ||
    `Compre ${product.name} - R$ ${Number(product.price).toFixed(2).replace('.', ',')}. ${product.category ? `Categoria: ${product.category.name}` : ''}`;

  return {
    title: `${product.name} - Cupcake Commerce`,
    description,
    openGraph: {
      title: product.name,
      description,
      type: 'website',
      images: product.imageUrl
        ? [
            {
              url: product.imageUrl,
              width: 1200,
              height: 630,
              alt: product.name,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: product.imageUrl ? [product.imageUrl] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cupcake = await ProductController.getProductBySlug(slug);

  if (!cupcake) {
    notFound();
  }

  const user = await getCurrentUser();

  const userReview = user
    ? await ReviewModel.findByUserAndCupcake(user.id, cupcake.id)
    : null;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <Link
          href="/products"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          ← Voltar para produtos
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="bg-muted relative aspect-square w-full overflow-hidden rounded-lg">
          {cupcake.imageUrl ? (
            <ProductImageLightbox
              src={cupcake.imageUrl}
              alt={cupcake.name}
              className="h-full w-full"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-8xl">
              🧁
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            {cupcake.category && (
              <Badge variant="secondary">{cupcake.category.name}</Badge>
            )}
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {cupcake.name}
            </h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.floor(cupcake.avgRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : star === Math.ceil(cupcake.avgRating) &&
                            cupcake.avgRating % 1 >= 0.5
                          ? 'fill-yellow-400/50 text-yellow-400/50'
                          : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <span className="text-muted-foreground text-sm">
                {cupcake.avgRating > 0
                  ? `${cupcake.avgRating.toFixed(1)} (${cupcake.reviews.length} avaliações)`
                  : `(${cupcake.reviews.length} avaliações)`}
              </span>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <span className="text-3xl font-bold sm:text-4xl">
                R$ {Number(cupcake.price).toFixed(2).replace('.', ',')}
              </span>
            </div>
            <div>
              {cupcake.stock > 0 ? (
                <Badge variant="default">{cupcake.stock} em estoque</Badge>
              ) : (
                <Badge variant="secondary">Esgotado</Badge>
              )}
            </div>
            {cupcake.description && (
              <p className="text-muted-foreground text-lg leading-relaxed">
                {cupcake.description}
              </p>
            )}
          </div>

          <Separator />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <AddToCartButton
                cupcakeId={cupcake.id}
                disabled={cupcake.stock === 0}
              />
            </div>
            <div className="flex gap-2">
              {user && <FavoriteButton cupcakeId={cupcake.id} />}
              <ProductShare
                productName={cupcake.name}
                productSlug={cupcake.slug}
                productImage={cupcake.imageUrl}
              />
            </div>
          </div>

          <Separator />

          {cupcake.reviews.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Avaliações</h2>
              <div className="space-y-4">
                {cupcake.reviews.map((review) => (
                  <Card key={review.id}>
                    <CardHeader className="pb-3">
                      <div className="space-y-2">
                        <CardTitle className="text-lg">
                          {review.user.fullName ||
                            review.user.email.split('@')[0]}
                        </CardTitle>
                        <p className="text-muted-foreground text-xs">
                          {new Date(review.createdAt).toLocaleDateString(
                            'pt-BR',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            }
                          )}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-muted-foreground text-sm">
                            {review.rating} estrelas
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    {review.comment && (
                      <CardContent className="pt-0">
                        <p className="text-muted-foreground">
                          {review.comment}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {user && !userReview && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Deixe sua Avaliação</h2>
              <ReviewForm cupcakeId={cupcake.id} />
            </div>
          )}
          {user && userReview && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3 text-center">
                  <p className="text-muted-foreground">
                    Você já avaliou este produto.
                  </p>
                  <div className="flex items-center justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= userReview.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  {userReview.comment && (
                    <p className="text-muted-foreground text-sm italic">
                      &ldquo;{userReview.comment}&rdquo;
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          {!user && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2 text-center">
                  <p className="text-muted-foreground">
                    Faça login para deixar uma avaliação
                  </p>
                  <Link href="/login">
                    <span className="text-primary hover:underline">Entrar</span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
