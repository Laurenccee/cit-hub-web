import { createClient } from '@/lib/supabase/server';
import { Suspense } from 'react';

import RegisterPersonnelButton from '@/features/personnel/components/RegisterPersonnelButton';
import PersonnelGrid from '@/features/personnel/components/PersonnelGrid';
import PersonnelCardSkeleton from '@/features/personnel/components/skeletons/PersonalCardSkeleton';
import { getPersonnelPageData } from '@/features/personnel/action/queries';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Mail } from 'lucide-react';

export default async function PersonnelPage() {
    const { ranks, designations } = await getPersonnelPageData();

    return (
        <section className="flex flex-col py-8">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
                {/* Header Section */}
                <div className="flex flex-col gap-2">
                    <Badge variant="secondary" className="w-fit text-xs font-semibold uppercase tracking-wider">
                        Directory
                    </Badge>
                    <h1 className="text-4xl sm:text-5xl font-serif text-foreground tracking-tight">
                        CIT Faculty & Staff
                    </h1>
                    <p className="text-muted-foreground max-w-3xl">
                        Discover accredited instructors, professors, department coordinators, and technical
                        personnel powering educational excellence in technology and engineering.
                    </p>
                </div>

                {/* Personnel Grid */}
                <Suspense fallback={<PersonnelCardSkeleton />}>
                    <PersonnelGrid ranks={ranks} designations={designations} />
                </Suspense>

                {/* Bottom CTA */}
                <div className="border-t pt-8 mt-4">
                    <div className="flex flex-col items-center text-center gap-3">
                        <p className="text-muted-foreground">
                            Looking for office hours, syllabus coordinators, or onboarding new personnel?
                        </p>
                        <div className="flex items-center gap-4">
                            <Button variant="link" className="gap-2 text-[#8B1A1A]">
                                <Download className="w-4 h-4" />
                                Download Complete 2025-2026 Faculty Rosters (PDF)
                            </Button>
                            <span className="text-muted-foreground">•</span>
                            <Button variant="link" className="gap-2 text-[#8B1A1A]">
                                <Mail className="w-4 h-4" />
                                Contact College Dean's Office
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
