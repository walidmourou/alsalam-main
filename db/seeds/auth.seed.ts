import { db } from "../index";
import { topics, userTopics } from "../schema";
import { users } from "../schema";
import { eq, ne } from "drizzle-orm";
import bcrypt from "bcryptjs";

const ADMIN_EMAIL = "walid.mourou@gmail.com";

export async function seedAuth() {
  const topicList = [
    { name: "dashboard", label: "Dashboard" },
    { name: "memberships", label: "Memberships" },
    { name: "education", label: "Education" },
    { name: "users", label: "Users" },
    { name: "settings", label: "Settings" },
  ];

  for (const t of topicList) {
    await db
      .insert(topics)
      .values(t)
      .onDuplicateKeyUpdate({ set: { label: t.label } });
  }
  console.log("  Topics seeded.");

  await db.update(users).set({ password: null }).where(ne(users.email, ADMIN_EMAIL));
  console.log(`  Cleared passwords for all users except ${ADMIN_EMAIL}`);

  const hash = await bcrypt.hash("123456", 10);
  await db.update(users).set({ password: hash }).where(eq(users.email, ADMIN_EMAIL));
  console.log(`  Password set for ${ADMIN_EMAIL} (default: 123456).`);

  const [admin] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, ADMIN_EMAIL))
    .limit(1);

  await db.delete(userTopics);

  if (admin) {
    const allTopics = await db.select().from(topics);
    for (const t of allTopics) {
      await db.insert(userTopics).values({
        userId: admin.id,
        topicId: t.id,
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: true,
      });
    }
    console.log(`  Full permissions granted to ${ADMIN_EMAIL} on ${allTopics.length} topics.`);
  }

  console.log("  Auth seed complete.");
}
