import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { clearOAuthCookie, getOAuthCookie, setSessionCookie } from "@/lib/session";

function basicAuthHeader(clientId: string, clientSecret: string) {
  const raw = `${clientId}:${clientSecret}`;
  return `Basic ${Buffer.from(raw).toString("base64")}`;
}

async function exchangeToken(params: {
  code: string;
  codeVerifier: string;
}) {
  const tokenUrl = "https://api.x.com/2/oauth2/token";

  const body = new URLSearchParams();
  body.set("grant_type", "authorization_code");
  body.set("code", params.code);
  body.set("redirect_uri", env.X_REDIRECT_URI);
  body.set("code_verifier", params.codeVerifier);

  // IMPORTANT:
  // - Confidential clients (Web App / bots) should authenticate with Authorization header. :contentReference[oaicite:2]{index=2}
  // - Public clients (SPA/Native) must include client_id in the body. :contentReference[oaicite:3]{index=3}
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded"
  };

  if (env.X_CLIENT_SECRET && env.X_CLIENT_SECRET.length > 0) {
    headers["Authorization"] = basicAuthHeader(env.X_CLIENT_ID, env.X_CLIENT_SECRET);
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

  return {
    ok: true as const,
    token: json as {
      token_type: string;
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
      scope?: string;
    }
  };
}

async function fetchMe(accessToken: string) {
  const res = await fetch("https://api.x.com/2/users/me", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false as const, detail: json };

  // Expected shape: { data: { id, name, username } }
  return { ok: true as const, me: json as any };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  if (error) {
    clearOAuthCookie();
    return NextResponse.json(
      { error: "X OAuth error.", detail: { error, errorDescription } },
      { status: 400 }
    );
  }

  if (!code || !returnedState) {
    clearOAuthCookie();
    return NextResponse.json({ error: "Missing code/state from X." }, { status: 400 });
  }

  const oauth = getOAuthCookie();
  if (!oauth) {
    // This is almost always caused by hostname mismatch:
    // starting login on 127.0.0.1 but callback is localhost (or vice versa).
    return NextResponse.json(
      {
        error: "Invalid OAuth state.",
        detail:
          "OAuth cookie missing. Make sure you start login and receive callback on the SAME hostname (use only http://localhost:3000)."
      },
      { status: 400 }
    );
  }

  if (oauth.state !== returnedState) {
    clearOAuthCookie();
    return NextResponse.json({ error: "Invalid OAuth state." }, { status: 400 });
  }

  // Exchange auth code for token
  const tokenRes = await exchangeToken({ code, codeVerifier: oauth.verifier });
  if (!tokenRes.ok) {
    clearOAuthCookie();
    return NextResponse.json(
      { error: "Failed token exchange with X.", detail: tokenRes.detail },
      { status: 400 }
    );
  }

  const accessToken = tokenRes.token.access_token;

  // Fetch user identity
  const meRes = await fetchMe(accessToken);
  if (!meRes.ok) {
    clearOAuthCookie();
    return NextResponse.json(
      { error: "Failed to fetch X user.", detail: meRes.detail },
      { status: 400 }
    );
  }

  const xUser = meRes.me?.data;
  if (!xUser?.id || !xUser?.username) {
    clearOAuthCookie();
    return NextResponse.json(
      { error: "Malformed /users/me response.", detail: meRes.me },
      { status: 400 }
    );
  }

  // Create a signed session cookie for your app
  setSessionCookie({
    userId: xUser.id,        // your internal userId (you can map differently later)
    username: xUser.username,
    xUserId: xUser.id
  });

  clearOAuthCookie();

  // Back to bracket
  return NextResponse.redirect(new URL("/bracket", url.origin));
}