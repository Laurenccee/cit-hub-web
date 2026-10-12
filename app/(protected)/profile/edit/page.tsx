import { Suspense } from 'react';
import ProfileEditCard from '@/features/personnel/components/ProfileEditCard';
import PersonnelCardSkeleton from '@/features/personnel/components/skeletons/PersonnelCardSkeleton';
import { getPersonnelPageData, getCurrentUserPersonnel } from '@/features/personnel/action/queries';
import { PageContainer, PageHeader, PageSection } from '@/components/layouts/PageLayout';

export default async function ProfileEditPage() {
    const [pageData, personnelResult] = await Promise.all([
        getPersonnelPageData(),
        getCurrentUserPersonnel(),
    ]);

    const { ranks, designations } = pageData;
    const personnel = personnelResult.success ? personnelResult.data : null;

    return (
        <PageSection>
            <PageContainer maxWidth="5xl" className="gap-8">
                <PageHeader
                    eyebrow={
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary/80">
                            Edit Profile
                        </span>
                    }
                    title="Edit Personnel Profile"
                    description="Update your professional dossier. Changes are saved immediately."
                />

                <Suspense fallback={<PersonnelCardSkeleton />}>
                    <ProfileEditCard ranks={ranks} designations={designations} initialPreview={personnel} />
                </Suspense>
            </PageContainer>
        </PageSection>
    );
}
