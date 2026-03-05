"use client";

import type { CSSProperties } from "react";
import { MatchSlot2 } from "@/components/bracket2/MatchSlot2";
import {
  COL_GAP,
  CONTENT_H,
  MATCHUP_GAP,
  R16_COL_W,
  R32_COL_W,
  R8_COL_W,
  REGION_INNER_PAD_X,
  SLOT_H,
  TITLE_GAP,
  TITLE_H
} from "@/lib/bracket2Layout";
import type { PicksMap, Region } from "@/lib/tournament";

type Side = "left" | "right";

type RegionBracket2Props = {
  region: Region;
  title: string;
  side: Side;
  style: CSSProperties;
  picks: PicksMap;
  results: Record<string, string>;
  locked: boolean;
  onPick: (matchId: string, winnerName: string) => void;
};

const R32_MATCH_IDS = [1, 2, 3, 4];
const R16_MATCH_IDS = [1, 2];

// These spacers automatically adapt because SLOT_H updated in bracket2Layout
const r16TopSpacer = SLOT_H + MATCHUP_GAP / 2;
const r8TopSpacer = SLOT_H + MATCHUP_GAP + SLOT_H + MATCHUP_GAP / 2;

export function RegionBracket2({
  region,
  title,
  side,
  style,
  picks,
  results,
  locked,
  onPick
}: RegionBracket2Props) {
  const inwardColumns = side === "left";

  const r32Column = (
    <div className="flex flex-col justify-start" style={{ width: R32_COL_W, gap: MATCHUP_GAP }}>
      {R32_MATCH_IDS.map((idx) => (
        <MatchSlot2
          key={`${region}-R32-${idx}`}
          matchId={`${region}-R32-${idx}`}
          picks={picks}
          results={results}
          locked={locked}
          onPick={onPick}
        />
      ))}
    </div>
  );

  const r16Column = (
    <div className="flex flex-col justify-start" style={{ width: R16_COL_W, gap: MATCHUP_GAP }}>
      <div style={{ height: r16TopSpacer }} />
      {R16_MATCH_IDS.map((idx) => (
        <MatchSlot2
          key={`${region}-R16-${idx}`}
          matchId={`${region}-R16-${idx}`}
          picks={picks}
          results={results}
          locked={locked}
          onPick={onPick}
        />
      ))}
    </div>
  );

  const r8Column = (
    <div className="flex flex-col justify-start" style={{ width: R8_COL_W }}>
      <div style={{ height: r8TopSpacer }} />
      <MatchSlot2 matchId={`${region}-R8-1`} picks={picks} results={results} locked={locked} onPick={onPick} />
    </div>
  );

  const orderedColumns = inwardColumns ? [r32Column, r16Column, r8Column] : [r8Column, r16Column, r32Column];

  const colTemplate = inwardColumns
    ? `${R32_COL_W}px ${R16_COL_W}px ${R8_COL_W}px`
    : `${R8_COL_W}px ${R16_COL_W}px ${R32_COL_W}px`;

  return (
    <section className="absolute z-20 overflow-visible" style={style}>
      <div className={side === "left" ? "text-left" : "text-right"} style={{ height: TITLE_H }}>
        <span className="inline-flex rounded-md bg-red-600/80 px-4 py-2 text-[11px] font-extrabold tracking-[0.18em] text-white shadow-[0_0_12px_rgba(220,38,38,0.4)]">
          {title}
        </span>
      </div>

      <div
        className="grid"
        style={{
          marginTop: TITLE_GAP,
          height: CONTENT_H,
          paddingLeft: REGION_INNER_PAD_X,
          paddingRight: REGION_INNER_PAD_X,
          gridTemplateColumns: colTemplate,
          columnGap: COL_GAP,
          alignItems: "start",
          // left region starts at left edge; right region hugs right edge
          justifyContent: side === "right" ? "end" : "start"
        }}
      >
        {orderedColumns}
      </div>
    </section>
  );
}