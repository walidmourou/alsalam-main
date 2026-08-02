import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import { genders, maritalStatuses, users } from "@/db/schema";

export async function GET() {
  try {
    const result = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        genderId: users.genderId,
        gender: genders,
        birthDate: users.birthDate,
        phone: users.phone,
        phone2: users.phone2,
        address: users.address,
        maritalStatusId: users.maritalStatusId,
        maritalStatus: maritalStatuses,
        bank: users.bank,
        iban: users.iban,
        bic: users.bic,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        deletedAt: users.deletedAt,
      })
      .from(users)
      .leftJoin(genders, eq(users.genderId, genders.id))
      .leftJoin(maritalStatuses, eq(users.maritalStatusId, maritalStatuses.id));

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
          .insert(users)
          .values(data as typeof users.$inferInsert)
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
          .update(users)
          .set(data as typeof users.$inferInsert)
          .where(eq(users.id, Number(where.id)))
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
          .delete(users)
          .where(eq(users.id, Number(where.id)))
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
    const cause = err instanceof Error && err.cause ? err.cause : null;
    const sqlMessage =
      cause instanceof Error ? cause.message : "";
    const message = sqlMessage.includes("Duplicate entry")
      ? "A user with this email already exists."
      : err instanceof Error
        ? err.message
        : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
