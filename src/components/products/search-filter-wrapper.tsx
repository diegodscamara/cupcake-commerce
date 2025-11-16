'use client';

import { Suspense } from 'react';
import { SearchFilter } from './search-filter';
import { Skeleton } from '@/components/ui/skeleton';

interface SearchFilterWrapperProps {
  categories: Array<{ id: string; slug: string; name: string }>;
  defaultCategory?: string;
  defaultSearch?: string;
}

export function SearchFilterWrapper(props: SearchFilterWrapperProps) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
      }
    >
      <SearchFilter {...props} />
    </Suspense>
  );
}
