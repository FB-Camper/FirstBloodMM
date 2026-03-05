import { getSessionCookie } from "@/lib/session";

export type AuthedUser = {
  id: string;
  username: string;
  xUserId: string;
};

export async function getAuthedUser(): Promise<AuthedUser | null> {
  const session = getSessionCookie();
  if (!session) return null;

  // session is what you set in setSessionCookie() during OAuth callback
  return {
    id: session.userId,
    username: session.username,
    xUserId: session.xUserId
  };
}