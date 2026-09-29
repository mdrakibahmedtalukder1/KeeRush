"use client";

import Link from "next/link";
import { Activity, ArrowLeft, BarChart3, CalendarDays, Target, Trash2, Zap } from "lucide-react";
import { useSyncExternalStore } from "react";
import {
  clearTypingSessions,
  getServerTypingSessions,
  getTypingSessions,
  subscribeToTypingSessions,
} from "../../lib/typingStats";

const modeLabels = {
  quick: "Quick test",
  daily: "Daily challenge",
  weak: "Weak keys",
} as const;

export default function ProgressPage() {
  const sessions = useSyncExternalStore(
    subscribeToTypingSessions,
    getTypingSessions,
    getServerTypingSessions
  );
  const averageWpm = sessions.length
    ? Math.round(sessions.reduce((total, session) => total + session.wpm, 0) / sessions.length)
    : 0;
  const averageAccuracy = sessions.length
    ? Math.round((sessions.reduce((total, session) => total + session.accuracy, 0) / sessions.length) * 10) / 10
    : 0;
  const practiceMinutes = Math.round(
    sessions.reduce((total, session) => total + session.elapsedSeconds, 0) / 60
  );

  const handleClearHistory = () => {
    if (window.confirm("Delete all saved typing sessions from this browser? This cannot be undone.")) {
      clearTypingSessions();
    }
  };

  return (
    <main className="min-h-screen bg-[#070a12] text-slate-100">
      <div className="mx-auto max-w-5xl px-5 py-6 sm:px-8">
        <header className="flex items-center justify-between border-b border-white/6 pb-5">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white">
            <ArrowLeft size={16} /> Dashboard
          </Link>
          <span className="text-sm font-semibold">KeyRush</span>
        </header>

        <section className="py-10">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9b87ff]">Progress</div>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Your typing history</h1>
              <p className="mt-2 text-sm text-slate-500">Results update whenever you complete a practice session.</p>
            </div>
            {sessions.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistory}
                className="flex items-center gap-2 rounded-lg border border-rose-400/20 px-3 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-400/10"
              >
                <Trash2 size={14} /> Clear history
              </button>
            )}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryStat icon={Activity} label="Sessions" value={sessions.length} />
          <SummaryStat icon={Zap} label="Average speed" value={`${averageWpm} WPM`} />
          <SummaryStat icon={Target} label="Average accuracy" value={`${averageAccuracy}%`} />
          <SummaryStat icon={CalendarDays} label="Practice time" value={`${practiceMinutes} min`} />
        </section>

        <section className="mt-8">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <BarChart3 size={16} className="text-slate-500" /> Completed sessions
          </div>
          {sessions.length === 0 ? (
            <div className="rounded-xl border border-white/8 bg-[#0d111c] px-6 py-12 text-center">
              <p className="font-semibold">No sessions recorded yet</p>
              <p className="mt-2 text-sm text-slate-500">Your completed runs will appear here.</p>
              <Link href="/practice" className="mt-5 inline-flex items-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#080b12] transition hover:bg-slate-200">
                Start a practice session
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-white/8 bg-[#0d111c]">
              <div className="hidden grid-cols-[minmax(0,1.5fr)_1fr_1fr_1fr_1fr] gap-3 border-b border-white/6 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-600 sm:grid">
                <span>Date</span><span>Mode</span><span>Speed</span><span>Accuracy</span><span>Errors</span>
              </div>
              <div className="divide-y divide-white/5">
                {sessions.map((session) => (
                  <article key={session.id} className="grid grid-cols-2 gap-x-4 gap-y-2 px-5 py-4 sm:grid-cols-[minmax(0,1.5fr)_1fr_1fr_1fr_1fr] sm:items-center sm:gap-3">
                    <time dateTime={session.date} className="text-sm text-slate-300">
                      {new Date(session.date).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </time>
                    <span className="text-xs text-slate-500">{session.mode ? modeLabels[session.mode] : "Practice"}</span>
                    <span className="text-sm font-semibold">{session.wpm} WPM</span>
                    <span className="text-sm text-slate-300">{session.accuracy}%</span>
                    <span className="text-sm text-slate-500">{session.errors}</span>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function SummaryStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-white/6 bg-[#0d111c] p-4">
      <div className="flex items-center justify-between text-xs text-slate-500">
        {label}<Icon size={15} />
      </div>
      <div className="mt-3 text-xl font-bold">{value}</div>
    </div>
  );
}
