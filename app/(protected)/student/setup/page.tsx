import SetupStudentCard from "@/features/students/components/SetupStudentCard";
import { getStudentsPageData } from "@/features/students/action/queries";

export default async function StudentSetupPage() {
  const { courses, majors } = await getStudentsPageData();

  return (
    <section className="flex h-full min-h-0 flex-col overflow-y-auto">
      <SetupStudentCard courses={courses} majors={majors} />
    </section>
  );
}
