import { createClient } from '@/lib/supabase/server';
import AddPersonnelButton from '@/features/personnel/components/AddPersonnelButton';
import PersonnelCardSkeleton from '@/features/personnel/components/skeletons/PersonalCardSkeleton';
import PersonnelGrid from '@/features/personnel/components/PersonnelGrid';
import { Suspense } from 'react';

export default async function PersonnelPage() {
  const supabase = await createClient();

  const [ranksResponse, designationsResponse] = await Promise.all([
    supabase.from('ranks').select('id, name').order('name'),
    supabase.from('designations').select('id, name').order('name'),
  ]);

  if (ranksResponse.error || designationsResponse.error) {
    throw new Error('Failed to load form options');
  }

  const ranks = ranksResponse.data;
  const designations = designationsResponse.data;

  return (
    <div className="flex flex-col gap-16">
      <section className="flex justify-between items-end">
        <h1 className="text-7xl text-mauve-800 tracking-wide leading-tighter">
          CIT Faculty & Staff
        </h1>
        <AddPersonnelButton
          ranks={ranks ?? []}
          designations={designations ?? []}
        />
      </section>
      <Suspense
        fallback={
          <section className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <PersonnelCardSkeleton key={i} />
            ))}
          </section>
        }
      >
        <PersonnelGrid ranks={ranks} designations={designations} />
      </Suspense>
    </div>
  );
}
