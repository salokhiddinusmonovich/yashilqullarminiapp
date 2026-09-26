// Переводы Mini App. Язык — тот же, что выбран в боте (приходит с сервера).
import type { Lang } from "./types";

const uz = {
  tabHome: "Asosiy", tabEvents: "Tadbirlar", tabQr: "QR", tabScan: "Skaner", tabTop: "Reyting", tabProfile: "Profil",
  hello: "Salom", points: "eko-ball", rankLeft: "{n} ball qoldi", rankMax: "Eng yuqori daraja 🎉",
  attendedN: "{n} ta tadbirda qatnashgan",
  nextEvent: "Keyingi tadbiringiz", showQr: "QR-kodni ko'rsatish", joinGroup: "Guruhga qo'shilish",
  noNext: "Siz hali hech qaysi tadbirga yozilmagansiz", noNextHint: "Quyidagi tadbirlardan birini tanlang 👇",
  upcoming: "Kelgusi tadbirlar", seeAll: "Barchasi",
  noEvents: "Hududingizda hozircha tadbirlar yo'q", noEventsHint: "Tez orada e'lon qilinadi — kuzatib boring 🌱",
  noRegion: "Hududingiz tanlanmagan — botda «👤 Mening profilim → 📍 Hududni o'zgartirish».",
  today: "Bugun", tomorrow: "Ertaga", inDays: "{n} kundan keyin",
  spots: "{n}/{max} joy", spotsLeft: "{n} joy qoldi", full: "Joylar tugadi",
  registered: "Yozilgansiz", attended: "Qatnashgansiz",
  register: "Yozilish", registering: "Yozilmoqda…",
  joinedOk: "Yozildingiz! 🎉", joinedHint: "Tadbir kuni QR-kodingizni koordinatorga ko'rsating.",
  subscribeFirst: "Avval kanalimizga a'zo bo'ling", openChannel: "Kanalni ochish",
  gone: "Bu tadbir endi mavjud emas", fullErr: "Afsuski, joylar tugadi",
  certHint: "🎓 Sertifikatlar tadbirdan keyin guruhga tashlanadi.",
  qrTitle: "Sizning eko-kodingiz", qrHint: "Tadbirda koordinatorga ko'rsating",
  qrTip: "Ekran yorqinligini oshiring — tezroq skaner qilinadi",
  topTitle: "Eng faol volontyorlar", myPlace: "Sizning o'rningiz", you: "Siz",
  profileStats: "Statistika", history: "Qatnashgan tadbirlar", noHistory: "Hali tadbirlarda qatnashmadingiz 🌿",
  language: "Til", openBot: "Botni ochish", region: "Hudud", role: "Rol",
  scanTitle: "Skaner", pickEvent: "Tadbirni tanlang", scanBtn: "Skanerlash", continuous: "Uzluksiz rejim",
  scanPopup: "Volontyorning QR-kodini skaner qiling",
  cameFrom: "keldi", of: "dan",
  scanOk: "+10 ball berildi", scanAdded: "Yozilmagan edi — avtomatik qo'shildi",
  scanAlready: "Allaqachon belgilangan", scanNotFound: "Foydalanuvchi topilmadi", scanBadQr: "Bu Yashil Qo'llar QR-kodi emas",
  searchPh: "Ism, @username yoki telefon", mark: "Belgilash",
  noStaffEvents: "Yaqin kunlarda tadbirlar yo'q", scanUnsupported: "Telegram'ni yangilang — skaner ishlashi uchun",
  unregTitle: "Avval botda ro'yxatdan o'ting", unregText: "Ro'yxatdan o'tish bir daqiqa oladi. Keyin ilovaga qayting.",
  errTitle: "Ulanib bo'lmadi", errText: "Internetni tekshirib, qayta urinib ko'ring.", retry: "Qayta urinish",
  onlyTelegram: "Bu ilova Telegram ichida ochiladi.",
  close: "Yopish",
};

type Dict = typeof uz;

