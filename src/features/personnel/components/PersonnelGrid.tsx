import PersonnelCard from './PersonnelCard';
import { Designation, Rank } from '../types';
import { getPersonnel } from '../action/queries';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserGroup03Icon } from '@hugeicons/core-free-icons';

export default async function PersonnelGrid({ ranks, designations }: { ranks: Rank[]; designations: Designation[] }) {
    const { success, data: personnelList } = await getPersonnel();

    if (!success || !personnelList || personnelList.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-75 rounded-xl border border-dashed p-8 text-center bg-muted/20">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <HugeiconsIcon icon={UserGroup03Icon} />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-foreground">No Personnel Found</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                    There are currently no active personnel records listed in the directory.
                </p>
            </div>
        );
    }

    return (
        <section className="grid grid-cols-1 sm:grid-cols-5 gap-8">
            {personnelList.map((p) => (
                <PersonnelCard key={p.id} data={p} editTarget={p} ranks={ranks} designations={designations} />
            ))}
        </section>
    );
}
