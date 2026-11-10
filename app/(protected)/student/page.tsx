import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/supabase/current-user";
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
  const current = await getCurrentUserProfile();

  if (!current) redirect(ROUTES.SIGN_IN);

  const roleId = current.profile?.role_id;
  if (roleId !== ROLES.ADMIN && roleId !== ROLES.PIONEER) {
    redirect(ROUTES.HOME);
  }

  const [{ data: directory }, { courses, majors }] = await Promise.all([
    getStudentDirectory(),
    getStudentsPageData(),
  ]);

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