const ru: Dict = {
  tabHome: "Главная", tabEvents: "События", tabQr: "QR", tabScan: "Сканер", tabTop: "Рейтинг", tabProfile: "Профиль",
  hello: "Привет", points: "эко-баллов", rankLeft: "ещё {n} баллов", rankMax: "Высший уровень 🎉",
  attendedN: "Участвовал в {n} мероприятиях",
  nextEvent: "Ваше ближайшее мероприятие", showQr: "Показать QR-код", joinGroup: "Вступить в группу",
  noNext: "Вы пока не записаны ни на одно мероприятие", noNextHint: "Выберите мероприятие ниже 👇",
  upcoming: "Ближайшие мероприятия", seeAll: "Все",
  noEvents: "В вашем регионе пока нет мероприятий", noEventsHint: "Скоро объявим — следите 🌱",
  noRegion: "Регион не выбран — в боте «👤 Мой профиль → 📍 Изменить регион».",
  today: "Сегодня", tomorrow: "Завтра", inDays: "через {n} дн.",
  spots: "{n}/{max} мест", spotsLeft: "осталось {n} мест", full: "Мест нет",
  registered: "Вы записаны", attended: "Вы участвовали",
  register: "Записаться", registering: "Записываем…",
  joinedOk: "Вы записаны! 🎉", joinedHint: "В день мероприятия покажите QR-код координатору.",
  subscribeFirst: "Сначала подпишитесь на наш канал", openChannel: "Открыть канал",
  gone: "Мероприятие больше недоступно", fullErr: "К сожалению, мест нет",
  certHint: "🎓 Сертификаты публикуем в группе после мероприятия.",
  qrTitle: "Ваш эко-код", qrHint: "Покажите координатору на мероприятии",
  qrTip: "Прибавьте яркость экрана — отсканируют быстрее",
  topTitle: "Самые активные волонтёры", myPlace: "Ваше место", you: "Вы",
  profileStats: "Статистика", history: "Где вы участвовали", noHistory: "Вы ещё не участвовали в мероприятиях 🌿",
  language: "Язык", openBot: "Открыть бота", region: "Регион", role: "Роль",
  scanTitle: "Сканер", pickEvent: "Выберите мероприятие", scanBtn: "Сканировать", continuous: "Сканировать подряд",
  scanPopup: "Наведите камеру на QR-код волонтёра",
  cameFrom: "пришли", of: "из",
  scanOk: "+10 баллов начислено", scanAdded: "Не был записан — добавлен автоматически",
  scanAlready: "Уже отмечен", scanNotFound: "Пользователь не найден", scanBadQr: "Это не QR-код Yashil Qo'llar",
  searchPh: "Имя, @username или телефон", mark: "Отметить",
  noStaffEvents: "Мероприятий на ближайшие дни нет", scanUnsupported: "Обновите Telegram, чтобы работал сканер",
  unregTitle: "Сначала зарегистрируйтесь в боте", unregText: "Это займёт минуту. Потом вернитесь в приложение.",
  errTitle: "Не удалось подключиться", errText: "Проверьте интернет и попробуйте ещё раз.", retry: "Повторить",
  onlyTelegram: "Это приложение открывается внутри Telegram.",
  close: "Закрыть",
};

const en: Dict = {
  tabHome: "Home", tabEvents: "Events", tabQr: "QR", tabScan: "Scanner", tabTop: "Top", tabProfile: "Profile",
  hello: "Hi", points: "eco points", rankLeft: "{n} points to go", rankMax: "Top level reached 🎉",
  attendedN: "Attended {n} events",
  nextEvent: "Your next event", showQr: "Show my QR code", joinGroup: "Join the group",
  noNext: "You haven't registered for any event yet", noNextHint: "Pick one below 👇",
  upcoming: "Upcoming events", seeAll: "All",
  noEvents: "No events in your region yet", noEventsHint: "Coming soon — stay tuned 🌱",
  noRegion: "No region selected — in the bot: «👤 My profile → 📍 Change region».",
  today: "Today", tomorrow: "Tomorrow", inDays: "in {n} days",
  spots: "{n}/{max} spots", spotsLeft: "{n} spots left", full: "Full",
  registered: "You're registered", attended: "You attended",
  register: "Register", registering: "Registering…",
  joinedOk: "You're in! 🎉", joinedHint: "Show your QR code to the coordinator on the event day.",
  subscribeFirst: "Please join our channel first", openChannel: "Open channel",
  gone: "This event is no longer available", fullErr: "Sorry, no spots left",
  certHint: "🎓 Certificates are posted in the group after the event.",
  qrTitle: "Your eco code", qrHint: "Show it to the coordinator at the event",
  qrTip: "Turn up your screen brightness — scanning gets faster",
  topTitle: "Most active volunteers", myPlace: "Your place", you: "You",
  profileStats: "Stats", history: "Events you attended", noHistory: "You haven't attended any events yet 🌿",
  language: "Language", openBot: "Open the bot", region: "Region", role: "Role",
  scanTitle: "Scanner", pickEvent: "Choose the event", scanBtn: "Scan", continuous: "Continuous scanning",
  scanPopup: "Point the camera at the volunteer's QR code",
  cameFrom: "checked in", of: "of",
  scanOk: "+10 points given", scanAdded: "Wasn't registered — added automatically",
  scanAlready: "Already checked in", scanNotFound: "User not found", scanBadQr: "Not a Yashil Qo'llar QR code",
  searchPh: "Name, @username or phone", mark: "Check in",
  noStaffEvents: "No events in the next few days", scanUnsupported: "Update Telegram to use the scanner",
  unregTitle: "Sign up in the bot first", unregText: "It takes a minute. Then come back to the app.",
  errTitle: "Couldn't connect", errText: "Check your internet and try again.", retry: "Retry",
  onlyTelegram: "This app opens inside Telegram.",
  close: "Close",
};

