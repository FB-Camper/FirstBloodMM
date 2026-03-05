"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LOCK_TIMESTAMP_ISO,
  applyPickWithCascade,
  calculateAccuracy,
  type PicksMap
} from "@/lib/tournament";
import { BracketCanvas2 } from "@/components/bracket2/BracketCanvas2";

type BracketClientProps = {
  initialPicks: PicksMap;
  initialResults: Record<string, string>;
  isLoggedIn: boolean;
  username: string | null;
};

const DEBUG_STABILITY = false;

export function BracketClient({
  initialPicks,
  initialResults,
  isLoggedIn,
  username
}: BracketClientProps) {
  const [picks, setPicks] = useState<PicksMap>(initialPicks);
  const [results] = useState<Record<string, string>>(initialResults);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState<number>(Date.now());

  const locked = nowMs >= new Date(LOCK_TIMESTAMP_ISO).getTime();

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 10_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      const raw = localStorage.getItem("fb_anonymous_picks");
      if (raw) {
        try {
          setPicks(JSON.parse(raw));
        } catch {
          localStorage.removeItem("fb_anonymous_picks");
        }
      }
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) {
      localStorage.setItem("fb_anonymous_picks", JSON.stringify(picks));
    }
  }, [isLoggedIn, picks]);

  const stats = useMemo(() => calculateAccuracy(picks, results), [picks, results]);

  async function persist(currentPicks: PicksMap) {
    if (!isLoggedIn || locked) return;
    setIsSaving(true);
    setError(null);

    const res = await fetch("/api/brackets/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ picks: currentPicks })
    });

    setIsSaving(false);
    if (!res.ok) {
      const payload = (await res.json().catch(() => ({}))) as { error?: string };
      setError(payload.error ?? "Failed to save picks.");
      return;
    }

    setLastSavedAt(new Date().toISOString());
  }

  useEffect(() => {
    if (!isLoggedIn || locked) return;
    const handle = setTimeout(() => {
      void persist(picks);
    }, 900);
    return () => clearTimeout(handle);
  }, [picks, isLoggedIn, locked]);

  function chooseWinner(matchId: string, winnerName: string) {
    if (locked) return;

    const root = DEBUG_STABILITY ? document.getElementById("bracket2-root") : null;
    const before = root?.getBoundingClientRect() ?? null;

    setPicks((prev) => applyPickWithCascade(prev, matchId, winnerName));

    if (DEBUG_STABILITY && before) {
      requestAnimationFrame(() => {
        const after = root?.getBoundingClientRect();
        if (!after) return;
        const dx = Math.abs(after.x - before.x);
        const dy = Math.abs(after.y - before.y);
        const dw = Math.abs(after.width - before.width);
        const dh = Math.abs(after.height - before.height);
        if (dx > 0.5 || dy > 0.5 || dw > 0.5 || dh > 0.5) {
          console.warn("[Bracket2 Stability] root moved after pick", { dx, dy, dw, dh, matchId });
        }
      });
    }
  }

  const champion = picks.CHIP ?? null;

  function handleShare() {
    const baseUrl = window.location.origin;
    const text = `First Blood Bracket Challenge | Champion: ${
      champion ?? "TBD"
    } | Accuracy: ${stats.correct}/${stats.decided} (${stats.percentage.toFixed(1)}%)`;
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(baseUrl)}`;
    window.open(intent, "_blank", "noopener,noreferrer");
  }

  async function handleExport() {
    await navigator.clipboard.writeText(JSON.stringify(picks, null, 2));
  }

  return (
    <div className="space-y-4">
      {/* HEADER (logo correctly constrained) */}
      <section className="card">
        <div className="grid items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
          {/* LEFT SIDE */}
          <div className="space-y-1">
            <p className="text-sm text-zinc-300">Lock: March 17, 2026 00:00 America/New_York</p>
            <p className={`text-sm font-semibold uppercase tracking-wide ${locked ? "text-red-400" : "text-emerald-400"}`}>
              {locked ? "Locked" : "Open"}
            </p>
            <p className="text-sm text-zinc-300">
              Accuracy: {stats.correct}/{stats.decided} ({stats.percentage.toFixed(1)}%)
            </p>
            {lastSavedAt && (
              <p className="text-xs text-zinc-400">Last saved: {new Date(lastSavedAt).toLocaleString()}</p>
            )}
            {error && <p className="text-xs text-red-300">{error}</p>}
          </div>

          {/* CENTER LOGO */}
          <div className="flex justify-center">
            <div className="relative h-[140px] w-[520px] max-w-full">
              <img
                src="/logo.png"
                alt="First Blood"
                className="h-full w-full object-contain drop-shadow-[0_0_30px_rgba(220,38,38,0.75)]"
              />
            </div>
          </div>

          {/* RIGHT BUTTONS */}
          <div className="flex flex-wrap justify-end gap-3">
            <button type="button" className="btn" onClick={() => void persist(picks)} disabled={!isLoggedIn || locked || isSaving}>
              {isSaving ? "Saving..." : "Save Now"}
            </button>
            <button type="button" className="btn" onClick={() => void handleExport()}>
              Export Picks
            </button>
            <button type="button" className="btn" onClick={handleShare}>
              Share to X
            </button>
            {!isLoggedIn && (
              <a className="btn" href="/api/auth/x/start">
                Login with X
              </a>
            )}
            {isLoggedIn && (
              <a className="btn" href="/api/logout">
                Logout @{username}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* FULL-WIDTH BRACKET */}
      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen">
        <section className="mx-auto w-full max-w-none px-0">
          <div className="card overflow-x-hidden p-0">
            <BracketCanvas2 picks={picks} results={results} locked={locked} onPick={chooseWinner} />
          </div>
        </section>
      </div>
    </div>
  );
}