import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROLES } from "@/utils/constants/roles";
import { ROUTES } from "@/utils/constants/routes";
import {
  getStudentDirectory,
  getStudentsPageData,
} from "@/features/students/action/queries";
import ExportDirectoryCsvButton from "@/features/students/components/ExportDirectoryCsvButton";
import RegisterStudentButton from "@/features/students/components/RegisterStudentButton";
import StudentDirectory from "@/features/students/components/StudentDirectory";
import { PageContainer, PageHeader, PageSection } from "@/components/layouts/PageLayout";

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

  const { data: directory } = await getStudentDirectory();
  const { courses, majors } = await getStudentsPageData();

  return (
    <PageSection>
      <PageContainer className="gap-6">
        <PageHeader
          eyebrow={
            <span className="text-eyebrow text-primary">
              Student Records
            </span>
          }
          title="Student Directory"
          description="Manage academic enrollments, student records, and RFID access credentials."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <ExportDirectoryCsvButton students={directory} />
              <RegisterStudentButton />
            </div>
          }
        />

        <StudentDirectory
          students={directory}
          courses={courses}
          majors={majors}
        />
      </PageContainer>
    </PageSection>
  );
}
