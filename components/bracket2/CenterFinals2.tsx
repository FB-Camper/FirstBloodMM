"use client";

import type { CSSProperties } from "react";
import { MatchSlot2 } from "@/components/bracket2/MatchSlot2";
import { CHAMP_GAP, FINALS_GAP } from "@/lib/bracket2Layout";
import type { PicksMap } from "@/lib/tournament";

type CenterFinals2Props = {
  style: CSSProperties;
  picks: PicksMap;
  results: Record<string, string>;
  locked: boolean;
  onPick: (matchId: string, winnerName: string) => void;
};

export function CenterFinals2({ style, picks, results, locked, onPick }: CenterFinals2Props) {
  return (
    <section className="absolute z-20 overflow-visible" style={style}>
      <div className="flex h-full flex-col px-1">
        {/* FINAL FOUR */}
        <p className="mb-4 text-center text-sm font-black tracking-[0.32em] text-red-200">FINAL FOUR</p>

        <MatchSlot2 matchId="FF-1" picks={picks} results={results} locked={locked} onPick={onPick} />

        <div style={{ height: FINALS_GAP }} />

        <MatchSlot2 matchId="FF-2" picks={picks} results={results} locked={locked} onPick={onPick} />

        {/* CHAMPIONSHIP */}
        <div style={{ height: CHAMP_GAP }} />

        <div className="relative">
          {/* Glow/spotlight behind the championship */}
          <div className="pointer-events-none absolute -inset-3 rounded-2xl bg-[radial-gradient(circle_at_50%_35%,rgba(220,38,38,0.35),transparent_62%)]" />
          <div className="pointer-events-none absolute -inset-3 rounded-2xl border border-red-500/35 shadow-[0_0_28px_rgba(220,38,38,0.35)]" />

          <p className="mb-4 text-center text-sm font-black tracking-[0.30em] text-red-200">CHAMPIONSHIP</p>

          <MatchSlot2 matchId="CHIP" picks={picks} results={results} locked={locked} onPick={onPick} />

          {/* subtle label under it if you want extra emphasis */}
          <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-[0.28em] text-red-300/90">
            PICK YOUR CHAMPION
          </p>
        </div>
      </div>
    </section>
  );
}