import { NextResponse } from "next/server";
import { getAuthedUser } from "@/lib/auth";
import { getServiceSupabase } from "@/lib/supabase";

const ADMIN_USERNAME = "FirstBlood_CDL";

export async function GET() {
  const user = await getAuthedUser();

  if (!user || user.username.toLowerCase() !== ADMIN_USERNAME.toLowerCase()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = getServiceSupabase();
  const { data, error } = await supabase.from("results").select("match_id,winner_name");

  if (error) {
    return NextResponse.json({ error: "Failed to load results." }, { status: 500 });
  }

  return NextResponse.json({ rows: data ?? [] });
}
