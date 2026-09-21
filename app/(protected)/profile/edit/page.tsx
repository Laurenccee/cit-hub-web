import { createClient } from '@/lib/supabase/server';
import { Suspense } from 'react';
import ProfileEditCard from '@/features/personnel/components/ProfileEditCard';
import PersonnelCardSkeleton from '@/features/personnel/components/skeletons/PersonalCardSkeleton';
import { getPersonnelPageData, getCurrentUserPersonnel } from '@/features/personnel/action/queries';

export default async function ProfileEditPage() {
    const [pageData, personnelResult] = await Promise.all([
        getPersonnelPageData(),
        getCurrentUserPersonnel(),
    ]);

    const { ranks, designations } = pageData;
    const personnel = personnelResult.success ? personnelResult.data : null;

    return (
        <section className="flex flex-col py-8">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 sm:px-6">
                {/* Header Section */}
                <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary/80">
                        Edit Profile
                    </span>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Edit Personnel Profile
                    </h1>
                    <p className="max-w-2xl text-muted-foreground">
                        Update your professional dossier. Changes are saved immediately.
                    </p>
                </div>

                <Suspense fallback={<PersonnelCardSkeleton />}>
                    <ProfileEditCard ranks={ranks} designations={designations} initialPreview={personnel} />
                </Suspense>
            </div>
        </section>
    );
}