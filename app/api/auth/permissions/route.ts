import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq, and } from "drizzle-orm";
import { db } from "@/db/index";
import { users, topics, userTopics } from "@/db/schema";
import { verifyToken } from "@/lib/auth";

async function getAuthedUserId(): Promise<number | null> {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  return payload?.userId ?? null;
}

export async function GET() {
  const userId = await getAuthedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const canManage = await db
    .select()
    .from(userTopics)
    .where(and(eq(userTopics.userId, userId), eq(userTopics.canCreate, true)))
    .limit(1);

  if (!canManage.length) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const allUsers = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      hasPassword: users.password,
    })
    .from(users)
    .orderBy(users.id);

  const allTopics = await db.select().from(topics);

  const perms = await db
    .select({
      userId: userTopics.userId,
      topicId: userTopics.topicId,
      canCreate: userTopics.canCreate,
      canRead: userTopics.canRead,
      canUpdate: userTopics.canUpdate,
      canDelete: userTopics.canDelete,
    })
    .from(userTopics);

  const permsMap: Record<number, Record<number, { canCreate: boolean; canRead: boolean; canUpdate: boolean; canDelete: boolean }>> = {};
  for (const p of perms) {
    if (!permsMap[p.userId]) permsMap[p.userId] = {};
    permsMap[p.userId][p.topicId] = {
      canCreate: p.canCreate,
      canRead: p.canRead,
      canUpdate: p.canUpdate,
      canDelete: p.canDelete,
    };
  }

  return NextResponse.json({ success: true, users: allUsers, topics: allTopics, permsMap });
}

export async function POST(request: Request) {
  const adminUserId = await getAuthedUserId();
  if (!adminUserId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const canManage = await db
    .select()
    .from(userTopics)
    .where(and(eq(userTopics.userId, adminUserId), eq(userTopics.canCreate, true)))
    .limit(1);

  if (!canManage.length) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  try {
    const { userId: targetUserId, topicId, canCreate, canRead, canUpdate, canDelete } = await request.json();

    if (!targetUserId || !topicId) {
      return NextResponse.json({ error: "userId and topicId are required." }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(userTopics)
      .where(
        and(eq(userTopics.userId, targetUserId), eq(userTopics.topicId, topicId)),
      )
      .limit(1);

    if (existing.length) {
      await db
        .update(userTopics)
        .set({ canCreate, canRead, canUpdate, canDelete })
        .where(eq(userTopics.id, existing[0].id));
    } else {
      await db.insert(userTopics).values({
        userId: targetUserId,
        topicId,
        canCreate: canCreate ?? false,
        canRead: canRead ?? true,
        canUpdate: canUpdate ?? false,
        canDelete: canDelete ?? false,
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
