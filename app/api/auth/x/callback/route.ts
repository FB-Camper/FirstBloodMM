import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import {
  clearOAuthCookieOnResponse,
  getOAuthCookie,
  setSessionCookieOnResponse
} from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function basicAuthHeader(clientId: string, clientSecret: string) {
  return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
}

async function exchangeToken(code: string, codeVerifier: string) {
  const tokenUrl = "https://api.x.com/2/oauth2/token";

  const body = new URLSearchParams();
  body.set("grant_type", "authorization_code");
  body.set("code", code);
  body.set("redirect_uri", env.X_REDIRECT_URI);
  body.set("code_verifier", codeVerifier);

  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded"
  };

  if (env.X_CLIENT_SECRET) {
    headers["Authorization"] = basicAuthHeader(
      env.X_CLIENT_ID,
      env.X_CLIENT_SECRET
    );
  } else {
    body.set("client_id", env.X_CLIENT_ID);
  }

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers,
    body
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    return { ok: false as const, detail: json };
  }

  return { ok: true as const, token: json as any };
}

async function fetchMe(accessToken: string) {
  const res = await fetch("https://api.x.com/2/users/me", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    return { ok: false as const, detail: json };
  }

  return { ok: true as const, me: json as any };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const oauth = getOAuthCookie();

  if (!code || !returnedState || !oauth || oauth.state !== returnedState) {
    const res = NextResponse.json(
      {
        error: "Invalid OAuth state.",
        detail:
          "OAuth cookie missing or state mismatch. Start and finish login on the same production domain."
      },
      { status: 400 }
    );
    clearOAuthCookieOnResponse(res);
    return res;
  }

  const tokenRes = await exchangeToken(code, oauth.verifier);
  if (!tokenRes.ok) {
    const res = NextResponse.json(
      { error: "Failed token exchange with X.", detail: tokenRes.detail },
      { status: 400 }
    );
    clearOAuthCookieOnResponse(res);
    return res;
  }

  const meRes = await fetchMe(tokenRes.token.access_token);
  if (!meRes.ok) {
    const res = NextResponse.json(
      { error: "Failed to fetch X user.", detail: meRes.detail },
      { status: 400 }
    );
    clearOAuthCookieOnResponse(res);
    return res;
  }

  const xUser = meRes.me?.data;
  if (!xUser?.id || !xUser?.username) {
    const res = NextResponse.json(
      { error: "Malformed /users/me response.", detail: meRes.me },
      { status: 400 }
    );
    clearOAuthCookieOnResponse(res);
    return res;
  }

  const res = NextResponse.redirect(new URL("/bracket", url.origin));

  setSessionCookieOnResponse(res, {
    userId: xUser.id,
    username: xUser.username,
    xUserId: xUser.id
  });

  clearOAuthCookieOnResponse(res);
  return res;
}