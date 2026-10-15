import {
  Briefcase,
  Camera,
  Fingerprint,
  GraduationCap,
  Link,
  type LucideIcon,
} from "lucide-react";
import type { WizardStep } from "@/components/shared/SetupWizard";

export interface PersonnelStepMeta {
  id: string;
  label: string;
  sublabel: string;
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
}

/**
 * Single source of truth for the personnel form's five steps. Consumed by the
 * setup wizard, the tabbed profile editor, and the edit dialog so their labels,
 * copy, and ordering never drift.
 */
export const PERSONNEL_STEPS = [
  {
    id: "profile",
    label: "Photo",
    sublabel: "Portrait",
    icon: Camera,
    eyebrow: "Corporate Badge & Directory Photo",
    title: "Profile Picture",
    description:
      "Upload a clear portrait photo for your personnel card, internal corporate directory, and team collaboration spaces.",
  },
  {
    id: "identity",
    label: "Identity",
    sublabel: "Details",
    icon: Fingerprint,
    eyebrow: "Official Identity Record",
    title: "Identity Details",
    description:
      "Enter your official identification details as they appear on your employee records.",
  },
  {
    id: "work",
    label: "Work",
    sublabel: "Department",
    icon: Briefcase,
    eyebrow: "Rank & Department Placement",
    title: "Work Assignment",
    description:
      "Select your rank, designation, and provide your office and contact details.",
  },
  {
    id: "education",
    label: "Education",
    sublabel: "Degrees",
    icon: GraduationCap,
    eyebrow: "Academic Credentials",
    title: "Education Background",
    description:
      "Add your educational qualifications, including ongoing degrees and completed degrees with graduation years.",
  },
  {
    id: "social",
    label: "Social",
    sublabel: "Links",
    icon: Link,
    eyebrow: "Professional Presence",
    title: "Social Channels",
    description:
      "Add your professional social media profiles. Optional, but helps students and colleagues connect with you.",
  },
] as const satisfies readonly PersonnelStepMeta[];

export type PersonnelStepId = (typeof PERSONNEL_STEPS)[number]["id"];

/** The same steps, shaped for `SetupWizard` (which names the icon `eyebrowIcon`). */
export const PERSONNEL_WIZARD_STEPS: readonly WizardStep[] = PERSONNEL_STEPS.map(
  (step) => ({
    id: step.id,
    label: step.label,
    sublabel: step.sublabel,
    eyebrow: step.eyebrow,
    eyebrowIcon: step.icon,
    title: step.title,
    description: step.description,
  }),
);
