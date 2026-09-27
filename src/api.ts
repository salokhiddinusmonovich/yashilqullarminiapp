// API-клиент Mini App. Бэкенд — тот же Django, что у бота (API/webapp.py).
import { tg } from "./tg";
import type { Bootstrap, CheckInResult, EventItem, ImpactEvent, SpotFull, SpotPoint, StaffEvents, Top, Person, ProfilePatch, PublicUser, RegionRow, ShopState, TeamMember, WrappedData } from "./types";

export const API_BASE = (import.meta.env.VITE_API_BASE || "https://api.yashilqollar.uz").replace(/\/$/, "");

const CACHE_KEY = "yq_boot_v1";
let access: string | null = null;

/** Последние данные — чтобы при повторном открытии экран появлялся сразу, до ответа сервера. */
export function cachedBootstrap(): Bootstrap | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Bootstrap) : null;
  } catch {
    return null;
  }
}

function remember(data: Bootstrap) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch { /* приватный режим */ }
}

export type LoginResult =
  | { kind: "ok"; data: Bootstrap }
  | { kind: "unregistered"; bot: string }
  | { kind: "error" };

/** Вход по initData — сервер сразу отдаёт и токен, и все данные главного экрана. */
export async function login(): Promise<LoginResult> {
  if (!tg) return { kind: "error" };
  try {
    const res = await fetch(`${API_BASE}/login/telegram-webapp/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ init_data: tg.initData }),
    });
    if (!res.ok) return { kind: "error" };
    const body = await res.json();
    if (!body.registered) return { kind: "unregistered", bot: body.bot_username };
    access = body.access;
    remember(body.data);
    return { kind: "ok", data: body.data };
  } catch {
    return { kind: "error" };
  }
}

async function request<T>(path: string, init: RequestInit = {}, retried = false): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init.body && !(init.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      ...(access ? { Authorization: `Bearer ${access}` } : {}),
      ...init.headers,
    },
  });
  // токен живёт час — если приложение долго было открыто, тихо перелогиниваемся
  if (res.status === 401 && !retried && (await login()).kind === "ok") {
    return request<T>(path, init, true);
  }
  if (!res.ok) {
    const err = new Error(String(res.status)) as Error & { body?: unknown };
    try { err.body = await res.json(); } catch { /* */ }
    throw err;
  }
  return (res.headers.get("content-type") || "").includes("json") ? res.json() : (res.text() as Promise<T>);
}

const post = <T>(path: string, body: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body) });

export const api = {
  async bootstrap() {
    const data = await request<Bootstrap>("/webapp/bootstrap/");
    remember(data);
    return data;
  },
  async saveProfile(patch: ProfilePatch) {
    const data = await request<Bootstrap>("/webapp/me/", { method: "PATCH", body: JSON.stringify(patch) });
    remember(data);
    return data;
  },
  async uploadPhoto(file: File) {
    const fd = new FormData();
    fd.append("photo", file);
    const data = await request<Bootstrap>("/webapp/me/photo/", { method: "POST", body: fd });
    remember(data);
    return data;
  },
  async setPassword(password: string) {
    const data = await post<Bootstrap>("/webapp/me/password/", { password });
    remember(data);
    return data;
  },
  allEvents: () => request<{ events: EventItem[] }>("/webapp/events/"),
  join: (id: number) =>
    post<{ result: "ok" | "already" | "gone" | "full" | "region" | "subscribe"; event?: EventItem; channel?: string }>(
      `/webapp/events/${id}/join/`, {},
    ),
  wait: (id: number, leave = false) =>
    post<{ result: "waiting" | "left" | "gone" | "region" | "already"; event?: EventItem }>(`/webapp/events/${id}/wait/`, leave ? { leave: true } : {}),
  async setLang(lang: string) {
    const data = await post<Bootstrap>("/webapp/lang/", { lang });
    remember(data);
    return data;
  },
  qrSvg: () => request<string>("/webapp/qr.svg"),
  top: () => request<Top>("/webapp/top/"),
  team: () => request<{ team: TeamMember[] }>("/webapp/team/"),
  user: (id: number) => request<PublicUser>(`/webapp/users/${id}/`),
  staffEvents: () => request<StaffEvents>("/webapp/staff/events/"),
  undo: (projectId: number, userId: number, autoAdded: boolean) =>
    post<{ result: "undone" | "nothing"; counts?: { registered: number; attended: number } }>("/webapp/staff/undo/", { project_id: projectId, user_id: userId, auto_added: autoAdded }),
  checkIn: (projectId: number, payload: { qr?: string; user_id?: number; force?: boolean }) =>
    post<CheckInResult>("/webapp/staff/checkin/", { project_id: projectId, ...payload }),
  regions: () => request<{ regions: RegionRow[]; mine: string | null }>("/webapp/regions/"),
  certSend: (pid: number) => post<{ result: string }>(`/webapp/certificates/${pid}/send/`, {}),
  shop: () => request<ShopState>("/webapp/shop/"),
  wish: (item: string) => post<ShopState>("/webapp/shop/", { item }),
  impact: (id: number) => (import.meta.env.DEV && !tg ? import("./dev").then((m) => m.DEV_IMPACT) : request<ImpactEvent>(`/webapp/impact/${id}/`)),
  wrapped: () => (import.meta.env.DEV && !tg ? import("./dev").then((m) => m.DEV_WRAPPED) : request<WrappedData>("/webapp/wrapped/")),
  spots: () => (import.meta.env.DEV && !tg ? import("./dev").then((m) => ({ spots: m.DEV_SPOTS })) : request<{ spots: SpotPoint[] }>("/webapp/spots/")),
  spot: (id: number) => (import.meta.env.DEV && !tg ? import("./dev").then((m) => m.devSpot(id)) : request<SpotFull>(`/webapp/spots/${id}/`)),
  search: (q: string) => request<{ results: Person[] }>(`/webapp/staff/search/?q=${encodeURIComponent(q)}`),
};
