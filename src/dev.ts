// Тестовые данные для `npm run dev` в обычном браузере (без Telegram).
// В production-сборку не попадают — используются только при import.meta.env.DEV.
import type { Bootstrap, ImpactEvent, SpotFull, SpotPoint, WrappedData } from "./types";

const d = (days: number, h = 10) => {
  const x = new Date();
  x.setDate(x.getDate() + days);
  x.setHours(h, 0, 0, 0);
  return x.toISOString();
};

export const DEV_DATA: Bootstrap = {
  bot_username: "yashilqollarbot",
  community: { volunteers: 1234, events: 48, checkins: 2310, regions: 14, kg: 12480, trees: 830 },
  impact: { kg: 34.6, bags: 3.2, trees: 5, events: 6, photos: [1, 2, 3, 4, 5, 6].map((i) => ({ url: `https://picsum.photos/seed/yq${i}/400/400`, event: 10, title: "Subbotnik — Chilonzor", date: d(-12) })) },
  wrapped: { year: 2026, image: "/logo.jpg", preview: true },
  spots: { open: 7, cleaned: 4, mine: 2 },
  user: {
    id: 1, tg_id: 1, username: "salokhiddin", fullname: "Salokhiddin Usmonov", photo: null,
    email: "usmonovsalokhiddin11@gmail.com", phone: "+998901234567", age: 20, education_place: "TDIU", experience: null,
    has_password: false, auth_provider: "telegram", role: "Founder", role_label: "Asoschi",
    is_staff: true, is_admin: true, balance: 120, rank: "🌱 Nihol", rank_next_at: 150,
    region: "tashkent_s", region_label: "Toshkent shahri", attended_count: 12, lang: "uz",
  },
  events: [
    { id: 1, title: "Plogging — Ankhor kanali", description: "Yugurib, chiqindi yig'amiz. Qo'lqop va paketlar beriladi.", date: d(1, 9), location: "Ankhor", region: "tashkent_s", region_label: "Toshkent shahri", photo: null, registered: 42, attended: 0, max: 60, my_status: "approved", chat_link: "https://t.me/+example" },
    { id: 2, title: "Daraxt ekish — Yunusobod", description: "Bahorgi ko'chat ekish aksiyasi.", date: d(4, 10), location: "Yunusobod bog'i", region: "tashkent_s", region_label: "Toshkent shahri", photo: null, registered: 95, attended: 0, max: 100, my_status: null, chat_link: null },
    { id: 3, title: "Eko-seminar: chiqindilarni saralash", description: "", date: d(9, 15), location: "TDIU", region: "tashkent_s", region_label: "Toshkent shahri", photo: null, registered: 12, attended: 0, max: 80, my_status: null, chat_link: null },
  ],
  history: [
    { id: 10, title: "Subbotnik — Chilonzor", date: d(-12), has_impact: true },
    { id: 11, title: "Plogging — Magic City", date: d(-30) },
    { id: 12, title: "Daraxt ekish — Sergeli", date: d(-45) },
    { id: 13, title: "Eko-seminar TDIU", date: d(-60) },
  ],
  regions: [["tashkent_s", "Toshkent shahri"], ["tashkent_v", "Toshkent viloyati"], ["samarkand", "Samarqand viloyati"], ["bukhara", "Buxoro viloyati"]],
};

export const DEV_IMPACT: ImpactEvent = {
  id: 10, title: "Subbotnik — Chilonzor", date: d(-12), region_label: "Toshkent shahri", kg: 120.5, bags: 14, trees: 0, attended: 4,
  photos: [1, 2, 3, 4, 5].map((i) => `https://picsum.photos/seed/yq${i}/900/900`), mine: { kg: 30.1, bags: 3.5, trees: 0 },
};

export const DEV_WRAPPED: WrappedData = {
  year: 2026, name: "Salokhiddin Usmonov", events: 12, titles: ["Plogging — Magic City", "Daraxt ekish — Sergeli", "Eko-seminar TDIU", "Subbotnik — Chilonzor"],
  first: { title: "Eko-seminar TDIU", date: "2026-02-14" }, months: [2, 3, 4, 5, 9, 10, 11], streak: 4, season: "kuz",
  share: { kg: 34.6, bags: 3.2, trees: 5, events: 6 }, place: 7, top_pct: 4, region_total: 180, region_label: "Toshkent shahri",
  community: { volunteers: 1284, checkins: 5210, events: 96, kg: 12480.5, trees: 830 }, image: "/logo.jpg", preview: true,
};

const P = [[41.33, 69.28, "accepted"], [41.29, 69.21, "cleaned"], [41.36, 69.34, "planned"], [40.12, 67.84, "accepted"], [39.65, 66.96, "cleaned"],
  [40.10, 65.37, "accepted"], [41.00, 71.67, "planned"], [40.78, 72.34, "cleaned"], [39.77, 64.42, "accepted"], [41.55, 60.63, "cleaned"], [41.31, 69.25, "new"]] as const;
export const DEV_SPOTS: SpotPoint[] = P.map(([lat, lon, status], i) => ({
  id: i + 1, lat, lon, status, region: "tashkent_s", region_label: "Toshkent shahri", size: (["small", "medium", "large"] as const)[i % 3],
  kind: (["household", "plastic", "construction", "mixed"] as const)[i % 4], created: Date.now() / 1000 - i * 86400 * 3, confirms: i % 3,
  photo: `https://picsum.photos/seed/sp${i}/300/300`, mine: i === 1 || i === 10,
}));
export const devSpot = (id: number): SpotFull => {
  const s = DEV_SPOTS[id - 1];
  return {
    ...s, photos: [1, 2, 3].map((k) => `https://picsum.photos/seed/sp${id}${k}/800/600`), after: s.status === "cleaned" ? [`https://picsum.photos/seed/clean${id}/800/600`] : [],
    access: "easy", note: "Bozor orqasida, ariq bo'yida", address: "Yunusobod tumani, Qashqar mahalla", maps: { google: "https://maps.google.com", yandex: "" }, updated: s.created,
    event: s.status === "planned" ? { id: 5, title: "Tozalash: Qashqar mahalla", date: d(5), active: false } : null,
  };
};
