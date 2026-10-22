import { asc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { achievements, userAchievements } from "@/lib/db/schema";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;
    const [definitions, earned] = await Promise.all([
      db.select().from(achievements).orderBy(asc(achievements.sortOrder)),
      userId
        ? db
            .select({
              achievementKey: userAchievements.achievementKey,
              unlockedAt: userAchievements.unlockedAt,
            })
            .from(userAchievements)
            .where(eq(userAchievements.userId, userId))
        : Promise.resolve([]),
    ]);

    const earnedByKey = new Map(earned.map((item) => [item.achievementKey, item.unlockedAt]));
    const items = definitions.map((definition) => {
      const unlockedAt = earnedByKey.get(definition.key);
      return {
        key: definition.key,
        title: definition.title,
        description: definition.description,
        icon: definition.icon,
        expReward: definition.expReward,
        category: definition.category,
        sortOrder: definition.sortOrder,
        unlocked: unlockedAt !== undefined,
        unlockedAt: unlockedAt?.toISOString() ?? null,
      };
    });

    return Response.json({
      achievements: items,
      unlockedCount: items.filter((item) => item.unlocked).length,
      totalCount: items.length,
      authenticated: userId !== null,
    });
  } catch (err) {
    console.error("[achievements] Failed to load achievements:", err instanceof Error ? err.message : err);
    return Response.json({ error: "Gagal memuat achievements." }, { status: 500 });
  }
}
