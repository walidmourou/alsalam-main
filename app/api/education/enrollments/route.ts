import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import {
  classStudents,
  students,
  classes,
  educationYears,
  educationLevels,
  enrollmentStatuses,
} from "@/db/schema";

export async function GET() {
  try {
    const rows = await db
      .select({
        id: classStudents.id,
        studentId: classStudents.studentId,
        studentFirstName: students.firstName,
        studentLastName: students.lastName,
        classId: classStudents.classId,
        educationYearLabel: educationYears.label,
        educationLevelLabel: educationLevels.label,
        classLabel: classes.label,
        statusId: classStudents.statusId,
        statusLabel: enrollmentStatuses.label,
        createdAt: classStudents.createdAt,
      })
      .from(classStudents)
      .leftJoin(students, eq(classStudents.studentId, students.id))
      .leftJoin(classes, eq(classStudents.classId, classes.id))
      .leftJoin(educationYears, eq(classes.educationYearId, educationYears.id))
      .leftJoin(educationLevels, eq(classes.educationLevelId, educationLevels.id))
      .leftJoin(
        enrollmentStatuses,
        eq(classStudents.statusId, enrollmentStatuses.id),
      );

    return NextResponse.json({ success: true, rows });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
