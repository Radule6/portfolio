"use client";


import React, { useEffect, useState } from "react";

const LOGO_TEXT = "RADULE";
const LOGO_ACCENT = ".DEV";
const LETTER_STAGGER = 60;
const HOLD_DURATION = 1000;
const EXIT_DURATION = 700;

const Preloader: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit" | "done">("enter");

  useEffect(() => {
    const enterTime = LOGO_TEXT.length * LETTER_STAGGER + LOGO_ACCENT.length * LETTER_STAGGER + 400;

    const holdTimer = setTimeout(() => setPhase("hold"), enterTime);
    const exitTimer = setTimeout(() => setPhase("exit"), enterTime + HOLD_DURATION);
    const doneTimer = setTimeout(() => {
      setPhase("done");
      onComplete?.();
    }, enterTime + HOLD_DURATION + EXIT_DURATION);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  if (phase === "done") return null;

  const allLetters = [...LOGO_TEXT.split(""), ...LOGO_ACCENT.split("")];

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-surface transition-all duration-700 ease-[cubic-bezier(0.7,0,0.3,1)] ${
        phase === "exit"
          ? "opacity-0 scale-[1.02]"
          : "opacity-100 scale-100"
      }`}
      aria-hidden="true"
    >
      {/* Subtle radial glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(183,255,3,0.06)_0%,transparent_70%)] blur-[100px]" />

      <span className="relative font-display font-800 text-3xl sm:text-4xl lg:text-5xl tracking-tight select-none">
        {allLetters.map((letter, i) => {
          const isAccent = i >= LOGO_TEXT.length;
          return (
            <span
              key={i}
              className={`inline-block transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isAccent ? "gradient-text" : "text-text-primary"
              }`}
              style={{
                opacity: phase === "enter" ? 0 : 1,
                transform:
                  phase === "enter"
                    ? "translate3d(0,16px,0) scale(0.9)"
                    : "translate3d(0,0,0) scale(1)",
                willChange: "opacity, transform",
                transitionDelay: `${i * LETTER_STAGGER}ms`,
              }}
            >
              {letter}
            </span>
          );
        })}
      </span>
    </div>
  );
};

export default Preloader;
