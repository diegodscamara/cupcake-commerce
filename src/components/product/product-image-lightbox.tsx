'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductImageLightboxProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function ProductImageLightbox({
  src,
  alt,
  className,
  priority = false,
}: ProductImageLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className={cn('group relative cursor-zoom-in', className)}>
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={priority}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
            <ZoomIn className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-5xl p-2 sm:p-4" showCloseButton={true}>
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <div className="bg-muted relative mx-auto aspect-square max-h-[85vh] w-full overflow-hidden rounded-lg">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain"
            sizes="90vw"
            priority
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
