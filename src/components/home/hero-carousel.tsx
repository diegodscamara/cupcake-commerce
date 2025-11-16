'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface HeroCarouselProps {
  products: Array<{
    id: string;
    slug: string;
    name: string;
    price: string;
    imageUrl: string | null;
    stock?: number;
  }>;
}

export function HeroCarousel({ products }: HeroCarouselProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {products.map((cupcake) => (
            <CarouselItem
              key={cupcake.id}
              className="pl-2 md:basis-1/2 md:pl-4 lg:basis-1/3 xl:basis-1/4"
            >
              <Link href={`/products/${cupcake.slug}`} className="block h-full">
                <Card className="group h-full overflow-hidden py-0 transition-shadow hover:shadow-lg">
                  <div className="bg-muted relative aspect-square w-full overflow-hidden">
                    {cupcake.imageUrl ? (
                      <Image
                        src={cupcake.imageUrl}
                        alt={cupcake.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-6xl">
                        🧁
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="mb-1 font-semibold">{cupcake.name}</h3>
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground text-sm">
                        R$ {Number(cupcake.price).toFixed(2).replace('.', ',')}
                      </p>
                      {cupcake.stock !== undefined && (
                        <>
                          {cupcake.stock > 0 ? (
                            <Badge variant="default" className="text-xs">
                              Em estoque
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Esgotado
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 md:left-4" />
        <CarouselNext className="right-2 md:right-4" />
      </Carousel>
    </div>
  );
}
