export type SavedTypingSession = {
  id: string;
  date: string;
  mode?: "quick" | "daily" | "weak";
  wpm: number;
  accuracy: number;
  errors: number;
  correctCharacters: number;
  totalCharacters: number;
  elapsedSeconds: number;
  mistakesByCharacter?: Record<string, number>;
};

const STORAGE_KEY = "keyrush_typing_sessions";
const STORAGE_EVENT = "keyrush_sessions_updated";
const EMPTY_SESSIONS: SavedTypingSession[] = [];

let cachedSessions = EMPTY_SESSIONS;
let hasLoadedSessions = false;

function readSessionsFromStorage(): SavedTypingSession[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return EMPTY_SESSIONS;
    }

    const sessions = JSON.parse(stored);

    return Array.isArray(sessions)
      ? sessions
      : EMPTY_SESSIONS;
  } catch {
    return EMPTY_SESSIONS;
  }
}

export function getTypingSessions(): SavedTypingSession[] {
  if (typeof window === "undefined") {
    return EMPTY_SESSIONS;
  }

  if (!hasLoadedSessions) {
    cachedSessions = readSessionsFromStorage();
    hasLoadedSessions = true;
  }

  return cachedSessions;
}

export function getServerTypingSessions(): SavedTypingSession[] {
  return EMPTY_SESSIONS;
}

export function subscribeToTypingSessions(
  callback: () => void
) {
  const handleStorageChange = () => {
    cachedSessions = readSessionsFromStorage();
    hasLoadedSessions = true;
    callback();
  };

  window.addEventListener(
    "storage",
    handleStorageChange
  );

  window.addEventListener(
    STORAGE_EVENT,
    handleStorageChange
  );

  return () => {
    window.removeEventListener(
      "storage",
      handleStorageChange
    );

    window.removeEventListener(
      STORAGE_EVENT,
      handleStorageChange
    );
  };
}

export function saveTypingSession(
  session: Omit<SavedTypingSession, "id" | "date">
): SavedTypingSession {
  const newSession: SavedTypingSession = {
    ...session,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
  };

  const existingSessions = getTypingSessions();

  const updatedSessions = [
    newSession,
    ...existingSessions,
  ];

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedSessions)
  );
  cachedSessions = updatedSessions;
  hasLoadedSessions = true;

  window.dispatchEvent(
    new Event(STORAGE_EVENT)
  );

  return newSession;
}

export function clearTypingSessions() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
  cachedSessions = EMPTY_SESSIONS;
  hasLoadedSessions = true;

  window.dispatchEvent(
    new Event(STORAGE_EVENT)
  );
}

export function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getTypingStreak(
  sessions: SavedTypingSession[],
  now = new Date()
): number {
  const activeDays = new Set(
    sessions.map((session) =>
      getLocalDateKey(new Date(session.date))
    )
  );
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  if (!activeDays.has(getLocalDateKey(today))) {
    today.setDate(today.getDate() - 1);
  }

  let streak = 0;

  while (activeDays.has(getLocalDateKey(today))) {
    streak++;
    today.setDate(today.getDate() - 1);
  }

  return streak;
}