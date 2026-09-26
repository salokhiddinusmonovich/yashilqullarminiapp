// Эффекты: конфетти, «набегающие» числа, живой таймер, достижения.
import { useEffect, useRef, useState } from "preact/hooks";
import type { Bootstrap } from "./types";
import type { Key } from "./i18n";

const COLORS = ["#6cc48a", "#f0b84a", "#e0764a", "#6fa9c7", "#d27496", "#efe7d6"];

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

/** «Чернила» мероприятия — стабильные по id, землистые цвета вместо неона. */
export const INKS = ["#3f9d63", "#e0a030", "#d4623a", "#3f86a8", "#b34a6c", "#7f9a35"];
export const eventColors = (id: number): [string, string] => {
  const c = INKS[id % INKS.length];
  return [c, c];
};
export const eventStyle = (id: number) => ({ "--ink-c": INKS[id % INKS.length] } as Record<string, string>);

/** Небольшой «ручной» наклон — печати и нашивки лежат не идеально ровно. */
export const tilt = (seed: number, max = 7) => `${((seed * 37) % (max * 2 + 1)) - max}deg`;

export interface Badge { id: string; icon: string; name: Key; desc: Key; done: boolean; progress?: [number, number] }

export interface BadgeInput { attended: number; balance: number; staff: boolean; planned?: boolean }

export function badgesFrom({ attended: a, balance: p, staff, planned }: BadgeInput): Badge[] {
  const mk = (id: string, icon: string, need: number, have: number): Badge => ({
    id, icon, name: `b_${id}` as Key, desc: `b_${id}_d` as Key, done: have >= need, progress: [Math.min(have, need), need],
  });
  const list: Badge[] = [
    mk("first", "🌱", 1, a),
    mk("five", "🔥", 5, a),
    mk("ten", "🌳", 10, a),
    mk("legend", "🏆", 25, a),
    mk("tree", "🍃", 150, p),
    mk("guard", "🛡", 300, p),
  ];
  // «Планировщик» знаем только про себя (чужие записи не показываем)
  if (planned !== undefined) list.push({ id: "plan", icon: "📅", name: "b_plan", desc: "b_plan_d", done: planned });
  list.push({ id: "team", icon: "🧭", name: "b_team", desc: "b_team_d", done: staff });
  return list;
}

export function badgesFor(d: Bootstrap): Badge[] {
  return badgesFrom({
    attended: d.user.attended_count,
    balance: d.user.balance,
    staff: d.user.is_staff,
    planned: d.events.some((e) => e.my_status === "approved"),
  });
}

export const isFounder = (role?: string | null) => role === "Founder";

/** Ташкент-город и область — один регион (как на сервере, services.region_group). */
export function sameRegion(userRegion: string | null, eventRegion: string) {
  const tash = ["tashkent_s", "tashkent_v"];
  if (!userRegion) return false;
  if (tash.includes(userRegion)) return tash.includes(eventRegion);
  return userRegion === eventRegion;
}
