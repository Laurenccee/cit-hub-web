'use client';
import Image from 'next/image';
import { Building2, GraduationCap, Phone } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { PersonnelCardProps } from '../types';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserIcon } from '@hugeicons/core-free-icons';

export default function PersonnelCard({ data, ranks, designations, editTarget, actions }: PersonnelCardProps) {
    const { isAdmin, isFaculty } = useAuth();
    const canEdit = !!editTarget && (isAdmin || isFaculty);

    const rankName = data.ranks?.name ?? ranks.find((r) => r.id === data.rank_id)?.name ?? null;
    const designationName =
        data.designations?.name ?? designations.find((d) => d.id === data.designation_id)?.name ?? null;

    const featuredEdu = data.education.find((e) => e.onGoing) ?? data.education.at(-1);

    const firstName = data.first_name?.trim() ?? '';
    const lastName = data.last_name?.trim() ?? '';
    const hasName = firstName || lastName;

    return (
        <div className=" relative w-full flex flex-col bg-card text-card-foreground rounded-xl overflow-hidden border">
            <div className="absolute p-2 justify-between w-full z-10 flex items-center gap-2">
                {canEdit && actions}
                {designationName ? (
                    <Badge size="default" className={`transition-all duration-200 bg-primary/80`}>
                        {designationName}
                    </Badge>
                ) : (
                    <Skeleton className="h-5 w-20 rounded-md transition-all duration-200 bg-primary/80" />
                )}
            </div>
            <div className="relative aspect-square bg-muted">
                {data.profile_picture_url ? (
                    <Image
                        src={data.profile_picture_url}
                        alt={hasName ? `${firstName} ${lastName}` : 'Personnel card'}
                        fill
                        loading="eager"
                        className="object-cover transition-all"
                        sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 280px"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <HugeiconsIcon icon={UserIcon} className="text-muted-foreground/20" strokeWidth={2} />
                    </div>
                )}
            </div>

            {/* ── Info body ─────────────────────────────────── */}
            <div className="flex flex-col gap-2 p-4">
                {/* Full name + Rank */}
                <div className="flex flex-col gap-1">
                    {hasName ? (
                        <h2 className="font-serif text-lg font-bold leading-snug text-primary">
                            {firstName} {lastName}
                        </h2>
                    ) : (
                        <Skeleton className="h-5 w-3/4" />
                    )}

                    {rankName ? (
                        <p className="text-sm text-foreground/70">{rankName}</p>
                    ) : (
                        <Skeleton className="h-3.5 w-2/3" />
                    )}
                </div>

                <Separator />

                {/* Education highlight */}
                <div className="flex flex-col gap-1">
                    {featuredEdu?.degree ? (
                        <>
                            <p className="text-xs text-foreground/80 leading-snug flex items-start gap-1.5">
                                <GraduationCap
                                    className="size-3.5 mt-0.5 shrink-0 text-muted-foreground"
                                    strokeWidth={1.5}
                                />
                                <span>
                                    {featuredEdu.degree}
                                    {featuredEdu.major && (
                                        <span className="text-muted-foreground"> · {featuredEdu.major}</span>
                                    )}
                                    {featuredEdu.onGoing && <span className="text-primary/60"> · Ongoing</span>}
                                </span>
                            </p>
                            {featuredEdu.institution && (
                                <p className="text-[11px] text-muted-foreground ml-5 leading-snug">
                                    {featuredEdu.institution}
                                    {!featuredEdu.onGoing && featuredEdu.yearGraduated
                                        ? `, ${featuredEdu.yearGraduated}`
                                        : null}
                                </p>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col gap-1.5">
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-2/3" />
                        </div>
                    )}
                </div>

                <Separator />

                {/* Office / Contact + optional edit button */}
                <div className="flex items-end justify-between gap-2">
                    {data.office?.trim() ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <Building2 className="size-3 shrink-0" strokeWidth={1.5} />
                            {data.office.trim()}
                        </span>
                    ) : (
                        <Skeleton className="h-3.5 w-24" />
                    )}

                    {data.contact_number?.trim() ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <Phone className="size-3 shrink-0" strokeWidth={1.5} />
                            {data.contact_number.trim()}
                        </span>
                    ) : (
                        <Skeleton className="h-3.5 w-20" />
                    )}
                </div>
            </div>
        </div>
    );
}
