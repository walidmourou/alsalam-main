import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import {
  classCourseRooms,
  classes,
  educationYears,
  educationLevels,
  educationalCourses,
  classRooms,
  teachers,
  users,
} from "@/db/schema";

export async function GET() {
  try {
    const rows = await db
      .select({
        id: classCourseRooms.id,
        classId: classCourseRooms.classId,
        educationYearLabel: educationYears.label,
        educationLevelLabel: educationLevels.label,
        classLabel: classes.label,
        courseId: classCourseRooms.courseId,
        courseLabel: educationalCourses.label,
        roomId: classCourseRooms.roomId,
        roomLabel: classRooms.label,
        teacherId: classCourseRooms.teacherId,
        teacherFirstName: users.firstName,
        teacherLastName: users.lastName,
        weekDayId: classCourseRooms.weekDayId,
        weekDay: classCourseRooms.weekDay,
        courseStart: classCourseRooms.courseStart,
        courseEnd: classCourseRooms.courseEnd,
      })
      .from(classCourseRooms)
      .leftJoin(classes, eq(classCourseRooms.classId, classes.id))
      .leftJoin(educationYears, eq(classes.educationYearId, educationYears.id))
      .leftJoin(educationLevels, eq(classes.educationLevelId, educationLevels.id))
      .leftJoin(
        educationalCourses,
        eq(classCourseRooms.courseId, educationalCourses.id),
      )
      .leftJoin(classRooms, eq(classCourseRooms.roomId, classRooms.id))
      .leftJoin(teachers, eq(classCourseRooms.teacherId, teachers.id))
      .leftJoin(users, eq(teachers.userId, users.id));

    return NextResponse.json({ success: true, rows });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
