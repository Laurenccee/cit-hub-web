"use client";
import Image from "next/image";
import { Building2, GraduationCap, Phone, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type {
  CardData,
  Designation,
  EducationEntry,
  PersonnelCardProps,
  Rank,
} from "../types";
import type { LucideIcon } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";

function resolveName(
  embedded: { name: string } | null | undefined,
  list: { id: string; name: string }[],
  id: string | null | undefined,
) {
  return embedded?.name ?? list.find((item) => item.id === id)?.name ?? null;
}

function getRoleBadgeColor(designationName: string | null) {
  const name = designationName?.toLowerCase() ?? "";
  if (name.includes("head")) return "bg-primary";
  if (name.includes("staff")) return "bg-muted-foreground";
  return "bg-primary";
}

function PersonnelBadge({ designationName }: { designationName: string | null }) {
  return (
    <div className="absolute top-3 left-3 z-10">
      <Badge
        className={`${getRoleBadgeColor(designationName)} text-primary-foreground text-xs`}
      >
        {designationName || "Faculty"}
      </Badge>
    </div>
  );
}

function PersonnelPhoto({
  url,
  alt,
}: {
  url: string | null | undefined;
  alt: string;
}) {
  return (
    <div className="relative aspect-square bg-muted">
      {url ? (
        <Image
          src={url}
          alt={alt}
          fill
          loading="eager"
          className="object-cover transition-all"
          sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 280px"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <HugeiconsIcon
            icon={UserIcon}
            className="text-muted-foreground/20 w-16 h-16"
            strokeWidth={1.5}
          />
        </div>
      )}
    </div>
  );
}

function PersonnelNameBlock({
  firstName,
  lastName,
  rankName,
}: {
  firstName: string;
  lastName: string;
  rankName: string | null;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      {firstName || lastName ? (
        <h3 className="text-sm font-semibold leading-snug text-foreground">
          {firstName} {lastName}
        </h3>
      ) : (
        <Skeleton className="h-4 w-3/4" />
      )}

      {rankName ? (
        <p className="text-xs text-muted-foreground">{rankName}</p>
      ) : (
        <Skeleton className="h-3 w-2/3" />
      )}
    </div>
  );
}

function EducationInstitution({ education }: { education: EducationEntry }) {
  if (!education.institution) return null;
  const showYear = !education.onGoing && education.yearGraduated;
  return (
    <p className="text-micro text-muted-foreground ml-4 leading-snug">
      {education.institution}
      {showYear ? `, ${education.yearGraduated}` : null}
    </p>
  );
}

function PersonnelEducationSummary({
  education,
}: {
  education: EducationEntry | undefined;
}) {
  if (!education?.degree) {
    return (
      <div className="flex flex-col gap-1">
        <Skeleton className="h-2.5 w-full" />
        <Skeleton className="h-2.5 w-2/3" />
      </div>
    );
  }
  return (
    <>
      <p className="text-micro text-foreground leading-snug flex items-start gap-1">
        <GraduationCap
          className="size-3 mt-0.5 shrink-0 text-primary"
          strokeWidth={1.5}
        />
        <span>
          <strong>{education.degree}</strong>
          {education.major && (
            <span className="text-muted-foreground"> • {education.major}</span>
          )}
        </span>
      </p>
      <EducationInstitution education={education} />
    </>
  );
}

function PersonnelContactRow({
  icon: Icon,
  value,
  skeletonClassName,
}: {
  icon: LucideIcon;
  value: string | null | undefined;
  skeletonClassName: string;
}) {
  const text = value?.trim();
  if (!text) return <Skeleton className={skeletonClassName} />;
  return (
    <span className="inline-flex items-center gap-1 text-micro text-muted-foreground">
      <Icon className="size-2.5 shrink-0" strokeWidth={1.5} />
      {text}
    </span>
  );
}

function PersonnelProfileLink({ id }: { id: string | undefined }) {
  if (!id) return null;
  return (
    <Link href={`/personnel/${id}`}>
      <Button
        variant="outline"
        size="sm"
        className="w-full gap-1 text-primary border-primary hover:bg-primary hover:text-primary-foreground text-xs py-1"
      >
        View Profile & Consultation
        <ArrowRight className="w-3 h-3" />
      </Button>
    </Link>
  );
}

function getPersonnelCardData(
  data: CardData,
  ranks: Rank[],
  designations: Designation[],
) {
  const firstName = data.first_name?.trim() ?? "";
  const lastName = data.last_name?.trim() ?? "";
  return {
    firstName,
    lastName,
    rankName: resolveName(data.ranks, ranks, data.rank_id),
    designationName: resolveName(
      data.designations,
      designations,
      data.designation_id,
    ),
    featuredEdu: data.education.find((e) => e.onGoing) ?? data.education.at(-1),
    photoAlt:
      firstName || lastName ? `${firstName} ${lastName}` : "Personnel card",
  };
}

export default function PersonnelCard({
  data,
  ranks,
  designations,
  editTarget,
  actions,
}: PersonnelCardProps) {
  const { isAdmin, isFaculty } = useAuth();
  const canEdit = !!editTarget && (isAdmin || isFaculty);
  const card = getPersonnelCardData(data, ranks, designations);

  return (
    <div className="relative w-full flex flex-col bg-card text-card-foreground rounded-xl overflow-hidden border hover:shadow-lg transition-shadow">
      <PersonnelBadge designationName={card.designationName} />

      {canEdit && <div className="absolute top-3 right-3 z-10">{actions}</div>}

      <PersonnelPhoto url={data.profile_picture_url} alt={card.photoAlt} />

      <div className="flex flex-col gap-2 p-3">
        <PersonnelNameBlock
          firstName={card.firstName}
          lastName={card.lastName}
          rankName={card.rankName}
        />

        <div className="flex flex-col gap-0.5">
          <PersonnelEducationSummary education={card.featuredEdu} />
        </div>

        <div className="flex items-center justify-between gap-1 pt-1.5 border-t">
          <PersonnelContactRow
            icon={Building2}
            value={data.office}
            skeletonClassName="h-3 w-16"
          />
          <PersonnelContactRow
            icon={Phone}
            value={data.contact_number}
            skeletonClassName="h-3 w-14"
          />
        </div>

        <PersonnelProfileLink id={editTarget?.id} />
      </div>
    </div>
  );
}
