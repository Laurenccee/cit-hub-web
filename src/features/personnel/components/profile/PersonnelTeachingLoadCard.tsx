"use client";

import { BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PersonnelTeachingLoadCardProps } from "../../types";

const DEFAULT_LOADS = [
  {
    courseCode: "IT 101",
    courseTitle: "Introduction to Software Engineering",
    section: "Section BSIT 2-A • Lecture & Laboratory (3 Units)",
    schedule: "Tue / Thu 9:00 AM – 11:30 AM",
    room: "Lab Room 302",
  },
  {
    courseCode: "CS 204",
    courseTitle: "Modern Web Systems & Technologies",
    section: "Section BSIT 3-B • Web Dev Track (3 Units)",
    schedule: "Mon / Wed 10:00 AM – 12:00 PM",
    room: "Multimedia Lab 1",
  },
];

export default function PersonnelTeachingLoadCard({
  loads = DEFAULT_LOADS,
  semester = "1st Semester Academic Year 2025-2026",
}: PersonnelTeachingLoadCardProps = {}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            Current Semester Teaching Load
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">{semester}</p>
        </div>
        <Badge className="bg-success/10 text-success text-xs">
          {loads.length} Sections Active
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {loads.map((item) => (
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
        ))}
      </CardContent>
    </Card>
  );
}
