import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPersonnelById } from '@/features/personnel/action/queries';
import PersonnelProfile from '@/features/personnel/components/PersonnelProfile';

interface PersonnelPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PersonnelPageProps): Promise<Metadata> {
    const { id } = await params;
    const { data } = await getPersonnelById(id);

    if (!data) {
        return { title: 'Personnel Not Found' };
    }

    return {
        title: `${data.first_name} ${data.last_name} | CIT Personnel Directory`,
        description: `${data.ranks?.name || 'Staff'} - ${data.office}`,
    };
}

export default async function PersonnelPage({ params }: PersonnelPageProps) {
    const { id } = await params;
    const { success, data: personnel } = await getPersonnelById(id);

    if (!success || !personnel) {
        notFound();
    }

    return <PersonnelProfile personnel={personnel} />;
}