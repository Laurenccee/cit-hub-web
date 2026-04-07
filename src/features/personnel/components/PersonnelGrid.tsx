import { createClient } from '@/lib/supabase/server';
import {
  EducationEntry,
  LookupOption,
  Personnel,
  SocialMedia,
} from '@/types/types';
import PersonnelCard from './PersonnelCard';

export default async function PersonnelGrid({
  ranks,
  designations,
}: {
  ranks: LookupOption[];
  designations: LookupOption[];
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('personnel')
    .select(
      `
    *,
    ranks ( id, name ),
    designations ( id, name )
  `,
    )
    .eq('is_active', true);

  const personnel: Personnel[] = (data ?? []).map((row) => ({
    id: row.id,
    employeeId: row.employee_id,
    email: row.email,
    name: row.name,
    rank: row.ranks!,
    designation: row.designations ?? undefined,
    office: row.office,
    contactNumber: row.contact_number,
    socialMedia: (row.social_media ?? {}) as unknown as SocialMedia,
    education: (row.education ?? []) as unknown as EducationEntry[],
    profilePictureUrl: row.profile_picture_url ?? undefined,
  }));

  return (
    <section className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {personnel.map((p) => (
        <PersonnelCard
          key={p.id}
          personnel={p}
          ranks={ranks}
          designations={designations}
        />
      ))}
    </section>
  );
}
