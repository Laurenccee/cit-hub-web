import { DirectoryStudent, Student } from "../types";

/** Map a course name to the college label shown under each row. */
function collegeFromProgram(course?: string | null): string {
  const text = (course ?? "").toLowerCase();
  if (
    /computer science|information systems|information technology|software|data science/.test(
      text,
    )
  ) {
    return "College of Computer Studies (CCS)";
  }
  if (/engineering/.test(text)) {
    return "College of Engineering (COE)";
  }
  if (/accountancy|business|marketing|management|administration/.test(text)) {
    return "College of Business & Accountancy (CBA)";
  }
  if (/communication|arts|media|multimedia/.test(text)) {
    return "College of Arts & Sciences (CAS)";
  }
  return "CIT";
}

function formatYearLevel(yearLevel?: string | null) {
  const raw = (yearLevel ?? "").trim();
  if (!raw) return "—";
  if (/year/i.test(raw)) return raw;
  return `${raw} Year`;
}

export function mapStudentToDirectory(student: Student): DirectoryStudent {
  const courseName = student.courses?.name ?? student.courses?.code ?? null;
  const linked = Boolean(student.rfid_uid);
  return {
    id: student.id,
    firstName: student.first_name,
    lastName: student.last_name,
    photoUrl: student.profile_picture_url,
    yearLevel: formatYearLevel(student.year_level),
    studentId: student.student_id ?? "—",
    course: courseName ?? "—",
    major: student.majors?.name ?? null,
    majorId: student.major_id ?? student.majors?.id ?? null,
    majorCode: student.majors?.code ?? null,
    college: collegeFromProgram(courseName),
    rfidStatus: linked ? "linked" : "unlinked",
    nfcTag: linked ? `NFC-${student.rfid_uid!.slice(-6).toUpperCase()}` : null,
    rfidUid: student.rfid_uid,
    rfidNote: linked ? null : "No credential assigned",
    presence: linked ? "inside" : "outside",
    source: student,
  };
}
