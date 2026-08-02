import { NextResponse } from "next/server";
import { and, eq, getTableColumns, type AnyColumn } from "drizzle-orm";
import { db } from "@/db/index";
import {
  articles,
  classCourseRooms,
  classRooms,
  classStudents,
  classes,
  currencies,
  educationalCourses,
  educationLevels,
  educationYears,
  genders,
  incomingTransactions,
  incomingTypes,
  maritalStatuses,
  membershipStatuses,
  membershipTypes,
  memberships,
  purchaseCategories,
  purchases,
  relationshipTypes,
  studentGuardians,
  students,
  teachers,
  users,
} from "@/db/schema";

const tableMap = {
  articles,
  classCourseRooms,
  classRooms,
  classStudents,
  classes,
  currencies,
  educationalCourses,
  educationLevels,
  educationYears,
  genders,
  incomingTransactions,
  incomingTypes,
  maritalStatuses,
  membershipStatuses,
  membershipTypes,
  memberships,
  purchaseCategories,
  purchases,
  relationshipTypes,
  studentGuardians,
  students,
  teachers,
  users,
} as const;

type TableName = keyof typeof tableMap;
type CrudTable = (typeof tableMap)[TableName];
type CrudAction = "create" | "update" | "delete";

type CrudRequest = {
  action: CrudAction;
  table: TableName;
  data?: Record<string, unknown>;
  where?: Record<string, unknown>;
};

export function getTable(tableName: string) {
  if (!(tableName in tableMap)) {
    throw new Error(
      `Unknown table '${tableName}'. Allowed tables: ${Object.keys(tableMap).join(", ")}`,
    );
  }
  return tableMap[tableName as TableName];
}

function getTableColumnNames(table: CrudTable) {
  const columns = getTableColumns(table) as
    | Record<string, AnyColumn>
    | undefined;
  return columns ? Object.keys(columns) : [];
}

function assertValidColumns(
  table: CrudTable,
  payload: Record<string, unknown>,
  context: string,
) {
  const allowedColumns = getTableColumnNames(table);
  const invalidColumns = Object.keys(payload).filter(
    (column) => !allowedColumns.includes(column),
  );
  if (invalidColumns.length > 0) {
    throw new Error(
      `Unknown ${context} column(s): ${invalidColumns.join(", ")}. Allowed columns: ${allowedColumns.join(", ")}`,
    );
  }
}

function createWhereExpression(
  table: CrudTable,
  where: Record<string, unknown>,
) {
  const entries = Object.entries(where).filter(
    ([, value]) => value !== undefined,
  );
  if (entries.length === 0) {
    throw new Error(
      'Missing filter for update/delete operation. Provide at least one property in "where".',
    );
  }

  assertValidColumns(table, where, "where");

  const columns = getTableColumns(table) as
    | Record<string, AnyColumn>
    | undefined;

  const conditions = entries.map(([column, value]) => {
    const columnRef = columns?.[column as keyof typeof columns];
    if (!columnRef) {
      throw new Error(
        `Unknown column '${column}' for table. Use one of: ${getTableColumnNames(table).join(", ")}`,
      );
    }
    return eq(columnRef, value as string | number | boolean | null);
  });

  return conditions.length === 1 ? conditions[0] : and(...conditions);
}

function parseQueryStringValue(value: string | string[] | null): string | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] : value;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tableName = parseQueryStringValue(url.searchParams.get("table"));
  const whereParam = parseQueryStringValue(url.searchParams.get("where"));

  if (!tableName) {
    return NextResponse.json(
      { error: 'Missing "table" query parameter.' },
      { status: 400 },
    );
  }

  try {
    const table = getTable(tableName);

    if (!whereParam) {
      const rows = await db.select().from(table);
      return NextResponse.json({ success: true, rows });
    }

    let where: Record<string, unknown>;
    try {
      where = JSON.parse(whereParam);
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in "where" query parameter.' },
        { status: 400 },
      );
    }

    const rows = await db
      .select()
      .from(table)
      .where(createWhereExpression(table, where));
    return NextResponse.json({ success: true, rows });
  } catch {
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  let payload: CrudRequest;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { action, table: tableName, data, where } = payload;

  if (!action || !tableName) {
    return NextResponse.json(
      { error: 'Both "action" and "table" are required.' },
      { status: 400 },
    );
  }

  try {
    const table = getTable(tableName);

    switch (action) {
      case "create": {
        if (!data) {
          return NextResponse.json(
            { error: 'Missing "data" for create operation.' },
            { status: 400 },
          );
        }
        assertValidColumns(table, data, "data");
        const result = await db.insert(table).values(data).execute();
        return NextResponse.json({ success: true, result });
      }

      case "update": {
        if (!data) {
          return NextResponse.json(
            { error: 'Missing "data" for update operation.' },
            { status: 400 },
          );
        }
        assertValidColumns(table, data, "data");
        const whereClause = where || (data.id ? { id: data.id } : undefined);
        if (!whereClause) {
          return NextResponse.json(
            { error: 'Missing "where" filter for update operation.' },
            { status: 400 },
          );
        }
        const result = await db
          .update(table)
          .set(data)
          .where(createWhereExpression(table, whereClause))
          .execute();
        return NextResponse.json({ success: true, result });
      }

      case "delete": {
        const whereClause = where;
        if (!whereClause) {
          return NextResponse.json(
            { error: 'Missing "where" filter for delete operation.' },
            { status: 400 },
          );
        }
        const result = await db
          .delete(table)
          .where(createWhereExpression(table, whereClause))
          .execute();
        return NextResponse.json({ success: true, result });
      }

      default:
        return NextResponse.json(
          { error: `Unsupported action '${action}'.` },
          { status: 400 },
        );
    }
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 },
    );
  }
}
