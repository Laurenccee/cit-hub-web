import { createClient } from '@/lib/supabase/server';
import { Suspense } from 'react';

import AddPersonnelButton from '@/features/personnel/components/AddPersonnelButton';
import PersonnelGrid from '@/features/personnel/components/PersonnelGrid';
import PersonnelCardSkeleton from '@/features/personnel/components/skeletons/PersonalCardSkeleton';

export default async function PersonnelPage() {
  const supabase = await createClient();
  const [ranksResponse, designationsResponse] = await Promise.all([
    supabase.from('ranks').select('id, name').order('name'),
    supabase.from('designations').select('id, name').order('name'),
  ]);

  if (ranksResponse.error || designationsResponse.error) {
    console.error(
      'Data fetching error:',
      ranksResponse.error || designationsResponse.error,
    );
    throw new Error('Failed to load form options');
  }

  const ranks = ranksResponse.data ?? [];
  const designations = designationsResponse.data ?? [];

  return (
    <div className="flex flex-col gap-10 lg:gap-16">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <span className="text-sm lg:text-base text-primary/80 font-bold tracking-wide uppercase">
            Directory
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-7xl text-mauve-800 tracking-tight lg:tracking-wide leading-tight">
            CIT Faculty & Staff
          </h1>
        </div>

        <div className="flex shrink-0">
          <AddPersonnelButton ranks={ranks} designations={designations} />
        </div>
      </section>

      <Suspense fallback={<PersonnelLoadingGrid />}>
        <PersonnelGrid ranks={ranks} designations={designations} />
      </Suspense>
    </div>
  );
}

function PersonnelLoadingGrid() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
      {Array.from({ length: 10 }).map((_, i) => (
        <PersonnelCardSkeleton key={i} />
      ))}
    </section>
  );
}
