import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import {
  students,
  genders,
  studentGuardians,
  users,
  relationshipTypes,
} from "@/db/schema";

export async function GET() {
  try {
    const studentRows = await db
      .select({
        id: students.id,
        firstName: students.firstName,
        lastName: students.lastName,
        birthDate: students.birthDate,
        notes: students.notes,
        genderId: students.genderId,
        gender: genders,
        createdAt: students.createdAt,
        updatedAt: students.updatedAt,
        deletedAt: students.deletedAt,
      })
      .from(students)
      .leftJoin(genders, eq(students.genderId, genders.id));

    const studentIds = studentRows.map((s) => s.id);

    const guardianRows = studentIds.length > 0
      ? await db
          .select({
            id: studentGuardians.id,
            studentId: studentGuardians.studentId,
            userId: studentGuardians.userId,
            userFirstName: users.firstName,
            userLastName: users.lastName,
            relationshipTypeId: studentGuardians.relationshipTypeId,
            relationshipType: relationshipTypes,
            isPrimary: studentGuardians.isPrimary,
          })
          .from(studentGuardians)
          .leftJoin(users, eq(studentGuardians.userId, users.id))
          .leftJoin(
            relationshipTypes,
            eq(studentGuardians.relationshipTypeId, relationshipTypes.id),
          )
      : [];

    const guardiansByStudent = new Map<number, typeof guardianRows>();
    for (const g of guardianRows) {
      const list = guardiansByStudent.get(g.studentId);
      if (list) {
        list.push(g);
      } else {
        guardiansByStudent.set(g.studentId, [g]);
      }
    }

    const result = studentRows.map((s) => ({
      ...s,
      guardians: guardiansByStudent.get(s.id) ?? [],
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
    data?: Record<string, unknown>;
    where?: Record<string, unknown>;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { action, data, where } = body;

  if (!action) {
    return NextResponse.json(
      { error: '"action" is required.' },
      { status: 400 },
    );
  }

  try {
    switch (action) {
      case "create": {
        if (!data) {
          return NextResponse.json(
            { error: 'Missing "data" for create operation.' },
            { status: 400 },
          );
        }
        const result = await db
          .insert(students)
          .values(data as typeof students.$inferInsert)
          .execute();
        return NextResponse.json({ success: true, result });
      }

      case "update": {
        if (!data || !where?.id) {
          return NextResponse.json(
            {
              error:
                'Both "data" and "where.id" are required for update operation.',
            },
            { status: 400 },
          );
        }
        await db
          .update(students)
          .set(data as typeof students.$inferInsert)
          .where(eq(students.id, Number(where.id)))
          .execute();
        return NextResponse.json({ success: true });
      }

      case "delete": {
        if (!where?.id) {
          return NextResponse.json(
            { error: 'Missing "where.id" for delete operation.' },
            { status: 400 },
          );
        }
        await db
          .delete(students)
          .where(eq(students.id, Number(where.id)))
          .execute();
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
