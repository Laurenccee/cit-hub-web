"use client";
import Image from "next/image";
import { Building2, GraduationCap, Phone, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { PersonnelCardProps } from "../types";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";

export default function PersonnelCard({
  data,
  ranks,
  designations,
  editTarget,
  actions,
}: PersonnelCardProps) {
  const { isAdmin, isFaculty } = useAuth();
  const canEdit = !!editTarget && (isAdmin || isFaculty);

  const rankName =
    data.ranks?.name ?? ranks.find((r) => r.id === data.rank_id)?.name ?? null;
  const designationName =
    data.designations?.name ??
    designations.find((d) => d.id === data.designation_id)?.name ??
    null;

  const featuredEdu =
    data.education.find((e) => e.onGoing) ?? data.education.at(-1);

  const firstName = data.first_name?.trim() ?? "";
  const lastName = data.last_name?.trim() ?? "";
  const hasName = firstName || lastName;

  const getRoleBadgeColor = () => {
    if (designationName?.toLowerCase().includes("head")) return "bg-[#8B1A1A]";
    if (designationName?.toLowerCase().includes("staff")) return "bg-gray-600";
    return "bg-[#8B1A1A]";
  };

  return (
    <div className="relative w-full flex flex-col bg-card text-card-foreground rounded-xl overflow-hidden border hover:shadow-lg transition-shadow">
      {/* Role Badge */}
      <div className="absolute top-3 left-3 z-10">
        <Badge className={`${getRoleBadgeColor()} text-white text-xs`}>
          {designationName || "Faculty"}
        </Badge>
      </div>

      {/* Edit Button */}
      {canEdit && <div className="absolute top-3 right-3 z-10">{actions}</div>}

      {/* Profile Image */}
      <div className="relative aspect-square bg-muted">
        {data.profile_picture_url ? (
          <Image
            src={data.profile_picture_url}
            alt={hasName ? `${firstName} ${lastName}` : "Personnel card"}
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

      {/* Info Body */}
      <div className="flex flex-col gap-2 p-3">
        {/* Name */}
        <div className="flex flex-col gap-0.5">
          {hasName ? (
            <h3 className="font-serif text-sm font-bold leading-snug text-foreground">
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

        {/* Education */}
        <div className="flex flex-col gap-0.5">
          {featuredEdu?.degree ? (
            <>
              <p className="text-[11px] text-foreground leading-snug flex items-start gap-1">
                <GraduationCap
                  className="size-3 mt-0.5 shrink-0 text-[#8B1A1A]"
                  strokeWidth={1.5}
                />
                <span>
                  <strong>{featuredEdu.degree}</strong>
                  {featuredEdu.major && (
                    <span className="text-muted-foreground">
                      {" "}
                      • {featuredEdu.major}
                    </span>
                  )}
                </span>
              </p>
              {featuredEdu.institution && (
                <p className="text-[10px] text-muted-foreground ml-4 leading-snug">
                  {featuredEdu.institution}
                  {!featuredEdu.onGoing && featuredEdu.yearGraduated
                    ? `, ${featuredEdu.yearGraduated}`
                    : null}
                </p>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-1">
              <Skeleton className="h-2.5 w-full" />
              <Skeleton className="h-2.5 w-2/3" />
            </div>
          )}
        </div>

        {/* Department & Contact */}
        <div className="flex items-center justify-between gap-1 pt-1.5 border-t">
          {data.office?.trim() ? (
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <Building2 className="size-2.5 shrink-0" strokeWidth={1.5} />
              {data.office.trim()}
            </span>
          ) : (
            <Skeleton className="h-3 w-16" />
          )}

          {data.contact_number?.trim() ? (
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <Phone className="size-2.5 shrink-0" strokeWidth={1.5} />
              {data.contact_number.trim()}
            </span>
          ) : (
            <Skeleton className="h-3 w-14" />
          )}
        </div>

        {/* View Profile Button */}
        {editTarget?.id && (
          <Link href={`/personnel/${editTarget.id}`}>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1 text-[#8B1A1A] border-[#8B1A1A] hover:bg-[#8B1A1A] hover:text-white text-xs py-1"
            >
              View Profile & Consultation
              <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
