import { NextResponse } from "next/server";
import { getAuthedUser } from "@/lib/auth";
import { getServiceSupabase } from "@/lib/supabase";

const ADMIN_USERNAME = "FirstBlood_CDL";

export async function POST() {
  const user = await getAuthedUser();

  if (!user || user.username.toLowerCase() !== ADMIN_USERNAME.toLowerCase()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = getServiceSupabase();

  const { error } = await supabase
    .from("results")
    .delete()
    .neq("match_id", ""); // delete all rows

  if (error) {
    return NextResponse.json({ error: "Failed to reset results." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}