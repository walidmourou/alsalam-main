import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/db/index";
import { users, userTopics } from "@/db/schema";
import { verifyToken } from "@/lib/auth";

export async function POST(request: Request) {
  const token = (await cookies()).get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid token." }, { status: 401 });
  }

  const canManage = await db
    .select()
    .from(userTopics)
    .where(and(eq(userTopics.userId, payload.userId), eq(userTopics.canCreate, true)))
    .limit(1);

  if (!canManage.length) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  try {
    const { userId, password } = await request.json();
    if (!userId || !password) {
      return NextResponse.json({ error: "userId and password are required." }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 10);
    await db.update(users).set({ password: hash }).where(eq(users.id, userId));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
