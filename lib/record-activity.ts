/**
 * record-activity.ts
 *
 * Client-side utility to fire POST /api/user/activity.
 *
 * Called after completing a quiz, challenge, or saving a scan.
 * Silently ignores errors — EXP recording is best-effort;
 * the primary action (save result) has already completed.
 *
 * Guest users (id === 'guest') are skipped — no session, no EXP.
 */

export interface RecordActivityParams {
  /** 'quest' | 'challenge' | 'scan_save' */
  activityType: "quest" | "challenge" | "scan_save";
  /** Human-readable label shown in activity history */
  activityLabel: string;
  /**
   * Stable idempotency key to prevent double-award.
   * Use questIdempotencyKey / challengeIdempotencyKey / scanSaveIdempotencyKey
   * from lib/exp-system.ts — but since those need userId (server-side),
   * use the sourceRef as the uniqueness anchor from the client.
   * The server will prepend userId.
   *
   * Format used here: `${activityType}:${sourceRef}`
   */
  sourceRef: string;
  score?: number;
  domain?: string;
}

/**
 * Fire-and-forget activity recording.
 * Returns { expAwarded, newTotalExp } or null if skipped/failed.
 */
export async function recordActivity(
  params: RecordActivityParams
): Promise<{ expAwarded: number; newTotalExp: number } | null> {
  try {
    const res = await fetch("/api/user/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        activityType:   params.activityType,
        activityLabel:  params.activityLabel,
        // Server prepends userId from session; client uses a source-relative key
        idempotencyKey: `${params.activityType}:${params.sourceRef}`,
        sourceRef:      params.sourceRef,
        score:          params.score,
        domain:         params.domain,
      }),
    });

    if (!res.ok) return null;

    const data = await res.json() as { expAwarded: number; newTotalExp: number };
    return { expAwarded: data.expAwarded, newTotalExp: data.newTotalExp };
  } catch {
    // Network error or server down — silently ignore
    return null;
  }
}
