"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { DirectoryStudent } from "../types";

function toCsv(rows: DirectoryStudent[]) {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const lines = [
    "Name,Student ID,Year Level,Degree Program,Major,RFID Credential",
    ...rows.map((row) =>
      [
        escape(`${row.firstName} ${row.lastName}`),
        escape(row.studentId),
        escape(row.yearLevel),
        escape(row.course),
        escape(row.major ?? ""),
        escape(row.rfidStatus === "linked" ? row.rfidUid ?? "Linked" : "Not Linked"),
      ].join(","),
    ),
  ];
  return lines.join("\n");
}

export default function ExportDirectoryCsvButton({
  students,
}: {
  students: DirectoryStudent[];
}) {
  const exportCsv = () => {
    const blob = new Blob([toCsv(students)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "student-directory.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="xl"
      className="gap-2"
      disabled={students.length === 0}
      onClick={exportCsv}
    >
      <Download className="h-4 w-4 text-muted-foreground" />
      Export CSV
    </Button>
  );
}
