// Версия Mini App и история обновлений. Новая версия → добавить запись сверху
// и поднять APP_VERSION: у всех один раз откроется окно «Что нового».
import type { Lang } from "./types";

export const APP_VERSION = "1.1.0";

interface Release { v: string; date: Record<Lang, string>; items: Record<Lang, string[]> }

export const CHANGELOG: Release[] = [
  {
    v: "1.1",
    date: { uz: "27-sentabr, 2026", ru: "27 сентября 2026", en: "27 September 2026" },
    items: {
      uz: ["🛍 Eko-do'kon (beta): sovg'alar, narxlar va «Xohlayman» tugmasi", "📍 Skaner endi faqat o'z hududingiz tadbirlarini ko'rsatadi", "✨ Versiyalar va «Yangiliklar» oynasi"],
      ru: ["🛍 Эко-магазин (бета): подарки, цены и кнопка «Хочу»", "📍 Сканер показывает только мероприятия вашего региона", "✨ Версии и окно «Что нового»"],
      en: ["🛍 Eco shop (beta): gifts, prices and an «I want it» button", "📍 The scanner now shows only your region's events", "✨ Versions and a «What's new» window"],
    },
  },
  {
    v: "1.0",
    date: { uz: "Sentabr, 2026", ru: "Сентябрь 2026", en: "September 2026" },
    items: {
      uz: ["🪪 Volontyor pasporti: ballar va daraja", "🎟 Tadbirlarga bir bosishda yozilish", "📱 Shaxsiy QR-kod — internetsiz ham", "🏅 Muhrlar va nishonlar", "🏆 Reyting va hudud jamoasi", "📷 Koordinatorlar uchun skaner", "✏️ Profilni tahrirlash"],
      ru: ["🪪 Паспорт волонтёра: баллы и уровень", "🎟 Запись на мероприятия в одно касание", "📱 Личный QR-код — даже без интернета", "🏅 Печати и нашивки", "🏆 Рейтинг и команда региона", "📷 Сканер для координаторов", "✏️ Редактирование профиля"],
      en: ["🪪 Volunteer passport: points and level", "🎟 One-tap event sign-up", "📱 Personal QR code — works offline", "🏅 Stamps and badges", "🏆 Leaderboard and regional team", "📷 Scanner for coordinators", "✏️ Profile editing"],
    },
  },
];

const SEEN_KEY = "yq_seen_version";
export function shouldShowWhatsNew(): boolean {
  try { return localStorage.getItem(SEEN_KEY) !== APP_VERSION; } catch { return false; }
}
export function markWhatsNewSeen() {
  try { localStorage.setItem(SEEN_KEY, APP_VERSION); } catch { /* */ }
}
