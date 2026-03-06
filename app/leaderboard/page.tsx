import { LeaderboardClient } from "@/components/LeaderboardClient";
import { getAuthedUser } from "@/lib/auth";
import { getServiceSupabase } from "@/lib/supabase";
import { scoreEntry } from "@/lib/scoring";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const supabase = getServiceSupabase();
  const me = await getAuthedUser();

  const [{ data: brackets, error: bracketsError }, { data: results, error: resultsError }] =
    await Promise.all([
      supabase
        .from("brackets")
        .select("user_id, handle, picks_json, champion, submitted_at, updated_at"),
      supabase
        .from("results")
        .select("match_id, winner_name")
    ]);

  if (bracketsError) {
    throw new Error(`Failed to load brackets: ${bracketsError.message}`);
  }

  if (resultsError) {
    throw new Error(`Failed to load results: ${resultsError.message}`);
  }

  const resultMap = Object.fromEntries(
    (results ?? []).map((row) => [row.match_id, row.winner_name])
  );

  const entries = (brackets ?? [])
    .map((b) => {
      const user = {
        id: b.user_id,
        username: (b.handle ?? "").replace(/^@/, "") || "unknown"
      };

      return scoreEntry(user, b, resultMap);
    })
    .sort((a, b) => {
      if (b.correct !== a.correct) return b.correct - a.correct;
      if (Number(b.championCorrect) !== Number(a.championCorrect)) {
        return Number(b.championCorrect) - Number(a.championCorrect);
      }
      if (b.finalFourCorrect !== a.finalFourCorrect) {
        return b.finalFourCorrect - a.finalFourCorrect;
      }
      return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
    })
    .map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
      isMe: entry.userId === me?.id
    }));

  const meEntry = entries.find((e) => e.userId === me?.id) ?? null;

  return <LeaderboardClient initial={{ entries, me: meEntry }} />;
}
