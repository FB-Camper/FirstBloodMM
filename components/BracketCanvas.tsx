"use client";

import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import { useViewport } from "@/hooks/useViewport";
import { REGION_SEEDS, getMatchOptions, type PicksMap, type Region } from "@/lib/tournament";
import {
  BOT_Y,
  CENTER_H,
  CENTER_W,
  CENTER_X,
  CENTER_Y,
  COL_GAP,
  DESIGN_H,
  DESIGN_W,
  LEFT_X,
  MATCH_GAP,
  REGION_H,
  REGION_W,
  RIGHT_X,
  SLOT_H,
  TITLE_BAR_SPACE,
  TITLE_SAFE_H,
  TEAM_GAP,
  TEAM_ROW_H,
  TOP_Y
} from "@/lib/bracketLayout";

type CanvasProps = {
  picks: PicksMap;
  results: Record<string, string>;
  locked: boolean;
  onPick: (matchId: string, winnerName: string) => void;
};

type MatchSlotProps = {
  matchId: string;
  region?: Region;
  showSeed: boolean;
  picks: PicksMap;
  results: Record<string, string>;
  locked: boolean;
  onPick: (matchId: string, winnerName: string) => void;
};

type RegionBox = {
  region: Region;
  title: string;
  side: "left" | "right";
  x: number;
  y: number;
  w: number;
  h: number;
};

const DEBUG_LAYOUT = false;
const DEBUG_STABILITY = false;

const REGION_BOXES: RegionBox[] = [
  { region: "EAST", title: "EAST REGION", side: "left", x: LEFT_X, y: TOP_Y, w: REGION_W, h: REGION_H },
  { region: "SOUTH", title: "SOUTH REGION", side: "right", x: RIGHT_X, y: TOP_Y, w: REGION_W, h: REGION_H },
  { region: "WEST", title: "WEST REGION", side: "left", x: LEFT_X, y: BOT_Y, w: REGION_W, h: REGION_H },
  { region: "MIDWEST", title: "MIDWEST REGION", side: "right", x: RIGHT_X, y: BOT_Y, w: REGION_W, h: REGION_H }
];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function TeamButton({
  label,
  seed,
  selected,
  correctState,
  disabled,
  onClick
}: {
  label: string | null;
  seed?: number | null;
  selected: boolean;
  correctState: "none" | "correct" | "wrong";
  disabled: boolean;
  onClick: () => void;
}) {
  let stateClass = "border-zinc-500 bg-zinc-900/95 hover:border-red-500";
  if (selected) stateClass = "border-red-400 bg-zinc-800/95 shadow-[0_0_12px_rgba(220,38,38,0.35)]";
  if (correctState === "correct") stateClass = "border-emerald-300/80 bg-emerald-700/70";
  if (correctState === "wrong") stateClass = "border-red-300/80 bg-red-700/75";

  return (
    <button
      type="button"
      className={`flex h-[var(--fb-row-h)] w-full items-center gap-2 rounded-lg border-2 px-3 text-left text-[clamp(12px,0.75vw,14px)] font-bold uppercase tracking-wide leading-none text-zinc-50 transition-colors transition-shadow ${stateClass} disabled:cursor-not-allowed disabled:opacity-45`}
      disabled={disabled || !label}
      onClick={onClick}
    >
      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-zinc-300/60 bg-black/85 text-[10px] font-extrabold tabular-nums leading-none text-zinc-100">
        {seed ?? "-"}
      </span>
      <span className="h-7 min-w-0 flex-1 truncate whitespace-nowrap rounded-md bg-zinc-800/55 px-2 leading-7">{label ?? "TBD"}</span>
    </button>
  );
}

function MatchSlot({ matchId, region, showSeed, picks, results, locked, onPick }: MatchSlotProps) {
  const [left, right] = getMatchOptions(matchId, picks);
  const selected = picks[matchId];
  const winner = results[matchId];

  const leftState = selected === left && winner ? (selected === winner ? "correct" : "wrong") : "none";
  const rightState = selected === right && winner ? (selected === winner ? "correct" : "wrong") : "none";

  const seedOf = (name: string | null): number | null => {
    if (!showSeed || !region || !name) return null;
    return REGION_SEEDS[region].find((t) => t.name === name)?.seed ?? null;
  };

  return (
    <div className="relative z-20 h-[var(--fb-slot-h)] w-full min-w-0 rounded-lg border border-zinc-600/80 bg-black/68 p-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
      <div className="grid h-full grid-rows-2" style={{ rowGap: "var(--fb-team-gap)" }}>
        <TeamButton
          label={left}
          seed={seedOf(left)}
          selected={selected === left}
          correctState={leftState}
          disabled={locked}
          onClick={() => left && onPick(matchId, left)}
        />
        <TeamButton
          label={right}
          seed={seedOf(right)}
          selected={selected === right}
          correctState={rightState}
          disabled={locked}
          onClick={() => right && onPick(matchId, right)}
        />
      </div>
    </div>
  );
}

