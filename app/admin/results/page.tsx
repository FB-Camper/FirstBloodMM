import { getAuthedUser } from "@/lib/auth";
import AdminResultsBracketClient from "@/components/admin/AdminResultsBracketClient";

const ADMIN_USERNAME = "FirstBlood_CDL";

export default async function AdminResultsPage() {
  const user = await getAuthedUser();

  const isAdmin =
    Boolean(user?.username) &&
    user!.username!.toLowerCase() === ADMIN_USERNAME.toLowerCase();

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-2xl border border-red-900/40 bg-black/70 p-6">
          <h1 className="text-xl font-black uppercase tracking-[0.12em] text-zinc-100">
            Admin Results
          </h1>

          <p className="mt-3 text-sm text-zinc-300">
            You must be logged in as{" "}
            <span className="font-bold text-zinc-100">@{ADMIN_USERNAME}</span>{" "}
            to update official results.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <a className="btn" href="/api/auth/x/start">
              Login with X
            </a>
            <a className="btn" href="/bracket">
              Back to Bracket
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <AdminResultsBracketClient adminUsername={user!.username!} />;
}