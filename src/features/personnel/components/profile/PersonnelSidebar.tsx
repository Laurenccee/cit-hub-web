"use client";

import { BookOpen, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  ExternalLinkIcon,
} from "@hugeicons/core-free-icons";
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
          <h3 className="font-bold text-foreground mb-4">Profile Details</h3>
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
            <div className="flex justify-between items-center py-2 border-b border-dashed">
              <dt className="text-sm text-muted-foreground">Primary Contact</dt>
              <dd className="text-sm font-semibold text-foreground">
                {personnel.contact_number || "N/A"}
              </dd>
            </div>
            <div className="flex justify-between items-center py-2">
              <dt className="text-sm text-muted-foreground">Advisory Group</dt>
              <dd className="text-sm font-semibold text-foreground">
                Junior CS / IT Council
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Book Consultation */}
      <Card>
        <CardContent className="pt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
            Book Consultation
          </h3>
          <h4 className="font-bold text-foreground mb-1">
            Upcoming Open Slot
          </h4>
          <p className="text-xs text-muted-foreground mb-4">
            Select an open slot for academic advisory or project consultation.
          </p>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/30">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-success" />
                <div>
                  <p className="text-sm font-semibold">Friday, Oct 24</p>
                  <p className="text-xs text-muted-foreground">
                    01:30 PM – 02:15 PM
                  </p>
                </div>
              </div>
              <Badge className="bg-success/10 text-success text-micro">
                AVAILABLE
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-muted-foreground/40" />
                <div>
                  <p className="text-sm font-semibold">Monday, Oct 27</p>
                  <p className="text-xs text-muted-foreground">
                    02:00 PM – 02:45 PM
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-micro">
                OPEN
              </Badge>
            </div>
          </div>

          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            Confirm Consultation Slot
            <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Academic Resources */}
      <Card>
        <CardContent className="pt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Academic Resources
          </h3>
          <div className="space-y-2">
            <a
              href="#"
              className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-sm">
                  CIT Course Syllabus Repository
                </span>
              </div>
              <HugeiconsIcon
                icon={ExternalLinkIcon}
                className="w-3.5 h-3.5 text-muted-foreground"
              />
            </a>
            <a
              href="#"
              className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm">Consultation Request Policy</span>
              </div>
              <HugeiconsIcon
                icon={ExternalLinkIcon}
                className="w-3.5 h-3.5 text-muted-foreground"
              />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
