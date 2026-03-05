import crypto from "node:crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { env } from "@/lib/env";

const SESSION_COOKIE = "fb_session";
const OAUTH_COOKIE = "fb_oauth";

export type SessionPayload = {
  userId: string;
  username: string;
  xUserId: string;
};

export type OAuthPayload = {
  state: string;
  verifier: string;
  createdAt: number;
};

function base64url(input: string | Buffer) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function sign(payloadB64: string) {
  return base64url(crypto.createHmac("sha256", env.SESSION_SECRET).update(payloadB64).digest());
}

function encodeSigned(value: unknown) {
  const payloadB64 = base64url(JSON.stringify(value));
  const sig = sign(payloadB64);
  return `${payloadB64}.${sig}`;
}

function decodeSigned<T>(raw: string | undefined | null): T | null {
  if (!raw) return null;
  const [payloadB64, signature] = raw.split(".");
  if (!payloadB64 || !signature) return null;
  if (sign(payloadB64) !== signature) return null;
  try {
    return JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

const baseCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/"
};

/**
 * Server-side cookie helpers (works in Server Components / Route Handlers).
 */
export function setSessionCookie(payload: SessionPayload) {
  cookies().set(SESSION_COOKIE, encodeSigned(payload), { ...baseCookie, maxAge: 60 * 60 * 24 * 30 });
}
export function getSessionCookie(): SessionPayload | null {
  return decodeSigned<SessionPayload>(cookies().get(SESSION_COOKIE)?.value);
}
export function clearSessionCookie() {
  cookies().set(SESSION_COOKIE, "", { ...baseCookie, maxAge: 0 });
}
export function setOAuthCookie(payload: OAuthPayload) {
  cookies().set(OAUTH_COOKIE, encodeSigned(payload), { ...baseCookie, maxAge: 60 * 10 });
}
export function getOAuthCookie(): OAuthPayload | null {
  return decodeSigned<OAuthPayload>(cookies().get(OAUTH_COOKIE)?.value);
}
export function clearOAuthCookie() {
  cookies().set(OAUTH_COOKIE, "", { ...baseCookie, maxAge: 0 });
}

/**
 * Response-attached cookie helpers (most reliable for redirects).
 */
export function setOAuthCookieOnResponse(res: NextResponse, payload: OAuthPayload) {
  res.cookies.set(OAUTH_COOKIE, encodeSigned(payload), { ...baseCookie, maxAge: 60 * 10 });
}
export function clearOAuthCookieOnResponse(res: NextResponse) {
  res.cookies.set(OAUTH_COOKIE, "", { ...baseCookie, maxAge: 0 });
}
export function setSessionCookieOnResponse(res: NextResponse, payload: SessionPayload) {
  res.cookies.set(SESSION_COOKIE, encodeSigned(payload), { ...baseCookie, maxAge: 60 * 60 * 24 * 30 });
}