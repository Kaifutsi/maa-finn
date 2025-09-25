"use client";
import { useState, PropsWithChildren } from "react";

type FlipCardProps = PropsWithChildren<{
  back: React.ReactNode;
  className?: string;
}>;

export default function FlipCard({ children, back, className }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className={`relative h-full ${className ?? ""}`}
      style={{ perspective: 1000 }}
      onClick={() => setFlipped(v => !v)}
      role="button"
      aria-pressed={flipped}
    >
      <div
        className={`transition-transform duration-500 [transform-style:preserve-3d] ${
          flipped ? "rotate-y-180" : ""
        } h-full`}
      >
        {/* Front side */}
        <div className="rounded-xl overflow-hidden border border-slate-200 shadow bg-white dark:bg-slate-900 [backface-visibility:hidden] h-full flex flex-col">
          {children}
        </div>

        {/* Back side */}
        <div className="rounded-xl overflow-hidden border border-slate-200 shadow bg-white dark:bg-slate-900 absolute inset-0 rotate-y-180 [backface-visibility:hidden] h-full flex flex-col">
          {back}
        </div>
      </div>

      {/* Tailwind не знает rotate-y-180 по умолчанию — добавляем вручную */}
      <style jsx>{`
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
