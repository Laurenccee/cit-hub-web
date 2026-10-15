"use client";

import Image from "next/image";
import { Building2, Clock, Mail, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PersonnelHeroProps } from "../../types";

export default function PersonnelHero({
  personnel,
  rankName,
  designationName,
}: PersonnelHeroProps) {
  const getRoleBadgeColor = () => {
    if (designationName?.toLowerCase().includes("head")) return "bg-primary";
    if (designationName?.toLowerCase().includes("staff"))
      return "bg-muted-foreground";
    return "bg-primary";
  };

  return (
    <section className="relative overflow-hidden bg-card border-b">
      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 py-10 sm:px-6 lg:px-8">
        {/* Profile Image */}
        <div className="relative w-32 h-32 sm:w-36 sm:h-36">
          {personnel.profile_picture_url ? (
            <Image
              src={personnel.profile_picture_url}
              alt={`${personnel.first_name} ${personnel.last_name}`}
              fill
              className="object-cover rounded-full ring-4 ring-primary/20"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-full bg-muted ring-4 ring-primary/20">
              <User className="w-14 h-14 text-muted-foreground/50" />
            </div>
          )}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
            <Badge
              className={`${getRoleBadgeColor()} text-primary-foreground text-micro px-2.5 py-0.5 uppercase`}
            >
              {designationName || "Faculty"}
            </Badge>
          </div>
        </div>

        {/* Name & Title */}
        <div className="text-center mt-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-serif">
            {personnel.first_name} {personnel.last_name}
          </h1>
          <p className="mt-1 text-base text-muted-foreground flex items-center justify-center gap-2">
            <span>{rankName || "Instructor"}</span>
            <span className="text-primary">•</span>
            <span>{personnel.office || "College of Information Technology"}</span>
          </p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-sm">
            <Badge className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-micro flex items-center justify-center">
              ID
            </Badge>
            Employee ID: #{personnel.employee_id}
          </Badge>
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-sm">
            <Building2 className="w-4 h-4 text-primary" />
            {personnel.office || "CIT Department"}
          </Badge>
          <Badge
            variant="outline"
            className="gap-1.5 px-3 py-1.5 text-sm border-success/40 bg-success/10 text-success"
          >
            <span className="w-2 h-2 rounded-full bg-success" />
            Regular Active Status
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-2">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-6">
            <Clock className="w-4 h-4" />
            Schedule Consultation
          </Button>
          <Button
            variant="outline"
            className="gap-2 px-6 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Mail className="w-4 h-4" />
            Send Message
          </Button>
        </div>
      </div>
    </section>
  );
}
