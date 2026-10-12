import { Suspense } from "react";

import RegisterPersonnelButton from "@/features/personnel/components/RegisterPersonnelButton";
import PersonnelGrid from "@/features/personnel/components/PersonnelGrid";
import PersonnelCardSkeleton from "@/features/personnel/components/skeletons/PersonnelCardSkeleton";
import { getPersonnelPageData } from "@/features/personnel/action/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Mail } from "lucide-react";
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
              className="w-fit text-xs font-semibold uppercase tracking-wider"
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

        {/* Bottom CTA */}
        <div className="mt-4 border-t pt-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-muted-foreground">
              Looking for office hours, syllabus coordinators, or onboarding new
              personnel?
            </p>
            <div className="flex items-center gap-4">
              <Button variant="link" className="gap-2">
                <Download className="w-4 h-4" />
                Download Complete 2025-2026 Faculty Rosters (PDF)
              </Button>
              <span className="text-muted-foreground">•</span>
              <Button variant="link" className="gap-2">
                <Mail className="w-4 h-4" />
                Contact College Dean&apos;s Office
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    </PageSection>
  );
}
