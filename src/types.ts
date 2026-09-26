// Форматы ответов API/webapp.py

export type Lang = "uz" | "ru" | "en";

export interface User {
  id: number;
  tg_id: number | null;
  fullname: string;
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
}

export interface Bootstrap {
  user: User;
  events: EventItem[];
  history: { id: number; title: string; date: string }[];
  bot_username: string;
}

export interface Person {
  id: number;
  fullname: string;
  username?: string | null;
  photo: string | null;
  balance?: number;
}

export interface Top {
  top: (Person & { balance: number; me: boolean })[];
  my_place: number;
  my_balance: number;
}

export interface StaffEvents {
  events: EventItem[];
  default: number | null;
}

export interface CheckInResult {
  result: "ok" | "already" | "not_found" | "bad_qr" | "no_event";
  auto_added?: boolean;
  person?: Person;
  counts?: { registered: number; attended: number };
}
