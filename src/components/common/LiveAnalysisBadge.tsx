"use client";

import { useEffect, useState } from "react";

export function LiveAnalysisBadge({ className = "" }: { className?: string }) {
  const [totalCount, setTotalCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/stats/analyses", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (active && typeof data?.totalCount === "number") {
          setTotalCount(data.totalCount);
        }
      })
      .catch(() => {
        // Silent fallback
      });
    return () => {
      active = false;
    };
  }, []);

  if (totalCount === null) return null;

  return (
    <>
      <div className={`h-5 ${className}`} aria-hidden="true" />
      <div className="fixed top-[60px] left-1/2 -translate-x-1/2 z-40 pointer-events-none">
        <div className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-zinc-900/92 backdrop-blur-md text-white px-3.5 py-1.5 text-[11.5px] font-bold shadow-lg shadow-zinc-950/15 border border-white/10 whitespace-nowrap">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span>
            현재까지 <strong className="text-amber-300 font-black">{totalCount.toLocaleString()}명</strong>이 분석을 진행했어요
          </span>
        </div>
      </div>
    </>
  );
}
