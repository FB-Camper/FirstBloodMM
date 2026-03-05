import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET() {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase.from("results").select("match_id,winner_name");

  if (error) {
    return NextResponse.json({ error: "Failed to load results.", detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ rows: data ?? [] });
}