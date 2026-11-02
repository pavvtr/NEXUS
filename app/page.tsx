"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity, Bell, BookOpen, Check, ChevronDown, Clock3, Coffee, LayoutDashboard,
  Leaf, Menu, Moon, MoreHorizontal, Pause, Play, Plus, Settings, ShieldCheck,
  Smartphone, Sparkles, Target, Timer, TrendingDown, TrendingUp, X, Zap
} from "lucide-react";

type Section = "Overview" | "Screen limits" | "Break schedule" | "Study mode" | "Reports" | "Settings";
type AppLimit = { name: string; icon: string; used: number; limit: number; color: string };
type Stored = { dailyLimit: number; breakAfter: number; breakLength: number; studyMinutes: number; apps: AppLimit[]; totalSeconds: number };

const initialApps: AppLimit[] = [
  { name: "Social media", icon: "◎", used: 42, limit: 60, color: "bg-violet-500" },
  { name: "Entertainment", icon: "▶", used: 68, limit: 90, color: "bg-orange-400" },
  { name: "Games", icon: "◇", used: 25, limit: 45, color: "bg-sky-500" },
];

const navItems: { label: Section; icon: typeof LayoutDashboard }[] = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Screen limits", icon: Smartphone },
  { label: "Break schedule", icon: Coffee },
  { label: "Study mode", icon: BookOpen },
  { label: "Reports", icon: Activity },
  { label: "Settings", icon: Settings },
];

