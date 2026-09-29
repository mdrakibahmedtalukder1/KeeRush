"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  ArrowRight,
  BarChart3,
  Flame,
  Keyboard,
  LayoutDashboard,
  Medal,
  Play,
  Shield,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

import {
  startTransition,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";

import {
  getLocalDateKey,
  getServerTypingSessions,
  getTypingSessions,
  getTypingStreak,
  subscribeToTypingSessions,
} from "../lib/typingStats";

const navigation = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    label: "Practice",
    icon: Keyboard,
    href: "/practice",
  },
  {
    label: "Progress",
    icon: BarChart3,
    href: "/progress",
  },
];

const modes = [
  {
    title: "Quick Test",
    description:
      "Warm up with a fast typing session.",
    icon: Zap,
    time: "30 sec",
    href: "/practice?mode=quick",
  },
  {
    title: "Daily Challenge",
    description:
      "A 60-second typing test with a passage that changes daily.",
    icon: Target,
    time: "60 sec",
    href: "/practice?mode=daily",
  },
  {
    title: "Weak Keys",
    description:
      "Train the keys holding you back.",
    icon: Keyboard,
    time: "Adaptive",
    href: "/practice?mode=weak",
  },
];

export default function Home() {
  const pathname = usePathname();
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    const updateDate = () => startTransition(() => setCurrentDate(new Date()));
    updateDate();
    const interval = window.setInterval(updateDate, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const sessions = useSyncExternalStore(
    subscribeToTypingSessions,
    getTypingSessions,
    getServerTypingSessions
  );

  const latestSession = sessions[0];
  const todayKey = currentDate ? getLocalDateKey(currentDate) : "";
  const todaySessions = sessions.filter(
    (session) => getLocalDateKey(new Date(session.date)) === todayKey
  );
  const dailySessions = todaySessions.filter(
    (session) => session.mode === "daily"
  );
  const dailyBest = dailySessions.length
    ? Math.max(...dailySessions.map((session) => session.wpm))
    : 0;
  const streak = currentDate ? getTypingStreak(sessions, currentDate) : 0;
  const activeDaysThisWeek = new Set(
    sessions
      .filter((session) => currentDate &&
        new Date(session.date).getTime() >=
          new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 6).getTime())
      .map((session) => getLocalDateKey(new Date(session.date)))
  ).size;
  const personalBest = sessions.length
    ? Math.max(
        ...sessions.map(
          (session) => session.wpm
        )
      )
    : 0;

  const currentSpeed =
    latestSession?.wpm ?? 0;

  const currentAccuracy =
    latestSession?.accuracy ?? 0;

  const averageAccuracy = sessions.length
    ? Math.round(
        (sessions.reduce(
          (total, session) =>
            total + session.accuracy,
          0
        ) /
          sessions.length) *
          10
      ) / 10
    : 0;

  const profileName = averageAccuracy >= 95
    ? "Precision-focused"
    : averageAccuracy >= 85
      ? "Balanced typist"
      : "Building accuracy";
  const recentAccuracy = latestSession?.accuracy ?? 0;

  return (
    <main className="min-h-screen bg-[#070a12] text-slate-100">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="hidden w-62.5 shrink-0 border-r border-white/6 bg-[#090c14] lg:flex lg:flex-col">

          <div className="flex h-20 items-center px-6">
            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-[#7c5cff] to-[#22d3ee] shadow-lg shadow-purple-500/10">
                <Keyboard
                  size={19}
                  strokeWidth={2.5}
                />
              </div>

              <div>
                <div className="text-[17px] font-bold tracking-tight">
                  KeyRush
                </div>

                <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
                  Level up typing
                </div>
              </div>

            </div>
          </div>

          <div className="px-3 pt-5">

            <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              Workspace
            </div>

            <nav className="space-y-1">

              {navigation.map((item) => {
                const Icon = item.icon;

                const active = pathname === item.href;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      active
                        ? "bg-white/[0.07] text-white"
                        : "text-slate-500 hover:bg-white/4 hover:text-slate-200"
                    }`}
                  >

                    <Icon
                      size={18}
                      className={
                        active
                          ? "text-[#9b87ff]"
                          : ""
                      }
                    />

                    {item.label}
                  </Link>
                );
              })}

            </nav>
          </div>

          <div className="mt-auto p-3">

            <div className="mb-3 rounded-2xl border border-white/6 bg-white/2.5 p-4">

              <div className="mb-3 flex items-center justify-between">

                <span className="text-xs font-semibold text-slate-400">
                  Last 7 days
                </span>

                <span className="text-[10px] font-medium text-slate-600">
                  {activeDaysThisWeek}/7 active days
                </span>

              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-white/6">
                <div
                  className="h-full rounded-full bg-linear-to-r from-[#7c5cff] to-[#22d3ee]"
                  style={{ width: `${(activeDaysThisWeek / 7) * 100}%` }}
                />
              </div>

              <div className="mt-2 text-[10px] text-slate-600">
                {sessions.length} total sessions
              </div>

            </div>

            <Link
              href="/progress"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500 transition hover:bg-white/4 hover:text-white"
            >
              <BarChart3 size={18} />
              Session history
            </Link>

          </div>
        </aside>

        {/* Main */}
        <section className="min-w-0 flex-1">

          {/* Header */}
          <header className="flex h-20 items-center justify-between border-b border-white/6 px-5 sm:px-8">

            <div>

              <p className="text-xs font-medium text-slate-500">
                {currentDate?.toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                }) ?? "Your typing activity"}
              </p>

              <h1 className="mt-0.5 text-lg font-semibold tracking-tight">
                {currentDate
                  ? `${currentDate.getHours() < 12 ? "Good morning" : currentDate.getHours() < 18 ? "Good afternoon" : "Good evening"}.`
                  : "Welcome to KeyRush."}
              </h1>

            </div>

            <div className="flex items-center gap-3">

              <div className="flex items-center gap-2 rounded-xl border border-white/6 bg-white/2.5 px-3 py-2">

                <Flame
                  size={15}
                  className="text-orange-400"
                />

                <span className="text-sm font-semibold">
                  {streak}
                </span>

                <span className="text-xs text-slate-500">
                  day streak
                </span>

              </div>

            </div>

          </header>

          <div className="mx-auto max-w-350 p-5 sm:p-8">

            {/* Hero */}
            <section className="relative overflow-hidden rounded-[28px] border border-white/[0.07] bg-[#0d111c] p-7 sm:p-10">

              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#7c5cff]/10 blur-3xl" />

              <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-[#22d3ee]/6 blur-3xl" />

              <div className="relative max-w-3xl">

                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#7c5cff]/20 bg-[#7c5cff]/10 px-3 py-1.5 text-xs font-medium text-[#b0a4ff]">

                  <Sparkles size={13} />

                  Your typing journey continues

                </div>

                <h2 className="max-w-2xl text-4xl font-bold leading-[1.08] tracking-[-0.04em] sm:text-5xl">
                  {sessions.length > 0 ? (
                    <>
                      Your personal best is{" "}
                      <span className="bg-linear-to-r from-[#9b87ff] to-[#22d3ee] bg-clip-text text-transparent">
                        {personalBest} WPM.
                      </span>
                    </>
                  ) : (
                    <>
                      Start your first{" "}

                      <span className="bg-linear-to-r from-[#9b87ff] to-[#22d3ee] bg-clip-text text-transparent">
                        typing session
                      </span>{" "}

                      and begin your journey.
                    </>
                  )}

                </h2>

                <p className="mt-5 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                  {sessions.length > 0
                    ? `Your latest run was ${currentSpeed} WPM at ${recentAccuracy}% accuracy. ${todaySessions.length} ${todaySessions.length === 1 ? "session" : "sessions"} completed today.`
                    : "Take your first typing test and KeyRush will start building your personal performance profile."}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">

                  <Link
                    href="/practice"
                    className="group flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#080b12] transition hover:bg-slate-200"
                  >
                    <Play
                      size={16}
                      fill="currentColor"
                    />

                    Start Practice

                    <ArrowRight
                      size={15}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>

                  <Link
                    href="/progress"
                    className="rounded-xl border border-white/8 bg-white/2.5 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/6 hover:text-white"
                  >
                    View Progress
                  </Link>

                </div>

              </div>

              {/* Hero stat */}
              <div className="absolute bottom-8 right-8 hidden xl:block">

                <div className="text-right">

                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-600">
                    Personal Best
                  </div>

                  <div className="mt-1 text-6xl font-bold tracking-[-0.06em]">

                    {personalBest}

                    <span className="ml-2 text-lg font-medium text-slate-500">
                      WPM
                    </span>

                  </div>

                </div>

              </div>

            </section>

            {/* Stats */}
            <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">

              {[
                {
                  label: "Latest Speed",
                  value: currentSpeed,
                  unit: "WPM",
                  change: sessions.length
                    ? "Latest test"
                    : "No tests yet",
                  icon: Zap,
                },
                {
                  label: "Accuracy",
                  value: currentAccuracy,
                  unit: "%",
                  change: sessions.length
                    ? "Latest test"
                    : "No tests yet",
                  icon: Target,
                },
                {
                  label: "Average Accuracy",
                  value: averageAccuracy,
                  unit: "%",
                  change: sessions.length
                    ? `${sessions.length} tests`
                    : "No tests yet",
                  icon: BarChart3,
                },
                {
                  label: "Personal Best",
                  value: personalBest,
                  unit: "WPM",
                  change: sessions.length
                    ? `${sessions.length} tests`
                    : "No tests yet",
                  icon: Trophy,
                },
              ].map((stat) => {

                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/6 bg-[#0d111c] p-5"
                  >

                    <div className="flex items-center justify-between">

                      <span className="text-xs font-medium text-slate-500">
                        {stat.label}
                      </span>

                      <Icon
                        size={15}
                        className="text-slate-600"
                      />

                    </div>

                    <div className="mt-4 flex items-baseline gap-1">

                      <span className="text-2xl font-bold tracking-tight">
                        {stat.value}
                      </span>

                      <span className="text-xs font-medium text-slate-600">
                        {stat.unit}
                      </span>

                    </div>

                    <div className="mt-2 text-[11px] font-medium text-emerald-400">

                      {stat.change}

                    </div>

                  </div>
                );
              })}

            </section>

            {/* Practice modes */}
            <section className="mt-10">

              <div className="mb-4 flex items-end justify-between">

                <div>

                  <h3 className="text-lg font-semibold tracking-tight">
                    Choose your session
                  </h3>

                  <p className="mt-1 text-xs text-slate-600">
                    Every session contributes to your typing profile.
                  </p>

                </div>

                <Link
                  href="/practice"
                  className="hidden items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-white sm:flex"
                >
                  All modes
                  <ArrowRight size={14} />
                </Link>

              </div>

              <div className="grid gap-3 md:grid-cols-3">

                {modes.map((mode) => {

                  const Icon = mode.icon;

                  return (
                    <Link
                      key={mode.title}
                      href={mode.href}
                      className="group text-left rounded-2xl border border-white/6 bg-[#0d111c] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/12 hover:bg-[#111622]"
                    >

                      <div className="flex items-start justify-between">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-300 transition group-hover:bg-[#7c5cff]/10 group-hover:text-[#a898ff]">
                          <Icon size={18} />
                        </div>

                        <span className="rounded-lg bg-white/4 px-2 py-1 text-[10px] font-medium text-slate-600">
                          {mode.time}
                        </span>

                      </div>

                      <h4 className="mt-5 text-sm font-semibold">
                        {mode.title}
                      </h4>

                      <p className="mt-1.5 text-xs leading-5 text-slate-600">
                        {mode.description}
                      </p>

                      <div className="mt-5 flex items-center gap-1 text-xs font-medium text-slate-500 transition group-hover:text-white">

                        Start

                        <ArrowRight
                          size={13}
                          className="transition-transform group-hover:translate-x-1"
                        />

                      </div>

                    </Link>
                  );
                })}

              </div>

            </section>

            {/* Bottom grid */}
            <section className="mt-10 grid gap-5 lg:grid-cols-[1.4fr_1fr]">

              {/* Daily challenge */}
              <div className="rounded-2xl border border-white/6 bg-[#0d111c] p-6">

                <div className="flex items-center justify-between">

                  <div>

                    <div className="flex items-center gap-2">

                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400">
                        <Trophy size={15} />
                      </div>

                      <span className="text-sm font-semibold">
                        Daily Challenge
                      </span>

                    </div>

                    <p className="mt-3 text-xs leading-5 text-slate-600">
                      A consistent 60-second passage, saved with today’s practice.
                    </p>

                  </div>

                  <div className="text-right">

                    <div className="text-[10px] uppercase tracking-widest text-slate-600">
                      Today’s best
                    </div>

                    <div className="mt-1 text-xl font-bold">
                      {dailySessions.length ? `${dailyBest} WPM` : "Not attempted"}
                    </div>

                  </div>

                </div>

                <div className="mt-6 rounded-xl border border-white/5 bg-black/10 p-4">

                  <div className="flex items-center justify-between text-xs">

                    <span className="text-slate-500">
                      Attempts today
                    </span>

                    <span className="font-semibold text-slate-300">
                      {dailySessions.length}
                    </span>

                  </div>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-[#7c5cff] to-[#22d3ee]"
                      style={{ width: `${Math.min(dailySessions.length, 1) * 100}%` }}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[10px] text-slate-600">

                    <span>{todaySessions.length} total sessions today</span>

                    <span>{dailySessions.length ? "Challenge complete" : "Not yet complete"}</span>

                  </div>

                </div>

                <Link
                  href="/practice?mode=daily"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 py-3 text-xs font-semibold text-slate-300 transition hover:bg-white/8 hover:text-white"
                >
                  {dailySessions.length ? "Run challenge again" : "Start daily challenge"}
                  <ArrowRight size={14} />
                </Link>

              </div>

              {/* Typing identity */}
              <div className="rounded-2xl border border-white/6 bg-[#0d111c] p-6">

                <div className="flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7c5cff]/10 text-[#a898ff]">
                    <Medal size={15} />
                  </div>

                  <span className="text-sm font-semibold">
                    Performance profile
                  </span>

                </div>

                <div className="mt-5 flex items-center gap-4">

                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#7c5cff]/20 bg-linear-to-br from-[#7c5cff]/15 to-[#22d3ee]/10">
                    <Shield
                      size={27}
                      className="text-[#a898ff]"
                    />
                  </div>

                  <div>

                    <div className="text-lg font-bold">
                      {sessions.length ? profileName : "Waiting for your first run"}
                    </div>

                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      {sessions.length
                        ? `${sessions.length} recorded ${sessions.length === 1 ? "session" : "sessions"} shape this profile.`
                        : "Complete a practice session to build your profile."}
                    </p>

                  </div>

                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">

                  <div className="rounded-xl bg-white/2.5 p-3">

                    <div className="text-[10px] text-slate-600">
                      Precision
                    </div>

                    <div className="mt-1 text-sm font-semibold">
                      {averageAccuracy}%
                    </div>

                  </div>

                  <div className="rounded-xl bg-white/2.5 p-3">

                    <div className="text-[10px] text-slate-600">
                      Consistency
                    </div>

                    <div className="mt-1 text-sm font-semibold">
                      {activeDaysThisWeek}/7 days
                    </div>

                  </div>

                </div>

                <Link
                  href="/progress"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-white/6 py-3 text-xs font-semibold text-slate-400 transition hover:bg-white/4 hover:text-white"
                >
                  Explore session history
                  <ArrowRight size={14} />
                </Link>

              </div>

            </section>

          </div>
        </section>
      </div>
    </main>
  );
}