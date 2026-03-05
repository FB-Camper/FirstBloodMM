import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session";

export async function GET(req: Request) {
  clearSessionCookie();
  const url = new URL(req.url);
  return NextResponse.redirect(new URL("/bracket", url.origin));
}