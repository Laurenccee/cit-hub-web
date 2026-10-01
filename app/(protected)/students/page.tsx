import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROLES } from "@/utils/constants/roles";
import { ROUTES } from "@/utils/constants/routes";
import { Button } from "@/components/ui/button";
import { ArrowDownUp, Download, Nfc } from "lucide-react";
import {
  getStudents,
  getStudentsPageData,
} from "@/features/students/action/queries";
import RegisterStudentButton from "@/features/students/components/RegisterStudentButton";
import StudentDirectory from "@/features/students/components/StudentDirectory";
import { mapStudentToDirectory } from "@/features/students/utils/directory";

export default async function StudentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(ROUTES.SIGN_IN);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role_id")
    .eq("id", user.id)
    .single();

  if (profile?.role_id !== ROLES.ADMIN && profile?.role_id !== ROLES.PIONEER) {
    redirect(ROUTES.HOME);
  }

  const { data: students } = await getStudents();
  const { courses, majors } = await getStudentsPageData();
  const directory = students.map(mapStudentToDirectory);

  return (
    <section
      className="flex flex-col py-8"
      style={{
        backgroundColor: "#fafafa",
        backgroundImage: "radial-gradient(#e0e0e0 1px, transparent 1px)",
        backgroundSize: "22px 22px",
      }}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
        {/* Admin header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em]">
              <span className="text-[#8B1A1A]">Administrative Console</span>
              <span className="mx-2 text-slate-300">/</span>
              <span className="text-slate-500">
                Registrar & Student Affairs
              </span>
            </p>
            <h1 className="mt-1.5 font-serif text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Student Directory & Records Management
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
              Manage academic enrollments, assign and synchronize contactless
              RFID/NFC credentials, and monitor live campus session attendance
              across collegiate departments.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-10 gap-2 bg-white text-xs font-semibold"
              >
                <ArrowDownUp className="h-4 w-4 text-slate-500" />
                Import / SIS Sync
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 gap-2 bg-white text-xs font-semibold"
              >
                <Download className="h-4 w-4 text-slate-500" />
                Export Roster
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 gap-2 bg-white text-xs font-semibold"
              >
                <Nfc className="h-4 w-4 text-slate-500" />
                Batch RFID
              </Button>
            </div>
            <RegisterStudentButton />
          </div>
        </div>

        <StudentDirectory
          students={directory}
          courses={courses}
          majors={majors}
        />
      </div>
    </section>
  );
}
