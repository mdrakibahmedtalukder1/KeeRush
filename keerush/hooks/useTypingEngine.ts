"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type TypingResult = {
  wpm: number;
  accuracy: number;
  errors: number;
  correctCharacters: number;
  totalCharacters: number;
  elapsedSeconds: number;
};

type TypingStatus = "idle" | "running" | "finished";

const calculateWpm = (
  correctCharacters: number,
  elapsedSeconds: number
) => {
  if (elapsedSeconds <= 0) return 0;

  return Math.round(
    (correctCharacters / 5 / elapsedSeconds) * 60
  );
};

export function useTypingEngine(
  text: string,
  duration: number
) {
  const [typedText, setTypedText] = useState("");
  const [status, setStatus] =
    useState<TypingStatus>("idle");

  const [elapsedSeconds, setElapsedSeconds] =
    useState(0);

  const [errors, setErrors] = useState(0);

  const inputRef =
    useRef<HTMLTextAreaElement | null>(null);

  const startTimeRef =
    useRef<number | null>(null);

  /*
   * Focus the typing input.
   *
   * IMPORTANT:
   * This does NOT start the timer.
   * The timer starts only when the user
   * actually types the first character.
   */
  const start = useCallback(() => {
    if (status === "finished") return;

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, [status]);

  /*
   * Reset the entire typing session.
   */
  const reset = useCallback(() => {
    setTypedText("");
    setStatus("idle");
    setElapsedSeconds(0);
    setErrors(0);

    startTimeRef.current = null;

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  /*
   * Finish the current session.
   */
  const finish = useCallback(() => {
    if (startTimeRef.current !== null) {
      const elapsed = Math.floor(
        (Date.now() - startTimeRef.current) / 1000
      );
      setElapsedSeconds(
        Math.min(duration, Math.max(1, elapsed))
      );
    }

    setStatus("finished");
  }, [duration]);

  /*
   * Handle typing input.
   */
  const handleChange = useCallback(
    (value: string) => {
      if (status === "finished") return;

      /*
       * Never allow typing beyond the passage.
       */
      const nextValue = value.slice(
        0,
        text.length
      );

      /*
       * Calculate errors.
       */
      let errorCount = 0;

      for (
        let i = 0;
        i < nextValue.length;
        i++
      ) {
        if (nextValue[i] !== text[i]) {
          errorCount++;
        }
      }

      setErrors(errorCount);
      setTypedText(nextValue);

      /*
       * If this is the first character,
       * start the timer NOW.
       */
      if (
        status === "idle" &&
        nextValue.length > 0
      ) {
        startTimeRef.current = Date.now();
        setStatus("running");
      }

      /*
       * If the entire passage has been typed,
       * finish the session.
       */
      if (nextValue.length >= text.length) {
        finish();
      }
    },
    [finish, status, text]
  );

  /*
   * Timer.
   */
  useEffect(() => {
    if (status !== "running") return;

    const interval = window.setInterval(() => {
      if (startTimeRef.current === null) return;

      const elapsed = Math.floor(
        (Date.now() -
          startTimeRef.current) /
          1000
      );

      const currentElapsed = Math.min(
        elapsed,
        duration
      );

      setElapsedSeconds(currentElapsed);

      /*
       * Time is up.
       */
      if (elapsed >= duration) {
        setElapsedSeconds(duration);
        finish();
      }
    }, 100);

    return () => {
      window.clearInterval(interval);
    };
  }, [duration, finish, status]);

  /*
   * Calculate live statistics.
   */
  const result = useMemo<TypingResult>(() => {
    let correctCharacters = 0;

    for (
      let i = 0;
      i < typedText.length;
      i++
    ) {
      if (typedText[i] === text[i]) {
        correctCharacters++;
      }
    }

    const totalCharacters =
      typedText.length;

    const accuracy =
      totalCharacters === 0
        ? 100
        : Math.round(
            (correctCharacters /
              totalCharacters) *
              1000
          ) / 10;

    return {
      wpm: calculateWpm(
        correctCharacters,
        elapsedSeconds
      ),
      accuracy,
      errors,
      correctCharacters,
      totalCharacters,
      elapsedSeconds,
    };
  }, [
    elapsedSeconds,
    errors,
    text,
    typedText,
  ]);

  return {
    typedText,
    status,
    elapsedSeconds,
    errors,
    inputRef,
    start,
    reset,
    finish,
    handleChange,
    result,
  };
}