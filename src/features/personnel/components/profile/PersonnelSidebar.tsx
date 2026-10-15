"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PersonnelSidebarProps } from "../../types";

export default function PersonnelSidebar({
  personnel,
  rankName,
  designationName,
}: PersonnelSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Profile Details */}
      <Card>
        <CardContent className="pt-5">
          <h3 className="text-subtitle text-foreground mb-4">Profile Details</h3>
          <dl className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-dashed">
              <dt className="text-sm text-muted-foreground">Academic Rank</dt>
              <dd className="text-sm font-semibold text-foreground">
                {rankName || "Instructor"}
              </dd>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-dashed">
              <dt className="text-sm text-muted-foreground">Designation</dt>
              <dd className="text-sm font-semibold text-primary">
                {designationName || "Faculty"}
              </dd>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-dashed">
              <dt className="text-sm text-muted-foreground">Department</dt>
              <dd className="text-sm font-semibold text-foreground">
                {personnel.office || "CIT Department"}
              </dd>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-dashed">
              <dt className="text-sm text-muted-foreground">Employee ID</dt>
              <dd className="text-sm font-semibold text-foreground">
                {personnel.employee_id}
              </dd>
            </div>
            <div className="flex justify-between items-center py-2">
              <dt className="text-sm text-muted-foreground">Primary Contact</dt>
              <dd className="text-sm font-semibold text-foreground">
                {personnel.contact_number || "N/A"}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Book Consultation */}
      <Card>
        <CardContent className="pt-5">
          <h3 className="text-eyebrow text-primary mb-1">
            Book Consultation
          </h3>
          <h4 className="text-base font-semibold text-foreground mb-1">
            Upcoming Open Slot
          </h4>
          <p className="text-xs text-muted-foreground mb-4">
            Select an open slot for academic advisory or project consultation.
          </p>

          <p className="text-sm text-muted-foreground">
            No consultation slots available.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
