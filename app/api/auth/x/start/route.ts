import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { setOAuthCookie } from "@/lib/session";

function base64url(input: Buffer) {
  return input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export async function GET() {
  const verifier = base64url(crypto.randomBytes(32));
  const challenge = base64url(crypto.createHash("sha256").update(verifier).digest());
  const state = base64url(crypto.randomBytes(24));

  // Store state+verifier in an HttpOnly cookie for the callback to validate.
  setOAuthCookie({ state, verifier, createdAt: Date.now() });

  // Use x.com authorize endpoint (OAuth2 PKCE)
  const authUrl = new URL("https://x.com/i/oauth2/authorize");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", env.X_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", env.X_REDIRECT_URI);
  authUrl.searchParams.set("scope", "users.read tweet.read offline.access");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("code_challenge", challenge);
  authUrl.searchParams.set("code_challenge_method", "S256");

  return NextResponse.redirect(authUrl.toString());
}