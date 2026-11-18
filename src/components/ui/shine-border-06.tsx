import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FocusFrameBorderProps = {
  children: ReactNode;
  className?: string;
  duration?: number;
  color?: string;
};

const corners = [
  {
    position: "top-0 left-0",
    edges: "border-t-2 border-l-2 rounded-tl-2xl",
    delay: 0,
  },
  {
    position: "top-0 right-0",
    edges: "border-t-2 border-r-2 rounded-tr-2xl",
    delay: 0.3,
  },
  {
    position: "bottom-0 left-0",
    edges: "border-b-2 border-l-2 rounded-bl-2xl",
    delay: 0.6,
  },
  {
    position: "bottom-0 right-0",
    edges: "border-b-2 border-r-2 rounded-br-2xl",
    delay: 0.9,
  },
];

const FocusFrameBorder = ({
  children,
  className,
  duration = 2.4,
  color = "#2563eb",
}: FocusFrameBorderProps) => {
  return (
    <>
      <style>{`
        @keyframes focus-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .animate-focus-pulse {
          animation: focus-pulse var(--duration, 2.4s) ease-in-out infinite;
        }
      `}</style>
      <div className={cn("relative rounded-2xl", className)}>
        {corners.map((corner) => (
          <div
            key={corner.position}
            className={cn(
              "absolute z-20 w-8 h-8 pointer-events-none animate-focus-pulse",
              corner.position,
              corner.edges
            )}
            style={
              {
                borderColor: color,
                filter: `drop-shadow(0 0 6px ${color}) drop-shadow(0 0 12px ${color})`,
                animationDelay: `${corner.delay}s`,
                "--duration": `${duration}s`,
              } as React.CSSProperties
            }
          />
        ))}

        <div className="relative z-10 rounded-2xl bg-white border border-zinc-200/80 overflow-hidden h-full shadow-sm">
          {children}
        </div>
      </div>
    </>
  );
};

export default FocusFrameBorder;
