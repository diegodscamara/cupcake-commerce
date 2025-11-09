'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface SearchFilterProps {
  categories: Array<{ id: string; slug: string; name: string }>;
  defaultCategory?: string;
  defaultSearch?: string;
}

export function SearchFilter({
  categories,
  defaultCategory,
  defaultSearch,
}: SearchFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(defaultSearch || '');
  const [category, setCategory] = useState(defaultCategory || 'all');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search.trim()) {
      params.set('search', search.trim());
    }
    if (category && category !== 'all') {
      params.set('category', category);
    }
    params.set('page', '1');
    router.push(`/products?${params.toString()}`);
  };

  const handleClear = () => {
    setSearch('');
    setCategory('all');
    router.push('/products?page=1');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const hasFilters = search.trim() || (category && category !== 'all');

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      <div className="flex flex-1 gap-2">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar cupcakes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
          />
        </div>
        {hasFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            aria-label="Limpar filtros"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <Button onClick={handleSearch}>Buscar</Button>
      </div>
      <Select
        value={category}
        onValueChange={(value) => {
          setCategory(value);
          const params = new URLSearchParams(searchParams.toString());
          if (value === 'all') {
            params.delete('category');
          } else {
            params.set('category', value);
          }
          if (search.trim()) {
            params.set('search', search.trim());
          }
          params.set('page', '1');
          router.push(`/products?${params.toString()}`);
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Todas as categorias" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as categorias</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.slug}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
