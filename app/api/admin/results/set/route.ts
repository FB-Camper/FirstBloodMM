import { NextResponse } from "next/server";
import { getAuthedUser } from "@/lib/auth";
import { getServiceSupabase } from "@/lib/supabase";
import { MATCH_IDS, TEAMS } from "@/lib/tournament";

const ADMIN_USERNAME = "FirstBlood_CDL";
const TEAM_SET = new Set(TEAMS.map((t) => t.name));

export async function POST(req: Request) {
  const user = await getAuthedUser();

  if (!user || user.username.toLowerCase() !== ADMIN_USERNAME.toLowerCase()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as { matchId?: string; winnerName?: string };
  const matchId = body.matchId ?? "";
  const winnerName = body.winnerName ?? "";

  if (!MATCH_IDS.includes(matchId)) {
    return NextResponse.json({ error: "Invalid matchId" }, { status: 400 });
  }

  if (!TEAM_SET.has(winnerName)) {
    return NextResponse.json({ error: "Invalid team" }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  const { error } = await supabase
    .from("results")
    .upsert([{ match_id: matchId, winner_name: winnerName, updated_at: new Date().toISOString() }], {
      onConflict: "match_id"
    });

  if (error) {
    return NextResponse.json({ error: "Failed to save result." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}