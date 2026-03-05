"use client";

import { useEffect, useMemo, useState } from "react";
import { BracketCanvas2 } from "@/components/bracket2/BracketCanvas2";
import type { PicksMap } from "@/lib/tournament";
import { MATCH_IDS } from "@/lib/tournament";

type Props = {
  adminUsername: string;
};

type ResultRow = {
  match_id: string;
  winner_name: string;
};

export default function AdminResultsBracketClient({ adminUsername }: Props) {
  const [results, setResults] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingMatchId, setSavingMatchId] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadResults() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/results/list", { cache: "no-store" });
      const payload = (await res.json().catch(() => ({}))) as { rows?: ResultRow[]; error?: string };

      if (!res.ok) throw new Error(payload.error ?? `Failed to load (${res.status})`);

      const map: Record<string, string> = {};
      for (const r of payload.rows ?? []) {
        map[r.match_id] = r.winner_name;
      }
      setResults(map);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load results.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadResults();
  }, []);

  // Treat official results as "picks" so later rounds populate correctly
  const adminPicks = useMemo(() => results as unknown as PicksMap, [results]);

  const decidedCount = useMemo(() => {
    let n = 0;
    for (const id of MATCH_IDS) if (results[id]) n++;
    return n;
  }, [results]);

  async function setOfficialWinner(matchId: string, winnerName: string) {
    setSavingMatchId(matchId);
    setStatus(null);
    setError(null);

    // optimistic update
    setResults((prev) => ({ ...prev, [matchId]: winnerName }));

    try {
      const res = await fetch("/api/admin/results/set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, winnerName })
      });

      const payload = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        throw new Error(payload.error ?? "Failed to save result.");
      }

      setStatus(`Saved: ${matchId} → ${winnerName}`);
      await loadResults();
    } catch (e: any) {
      setError(e?.message ?? "Failed to save result.");
      await loadResults(); // rollback to server truth
    } finally {
      setSavingMatchId(null);
      setTimeout(() => setStatus(null), 2000);
    }
  }

  async function resetBracket() {
    const ok = confirm(
      "Reset the ENTIRE bracket?\n\nThis will delete all official results and set every match back to TBD."
    );
    if (!ok) return;

    setIsResetting(true);
    setStatus(null);
    setError(null);

    try {
      const res = await fetch("/api/admin/results/reset", { method: "POST" });
      const payload = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        throw new Error(payload.error ?? "Failed to reset bracket.");
      }

      // clear immediately in UI
      setResults({});
      setStatus("Bracket reset. All matches are now TBD.");
      // optionally re-sync from DB
      await loadResults();
    } catch (e: any) {
      setError(e?.message ?? "Failed to reset bracket.");
    } finally {
      setIsResetting(false);
      setTimeout(() => setStatus(null), 2500);
    }
  }

  const busy = loading || Boolean(savingMatchId) || isResetting;

  return (
    <div className="space-y-4">
      <section className="card">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-zinc-300">
              Admin: <span className="font-bold text-zinc-100">@{adminUsername}</span>
            </p>
            <p className="text-sm text-zinc-300">
              Official results set: {decidedCount} / {MATCH_IDS.length}
            </p>
            {loading && <p className="text-xs text-zinc-400">Loading…</p>}
            {savingMatchId && <p className="text-xs text-zinc-400">Saving {savingMatchId}…</p>}
            {isResetting && <p className="text-xs text-zinc-400">Resetting bracket…</p>}
            {status && <p className="text-xs text-emerald-300">{status}</p>}
            {error && <p className="text-xs text-red-300">{error}</p>}
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn" onClick={() => void loadResults()} disabled={busy}>
              Refresh
            </button>

            <button
              type="button"
              className="btn bg-red-700/90 hover:bg-red-700 disabled:opacity-50"
              onClick={() => void resetBracket()}
              disabled={busy}
              title="Deletes all official results"
            >
              Reset Bracket
            </button>

            <a className={`btn ${busy ? "pointer-events-none opacity-50" : ""}`} href="/bracket">
              Back
            </a>
          </div>
        </div>
      </section>

      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen">
        <div className="card overflow-x-hidden p-0">
          <BracketCanvas2 picks={adminPicks} results={{}} locked={false} onPick={setOfficialWinner} />
        </div>
      </div>
    </div>
  );
}