import { getPersonnelPageData } from "@/features/personnel/action/queries";
import SetupPersonnelCard from "@/features/personnel/components/SetupPersonnelCard";

export default async function PersonnelSetupPage() {
  const { ranks, designations } = await getPersonnelPageData();

  return (
    <section className="flex h-full min-h-0 flex-col overflow-y-auto">
      <SetupPersonnelCard ranks={ranks} designations={designations} />
    </section>
  );
}
