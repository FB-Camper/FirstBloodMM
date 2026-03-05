"use client";

import { useEffect, useState } from "react";

type ViewportState = {
  width: number;
  height: number;
};

export function useViewport(): ViewportState {
  const [viewport, setViewport] = useState<ViewportState>({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let frame = 0;
    const update = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    const onResize = () => {
      if (frame) {
        cancelAnimationFrame(frame);
      }
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("resize", onResize);
    return () => {
      if (frame) {
        cancelAnimationFrame(frame);
      }
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return viewport;
}
