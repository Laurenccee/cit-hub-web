import { createClient } from '@/lib/supabase/server';
import { Suspense } from 'react';

import RegisterPersonnelButton from '@/features/personnel/components/RegisterPersonnelButton';
import PersonnelGrid from '@/features/personnel/components/PersonnelGrid';
import PersonnelCardSkeleton from '@/features/personnel/components/skeletons/PersonalCardSkeleton';
import { getDesignations, getRanks } from '@/features/personnel/action/queries';

export default async function PersonnelPage() {
    const [ranksResult, designationsResult] = await Promise.all([getRanks(), getDesignations()]);

    const ranks = ranksResult.success ? ranksResult.data : [];
    const designations = designationsResult.success ? designationsResult.data : [];

    return (
        <section className="flex flex-col sm:py-8">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 sm:gap-8">
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
                            <RegisterPersonnelButton />
                        </div>
                    </section>

                    <Suspense fallback={<PersonnelCardSkeleton />}>
                        <PersonnelGrid ranks={ranks} designations={designations} />
                    </Suspense>
                </div>
            </div>
        </section>
    );
}
