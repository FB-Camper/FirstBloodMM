import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getServiceSupabase } from "@/lib/supabase";
import { MATCH_IDS, TEAMS } from "@/lib/tournament";

type UpdateRow = { matchId: string; winnerName: string };

const TEAM_NAME_SET = new Set(TEAMS.map((t) => t.name));

export async function POST(request: Request) {
  const secret = request.headers.get("x-admin-secret");
  if (!secret || secret !== env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let payload: { updates?: UpdateRow[]; matchId?: string; winnerName?: string };
  try {
    payload = (await request.json()) as any;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const updates: UpdateRow[] =
    payload.updates ??
    (payload.matchId && payload.winnerName ? [{ matchId: payload.matchId, winnerName: payload.winnerName }] : []);

  if (updates.length === 0) {
    return NextResponse.json({ error: "No updates provided." }, { status: 400 });
  }

  const rows = updates
    .filter((u) => {
      if (!u || typeof u.matchId !== "string" || typeof u.winnerName !== "string") return false;
      if (!MATCH_IDS.includes(u.matchId)) return false;
      const name = u.winnerName.trim();
      if (!name) return false;
      if (!TEAM_NAME_SET.has(name)) return false;
      return true;
    })
    .map((u) => ({
      match_id: u.matchId,
      winner_name: u.winnerName.trim()
    }));

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "No valid match updates.", hint: "matchId must be valid and winnerName must match a team name exactly." },
      { status: 400 }
    );
  }

  const supabase = getServiceSupabase();
  const { error } = await supabase.from("results").upsert(rows, { onConflict: "match_id" });

  if (error) {
    return NextResponse.json({ error: "Failed to upsert results.", detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, count: rows.length });
}
