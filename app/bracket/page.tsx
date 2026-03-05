export const dynamic = "force-dynamic";

import { BracketClient } from "@/components/BracketClient";
import { getAuthedUser } from "@/lib/auth";
import { getServiceSupabase } from "@/lib/supabase";
import type { PicksMap } from "@/lib/tournament";

export default async function BracketPage() {
  const user = await getAuthedUser();
  const supabase = getServiceSupabase();

  let initialPicks: PicksMap = {};
  if (user) {
    const { data } = await supabase.from("brackets").select("picks_json").eq("user_id", user.id).maybeSingle();
    initialPicks = (data?.picks_json as PicksMap) ?? {};
  }

  const { data: resultRows } = await supabase.from("results").select("match_id,winner_name");
  const initialResults = Object.fromEntries((resultRows ?? []).map((row) => [row.match_id, row.winner_name]));

  return (
    <BracketClient
      initialPicks={initialPicks}
      initialResults={initialResults}
      isLoggedIn={Boolean(user)}
      username={user?.username ?? null}
    />
  );
}