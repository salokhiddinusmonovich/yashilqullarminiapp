// Форматы ответов API/webapp.py

export type Lang = "uz" | "ru" | "en";

export interface User {
  id: number;
  tg_id: number | null;
  username: string | null;
  fullname: string;
  email: string | null;
  phone: string | null;
  age: number | null;
  education_place: string | null;
  experience: string | null;
  has_password: boolean;
  auth_provider: "telegram" | "email" | "google";
  photo: string | null;
  role: string;
  role_label: string;
  is_staff: boolean;
  is_admin: boolean;
  balance: number;
  rank: string;
  rank_next_at: number | null;
  region: string | null;
  region_label: string | null;
  attended_count: number;
  lang: Lang;
}

export interface EventItem {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  region: string;
  region_label: string;
  photo: string | null;
  registered: number | null;
  attended: number | null;
  max: number;
  my_status: "approved" | "attended" | "pending" | null;
  chat_link: string | null;
  waitlist?: number;          // ⏳ сколько в очереди
  my_wait?: number | null;    // моё место в очереди
}

export interface Community {
  volunteers: number;
  events: number;
  checkins: number;
  regions: number;
  kg?: number;        // 📊 итоги мероприятий (вводят координаторы)
  bags?: number;
  trees?: number;
  photos?: number;
}

export type SpotStatus = "new" | "accepted" | "planned" | "cleaned" | "rejected" | "duplicate";

/** 📍 Точка эко-карты (сообщение «Iflos joy»). */
export interface SpotPoint {
  id: number; lat: number; lon: number; status: SpotStatus; region: string | null; region_label: string;
  size: "small" | "medium" | "large"; kind: "household" | "plastic" | "construction" | "mixed";
  created: number; confirms: number; photo: string | null; mine: boolean;
}

export interface SpotFull extends SpotPoint {
  photos: string[]; after: string[]; access: "easy" | "hard" | "unknown"; note: string; address: string;
  maps: { google: string; yandex: string }; updated: number;
  event: { id: number; title: string; date: string; active: boolean } | null;
}

export interface ImpactPhoto { url: string; event: number; title: string; date: string }

/** «Mening hissam» — моя доля в итогах мероприятий, где я был. */
export interface MyImpact { kg: number; bags: number; trees: number; events: number; photos: ImpactPhoto[] }

export interface ImpactEvent {
  id: number; title: string; date: string; region_label: string;
  kg: number; bags: number; trees: number; attended: number; photos: string[];
  mine: { kg: number; bags: number; trees: number } | null;
}

export interface WrappedData {
  year: number; name: string; events: number; titles: string[];
  first: { title: string; date: string } | null;
  months: number[]; streak: number; season: "kuz" | "qish" | "bahor" | "yoz" | null;
  share: { kg: number; bags: number; trees: number; events: number };
  place: number | null; top_pct: number | null; region_total: number | null; region_label: string | null;
  community: { volunteers: number; checkins: number; events: number; kg: number; trees: number };
  image: string; preview: boolean;
}

export interface Bootstrap {
  user: User;
  events: EventItem[];
  history: { id: number; title: string; date: string; has_impact?: boolean; cert?: { pid: number; number: string; pdf: string; jpg: string } }[];
  bot_username: string;
  impact?: MyImpact;
  wrapped?: { year: number; image: string; preview: boolean } | null;
  spots?: { open: number; cleaned: number; mine: number };
  cv_url?: string;
  referral?: { link: string; invited: number; joined: number; bonus: number } | null;
  community?: Community;
  regions: [string, string][];
}

export type ProfilePatch = Partial<Pick<User, "fullname" | "region" | "phone" | "email" | "age" | "education_place" | "experience">>;

export interface Person {
  id: number;
  fullname: string;
  username?: string | null;
  photo: string | null;
  balance?: number;
}

export interface PublicUser {
  id: number;
  fullname: string;
  photo: string | null;
  role: string;
  role_label: string;
  balance: number;
  rank: string;
  rank_next_at: number | null;
  region: string | null;
  region_label: string | null;
  attended_count: number;
  is_staff: boolean;
  history: { id: number; title: string; date: string; cert?: { pid: number; number: string; pdf: string; jpg: string } }[];
}

export interface TeamMember {
  id: number;
  fullname: string;
  photo: string | null;
  role: string;
  role_label: string;
  balance: number;
}

export interface Top {
  top: (Person & { balance: number; me: boolean; role?: string })[];
  my_place: number;
  my_balance: number;
}

export interface StaffEvents {
  events: EventItem[];
  default: number | null;
  admin?: boolean;   // 👑 все регионы и прошедшие 60 дней
}

export interface CheckInResult {
  result: "ok" | "already" | "not_found" | "bad_qr" | "no_event" | "other_region" | "confirm_region";
  person_region?: string;
  event_region?: string;
  event_title?: string;
  auto_added?: boolean;
  person?: Person;
  counts?: { registered: number; attended: number };
}

export interface ShopState { counts: Record<string, number>; mine: string[] }

export interface RegionRow { key: string; label: string; month: number; total: number; volunteers: number }
