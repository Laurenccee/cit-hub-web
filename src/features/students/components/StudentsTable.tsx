import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserGroup03Icon } from "@hugeicons/core-free-icons";
import { getStudents } from "../action/queries";
import EditStudentDialog from "./EditStudentDialog";
import PromoteToPioneerButton from "./PromoteToPioneerButton";

export default async function StudentsTable() {
  const { success, data: students } = await getStudents();

  if (!success || students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-56 rounded-xl border border-dashed p-8 text-center bg-muted/20">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <HugeiconsIcon icon={UserGroup03Icon} />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-foreground">
          No Students Found
        </h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          Pre-register a student by email to add them to the directory.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Student</th>
            <th className="px-4 py-3 font-medium">Student No.</th>
            <th className="px-4 py-3 font-medium">Program</th>
            <th className="px-4 py-3 font-medium">Year &amp; Section</th>
            <th className="px-4 py-3 font-medium">Contact</th>
            <th className="px-4 py-3 font-medium">RFID</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {students.map((student) => (
            <tr key={student.id} className="hover:bg-muted/20">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-muted">
                    {student.profile_picture_url && (
                      <Image
                        src={student.profile_picture_url}
                        alt={`${student.first_name} ${student.last_name}`}
                        fill
                        className="object-cover"
                        sizes="36px"
                      />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {student.first_name} {student.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {student.profiles?.email}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">{student.student_number || "—"}</td>
              <td className="px-4 py-3">{student.program || "—"}</td>
              <td className="px-4 py-3">
                {[student.year_level, student.section]
                  .filter(Boolean)
                  .join(" - ") || "—"}
              </td>
              <td className="px-4 py-3">{student.contact_number || "—"}</td>
              <td className="px-4 py-3">
                {student.rfid_uid ? (
                  <Badge variant="secondary">Linked</Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    Not linked
                  </Badge>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <PromoteToPioneerButton student={student} />
                  <EditStudentDialog student={student} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