function formatTime(total: number) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
function formatClock(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function Home() {
  const [section, setSection] = useState<Section>("Overview");
  const [mobileNav, setMobileNav] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(180);
  const [breakAfter, setBreakAfter] = useState(30);
  const [breakLength, setBreakLength] = useState(5);
  const [studyMinutes, setStudyMinutes] = useState(25);
  const [apps, setApps] = useState<AppLimit[]>(initialApps);
  const [totalSeconds, setTotalSeconds] = useState(94 * 60);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [breakRunning, setBreakRunning] = useState(false);
  const [notice, setNotice] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("nexus-wellness");
      if (saved) {
        const data: Stored = JSON.parse(saved);
        setDailyLimit(data.dailyLimit ?? 180);
        setBreakAfter(data.breakAfter ?? 30);
        setBreakLength(data.breakLength ?? 5);
        setStudyMinutes(data.studyMinutes ?? 25);
        setApps(data.apps ?? initialApps);
        setTotalSeconds(data.totalSeconds ?? 94 * 60);
      }
    } catch { /* start with demo values if browser storage is unavailable */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const data: Stored = { dailyLimit, breakAfter, breakLength, studyMinutes, apps, totalSeconds };
    localStorage.setItem("nexus-wellness", JSON.stringify(data));
  }, [ready, dailyLimit, breakAfter, breakLength, studyMinutes, apps, totalSeconds]);

  useEffect(() => {
    if (!timerRunning && !breakRunning) return;
    const id = window.setInterval(() => {
      if (timerRunning) {
        setTimerSeconds((v) => {
          if (v <= 1) {
            setTimerRunning(false);
            setNotice("Study session complete. Take a short break!");
            return studyMinutes * 60;
          }
          return v - 1;
        });
      }
      if (breakRunning) {
        setTimerSeconds((v) => {
          if (v <= 1) {
            setBreakRunning(false);
            setNotice("Break finished. Ready for your next session?");
            return studyMinutes * 60;
          }
          return v - 1;
        });
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning, breakRunning, studyMinutes]);

  useEffect(() => {
    if (!ready) return;
    const id = window.setInterval(() => setTotalSeconds((v) => v + 1), 1000);
    return () => window.clearInterval(id);
  }, [ready]);

  const usedMinutes = Math.floor(totalSeconds / 60);
  const remaining = Math.max(dailyLimit - usedMinutes, 0);
  const usagePercent = Math.min((usedMinutes / dailyLimit) * 100, 100);
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  }, []);

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  }
  function saveAppLimit(index: number, value: number) {
    setApps((prev) => prev.map((app, i) => i === index ? { ...app, limit: value } : app));
    showNotice("App limit updated.");
  }
  function resetDemo() {
    setTotalSeconds(0);
    setApps(initialApps.map((app) => ({ ...app, used: 0 })));
    showNotice("Demo usage has been reset.");
  }

  const Sidebar = () => (
    <aside className={`${mobileNav ? "fixed inset-0 z-40 flex" : "hidden"} lg:relative lg:flex lg:w-64 lg:shrink-0`}>
      <div className="absolute inset-0 bg-slate-950/30 lg:hidden" onClick={() => setMobileNav(false)} />
      <div className="relative flex w-72 flex-col border-r border-slate-100 bg-white px-5 py-6 lg:w-64">
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-200"><Leaf size={21} /></div>
            <div><div className="text-lg font-bold tracking-tight">nexus</div><div className="text-[11px] text-slate-400">DIGITAL WELLNESS</div></div>
          </div>
          <button className="lg:hidden" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={20}/></button>
        </div>
        <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Workspace</div>
        <nav className="space-y-1">
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} onClick={() => { setSection(label); setMobileNav(false); }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${section === label ? "bg-violet-50 font-semibold text-violet-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}>
              <Icon size={18}/>{label}
              {label === "Screen limits" && <span className="ml-auto h-2 w-2 rounded-full bg-emerald-400"/>}
            </button>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 p-4 text-white">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/15"><Sparkles size={18}/></div>
          <div className="text-sm font-semibold">Small steps matter</div>
          <p className="mt-1 text-xs leading-5 text-violet-100">Build a healthier relationship with your screen, one day at a time.</p>
          <button onClick={() => setSection("Study mode")} className="mt-4 text-xs font-semibold text-white underline underline-offset-4">Start a focus session</button>
        </div>
      </div>
    </aside>
  );

  return (
    <main className="min-h-screen lg:flex">
      <Sidebar />
      <section className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-slate-100 bg-white/90 px-5 backdrop-blur md:px-9">
          <div className="flex items-center gap-3">
            <button className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={21}/></button>
            <div><div className="text-sm text-slate-400">Workspace / <span className="text-slate-700">{section}</span></div><div className="hidden text-xs text-slate-400 sm:block">Your personal digital wellness space</div></div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => showNotice("You're all caught up. No new reminders.")} className="relative rounded-xl border border-slate-100 p-2.5 text-slate-500 hover:bg-slate-50" aria-label="Notifications"><Bell size={18}/><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-violet-500"/></button>
            <div className="flex items-center gap-2 border-l border-slate-100 pl-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">S</div><div className="hidden sm:block"><div className="text-sm font-semibold">Student</div><div className="text-[11px] text-slate-400">Free plan</div></div><ChevronDown size={15} className="hidden text-slate-400 sm:block"/></div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-5 py-8 md:px-9 md:py-10">
          {notice && <div className="mb-5 flex items-center justify-between rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-800"><span>{notice}</span><button onClick={() => setNotice("")}><X size={16}/></button></div>}

          {section === "Overview" && <>
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div><div className="mb-2 flex items-center gap-2 text-sm font-medium text-violet-600"><Sparkles size={16}/> YOUR DAILY CHECK-IN</div><h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{greeting}, Student <span>✦</span></h1><p className="mt-2 text-sm text-slate-500">A little more balance, a little more focus. You’ve got this.</p></div>
              <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm"><span className="mr-2">◷</span>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
            </div>

            <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
              <div className="rounded-3xl bg-gradient-to-br from-[#29205f] via-[#45358f] to-[#6855c9] p-6 text-white shadow-xl shadow-violet-100 md:p-8">
                <div className="flex items-start justify-between"><div><div className="text-sm font-medium text-violet-200">TODAY’S SCREEN TIME</div><div className="mt-3 flex items-baseline gap-2"><span className="text-5xl font-bold tracking-tight">{formatTime(totalSeconds)}</span><span className="text-sm text-violet-200">/ {formatTime(dailyLimit * 60)}</span></div><div className="mt-2 text-sm text-violet-200">{remaining > 0 ? `${formatTime(remaining * 60)} left in your daily limit` : "Your daily limit has been reached"}</div></div><div className="rounded-2xl bg-white/10 p-3"><Smartphone size={23}/></div></div>
                <div className="mt-8"><div className="mb-2 flex justify-between text-xs text-violet-200"><span>Daily limit used</span><span>{Math.round(usagePercent)}%</span></div><div className="h-2.5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-emerald-300 transition-all" style={{ width: `${usagePercent}%` }}/></div></div>
                <div className="mt-7 flex flex-wrap items-center gap-3"><button onClick={() => setSection("Screen limits")} className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-violet-800 hover:bg-violet-50">Manage limits</button><button onClick={() => setSection("Reports")} className="rounded-xl border border-white/25 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10">View report</button></div>
              </div>
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between"><div><div className="text-sm font-semibold text-slate-800">Your daily goal</div><div className="mt-1 text-xs text-slate-400">Stay within your screen-time plan</div></div><div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600"><Target size={20}/></div></div>
                <div className="my-6 flex items-center justify-center"><div className="relative flex h-40 w-40 items-center justify-center rounded-full" style={{ background: `conic-gradient(#8b7cf6 ${usagePercent}%, #eeeefa 0)` }}><div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white"><span className="text-3xl font-bold text-slate-800">{Math.round(usagePercent)}%</span><span className="text-xs text-slate-400">used today</span></div></div></div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm"><span className="text-slate-500">Daily allowance</span><span className="font-semibold text-slate-800">{formatTime(dailyLimit * 60)}</span></div>
                <div className="mt-3 flex items-center justify-between text-sm"><span className="text-slate-500">Time remaining</span><span className="font-semibold text-emerald-600">{formatTime(remaining * 60)}</span></div>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">Daily screen time</span><Clock3 className="text-violet-500" size={19}/></div><div className="mt-3 text-2xl font-bold">{formatTime(totalSeconds)}</div><div className="mt-1 text-xs text-slate-400">Tracked in this demo session</div></div>
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">Break routine</span><Coffee className="text-orange-400" size={19}/></div><div className="mt-3 text-2xl font-bold">Every {breakAfter} min</div><div className="mt-1 text-xs text-slate-400">{breakLength} minute break planned</div></div>
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">Focus session</span><Zap className="text-emerald-500" size={19}/></div><div className="mt-3 text-2xl font-bold">{studyMinutes} minutes</div><div className="mt-1 text-xs text-slate-400">Your current study timer length</div></div>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-semibold text-slate-800">App categories</h2><p className="mt-1 text-xs text-slate-400">Your sample usage breakdown</p></div><button onClick={() => setSection("Screen limits")} className="text-xs font-semibold text-violet-600">Edit limits</button></div>
                <div className="space-y-5">{apps.map((app, i) => <div key={app.name}><div className="mb-2 flex items-center justify-between text-sm"><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-lg">{app.icon}</span><span className="font-medium text-slate-700">{app.name}</span></div><span className="text-slate-500">{app.used} / {app.limit} min</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${app.color}`} style={{ width: `${Math.min(app.used / app.limit * 100, 100)}%` }}/></div></div>)}</div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="font-semibold text-slate-800">Quick break</h2><p className="mt-1 text-xs text-slate-400">Give your mind a moment</p></div><div className="rounded-xl bg-orange-50 p-2.5 text-orange-500"><Coffee size={20}/></div></div><div className="my-6 text-center"><div className="text-5xl font-semibold tracking-tight text-slate-800">{formatClock(timerSeconds)}</div><div className="mt-2 text-xs text-slate-400">{breakRunning ? "Break time — relax for a moment" : timerRunning ? "Focus session in progress" : "Ready when you are"}</div></div><div className="flex gap-2"><button onClick={() => { setBreakRunning(false); setTimerRunning(!timerRunning); }} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white hover:bg-violet-700">{timerRunning ? <Pause size={16}/> : <Play size={16}/>} {timerRunning ? "Pause focus" : "Start focus"}</button><button onClick={() => { setTimerRunning(false); setBreakRunning(!breakRunning); setTimerSeconds(breakLength * 60); }} className="rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50">{breakRunning ? "Stop" : "Take break"}</button></div></div>
            </div>
          </>}

          {section === "Screen limits" && <div className="max-w-4xl"><PageHeading icon={<ShieldCheck/>} title="Screen time limits" subtitle="Set healthy boundaries that work for your routine."/><div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"><h2 className="font-semibold">Daily screen-time allowance</h2><p className="mt-1 text-sm text-slate-400">Choose how much recreational screen time you want to allow each day.</p><div className="mt-6 flex items-center justify-between"><span className="text-sm text-slate-500">Daily limit</span><span className="text-2xl font-bold text-violet-700">{formatTime(dailyLimit * 60)}</span></div><input aria-label="Daily screen time limit" type="range" min="30" max="480" step="15" value={dailyLimit} onChange={(e) => setDailyLimit(Number(e.target.value))} className="mt-4 w-full accent-violet-600"/><div className="mt-2 flex justify-between text-xs text-slate-400"><span>30 min</span><span>8 hours</span></div><div className="mt-6 rounded-xl bg-violet-50 p-4 text-sm text-violet-800">You have used {formatTime(totalSeconds)} today. {remaining > 0 ? `${formatTime(remaining * 60)} remaining.` : "Your selected limit has been reached."}</div></div>
            <div className="mt-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"><div className="mb-5"><h2 className="font-semibold">Category limits</h2><p className="mt-1 text-sm text-slate-400">Adjust the sample limits for each category.</p></div><div className="space-y-6">{apps.map((app, i) => <div key={app.name}><div className="mb-2 flex items-center justify-between"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-lg">{app.icon}</span><div><div className="text-sm font-semibold">{app.name}</div><div className="text-xs text-slate-400">Used {app.used} minutes</div></div></div><span className="text-sm font-semibold text-slate-700">{app.limit} min</span></div><input aria-label={`${app.name} limit`} type="range" min="15" max="240" step="5" value={app.limit} onChange={(e) => saveAppLimit(i, Number(e.target.value))} className="w-full accent-violet-600"/></div>)}</div></div></div>}

          {section === "Break schedule" && <div className="max-w-4xl"><PageHeading icon={<Coffee/>} title="Break schedule" subtitle="Plan short pauses to rest your eyes and reset your attention."/><div className="grid gap-5 md:grid-cols-2"><div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"><h2 className="font-semibold">Remind me to take a break</h2><p className="mt-1 text-sm text-slate-400">Choose how often you want a break reminder.</p><label className="mt-6 block text-sm text-slate-600">After every</label><select value={breakAfter} onChange={(e) => setBreakAfter(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-400">{[20,25,30,45,60,90].map(v => <option key={v} value={v}>{v} minutes</option>)}</select><label className="mt-5 block text-sm text-slate-600">Break duration</label><select value={breakLength} onChange={(e) => setBreakLength(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-400">{[3,5,10,15].map(v => <option key={v} value={v}>{v} minutes</option>)}</select><button onClick={() => showNotice("Your break schedule has been saved.")} className="mt-6 w-full rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white hover:bg-violet-700">Save schedule</button></div><div className="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 p-6"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-sm"><Coffee/></div><h2 className="mt-5 text-xl font-bold text-slate-800">A little pause goes a long way.</h2><p className="mt-2 text-sm leading-6 text-slate-600">Stand up, stretch gently, look away from your screen, or get a glass of water. Make your break a moment to recharge.</p><div className="mt-6 rounded-xl border border-orange-100 bg-white/70 p-4"><div className="text-xs font-semibold uppercase tracking-wider text-orange-600">Your current routine</div><div className="mt-2 text-2xl font-bold text-slate-800">{breakAfter} + {breakLength}</div><div className="text-xs text-slate-500">minutes of activity + break</div></div></div></div></div>}

          {section === "Study mode" && <div className="max-w-4xl"><PageHeading icon={<BookOpen/>} title="Study mode" subtitle="Set aside a little time for distraction-free work."/><div className="rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-600"><BookOpen size={28}/></div><h2 className="mt-5 text-xl font-bold">Your focus session</h2><p className="mt-2 text-sm text-slate-400">Choose a session length and start when you’re ready.</p><div className="mx-auto mt-7 flex max-w-xs items-center justify-center gap-3"><button onClick={() => { setStudyMinutes(Math.max(5, studyMinutes - 5)); setTimerSeconds(Math.max(5, studyMinutes - 5) * 60); }} className="h-10 w-10 rounded-full border border-slate-200 text-lg">−</button><div className="min-w-28"><div className="text-4xl font-bold text-slate-800">{studyMinutes}</div><div className="text-xs text-slate-400">minutes</div></div><button onClick={() => { setStudyMinutes(Math.min(90, studyMinutes + 5)); setTimerSeconds(Math.min(90, studyMinutes + 5) * 60); }} className="h-10 w-10 rounded-full border border-slate-200 text-lg">+</button></div><div className="my-8 text-6xl font-light tracking-tight text-violet-700">{formatClock(timerSeconds)}</div><div className="flex flex-wrap justify-center gap-3"><button onClick={() => { setBreakRunning(false); setTimerRunning(!timerRunning); }} className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white">{timerRunning ? <Pause size={17}/> : <Play size={17}/>} {timerRunning ? "Pause session" : "Start session"}</button><button onClick={() => { setTimerRunning(false); setBreakRunning(false); setTimerSeconds(studyMinutes * 60); }} className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600">Reset</button></div><p className="mt-5 text-xs text-slate-400">Tip: Keep only the materials you need nearby and silence non-essential notifications.</p></div></div>}

          {section === "Reports" && <div className="max-w-5xl"><PageHeading icon={<Activity/>} title="Usage reports" subtitle="A simple look at your screen-time habits."/><div className="grid gap-5 md:grid-cols-3"><StatCard title="Today's usage" value={formatTime(totalSeconds)} note="Current demo session" icon={<Clock3/>}/><StatCard title="Daily target" value={formatTime(dailyLimit * 60)} note="Your selected allowance" icon={<Target/>}/><StatCard title="Time remaining" value={formatTime(remaining * 60)} note="Until your daily limit" icon={<TrendingDown/>}/></div><div className="mt-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"><h2 className="font-semibold">Category usage</h2><p className="mt-1 text-sm text-slate-400">Sample category data for this frontend demo.</p><div className="mt-7 space-y-5">{apps.map(app => <div key={app.name}><div className="mb-2 flex justify-between text-sm"><span className="text-slate-600">{app.name}</span><span className="font-semibold">{app.used} min</span></div><div className="h-3 rounded-full bg-slate-100"><div className={`h-3 rounded-full ${app.color}`} style={{width: `${Math.min(app.used / Math.max(app.limit, 1) * 100,100)}%`}}/></div></div>)}</div><button onClick={resetDemo} className="mt-7 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Reset demo usage</button></div></div>}

          {section === "Settings" && <div className="max-w-3xl"><PageHeading icon={<Settings/>} title="Settings" subtitle="Manage your demo preferences."/><div className="divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white px-6 shadow-sm"><div className="flex items-center justify-between py-5"><div><div className="text-sm font-semibold">Daily reminder</div><div className="mt-1 text-xs text-slate-400">Show a reminder to review your screen time.</div></div><button onClick={() => showNotice("Reminder preference updated (demo).")} className="rounded-full bg-violet-100 px-4 py-2 text-xs font-semibold text-violet-700">Enabled</button></div><div className="flex items-center justify-between py-5"><div><div className="text-sm font-semibold">Save settings on this device</div><div className="mt-1 text-xs text-slate-400">Your demo preferences are stored in this browser.</div></div><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"><Check size={13} className="mr-1 inline"/> Active</span></div><div className="flex items-center justify-between py-5"><div><div className="text-sm font-semibold">Reset demo data</div><div className="mt-1 text-xs text-slate-400">Restore sample usage and app categories.</div></div><button onClick={() => { setDailyLimit(180); setBreakAfter(30); setBreakLength(5); setStudyMinutes(25); setApps(initialApps); setTotalSeconds(94 * 60); showNotice("Demo settings restored."); }} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Reset</button></div></div><div className="mt-5 rounded-2xl bg-amber-50 p-5 text-sm leading-6 text-amber-900"><strong>Prototype note:</strong> This frontend can save settings and run timers while the website is open. It cannot read or block usage in other phone apps. That needs a native mobile app and operating-system permissions.</div></div>}
          <footer className="mt-12 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">Nexus Digital Wellness · Frontend prototype · Your progress, your pace.</footer>
        </div>
      </section>
    </main>
  );
}

function PageHeading({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return <div className="mb-7 flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">{icon}</div><div><h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div></div>;
}
function StatCard({ title, value, note, icon }: { title: string; value: string; note: string; icon: React.ReactNode }) {
  return <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between text-sm text-slate-500"><span>{title}</span><span className="text-violet-500">{icon}</span></div><div className="mt-3 text-2xl font-bold text-slate-800">{value}</div><div className="mt-1 text-xs text-slate-400">{note}</div></div>;
}
