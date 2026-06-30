import { getDesignations, getRanks } from '@/features/personnel/action/queries';
import SetupPersonnelForm from '@/features/personnel/components/SetupPersonnelForm';

export default async function PersonnelSetupPage() {
    const [ranksResult, designationsResult] = await Promise.all([getRanks(), getDesignations()]);

    const ranks = ranksResult.success ? ranksResult.data : [];
    const designations = designationsResult.success ? designationsResult.data : [];

    return (
        <section className="flex flex-col sm:py-8">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 sm:gap-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-primary font-serif text-4xl underline">Setup Profile</h1>
                    <p className="text-accent-foreground text-sm">
                        Let's start by setting up your profile. This will help us personalize.
                    </p>
                </div>
                <SetupPersonnelForm ranks={ranks} designations={designations} />
            </div>
        </section>
    );
}