const DICTS: Record<Lang, Dict> = { uz, ru, en };
export type Key = keyof Dict;

let current: Lang = "uz";
export const setLang = (l: Lang) => { current = DICTS[l] ? l : "uz"; };
export const getLang = () => current;

export function t(key: Key, vars?: Record<string, string | number>): string {
  let s = DICTS[current][key] ?? uz[key];
  if (vars) for (const k in vars) s = s.replace(`{${k}}`, String(vars[k]));
  return s;
}

const LOCALES: Record<Lang, string> = { uz: "uz-Latn-UZ", ru: "ru-RU", en: "en-GB" };

// В браузерах (особенно в WebView Telegram) нет узбекских названий месяцев —
// вместо «okt» выводится «M10». Поэтому для uz — свои таблицы.
const UZ_MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
const UZ_MONTHS_SHORT = ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sen", "okt", "noy", "dek"];
const UZ_DAYS = ["yakshanba", "dushanba", "seshanba", "chorshanba", "payshanba", "juma", "shanba"];
const UZ_DAYS_SHORT = ["yak", "du", "se", "chor", "pay", "ju", "shan"];

const intl = (iso: string, o: Intl.DateTimeFormatOptions) => {
  try { return new Intl.DateTimeFormat(LOCALES[current], o).format(new Date(iso)); }
  catch { return new Date(iso).toLocaleDateString(); }
};
const pad = (n: number) => String(n).padStart(2, "0");

export const fmt = {
  /** 14:30 */
  time: (iso: string) => { const d = new Date(iso); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; },
  /** 6 */
  day: (iso: string) => String(new Date(iso).getDate()),
  /** okt / окт / Oct */
  monthShort: (iso: string) =>
    current === "uz" ? UZ_MONTHS_SHORT[new Date(iso).getMonth()] : intl(iso, { month: "short" }).replace(".", ""),
  /** 6 okt */
  dayMonth: (iso: string) =>
    current === "uz" ? `${new Date(iso).getDate()} ${UZ_MONTHS_SHORT[new Date(iso).getMonth()]}` : intl(iso, { day: "numeric", month: "short" }),
  /** 6 oktabr / 6 октября / 6 October */
  dayMonthLong: (iso: string) =>
    current === "uz" ? `${new Date(iso).getDate()}-${UZ_MONTHS[new Date(iso).getMonth()]}` : intl(iso, { day: "numeric", month: "long" }),
  /** seshanba, 6-oktabr */
  full: (iso: string) => {
    const d = new Date(iso);
    return current === "uz"
      ? `${UZ_DAYS[d.getDay()]}, ${d.getDate()}-${UZ_MONTHS[d.getMonth()]}`
      : intl(iso, { weekday: "long", day: "numeric", month: "long" });
  },
  /** se 14:30 */
  weekdayTime: (iso: string) => {
    const w = current === "uz" ? UZ_DAYS_SHORT[new Date(iso).getDay()] : intl(iso, { weekday: "short" });
    return `${w} ${fmt.time(iso)}`;
  },
};

/** «Сегодня / Завтра / через 3 дн.» — или null, если дальше недели. */
export function relDay(iso: string): string | null {
  const d = new Date(iso);
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const day = new Date(d); day.setHours(0, 0, 0, 0);
  const diff = Math.round((day.getTime() - start.getTime()) / 86400000);
  if (diff === 0) return t("today");
  if (diff === 1) return t("tomorrow");
  if (diff > 1 && diff <= 7) return t("inDays", { n: diff });
  return null;
}

export const LANG_LABELS: Record<Lang, string> = { uz: "O'zbekcha", ru: "Русский", en: "English" };
