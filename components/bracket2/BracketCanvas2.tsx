"use client";

import { useMemo } from "react";
import { useViewport } from "@/hooks/useViewport";
import { CenterFinals2 } from "@/components/bracket2/CenterFinals2";
import { RegionBracket2 } from "@/components/bracket2/RegionBracket2";
import {
  BOTTOM_Y,
  CENTER_H,
  CENTER_W,
  CENTER_X,
  CENTER_Y,
  DESIGN_H,
  DESIGN_W,
  LEFT_X,
  REGION_H,
  REGION_W,
  RIGHT_X,
  TOP_Y
} from "@/lib/bracket2Layout";
import type { PicksMap } from "@/lib/tournament";

type BracketCanvas2Props = {
  picks: PicksMap;
  results: Record<string, string>;
  locked: boolean;
  onPick: (matchId: string, winnerName: string) => void;
};

export function BracketCanvas2({ picks, results, locked, onPick }: BracketCanvas2Props) {
  const viewport = useViewport();
  const DEBUG_FIT_MARKERS = false;

  const scale = useMemo(() => {
    const vw = viewport.width || 1366;
    return Math.min((vw - 24) / DESIGN_W, 1);
  }, [viewport.width]);

  const offsetX = useMemo(() => {
    const vw = viewport.width || 1366;
    const scaledW = DESIGN_W * scale;
    return (vw - scaledW) / 2;
  }, [viewport.width, scale]);

  const scaledHeight = DESIGN_H * scale;

  // ✅ Extra space under the bigger title so regions never collide with it
  const HEADER_PUSH_DOWN = 70;

  return (
    <div className="w-screen overflow-x-hidden px-0 pt-6">
      <div className="flex w-full justify-center">
        <div className="relative w-screen" style={{ height: scaledHeight }}>
          <div
            className="relative"
            style={{
              width: DESIGN_W,
              height: DESIGN_H,
              transform: `translateX(${offsetX}px) scale(${scale})`,
              transformOrigin: "top left"
            }}
          >
            <div id="bracket2-root" className="relative" style={{ width: DESIGN_W, height: DESIGN_H }}>
              {/* BACKGROUND */}
              <div className="absolute inset-0 z-0 rounded-2xl border border-red-900/60 bg-zinc-950" />
              <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_20%,rgba(185,28,28,0.26),transparent_36%),radial-gradient(circle_at_80%_18%,rgba(239,68,68,0.18),transparent_32%),radial-gradient(circle_at_50%_90%,rgba(127,29,29,0.3),transparent_44%),linear-gradient(180deg,#0a0a0a_0%,#060606_100%)]" />
              <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px]" />
              <div className="absolute inset-0 z-0 bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.72)_100%)]" />

              {/* ✅ BIGGER TITLE HEADER */}
              <div className="absolute left-1/2 top-8 z-20 flex h-[150px] w-[1100px] -translate-x-1/2 items-center justify-center text-center pointer-events-none">
                <div>
                  <p className="text-[14px] font-extrabold uppercase tracking-[0.55em] text-red-200/90">
                    FIRST BLOOD PRESENTS
                  </p>

                  <h2 className="mt-3 text-[56px] font-black uppercase tracking-[0.16em] text-zinc-100 drop-shadow-[0_0_18px_rgba(220,38,38,0.45)]">
                    ALL-TIME CALL OF DUTY ROSTERS
                  </h2>

                  <p className="mt-3 text-[16px] font-bold uppercase tracking-[0.55em] text-red-300/90">
                    ONLY ONE SURVIVES
                  </p>
                </div>
              </div>

              {/* REGIONS (pushed down for bigger header) */}
              <RegionBracket2
                region="EAST"
                title="EAST REGION"
                side="left"
                style={{ left: LEFT_X, top: TOP_Y + HEADER_PUSH_DOWN, width: REGION_W, height: REGION_H }}
                picks={picks}
                results={results}
                locked={locked}
                onPick={onPick}
              />
              <RegionBracket2
                region="SOUTH"
                title="SOUTH REGION"
                side="right"
                style={{ left: RIGHT_X, top: TOP_Y + HEADER_PUSH_DOWN, width: REGION_W, height: REGION_H }}
                picks={picks}
                results={results}
                locked={locked}
                onPick={onPick}
              />
              <RegionBracket2
                region="WEST"
                title="WEST REGION"
                side="left"
                style={{ left: LEFT_X, top: BOTTOM_Y + HEADER_PUSH_DOWN, width: REGION_W, height: REGION_H }}
                picks={picks}
                results={results}
                locked={locked}
                onPick={onPick}
              />
              <RegionBracket2
                region="MIDWEST"
                title="MIDWEST REGION"
                side="right"
                style={{ left: RIGHT_X, top: BOTTOM_Y + HEADER_PUSH_DOWN, width: REGION_W, height: REGION_H }}
                picks={picks}
                results={results}
                locked={locked}
                onPick={onPick}
              />

              {/* CENTER FINALS (also pushed down so it stays centered relative to regions) */}
              <CenterFinals2
                style={{ left: CENTER_X, top: CENTER_Y + HEADER_PUSH_DOWN / 2, width: CENTER_W, height: CENTER_H }}
                picks={picks}
                results={results}
                locked={locked}
                onPick={onPick}
              />

              {DEBUG_FIT_MARKERS && (
                <>
                  <div className="pointer-events-none absolute left-0 top-0 z-30 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500" />
                  <div
                    className="pointer-events-none absolute top-0 z-30 h-3 w-3 -translate-y-1/2 translate-x-1/2 rounded-full bg-red-500"
                    style={{ left: DESIGN_W }}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
