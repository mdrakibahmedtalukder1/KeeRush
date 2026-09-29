"use client";

import Keyboard from "./Keyboard";
import {
  getLocalDateKey,
  getTypingSessions,
  saveTypingSession,
} from "../../lib/typingStats";

import {
  ArrowLeft,
  RotateCcw,
  Timer,
  Zap,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  startTransition,
} from "react";
import { useRouter } from "next/navigation";

import { useTypingEngine } from "../../hooks/useTypingEngine";

const passages = [
  "The future belongs to people who keep learning, adapting, and building things that matter.",
  "Great products are rarely created in a single day. They improve through small experiments and constant iteration.",
  "Speed is useful, but accuracy creates confidence. Practice deliberately and your keyboard will eventually feel natural.",
  "Every keystroke is a small step toward mastery. Stay focused, find your rhythm, and keep moving forward.",
];

const durations = [15, 30, 60];

export default function PracticePage() {
  const router = useRouter();
  const [duration, setDuration] = useState(30);
  const [passageIndex, setPassageIndex] = useState(0);
  const [mode, setMode] = useState<"quick" | "daily" | "weak">("quick");
  const [weakPassage, setWeakPassage] = useState<string | null>(null);
  const savedRun = useRef(false);

  useEffect(() => {
    const requestedMode = new URLSearchParams(window.location.search).get("mode");
    if (requestedMode !== "daily" && requestedMode !== "weak") return;

    startTransition(() => setMode(requestedMode));

    if (requestedMode === "daily") {
      const dateKey = getLocalDateKey(new Date());
      const dayIndex = Number(dateKey.replaceAll("-", ""));
      startTransition(() => {
        setPassageIndex(dayIndex % passages.length);
        setDuration(60);
      });
      return;
    }

    const mistakes = getTypingSessions().reduce<Record<string, number>>(
      (totals, session) => {
        for (const [character, count] of Object.entries(
          session.mistakesByCharacter ?? {}
        )) {
          totals[character] = (totals[character] ?? 0) + count;
        }
        return totals;
      },
      {}
    );
    const weakestCharacter = Object.entries(mistakes).sort(
      (first, second) => second[1] - first[1]
    )[0]?.[0];

    if (weakestCharacter) {
      const words = passages
        .flatMap((passage) => passage.toLowerCase().match(/[a-z]+/g) ?? [])
        .filter((word) => word.includes(weakestCharacter));
      if (words.length) {
        let generatedPassage = "";
        while (generatedPassage.length < 120) {
          generatedPassage += `${words[generatedPassage.length % words.length]} `;
        }
        startTransition(() => setWeakPassage(generatedPassage.trim()));
      }
    }
  }, []);

  const text = useMemo(
    () => mode === "weak" && weakPassage
      ? weakPassage
      : passages[passageIndex],
    [mode, passageIndex, weakPassage]
  );

  const {
    typedText,
    status,
    elapsedSeconds,
    result,
    inputRef,
    start,
    reset,
    handleChange,
  } = useTypingEngine(text, duration);

  /*
   * The next character the user needs to type.
   */
  const nextCharacter =
    typedText.length < text.length
      ? text[typedText.length]
      : undefined;

  /*
   * Scroll to results when the test finishes.
   */
  useEffect(() => {
  if (status !== "finished" || savedRun.current) return;
  savedRun.current = true;

  const mistakesByCharacter: Record<string, number> = {};
  for (let index = 0; index < typedText.length; index++) {
    if (typedText[index] !== text[index]) {
      const expectedCharacter = text[index].toLowerCase();
      mistakesByCharacter[expectedCharacter] =
        (mistakesByCharacter[expectedCharacter] ?? 0) + 1;
    }
  }

  saveTypingSession({
    mode,
    wpm: result.wpm,
    accuracy: result.accuracy,
    errors: result.errors,
    correctCharacters: result.correctCharacters,
    totalCharacters: result.totalCharacters,
    elapsedSeconds: result.elapsedSeconds,
    mistakesByCharacter,
  });

  const timer = window.setTimeout(() => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  }, 100);

  return () => {
    window.clearTimeout(timer);
  };
}, [mode, result, status, text, typedText]);

  /*
   * Restart the test with a different passage.
   */
  const restart = () => {
    savedRun.current = false;
    if (mode !== "quick") {
      reset();
      return;
    }

    let newIndex = Math.floor(
      Math.random() * passages.length
    );

    if (
      passages.length > 1 &&
      newIndex === passageIndex
    ) {
      newIndex =
        (newIndex + 1) % passages.length;
    }

    setPassageIndex(newIndex);
    reset();
  };

  /*
   * Change test duration.
   */
  const changeDuration = (seconds: number) => {
    savedRun.current = false;
    setMode("quick");
    setDuration(seconds);
    reset();
  };

  return (
    <main className="min-h-screen bg-[#070a12] text-slate-100">
      <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8">

        {/* Header */}
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Dashboard
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-[#7c5cff] to-[#22d3ee]">
              <Zap size={15} />
            </div>

            <span className="font-semibold">
              KeyRush
            </span>
          </div>
        </header>

        {/* Controls */}
        <section className="mt-14">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

            {/* Heading */}
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-[#8f82ff]">
                {mode === "daily" ? "Daily Challenge" : mode === "weak" ? "Weak Keys" : "Practice"}
              </div>

              <h1 className="text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
                {mode === "daily" ? "Today's challenge." : mode === "weak" ? "Train your weak keys." : "Find your rhythm."}
              </h1>

              <p className="mt-2 max-w-lg text-sm leading-6 text-slate-600">
                {mode === "weak" && weakPassage
                  ? "Your practice passage focuses on the keys you miss most."
                  : mode === "weak"
                    ? "No missed-key history yet. Complete a run to personalize this session."
                    : "Focus on accuracy first. Speed will follow."}
              </p>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-2 rounded-xl border border-white/6 bg-white/2.5 p-1">
              {durations.map((seconds) => (
                <button
                  key={seconds}
                  type="button"
                  onClick={() =>
                    changeDuration(seconds)
                  }
                  className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                    mode === "quick" && duration === seconds
                      ? "bg-white text-[#080b12]"
                      : "text-slate-500 hover:text-white"
                  }`}
                >
                  {seconds}s
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Typing Area */}
        <section className="mt-10">
          <div className="rounded-[28px] border border-white/[0.07] bg-[#0d111c] p-6 sm:p-10">

            {/* Stats */}
            <div className="mb-10 flex items-center justify-between">

              <div className="flex items-center gap-8">

                {/* WPM */}
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                    WPM
                  </div>

                  <div className="mt-1 text-2xl font-bold">
                    {result.wpm}
                  </div>
                </div>

                {/* Accuracy */}
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                    Accuracy
                  </div>

                  <div className="mt-1 text-2xl font-bold">
                    {result.accuracy}%
                  </div>
                </div>

                {/* Errors */}
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                    Errors
                  </div>

                  <div className="mt-1 text-2xl font-bold">
                    {result.errors}
                  </div>
                </div>
              </div>

              {/* Timer */}
              <div className="flex items-center gap-2 text-slate-500">
                <Timer size={16} />

                <span className="text-sm font-semibold">
                  {Math.max(
                    0,
                    duration - elapsedSeconds
                  )}
                  s
                </span>
              </div>
            </div>

            {/* Passage */}
            <div
              onClick={start}
              className="relative cursor-text rounded-2xl border border-white/5 bg-[#090c14] p-6 sm:p-8"
            >
              {/* Visible Passage */}
              <div className="pointer-events-none font-mono text-xl leading-loose tracking-wide sm:text-2xl">
                {text.split("").map(
                  (character, index) => {
                    const typedCharacter =
                      typedText[index];

                    let className =
                      "text-slate-700";

                    if (
                      typedCharacter !== undefined
                    ) {
                      if (
                        typedCharacter === character
                      ) {
                        className =
                          "text-slate-100";
                      } else {
                        className =
                          "rounded bg-rose-500/10 text-rose-400";
                      }
                    }

                    if (
                      index === typedText.length &&
                      status !== "finished"
                    ) {
                      className +=
                        " border-l-2 border-[#9b87ff] animate-pulse";
                    }

                    return (
                      <span
                        key={`${index}-${character}`}
                        className={className}
                      >
                        {character}
                      </span>
                    );
                  }
                )}
              </div>

              {/* Typing Input */}
              <textarea
                ref={inputRef}
                value={typedText}
                onPaste={(event) => event.preventDefault()}
                onChange={(event) => {
                  handleChange(
                    event.target.value
                  );
                }}
                disabled={
                  status === "finished"
                }
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                className="absolute inset-0 z-10 h-full w-full cursor-text resize-none bg-transparent text-transparent caret-transparent outline-none"
                aria-label="Typing input"
              />

              {/* Idle Message */}
              {status === "idle" && (
                <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 text-center text-[11px] font-medium text-slate-700">
                  Click anywhere and start typing
                </div>
              )}
            </div>

            {/* Virtual Keyboard */}
            <Keyboard
              nextCharacter={nextCharacter}
            />

            {/* Bottom Controls */}
            <div className="mt-6 flex items-center justify-between">

              <div className="text-xs text-slate-700">
                {status === "running"
                  ? "Stay focused."
                  : status === "finished"
                  ? "Session complete."
                  : "Accuracy first. Speed second."}
              </div>

              <button
                type="button"
                onClick={restart}
                className="flex items-center gap-2 rounded-xl border border-white/6 bg-white/2.5 px-4 py-2.5 text-xs font-semibold text-slate-400 transition hover:bg-white/6 hover:text-white"
              >
                <RotateCcw size={14} />
                Restart
              </button>
            </div>
          </div>
        </section>

        {/* Results */}
        {status === "finished" && (
          <section className="mt-6 rounded-[28px] border border-white/[0.07] bg-[#0d111c] p-7 sm:p-10">

            <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">

              {/* Result Heading */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f82ff]">
                  Session complete
                </div>

                <h2 className="mt-2 text-3xl font-bold">
                  Nice run.
                </h2>

                <p className="mt-2 text-sm text-slate-600">
                  Your result has been calculated.
                </p>
              </div>

              {/* Result Stats */}
              <div className="grid grid-cols-3 gap-3">

                <ResultStat
                  label="WPM"
                  value={result.wpm}
                />

                <ResultStat
                  label="Accuracy"
                  value={`${result.accuracy}%`}
                />

                <ResultStat
                  label="Errors"
                  value={result.errors}
                />

              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

/*
 * Result statistic component.
 */
function ResultStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="min-w-22.5 rounded-xl border border-white/5 bg-white/2.5 px-4 py-3 text-center">

      <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-600">
        {label}
      </div>

      <div className="mt-1 text-lg font-bold">
        {value}
      </div>

    </div>
  );
}
