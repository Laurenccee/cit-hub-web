import { getPersonnelPageData } from '@/features/personnel/action/queries';
import SetupPersonnelCard from '@/features/personnel/components/SetupPersonnelCard';

export default async function PersonnelSetupPage() {
    const { ranks, designations } = await getPersonnelPageData();

    return (
        <section className="flex h-full min-h-0 flex-col justify-center overflow-hidden sm:py-8">
            <div className="mx-auto flex max-h-full min-h-0 w-full max-w-7xl flex-col gap-6 sm:gap-8">
                <SetupPersonnelCard ranks={ranks} designations={designations} />
            </div>
        </section>
    );
}
