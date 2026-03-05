"use client";

import type { CSSProperties, ReactNode } from "react";

type CenterFinalsProps = {
  style: CSSProperties;
  renderMatch: (matchId: string) => ReactNode;
};

export function CenterFinals({ style, renderMatch }: CenterFinalsProps) {
  return (
    <section className="absolute z-20" style={style}>
      <div className="flex h-full flex-col items-center">
        <p className="mb-4 text-center text-xs font-extrabold tracking-[0.25em] text-red-200">FINAL FOUR</p>

        <div className="w-[92%] space-y-4">
          {renderMatch("FF-1")}
          {renderMatch("FF-2")}
        </div>

        <div className="my-7 flex h-14 w-14 items-center justify-center rounded-full border border-red-400/80 bg-red-950/75 text-lg font-black tracking-widest text-red-100 shadow-[0_0_18px_rgba(220,38,38,0.45)]">
          VS
        </div>

        <p className="mb-4 text-center text-xs font-extrabold tracking-[0.22em] text-red-200">CHAMPIONSHIP</p>
        <div className="w-full max-w-[540px]">{renderMatch("CHIP")}</div>
      </div>
    </section>
  );
}
