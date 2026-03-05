import { NextResponse } from "next/server";
import { getAuthedUser } from "@/lib/auth";
import { scoreEntry } from "@/lib/scoring";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET() {
  const supabase = getServiceSupabase();
  const me = await getAuthedUser();

  const [{ data: users }, { data: brackets }, { data: results }] = await Promise.all([
    supabase.from("users").select("id, username"),
    supabase.from("brackets").select("user_id,handle,picks_json,champion,submitted_at,updated_at"),
    supabase.from("results").select("match_id,winner_name")
  ]);

  const resultMap = Object.fromEntries((results ?? []).map((row) => [row.match_id, row.winner_name]));
  const usersById = new Map((users ?? []).map((u) => [u.id, u]));

  const entries = (brackets ?? [])
    .map((b) => {
      const user = usersById.get(b.user_id);
      if (!user) return null;
      return scoreEntry(user, b, resultMap);
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (b!.correct !== a!.correct) return b!.correct - a!.correct;
      if (Number(b!.championCorrect) !== Number(a!.championCorrect)) return Number(b!.championCorrect) - Number(a!.championCorrect);
      if (b!.finalFourCorrect !== a!.finalFourCorrect) return b!.finalFourCorrect - a!.finalFourCorrect;
      return new Date(a!.submittedAt).getTime() - new Date(b!.submittedAt).getTime();
    })
    .map((entry, idx) => ({ ...entry!, rank: idx + 1, isMe: entry!.userId === me?.id }));

  return NextResponse.json({ entries, me: entries.find((e) => e.userId === me?.id) ?? null });
}
