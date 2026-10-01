import { DirectoryStudent, Student, StudentDepartment } from "../types";

export function departmentFromProgram(course?: string | null): {
  department: StudentDepartment;
  college: string;
} {
  const text = (course ?? "").toLowerCase();
  if (
    /computer science|information systems|information technology|software|data science/.test(
      text,
    )
  ) {
    return { department: "CCS", college: "College of Computer Studies (CCS)" };
  }
  if (/engineering/.test(text)) {
    return { department: "COE", college: "College of Engineering (COE)" };
  }
  if (/accountancy|business|marketing|management|administration/.test(text)) {
    return {
      department: "CBA",
      college: "College of Business & Accountancy (CBA)",
    };
  }
  if (/communication|arts|media|multimedia/.test(text)) {
    return { department: "CAS", college: "College of Arts & Sciences (CAS)" };
  }
  return { department: "OTHER", college: "CIT" };
}

export function formatYearLevel(yearLevel?: string | null) {
  const raw = (yearLevel ?? "").trim();
  if (!raw) return "—";
  if (/year/i.test(raw)) return raw;
  return `${raw} Year`;
}

export function mapStudentToDirectory(student: Student): DirectoryStudent {
  const courseName = student.courses?.name ?? student.courses?.code ?? null;
  const { department, college } = departmentFromProgram(courseName);
  const linked = Boolean(student.rfid_uid);
  return {
    id: student.id,
    firstName: student.first_name,
    lastName: student.last_name,
    photoUrl: student.profile_picture_url,
    yearLevel: formatYearLevel(student.year_level),
    standing: "Good Standing",
    studentId: student.student_id ?? "—",
    course: courseName ?? "—",
    major: student.majors?.name ?? null,
    college,
    department,
    rfidStatus: linked ? "linked" : "unlinked",
    nfcTag: linked ? `NFC-${student.rfid_uid!.slice(-6).toUpperCase()}` : null,
    rfidUid: student.rfid_uid,
    rfidNote: linked ? null : "No credential assigned",
    presence: linked ? "inside" : "outside",
    source: student,
  };
}
