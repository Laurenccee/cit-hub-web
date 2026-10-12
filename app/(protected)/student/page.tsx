import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROLES } from "@/utils/constants/roles";
import { ROUTES } from "@/utils/constants/routes";
import { Button } from "@/components/ui/button";
import { ArrowDownUp, Download } from "lucide-react";
import {
  getStudents,
  getStudentsPageData,
} from "@/features/students/action/queries";
import RegisterStudentButton from "@/features/students/components/RegisterStudentButton";
import StudentDirectory from "@/features/students/components/StudentDirectory";
import { mapStudentToDirectory } from "@/features/students/utils/directory";
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

  const { data: students } = await getStudents();
  const { courses, majors } = await getStudentsPageData();
  const directory = students.map(mapStudentToDirectory);

  return (
    <PageSection>
      <PageContainer className="gap-6">
        <PageHeader
          eyebrow={
            <p className="text-micro font-bold uppercase tracking-[0.14em]">
              <span className="text-primary">Administrative Console</span>
              <span className="mx-2 text-muted-foreground/50">/</span>
              <span className="text-muted-foreground">Registrar &amp; Student Affairs</span>
            </p>
          }
          title="Student Directory & Records Management"
          description="Manage academic enrollments, assign and synchronize contactless RFID/NFC credentials, and monitor live campus session attendance across collegiate departments."
          actions={
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="xl" className="gap-2">
                  <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
                  Import / SIS Sync
                </Button>
                <Button type="button" variant="outline" size="xl" className="gap-2">
                  <Download className="h-4 w-4 text-muted-foreground" />
                  Export Roster
                </Button>
              </div>
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