function RegionBlock({ box, picks, results, locked, onPick }: { box: RegionBox } & CanvasProps) {
  const isRight = box.side === "right";

  return (
    <section className="absolute z-20 overflow-hidden" style={{ left: box.x, top: box.y, width: box.w, height: box.h }}>
      <div className="relative h-full w-full overflow-hidden">
        <div className={`absolute inset-x-0 top-0 z-30 ${isRight ? "text-right" : "text-left"}`}>
          <span className="inline-flex rounded-md bg-red-600/80 px-4 py-2 text-xs font-extrabold tracking-widest text-white shadow-[0_0_14px_rgba(220,38,38,0.45)]">
            {box.title}
          </span>
        </div>

      <div className={`absolute inset-x-0 bottom-0 ${isRight ? "grid-cols-[0.7fr_0.95fr_1.15fr]" : "grid-cols-[1.15fr_0.95fr_0.7fr]"} grid`} style={{ top: TITLE_BAR_SPACE, columnGap: "var(--fb-col-gap)" }}>
        <div className="flex flex-col justify-between" style={{ rowGap: "var(--fb-match-gap)" }}>
          {isRight ? (
            <MatchSlot matchId={`${box.region}-R8-1`} region={box.region} showSeed={false} picks={picks} results={results} locked={locked} onPick={onPick} />
          ) : (
            <>
              <MatchSlot matchId={`${box.region}-R32-1`} region={box.region} showSeed={true} picks={picks} results={results} locked={locked} onPick={onPick} />
              <MatchSlot matchId={`${box.region}-R32-2`} region={box.region} showSeed={true} picks={picks} results={results} locked={locked} onPick={onPick} />
              <MatchSlot matchId={`${box.region}-R32-3`} region={box.region} showSeed={true} picks={picks} results={results} locked={locked} onPick={onPick} />
              <MatchSlot matchId={`${box.region}-R32-4`} region={box.region} showSeed={true} picks={picks} results={results} locked={locked} onPick={onPick} />
            </>
          )}
        </div>

        <div className="flex flex-col justify-around" style={{ rowGap: "var(--fb-match-gap)" }}>
          <MatchSlot matchId={`${box.region}-R16-1`} region={box.region} showSeed={false} picks={picks} results={results} locked={locked} onPick={onPick} />
          <MatchSlot matchId={`${box.region}-R16-2`} region={box.region} showSeed={false} picks={picks} results={results} locked={locked} onPick={onPick} />
        </div>

        <div className="flex flex-col justify-center">
          {isRight ? (
            <div className="flex flex-col justify-between" style={{ rowGap: "var(--fb-match-gap)" }}>
              <MatchSlot matchId={`${box.region}-R32-1`} region={box.region} showSeed={true} picks={picks} results={results} locked={locked} onPick={onPick} />
              <MatchSlot matchId={`${box.region}-R32-2`} region={box.region} showSeed={true} picks={picks} results={results} locked={locked} onPick={onPick} />
              <MatchSlot matchId={`${box.region}-R32-3`} region={box.region} showSeed={true} picks={picks} results={results} locked={locked} onPick={onPick} />
              <MatchSlot matchId={`${box.region}-R32-4`} region={box.region} showSeed={true} picks={picks} results={results} locked={locked} onPick={onPick} />
            </div>
          ) : (
            <MatchSlot matchId={`${box.region}-R8-1`} region={box.region} showSeed={false} picks={picks} results={results} locked={locked} onPick={onPick} />
          )}
        </div>
      </div>
      </div>
    </section>
  );
}

