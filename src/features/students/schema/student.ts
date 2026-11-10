import * as z from "zod/mini";

export const RegisterStudentSchema = z.object({
  email: z.email("Please enter a valid email"),
});

export const PromoteToPioneerSchema = z.object({
  id: z.string(),
});

// Matches the students_year_level_check / students_section_check DB constraints.
export const YEAR_LEVELS = [
  { value: "1st Year", label: "1st Year" },
  { value: "2nd Year", label: "2nd Year" },
  { value: "3rd Year", label: "3rd Year" },
  { value: "4th Year", label: "4th Year" },
] as const;

export const SECTIONS = [
  { value: "A", label: "Section A" },
  { value: "B", label: "Section B" },
] as const;

const YEAR_LEVEL_VALUES = YEAR_LEVELS.map((y) => y.value) as [
  string,
  ...string[],
];
const SECTION_VALUES = SECTIONS.map((s) => s.value) as [string, ...string[]];

export const StudentSchema = z.object({
  profilePictureUrl: z.optional(z.url("Invalid profile picture URL")),
  studentId: z.string().check(z.minLength(1, "Student ID is required")),
  firstName: z
    .string()
    .check(z.minLength(2, "First name must be at least 2 characters")),
  lastName: z
    .string()
    .check(z.minLength(2, "Last name must be at least 2 characters")),
  courseId: z.uuid("Course is required"),
  majorId: z.union([z.optional(z.uuid()), z.literal("")]),
  yearLevel: z.enum(YEAR_LEVEL_VALUES, {
    message: "Please select a year level",
  }),
  section: z.enum(SECTION_VALUES, { message: "Please select a section" }),
  contactNumber: z.optional(
    z.string().check(z.minLength(7, "Contact number must be at least 7 characters")),
  ),
});

export const UpdateStudentSchema = z.extend(StudentSchema, {
  id: z.string(),
  rfidUid: z.union([z.optional(z.string().check(z.trim())), z.literal("")]),
});

export type RegisterStudentData = z.infer<typeof RegisterStudentSchema>;
export type StudentFormData = z.infer<typeof StudentSchema>;
export type PromoteToPioneerData = z.infer<typeof PromoteToPioneerSchema>;
