import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { setOAuthCookieOnResponse } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function base64url(input: Buffer) {
  return input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export async function GET() {
  const verifier = base64url(crypto.randomBytes(32));
  const challenge = base64url(
    crypto.createHash("sha256").update(verifier).digest()
  );
  const state = base64url(crypto.randomBytes(24));

  const authUrl = new URL("https://x.com/i/oauth2/authorize");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", env.X_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", env.X_REDIRECT_URI);
  authUrl.searchParams.set("scope", "users.read tweet.read");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("code_challenge", challenge);
  authUrl.searchParams.set("code_challenge_method", "S256");

  const res = NextResponse.redirect(authUrl.toString());

  setOAuthCookieOnResponse(res, {
    state,
    verifier,
    createdAt: Date.now()
  });

  return res;
}