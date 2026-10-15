"use client";

import { Building2, Calendar, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PersonnelEducationCardProps } from "../../types";

const EXPERTISE_FIELDS = [
  "Software Engineering",
  "Web Development",
  "Database Management",
  "UI/UX Systems Design",
  "Object-Oriented Programming",
];

export default function PersonnelEducationCard({
  education,
}: PersonnelEducationCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <GraduationCap className="w-4 h-4 text-primary" />
          </div>
          Education & Credentials
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {education && education.length > 0 ? (
          <div className="space-y-4">
            {education.map((edu, index) => (
              <div
                key={index}
                className="flex gap-4 p-4 bg-muted/30 rounded-lg border-l-4 border-primary"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Calendar className="w-3 h-3" />
                      {edu.onGoing
                        ? "Currently Pursuing"
                        : `Class of ${edu.yearGraduated || "N/A"}`}
                    </Badge>
                    {edu.onGoing && (
                      <Badge className="bg-primary text-primary-foreground text-micro">
                        Ongoing
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-bold text-foreground">{edu.degree}</h4>
                  {edu.major && (
                    <p className="text-sm text-primary font-medium">
                      Major in {edu.major}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {edu.institution}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No education information available.
          </p>
        )}

        {/* Academic Fields of Expertise */}
        <div className="pt-4 border-t">
          <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Academic Fields of Expertise
          </h5>
          <div className="flex flex-wrap gap-2">
            {EXPERTISE_FIELDS.map((field) => (
              <Badge key={field} variant="outline" className="text-xs">
                {field}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
