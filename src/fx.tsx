// Эффекты: конфетти, «набегающие» числа, живой таймер, достижения.
import { useEffect, useRef, useState } from "preact/hooks";
import type { Bootstrap } from "./types";
import type { Key } from "./i18n";

const COLORS = ["#22c55e", "#4ade80", "#06b6d4", "#a78bfa", "#f59e0b", "#f472b6", "#facc15"];

/** Лёгкое конфетти на CSS — без библиотек, ~40 частиц, удаляется само. */
export function confetti() {
  const box = document.createElement("div");
  box.className = "confetti";
  for (let i = 0; i < 44; i++) {
    const p = document.createElement("i");
    p.style.left = `${Math.random() * 100}%`;
    p.style.background = COLORS[i % COLORS.length];
    p.style.animationDelay = `${Math.random() * 0.25}s`;
    p.style.animationDuration = `${1.1 + Math.random() * 0.9}s`;
    p.style.setProperty("--dx", `${(Math.random() - 0.5) * 160}px`);
    p.style.setProperty("--rot", `${Math.random() * 720}deg`);
    box.appendChild(p);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 2200);
}

/** Число плавно «набегает» от 0 до value. */
export function useCountUp(value: number, ms = 900) {
  const [n, setN] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - k, 3);
      setN(Math.round(a + (value - a) * eased));
      if (k < 1) raf = requestAnimationFrame(step);
      else from.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return n;
}

/** Обратный отсчёт до даты; null — уже началось. */
export function useCountdown(iso: string) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = new Date(iso).getTime() - now;
  if (diff <= 0) return null;
  const s = Math.floor(diff / 1000);
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

/** Цвет мероприятия — стабильный по id, чтобы лента не была однотонной. */
const HUES: [string, string][] = [
  ["#10b981", "#047857"], ["#06b6d4", "#0e7490"], ["#8b5cf6", "#5b21b6"],
  ["#f59e0b", "#b45309"], ["#ec4899", "#9d174d"], ["#22c55e", "#15803d"],
];
export const eventColors = (id: number) => HUES[id % HUES.length];
export const eventStyle = (id: number) => {
  const [a, b] = eventColors(id);
  return { "--c1": a, "--c2": b } as Record<string, string>;
};

export interface Badge { id: string; icon: string; name: Key; desc: Key; done: boolean; progress?: [number, number] }

export function badgesFor(d: Bootstrap): Badge[] {
  const a = d.user.attended_count;
  const p = d.user.balance;
  const planned = d.events.some((e) => e.my_status === "approved");
  const mk = (id: string, icon: string, need: number, have: number): Badge => ({
    id, icon, name: `b_${id}` as Key, desc: `b_${id}_d` as Key, done: have >= need, progress: [Math.min(have, need), need],
  });
  return [
    mk("first", "🌱", 1, a),
    mk("five", "🔥", 5, a),
    mk("ten", "🌳", 10, a),
    mk("legend", "🏆", 25, a),
    mk("tree", "🍃", 150, p),
    mk("guard", "🛡", 300, p),
    { id: "plan", icon: "📅", name: "b_plan", desc: "b_plan_d", done: planned },
    { id: "team", icon: "🧭", name: "b_team", desc: "b_team_d", done: d.user.is_staff },
  ];
}
