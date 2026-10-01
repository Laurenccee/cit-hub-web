import { z } from "zod";

export const RegisterStudentSchema = z.object({
  email: z.string().email("Please enter a valid email"),
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
  profilePictureUrl: z.string().url("Invalid profile picture URL").optional(),
  studentId: z.string().min(1, "Student ID is required"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  courseId: z.string().uuid("Course is required"),
  majorId: z.string().uuid().optional().or(z.literal("")),
  yearLevel: z.enum(YEAR_LEVEL_VALUES, {
    message: "Please select a year level",
  }),
  section: z.enum(SECTION_VALUES, { message: "Please select a section" }),
  contactNumber: z
    .string()
    .min(7, "Contact number must be at least 7 characters")
    .optional(),
});

export const UpdateStudentSchema = StudentSchema.extend({
  id: z.string(),
  rfidUid: z.string().trim().optional().or(z.literal("")),
});

export type RegisterStudentData = z.infer<typeof RegisterStudentSchema>;
export type StudentFormData = z.infer<typeof StudentSchema>;
export type UpdateStudentFormData = z.infer<typeof UpdateStudentSchema>;
export type PromoteToPioneerData = z.infer<typeof PromoteToPioneerSchema>;
