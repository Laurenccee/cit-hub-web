import { Suspense } from "react";

import RegisterPersonnelButton from "@/features/personnel/components/RegisterPersonnelButton";
import PersonnelGrid from "@/features/personnel/components/PersonnelGrid";
import PersonnelCardSkeleton from "@/features/personnel/components/skeletons/PersonnelCardSkeleton";
import { getPersonnelPageData } from "@/features/personnel/action/queries";
import { Badge } from "@/components/ui/badge";
import { PageContainer, PageHeader, PageSection } from "@/components/layouts/PageLayout";

export default async function PersonnelPage() {
  const { ranks, designations } = await getPersonnelPageData();

  return (
    <PageSection>
      <PageContainer className="gap-8">
        <PageHeader
          eyebrow={
            <Badge
              variant="secondary"
              className="w-fit text-eyebrow"
            >
              Directory
            </Badge>
          }
          title="CIT Faculty & Staff"
          description="Discover accredited instructors, professors, department coordinators, and technical personnel powering educational excellence in technology and engineering."
          actions={<RegisterPersonnelButton />}
        />

        {/* Personnel Grid */}
        <Suspense fallback={<PersonnelCardSkeleton />}>
          <PersonnelGrid ranks={ranks} designations={designations} />
        </Suspense>
      </PageContainer>
    </PageSection>
  );
}
