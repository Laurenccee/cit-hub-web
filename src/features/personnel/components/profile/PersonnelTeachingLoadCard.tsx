"use client";

import { BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CardEmptyState } from "@/components/shared/CardEmptyState";
import { PersonnelTeachingLoadCardProps } from "../../types";

export default function PersonnelTeachingLoadCard({
  loads = [],
  semester,
}: PersonnelTeachingLoadCardProps = {}) {
  const hasLoads = loads.length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2 text-subtitle">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            Current Semester Teaching Load
          </CardTitle>
          {semester && <p className="text-xs text-muted-foreground mt-1">{semester}</p>}
        </div>
        {hasLoads && (
          <Badge className="bg-success/10 text-success text-xs">
            {loads.length} {loads.length === 1 ? "Section" : "Sections"} Active
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {hasLoads ? (
          loads.map((item) => (
            <div
              key={item.courseCode}
              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Badge className="bg-primary text-primary-foreground text-micro px-2 py-0.5">
                  {item.courseCode}
                </Badge>
                <div>
                  <p className="text-sm font-semibold">{item.courseTitle}</p>
                  <p className="text-xs text-muted-foreground">{item.section}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium">{item.schedule}</p>
                <p className="text-xs text-muted-foreground">{item.room}</p>
              </div>
            </div>
          ))
        ) : (
          <CardEmptyState
            icon={<BookOpen className="h-8 w-8 text-muted-foreground" />}
            title="No teaching load on record"
            description="Course assignments for the current semester will appear here once posted."
          />
        )}
      </CardContent>
    </Card>
  );
}
