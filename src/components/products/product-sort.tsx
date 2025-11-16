'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SortOption } from '@/models/cupcake.model';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'name', label: 'Nome (A-Z)' },
  { value: 'price-asc', label: 'Preço: Menor para Maior' },
  { value: 'price-desc', label: 'Preço: Maior para Menor' },
  { value: 'newest', label: 'Mais Recentes' },
];

interface ProductSortProps {
  defaultSort?: SortOption;
}

export function ProductSort({ defaultSort = 'name' }: ProductSortProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (value: SortOption) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    params.set('page', '1');
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-muted-foreground text-sm">
        Ordenar por:
      </label>
      <Select value={defaultSort} onValueChange={handleSortChange}>
        <SelectTrigger id="sort" className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
