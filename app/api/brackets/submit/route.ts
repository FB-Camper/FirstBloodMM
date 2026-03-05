import { NextResponse } from "next/server";
import { getAuthedUser } from "@/lib/auth";
import { getServiceSupabase } from "@/lib/supabase";
import { MATCH_IDS, isLocked, type PicksMap } from "@/lib/tournament";

function sanitizePicks(raw: unknown): PicksMap {
  if (!raw || typeof raw !== "object") return {};
  const entries = Object.entries(raw as Record<string, unknown>).filter(
    ([matchId, winner]) => MATCH_IDS.includes(matchId) && typeof winner === "string" && winner.length > 0
  );
  return Object.fromEntries(entries) as PicksMap;
}

export async function POST(request: Request) {
  const user = await getAuthedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isLocked()) {
    return NextResponse.json({ error: "Bracket is locked." }, { status: 423 });
  }

  const payload = (await request.json()) as { picks?: unknown };
  const picks = sanitizePicks(payload.picks);
  const champion = picks.CHIP ?? null;

  const supabase = getServiceSupabase();
  const { data: existing } = await supabase
    .from("brackets")
    .select("submitted_at")
    .eq("user_id", user.id)
    .maybeSingle();

  const nowIso = new Date().toISOString();
  const submittedAt = existing?.submitted_at ?? nowIso;

  const { error } = await supabase.from("brackets").upsert(
    {
      user_id: user.id,
      handle: `@${user.username}`,
      picks_json: picks,
      champion,
      submitted_at: submittedAt,
      updated_at: nowIso
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return NextResponse.json({ error: "Failed to save bracket." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, updatedAt: nowIso });
}
