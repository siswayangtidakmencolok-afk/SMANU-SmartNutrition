import { auth } from "@/auth";
import { checkAchievementsForUser } from "@/lib/achievement-checker";

export const runtime = "nodejs";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Login diperlukan." }, { status: 401 });
  }

  try {
    const result = await checkAchievementsForUser(session.user.id);
    return Response.json(result);
  } catch (err) {
    console.error("[check-achievements] Failed to evaluate verified activity:", err instanceof Error ? err.message : err);
    return Response.json({ error: "Gagal memeriksa achievements." }, { status: 500 });
  }
}
