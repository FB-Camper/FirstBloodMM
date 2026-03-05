"use client";

import { TEAMS, getMatchOptions, type PicksMap } from "@/lib/tournament";
import { SLOT_H, TEAM_GAP, TEAM_ROW_H } from "@/lib/bracket2Layout";

type MatchSlot2Props = {
  matchId: string;
  picks: PicksMap;
  results: Record<string, string>;
  locked: boolean;
  onPick: (matchId: string, winnerName: string) => void;
  widthClass?: string;
};

type TeamRowProps = {
  label: string | null;
  seedText: string;
  selected: boolean;
  state: "none" | "correct" | "wrong";
  disabled: boolean;
  onClick: () => void;
};

function seedForTeamName(name: string | null): string {
  if (!name) return "-";
  const team = TEAMS.find((t) => t.name === name);
  return team ? String(team.seed) : "-";
}

// ✅ 2-line clamp WITHOUT tailwind plugin
const clamp2: React.CSSProperties = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden"
};

function TeamRow({ label, seedText, selected, state, disabled, onClick }: TeamRowProps) {
  let stateClass = "border-zinc-500 bg-zinc-900/95";
  if (selected) stateClass = "border-red-400 bg-zinc-800/95 shadow-[0_0_8px_rgba(220,38,38,0.35)]";
  if (state === "correct") stateClass = "border-emerald-300/80 bg-emerald-700/70";
  if (state === "wrong") stateClass = "border-red-300/80 bg-red-700/75";

  return (
    <button
      type="button"
      disabled={disabled || !label}
      onClick={onClick}
      className={`flex w-full items-start gap-2 rounded-md border-2 px-2 py-2 text-left font-bold uppercase tracking-wide text-zinc-50 transition-colors transition-shadow ${stateClass} disabled:cursor-not-allowed disabled:opacity-45`}
      style={{ height: TEAM_ROW_H }}
    >
      {/* seed stays fixed */}
      <span className="mt-[2px] inline-flex h-6 w-7 shrink-0 items-center justify-center rounded-sm border border-zinc-300/60 bg-black/85 text-[10px] font-extrabold tabular-nums leading-none text-zinc-100">
        {seedText}
      </span>

      {/* ✅ wrap + 2-line clamp + fixed height (no layout shift) */}
      <span className="min-w-0 flex-1 rounded-sm bg-zinc-800/55 px-2 py-1 text-[11px] leading-[1.15]">
        <span style={clamp2}>{label ?? "TBD"}</span>
      </span>
    </button>
  );
}

export function MatchSlot2({
  matchId,
  picks,
  results,
  locked,
  onPick,
  widthClass = "w-full"
}: MatchSlot2Props) {
  const [left, right] = getMatchOptions(matchId, picks);
  const selected = picks[matchId];
  const winner = results[matchId];

  const leftState = selected === left && winner ? (selected === winner ? "correct" : "wrong") : "none";
  const rightState = selected === right && winner ? (selected === winner ? "correct" : "wrong") : "none";

  const leftSeed = seedForTeamName(left);
  const rightSeed = seedForTeamName(right);

  return (
    <div
      className={`relative z-20 min-w-0 rounded-lg border border-zinc-600/80 bg-black/70 p-[6px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] ${widthClass}`}
      style={{ height: SLOT_H }}
    >
      <div className="grid h-full grid-rows-2" style={{ rowGap: TEAM_GAP }}>
        <TeamRow
          label={left}
          seedText={left ? leftSeed : "-"}
          selected={selected === left}
          state={leftState}
          disabled={locked}
          onClick={() => left && onPick(matchId, left)}
        />
        <TeamRow
          label={right}
          seedText={right ? rightSeed : "-"}
          selected={selected === right}
          state={rightState}
          disabled={locked}
          onClick={() => right && onPick(matchId, right)}
        />
      </div>
    </div>
  );
}