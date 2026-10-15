"use client";

import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PersonnelContactCardProps } from "../../types";

export default function PersonnelContactCard({
  personnel,
}: PersonnelContactCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-subtitle">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Phone className="w-4 h-4 text-primary" />
          </div>
          Contact &amp; Office Information
        </CardTitle>
        <Badge variant="secondary" className="text-xs">
          Official Channel
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {personnel.contact_number && (
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Mobile Phone</p>
                <p className="text-sm font-semibold">
                  {personnel.contact_number}
                </p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Institutional Email
              </p>
              <p className="text-sm font-semibold text-primary">
                {personnel.first_name.toLowerCase()}.
                {personnel.last_name.toLowerCase()}@cit.edu.ph
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Office Assignment</p>
              <p className="text-sm font-semibold">
                {personnel.office || "CIT Dept - Faculty Room 204, Tech Wing"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Consultation Hours</p>
              <p className="text-sm font-semibold">
                Mon / Wed / Fri 1:00 PM – 4:00 PM
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
