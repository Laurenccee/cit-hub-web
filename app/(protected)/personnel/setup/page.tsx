import { getDesignations, getRanks } from '@/features/personnel/action/queries';
import PersonnelForm from '@/features/personnel/components/PersonnelForm';
import SetupPersonnelCard from '@/features/personnel/components/SetupPersonnelCard';
import SetupPersonnelForm from '@/features/personnel/components/SetupPersonnelForm';

export default async function PersonnelSetupPage() {
    const [ranksResult, designationsResult] = await Promise.all([getRanks(), getDesignations()]);

    const ranks = ranksResult.success ? ranksResult.data : [];
    const designations = designationsResult.success ? designationsResult.data : [];

    return (
        <section className="flex h-full min-h-0 flex-col justify-center overflow-hidden sm:py-8">
            <div className="mx-auto flex max-h-full min-h-0 w-full max-w-7xl flex-col gap-6 sm:gap-8">
                {/* <SetupPersonnelForm ranks={ranks} designations={designations} /> */}
                <SetupPersonnelCard ranks={ranks} designations={designations} />
                {/* <PersonnelForm mode={'setup'} ranks={ranks} designations={designations} /> */}
            </div>
        </section>
    );
}
