import SetupStudentCard from "@/features/students/components/SetupStudentCard";
import { getStudentsPageData } from "@/features/students/action/queries";
import { PageSection } from "@/components/layouts/PageLayout";

export default async function StudentSetupPage() {
  const { courses, majors } = await getStudentsPageData();

  return (
    <PageSection scroll>
      <SetupStudentCard courses={courses} majors={majors} />
    </PageSection>
  );
}
