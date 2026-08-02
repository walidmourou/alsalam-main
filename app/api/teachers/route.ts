import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import { teachers, users } from "@/db/schema";

export async function GET() {
  try {
    const result = await db
      .select({
        id: teachers.id,
        userId: teachers.userId,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userEmail: users.email,
        userPhone: users.phone,
        userBirthDate: users.birthDate,
        userAddress: users.address,
        specialization: teachers.specialization,
        qualifications: teachers.qualifications,
        createdAt: teachers.createdAt,
        updatedAt: teachers.updatedAt,
        deletedAt: teachers.deletedAt,
      })
      .from(teachers)
      .leftJoin(users, eq(teachers.userId, users.id));

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
          .insert(teachers)
          .values(data as typeof teachers.$inferInsert)
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
          .update(teachers)
          .set(data as typeof teachers.$inferInsert)
          .where(eq(teachers.id, Number(where.id)))
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
          .delete(teachers)
          .where(eq(teachers.id, Number(where.id)))
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
