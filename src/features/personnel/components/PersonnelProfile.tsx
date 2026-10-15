'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { PersonnelProfileProps } from '../types';
import PersonnelHero from './profile/PersonnelHero';
import PersonnelContactCard from './profile/PersonnelContactCard';
import PersonnelEducationCard from './profile/PersonnelEducationCard';
import PersonnelTeachingLoadCard from './profile/PersonnelTeachingLoadCard';
import PersonnelSidebar from './profile/PersonnelSidebar';

export default function PersonnelProfile({ personnel }: PersonnelProfileProps) {
    const rankName = personnel.ranks?.name ?? null;
    const designationName = personnel.designations?.name ?? null;

    return (
        <div className="flex min-h-screen flex-col bg-background">
            {/* Breadcrumb */}
            <div className="border-b bg-card">
                <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
                    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link href="/personnel" className="hover:text-foreground transition-colors">Directory</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span>{personnel.office || 'CIT Department'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="text-primary font-medium">Faculty Profile</span>
                    </nav>
                </div>
            </div>

            {/* Hero Section */}
            <PersonnelHero
                personnel={personnel}
                rankName={rankName}
                designationName={designationName}
            />

            {/* Content Sections */}
            <main className="flex-1">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content - Left Column */}
                        <div className="lg:col-span-2 space-y-6">
                            <PersonnelContactCard personnel={personnel} />
                            <PersonnelEducationCard education={personnel.education} />
                            <PersonnelTeachingLoadCard />
                        </div>

                        {/* Sidebar - Right Column */}
                        <PersonnelSidebar
                            personnel={personnel}
                            rankName={rankName}
                            designationName={designationName}
                        />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t bg-card">
                <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
                    <p>CIT Personnel Directory © 2026 CIT Hub • Central Institute of Technology</p>
                </div>
            </footer>
        </div>
    );
}