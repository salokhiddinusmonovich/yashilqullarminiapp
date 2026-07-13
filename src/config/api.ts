// src/config/api.ts
// Тот же самый бэкенд, что у основного сайта — API не дублируем.
export const API_BASE = import.meta.env.VITE_API_BASE?.replace(/\/$/, "") || "https://api.yashilqollar.uz";

export const ENDPOINTS = {
    loginTelegramWebApp: `${API_BASE}/login/telegram-webapp/`,
    me: `${API_BASE}/me/`,
    projects: `${API_BASE}/projects/`,
    projectJoin: (id: number | string) => `${API_BASE}/projects/${id}/join/`,
} as const;

export function authHeaders(token: string | null) {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
}

export function fixMediaUrl(path: string | null): string | null {
    if (!path) return null;
    let url = path.startsWith("http") ? path : `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
    return url.replace(/^http:\/\//, "https://");
}