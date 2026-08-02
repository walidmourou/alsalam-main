import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import { users, userTopics, topics } from "@/db/schema";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token." }, { status: 401 });
    }

    const user = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (!user.length) {
      return NextResponse.json({ error: "User not found." }, { status: 401 });
    }

    const perms = await db
      .select({
        topicName: topics.name,
        canCreate: userTopics.canCreate,
        canRead: userTopics.canRead,
        canUpdate: userTopics.canUpdate,
        canDelete: userTopics.canDelete,
      })
      .from(userTopics)
      .innerJoin(topics, eq(userTopics.topicId, topics.id))
      .where(eq(userTopics.userId, payload.userId));

    return NextResponse.json({
      success: true,
      user: user[0],
      permissions: perms,
    });
  } catch {
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 },
    );
  }
}
