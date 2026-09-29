"use client";

import { useEffect, useState } from "react";
import { keyboardRows } from "./keyboardRows";

type KeyboardProps = {
  nextCharacter?: string;
  disabled?: boolean;
};

export default function Keyboard({
  nextCharacter,
  disabled = false,
}: KeyboardProps) {
  const [pressedKey, setPressedKey] =
    useState<string | null>(null);

  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      let key = event.key;

      if (key === " ") {
        key = "SPACE";
      } else if (key === "Shift") {
        key = "SHIFT";
      } else {
        key = key.toUpperCase();
      }

      setPressedKey(key);
    };

    const handleKeyUp = () => {
      setPressedKey(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

      window.removeEventListener(
        "keyup",
        handleKeyUp
      );
    };
  }, [disabled]);

  if (disabled) {
    return null;
  }

  const targetCharacter = nextCharacter ?? "";

  const targetKey =
    targetCharacter === " "
      ? "SPACE"
      : targetCharacter.toUpperCase();

  const needsShift =
    targetCharacter.length === 1 &&
    /[A-Z]/.test(targetCharacter);

  return (
    <div className="mt-6 rounded-3xl border border-white/6 bg-[#0d111c] p-5 sm:p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
            Keyboard
          </div>

          <div className="mt-1 text-xs text-slate-500">
            Follow the highlighted key
          </div>
        </div>

        {targetCharacter && (
          <div className="rounded-lg bg-white/5 px-3 py-1.5 font-mono text-xs font-bold text-slate-300">
            {targetCharacter === " "
              ? "SPACE"
              : targetCharacter}
          </div>
        )}
      </div>

      {/* Keyboard */}
      <div className="mx-auto max-w-3xl space-y-2">
        {keyboardRows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex justify-center gap-1.5 sm:gap-2"
          >
            {row.map((key) => {
              const isTarget =
                key === targetKey;

              const isPressed =
                key === pressedKey;

              return (
                <div
                  key={key}
                  className={[
                    "flex h-10 min-w-7 flex-1 items-center justify-center rounded-lg",
                    "border text-[11px] font-semibold",
                    "transition-all duration-75",
                    "sm:h-11 sm:max-w-14",

                    isTarget
                      ? "border-[#8f82ff]/60 bg-[#8f82ff]/15 text-[#b8adff] shadow-[0_0_20px_rgba(143,130,255,0.12)]"
                      : isPressed
                      ? "scale-[0.96] border-white/20 bg-white/10 text-white"
                      : "border-white/5 bg-white/2.5 text-slate-600",
                  ].join(" ")}
                >
                  {key}
                </div>
              );
            })}
          </div>
        ))}

        {/* Shift + Space */}
        <div className="flex items-center justify-center gap-1.5 pt-1 sm:gap-2">
          <div
            className={[
              "flex h-10 w-20 items-center justify-center rounded-lg",
              "border text-[10px] font-semibold",
              "transition-all duration-75",
              "sm:h-11 sm:w-24",

              needsShift
                ? "border-[#8f82ff]/60 bg-[#8f82ff]/15 text-[#b8adff]"
                : pressedKey === "SHIFT"
                ? "scale-[0.96] border-white/20 bg-white/10 text-white"
                : "border-white/5 bg-white/2.5 text-slate-600",
            ].join(" ")}
          >
            Shift
          </div>

          <div
            className={[
              "flex h-10 flex-1 items-center justify-center rounded-lg",
              "border text-[10px] font-semibold uppercase tracking-widest",
              "transition-all duration-75",
              "sm:h-11 sm:max-w-md",

              targetKey === "SPACE"
                ? "border-[#8f82ff]/60 bg-[#8f82ff]/15 text-[#b8adff] shadow-[0_0_20px_rgba(143,130,255,0.12)]"
                : pressedKey === "SPACE"
                ? "scale-[0.98] border-white/20 bg-white/10 text-white"
                : "border-white/5 bg-white/2.5 text-slate-600",
            ].join(" ")}
          >
            Space
          </div>
        </div>
      </div>
    </div>
  );
}