'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { LookupOption, Personnel } from '@/types/types';
import { ArrowRight, Building, Phone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks/useAuth';
import EditPersonnelButton from './EditPersonnelButton';
import DeletePersonnelButton from './DeletePersonnelButton';

export default function PersonnelCard({
  personnel,
  ranks,
  designations,
}: {
  personnel: Personnel;
  ranks: LookupOption[];
  designations: LookupOption[];
}) {
  const { isAdmin, isFaculty } = useAuth();
  const canManage = isAdmin || isFaculty;
  const featuredEducation =
    personnel.education.find((e) => e.onGoing) ?? personnel.education.at(-1);

  return (
    <Card className="pt-0 gap-8">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {personnel.profilePictureUrl ? (
          <Image
            src={personnel.profilePictureUrl}
            alt={personnel.name}
            fill
            loading="eager"
            className="object-cover transition-all"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-16"
            >
              <path
                fillRule="evenodd"
                d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      <CardHeader className="gap-2 flex-1">
        {personnel.designation && (
          <p className="text-xs font-semibold uppercase tracking-widest text-primary/60">
            {personnel.designation.name}
          </p>
        )}
        <div>
          <CardTitle className="text-2xl leading-snug text-primary">
            {personnel.name}
          </CardTitle>
          <p className="text-base text-foreground/80">{personnel.rank.name}</p>
          <CardDescription className="text-sm leading-relaxed mt-1">
            {featuredEducation && (
              <>
                {featuredEducation.degree}
                {featuredEducation.major &&
                  ` major in ${featuredEducation.major}`}
                {featuredEducation.onGoing && (
                  <span className="text-primary/70"> · Ongoing</span>
                )}
              </>
            )}
          </CardDescription>
        </div>
      </CardHeader>
      <CardFooter className="flex justify-between items-end">
        <div className="flex gap-2">
          {personnel.office && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon-lg">
                  <Building size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{personnel.office}</p>
              </TooltipContent>
            </Tooltip>
          )}
          {personnel.contactNumber && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon-lg">
                  <Phone size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{personnel.contactNumber}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <div className="flex items-center gap-2">
          {canManage && (
            <>
              <DeletePersonnelButton id={personnel.id} name={personnel.name} />
              <EditPersonnelButton
                personnel={personnel}
                ranks={ranks}
                designations={designations}
              />
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
