// Тестовые данные для `npm run dev` в обычном браузере (без Telegram).
// В production-сборку не попадают — используются только при import.meta.env.DEV.
import type { Bootstrap } from "./types";

const d = (days: number, h = 10) => {
  const x = new Date();
  x.setDate(x.getDate() + days);
  x.setHours(h, 0, 0, 0);
  return x.toISOString();
};

export const DEV_DATA: Bootstrap = {
  bot_username: "yashilqollarbot",
  user: {
    id: 1, tg_id: 1, fullname: "Salokhiddin Usmonov", photo: null, role: "coordinator", role_label: "Koordinator",
    is_staff: true, is_admin: true, balance: 120, rank: "🌱 Nihol", rank_next_at: 150,
    region: "tashkent_s", region_label: "Toshkent shahri", attended_count: 12, lang: "uz",
  },
  events: [
    { id: 1, title: "Plogging — Ankhor kanali", description: "Yugurib, chiqindi yig'amiz. Qo'lqop va paketlar beriladi.", date: d(1, 9), location: "Ankhor", region: "tashkent_s", region_label: "Toshkent shahri", photo: null, registered: 42, attended: 0, max: 60, my_status: "approved", chat_link: "https://t.me/+example" },
    { id: 2, title: "Daraxt ekish — Yunusobod", description: "Bahorgi ko'chat ekish aksiyasi.", date: d(4, 10), location: "Yunusobod bog'i", region: "tashkent_s", region_label: "Toshkent shahri", photo: null, registered: 95, attended: 0, max: 100, my_status: null, chat_link: null },
    { id: 3, title: "Eko-seminar: chiqindilarni saralash", description: "", date: d(9, 15), location: "TDIU", region: "tashkent_s", region_label: "Toshkent shahri", photo: null, registered: 12, attended: 0, max: 80, my_status: null, chat_link: null },
  ],
  history: [
    { id: 10, title: "Subbotnik — Chilonzor", date: d(-12) },
    { id: 11, title: "Plogging — Magic City", date: d(-30) },
  ],
};
