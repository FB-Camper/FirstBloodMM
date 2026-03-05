import { NextResponse } from "next/server";
import { getAuthedUser } from "@/lib/auth";
import { getServiceSupabase } from "@/lib/supabase";
import { MATCH_IDS, TEAMS } from "@/lib/tournament";

const ADMIN_USERNAME = "FirstBlood_CDL";

const TEAM_SET = new Set(
TEAMS.map((t) => t.name)
);

export async function POST(req: Request) {
const user = await getAuthedUser();

if (!user || user.username.toLowerCase() !== ADMIN_USERNAME.toLowerCase()) {
return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

const { matchId, winnerName } = await req.json();

if (!MATCH_IDS.includes(matchId)) {
return NextResponse.json({ error: "Invalid matchId" }, { status: 400 });
}

if (!TEAM_SET.has(winnerName)) {
return NextResponse.json({ error: "Invalid team" }, { status: 400 });
}

const supabase = getServiceSupabase();

await supabase
.from("results")
.upsert(
[{ match_id: matchId, winner_name: winnerName }],
{ onConflict: "match_id" }
);

return NextResponse.json({ ok: true });
}
