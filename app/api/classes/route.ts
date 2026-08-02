import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import {
  classes,
  educationYears,
  educationLevels,
  classStudents,
  students,
  enrollmentStatuses,
  classCourseRooms,
  educationalCourses,
  classRooms,
  teachers,
  users,
} from "@/db/schema";

export async function GET() {
  try {
    const classRows = await db
      .select({
        id: classes.id,
        educationYearId: classes.educationYearId,
        educationYearLabel: educationYears.label,
        educationLevelId: classes.educationLevelId,
        educationLevelLabel: educationLevels.label,
        label: classes.label,
        maxStudents: classes.maxStudents,
        createdAt: classes.createdAt,
        updatedAt: classes.updatedAt,
        deletedAt: classes.deletedAt,
      })
      .from(classes)
      .leftJoin(educationYears, eq(classes.educationYearId, educationYears.id))
      .leftJoin(educationLevels, eq(classes.educationLevelId, educationLevels.id));

    const classIds = classRows.map((c) => c.id);

    const studentRows = classIds.length > 0
      ? await db
          .select({
            id: classStudents.id,
            classId: classStudents.classId,
            studentId: classStudents.studentId,
            studentFirstName: students.firstName,
            studentLastName: students.lastName,
            statusId: classStudents.statusId,
            statusLabel: enrollmentStatuses.label,
          })
          .from(classStudents)
          .leftJoin(students, eq(classStudents.studentId, students.id))
          .leftJoin(
            enrollmentStatuses,
            eq(classStudents.statusId, enrollmentStatuses.id),
          )
      : [];

    const scheduleRows = classIds.length > 0
      ? await db
          .select({
            id: classCourseRooms.id,
            classId: classCourseRooms.classId,
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
          .leftJoin(
            educationalCourses,
            eq(classCourseRooms.courseId, educationalCourses.id),
          )
          .leftJoin(classRooms, eq(classCourseRooms.roomId, classRooms.id))
          .leftJoin(teachers, eq(classCourseRooms.teacherId, teachers.id))
          .leftJoin(users, eq(teachers.userId, users.id))
      : [];

    const studentsByClass = new Map<number, typeof studentRows>();
    for (const s of studentRows) {
      const list = studentsByClass.get(s.classId);
      if (list) list.push(s);
      else studentsByClass.set(s.classId, [s]);
    }

    const schedulesByClass = new Map<number, typeof scheduleRows>();
    for (const s of scheduleRows) {
      const list = schedulesByClass.get(s.classId);
      if (list) list.push(s);
      else schedulesByClass.set(s.classId, [s]);
    }

    const result = classRows.map((c) => ({
      ...c,
      students: studentsByClass.get(c.id) ?? [],
      schedules: schedulesByClass.get(c.id) ?? [],
    }));

    return NextResponse.json({ success: true, rows: result });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

type CrudAction = "create" | "update" | "delete";

export async function POST(request: Request) {
  let body: {
    action: CrudAction;
    table?: string;
    data?: Record<string, unknown>;
    where?: Record<string, unknown>;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { action, table, data, where } = body;

  if (!action) {
    return NextResponse.json(
      { error: '"action" is required.' },
      { status: 400 },
    );
  }

  try {
    const targetTable = table || "classes";

    switch (action) {
      case "create": {
        if (!data) {
          return NextResponse.json(
            { error: 'Missing "data" for create operation.' },
            { status: 400 },
          );
        }
        let result;
        if (targetTable === "classes") {
          result = await db.insert(classes).values(data as typeof classes.$inferInsert).execute();
        } else if (targetTable === "classStudents") {
          result = await db.insert(classStudents).values(data as typeof classStudents.$inferInsert).execute();
        } else if (targetTable === "classCourseRooms") {
          result = await db.insert(classCourseRooms).values(data as typeof classCourseRooms.$inferInsert).execute();
        } else {
          return NextResponse.json({ error: `Unknown table '${targetTable}'.` }, { status: 400 });
        }
        return NextResponse.json({ success: true, result });
      }

      case "update": {
        if (!data || !where?.id) {
          return NextResponse.json(
            { error: 'Both "data" and "where.id" are required.' },
            { status: 400 },
          );
        }
        const id = Number(where.id);
        if (targetTable === "classes") {
          await db.update(classes).set(data as typeof classes.$inferInsert).where(eq(classes.id, id)).execute();
        } else if (targetTable === "classStudents") {
          await db.update(classStudents).set(data as typeof classStudents.$inferInsert).where(eq(classStudents.id, id)).execute();
        } else if (targetTable === "classCourseRooms") {
          await db.update(classCourseRooms).set(data as typeof classCourseRooms.$inferInsert).where(eq(classCourseRooms.id, id)).execute();
        } else {
          return NextResponse.json({ error: `Unknown table '${targetTable}'.` }, { status: 400 });
        }
        return NextResponse.json({ success: true });
      }

      case "delete": {
        if (!where?.id) {
          return NextResponse.json(
            { error: 'Missing "where.id" for delete operation.' },
            { status: 400 },
          );
        }
        const id = Number(where.id);
        if (targetTable === "classStudents") {
          await db.delete(classStudents).where(eq(classStudents.id, id)).execute();
        } else if (targetTable === "classCourseRooms") {
          await db.delete(classCourseRooms).where(eq(classCourseRooms.id, id)).execute();
        } else {
          return NextResponse.json({ error: `Deleting from '${targetTable}' is not supported via this endpoint.` }, { status: 400 });
        }
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json(
          { error: `Unsupported action '${action}'.` },
          { status: 400 },
        );
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