function CenterFinals({ picks, results, locked, onPick }: CanvasProps) {
  return (
    <section className="absolute z-20 overflow-hidden" style={{ left: CENTER_X, top: CENTER_Y, width: CENTER_W, height: CENTER_H }}>
      <p className="mb-3 text-center text-xs font-extrabold tracking-[0.25em] text-red-200">FINAL FOUR</p>
      <div className="space-y-4">
        <MatchSlot matchId="FF-1" showSeed={false} picks={picks} results={results} locked={locked} onPick={onPick} />
        <MatchSlot matchId="FF-2" showSeed={false} picks={picks} results={results} locked={locked} onPick={onPick} />
      </div>

      <div className="my-6 flex justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-red-400/80 bg-red-950/75 text-sm font-black tracking-widest text-red-100">
          VS
        </div>
      </div>

      <p className="mb-3 text-center text-xs font-extrabold tracking-[0.22em] text-red-200">CHAMPIONSHIP</p>
      <div className="mx-auto w-[300px]">
        <MatchSlot matchId="CHIP" showSeed={false} picks={picks} results={results} locked={locked} onPick={onPick} />
      </div>
    </section>
  );
}

export function BracketCanvas(props: CanvasProps) {
  const viewport = useViewport();
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const scale = useMemo(() => {
    const vw = viewport.width || 1366;
    const vh = viewport.height || 768;
    const s = Math.min((vw * 0.96) / DESIGN_W, (vh * 0.84) / DESIGN_H);
    return clamp(s, 0.72, 1.05);
  }, [viewport.width, viewport.height]);

  const isMobile = (viewport.width || 1366) < 1280;
  const outerHeight = DESIGN_H * scale;

  const styleVars = {
    ["--fb-col-gap" as const]: `${COL_GAP}px`,
    ["--fb-slot-h" as const]: `${SLOT_H}px`,
    ["--fb-row-h" as const]: `${TEAM_ROW_H}px`,
    ["--fb-team-gap" as const]: `${TEAM_GAP}px`,
    ["--fb-match-gap" as const]: `${MATCH_GAP}px`
  } as CSSProperties;

  useEffect(() => {
    if (!DEBUG_STABILITY) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    console.log("[BRACKET_STABILITY]", {
      scale,
      viewportWidth: viewport.width,
      viewportHeight: viewport.height,
      canvasX: rect?.x ?? null,
      canvasY: rect?.y ?? null,
      canvasW: rect?.width ?? null,
      canvasH: rect?.height ?? null
    });
  });

  return (
    <div className="w-full min-h-[calc(100vh-220px)] flex items-center justify-center">
      <div className={`w-full ${isMobile ? "overflow-x-auto" : "overflow-hidden"}`}>
        <div className="mx-auto flex justify-center" style={{ height: outerHeight, minWidth: isMobile ? 1200 : undefined }}>
          <div
            ref={canvasRef}
            className="relative"
            style={{ width: DESIGN_W, height: DESIGN_H, transform: `scale(${scale})`, transformOrigin: "top center", ...styleVars }}
          >
            <div className="absolute inset-0 z-0 rounded-2xl border border-red-900/60 bg-zinc-950" />
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_20%,rgba(185,28,28,0.28),transparent_34%),radial-gradient(circle_at_80%_18%,rgba(239,68,68,0.2),transparent_30%),radial-gradient(circle_at_50%_90%,rgba(127,29,29,0.32),transparent_42%),linear-gradient(180deg,#0a0a0a_0%,#060606_100%)]" />
            <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.72)_100%)]" />

            <div className="absolute left-1/2 top-4 z-20 flex h-[96px] w-[760px] -translate-x-1/2 items-center justify-center text-center">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-red-200">FIRST BLOOD presents</p>
                <h2 className="mt-1 text-2xl font-black uppercase tracking-[0.12em] text-zinc-100">ALL-TIME CALL OF DUTY ROSTERS</h2>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.3em] text-red-300">ONLY ONE SURVIVES</p>
              </div>
            </div>

            {REGION_BOXES.map((box) => (
              <RegionBlock key={box.region} box={box} {...props} />
            ))}

            <CenterFinals {...props} />

            {DEBUG_LAYOUT && (
              <div className="pointer-events-none absolute inset-0 z-30">
                <div className="absolute left-0 top-0 w-full border border-cyan-300/60" style={{ height: TITLE_SAFE_H }} />
                {REGION_BOXES.map((box) => (
                  <div key={box.region} className="absolute border border-cyan-300/60" style={{ left: box.x, top: box.y, width: box.w, height: box.h }} />
                ))}
                <div className="absolute border border-yellow-300/70" style={{ left: CENTER_X, top: CENTER_Y, width: CENTER_W, height: CENTER_H }} />
              </div>
            )}

            {DEBUG_STABILITY && (
              <div className="pointer-events-none absolute left-0 top-0 z-30 h-3 w-3 rounded-full bg-fuchsia-400 shadow-[0_0_10px_rgba(232,121,249,0.8)]" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
