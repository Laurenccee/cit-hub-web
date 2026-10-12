import { getPersonnelPageData } from "@/features/personnel/action/queries";
import SetupPersonnelCard from "@/features/personnel/components/SetupPersonnelCard";
import { PageSection } from "@/components/layouts/PageLayout";

export default async function PersonnelSetupPage() {
  const { ranks, designations } = await getPersonnelPageData();

  return (
    <PageSection scroll>
      <SetupPersonnelCard ranks={ranks} designations={designations} />
    </PageSection>
  );
}
