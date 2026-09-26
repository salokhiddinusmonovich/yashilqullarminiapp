// Переводы Mini App. Язык — тот же, что выбран в боте (приходит с сервера).
import type { Lang } from "./types";

const uz = {
  otherRegion: "Boshqa hudud", otherRegionHint: "Bu tadbir {region} uchun. Faqat o'z hududingizdagi tadbirlarga yozilish mumkin.",
  dateLbl: "Sana",
  passport: "Volontyor pasporti", stamps: "Muhrlar", stampsEmpty: "Birinchi muhr birinchi tadbirdan keyin paydo bo'ladi",
  admit: "KIRISH", passTitle: "Eko-talon", member: "a'zo",
  edit: "Tahrirlash", editTitle: "Profilni tahrirlash", changePhoto: "Rasmni almashtirish",
  fName: "Ism familiya", fRegion: "Hudud", fPhone: "Telefon", fromTg: "Telegramdan olish", fEmail: "Email",
  fAge: "Yosh", fEdu: "O'qish joyi", fExp: "Volontyorlik tajribasi",
  save: "Saqlash", saving: "Saqlanmoqda…", saved: "Saqlandi",
  err_required: "To'ldiring", err_invalid: "Noto'g'ri", err_taken: "Bu email band", err_range: "5 dan 120 gacha",
  accounts: "Hisoblar", connected: "Ulangan", notConnected: "Ulanmagan",
  accSite: "Sayt · yashilqollar.uz",
  accSiteOn: "Email va parol bilan kirasiz: {email}",
  accSiteNoPw: "Email bor, parol yo'q — parol o'rnating va saytga kiring",
  accSiteNoEmail: "Saytga email orqali kirish uchun avval email qo'shing",
  accSiteTg: "Saytga Telegram orqali ham kirish mumkin",
  setPw: "Parol o'rnatish", changePw: "Parolni almashtirish", addEmail: "Email qo'shish", openSite: "Saytni ochish",
  pwTitle: "Sayt uchun parol", pwHint: "Kamida 8 belgi. Saytga {email} va shu parol bilan kirasiz.", pwShort: "Kamida 8 belgi",
  filterMine: "Hududim", filterAll: "Barchasi", filterJoined: "Yozilganlarim", noJoined: "Siz hali hech qayerga yozilmagansiz",
  share: "Ulashish", shareText: "Keling, birga qatnashamiz: {title} 🌿",
  startsIn: "Boshlanishiga", live: "Hozir bo'lyapti", cdD: "kun", cdH: "soat", cdM: "daq", cdS: "son",
  badges: "Yutuqlar", badgesN: "{n}/{m} ochilgan",
  b_first: "Birinchi qadam", b_first_d: "1 ta tadbirda qatnashing",
  b_five: "Faol volontyor", b_five_d: "5 ta tadbir",
  b_ten: "Tabiat do'sti", b_ten_d: "10 ta tadbir",
  b_legend: "Afsona", b_legend_d: "25 ta tadbir",
  b_tree: "Daraxt", b_tree_d: "150 ball to'plang",
  b_guard: "Himoyachi", b_guard_d: "300 ball to'plang",
  b_plan: "Rejachi", b_plan_d: "Kelgusi tadbirga yoziling",
  b_team: "Jamoa a'zosi", b_team_d: "Koordinator yoki tashkilotchi bo'ling",
  community: "Bizning hissamiz", cVol: "volontyor", cEvents: "tadbir o'tkazildi", cCheck: "qatnashuv", cRegions: "hudud",
  invite: "Do'stingizni taklif qiling", inviteText: "Birga ko'proq foyda keltiramiz 🌍", inviteBtn: "Taklif qilish",
  inviteMsg: "Men Yashil Qo'llar volontyoriman! Sen ham qo'shil 🌿",
  theme: "Mavzu", themeDark: "Qorong'i", themeLight: "Yorug'", themeAuto: "Avto",
  newBadge: "Yangi yutuq!",
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
  otherRegion: "Другой регион", otherRegionHint: "Это мероприятие для региона «{region}». Записаться можно только в своём регионе.",
  dateLbl: "Дата",
  passport: "Паспорт волонтёра", stamps: "Печати", stampsEmpty: "Первая печать появится после первого мероприятия",
  admit: "ВХОД", passTitle: "Эко-талон", member: "участник",
  edit: "Изменить", editTitle: "Редактировать профиль", changePhoto: "Сменить фото",
  fName: "Имя и фамилия", fRegion: "Регион", fPhone: "Телефон", fromTg: "Взять из Telegram", fEmail: "Email",
  fAge: "Возраст", fEdu: "Место учёбы", fExp: "Волонтёрский опыт",
  save: "Сохранить", saving: "Сохраняем…", saved: "Сохранено",
  err_required: "Заполните", err_invalid: "Неверно", err_taken: "Этот email уже занят", err_range: "от 5 до 120",
  accounts: "Аккаунты", connected: "Подключено", notConnected: "Не подключено",
  accSite: "Сайт · yashilqollar.uz",
  accSiteOn: "Вход по email и паролю: {email}",
  accSiteNoPw: "Email есть, пароля нет — задайте пароль, чтобы входить на сайт",
  accSiteNoEmail: "Чтобы входить на сайт по email, сначала добавьте email",
  accSiteTg: "На сайт можно войти и через Telegram",
  setPw: "Задать пароль", changePw: "Сменить пароль", addEmail: "Добавить email", openSite: "Открыть сайт",
  pwTitle: "Пароль для сайта", pwHint: "Минимум 8 символов. На сайт — с {email} и этим паролем.", pwShort: "Минимум 8 символов",
  filterMine: "Мой регион", filterAll: "Все", filterJoined: "Мои записи", noJoined: "Вы пока никуда не записаны",
  share: "Поделиться", shareText: "Пойдём вместе: {title} 🌿",
  startsIn: "До начала", live: "Идёт сейчас", cdD: "дн", cdH: "ч", cdM: "мин", cdS: "сек",
  badges: "Достижения", badgesN: "открыто {n} из {m}",
  b_first: "Первый шаг", b_first_d: "Поучаствуйте в 1 мероприятии",
  b_five: "Активист", b_five_d: "5 мероприятий",
  b_ten: "Друг природы", b_ten_d: "10 мероприятий",
  b_legend: "Легенда", b_legend_d: "25 мероприятий",
  b_tree: "Дерево", b_tree_d: "Наберите 150 баллов",
  b_guard: "Защитник", b_guard_d: "Наберите 300 баллов",
  b_plan: "Планировщик", b_plan_d: "Запишитесь на ближайшее мероприятие",
  b_team: "В команде", b_team_d: "Станьте координатором или организатором",
  community: "Наш вклад", cVol: "волонтёров", cEvents: "мероприятий проведено", cCheck: "участий", cRegions: "регионов",
  invite: "Пригласите друга", inviteText: "Вместе сделаем больше 🌍", inviteBtn: "Пригласить",
  inviteMsg: "Я волонтёр Yashil Qo'llar! Присоединяйся 🌿",
  theme: "Тема", themeDark: "Тёмная", themeLight: "Светлая", themeAuto: "Авто",
  newBadge: "Новое достижение!",
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
  otherRegion: "Other region", otherRegionHint: "This event is for {region}. You can only register in your own region.",
  dateLbl: "Date",
  passport: "Volunteer passport", stamps: "Stamps", stampsEmpty: "Your first stamp appears after your first event",
  admit: "ADMIT ONE", passTitle: "Eco pass", member: "member",
  edit: "Edit", editTitle: "Edit profile", changePhoto: "Change photo",
  fName: "Full name", fRegion: "Region", fPhone: "Phone", fromTg: "Use Telegram number", fEmail: "Email",
  fAge: "Age", fEdu: "Education", fExp: "Volunteering experience",
  save: "Save", saving: "Saving…", saved: "Saved",
  err_required: "Required", err_invalid: "Invalid", err_taken: "This email is already used", err_range: "5 to 120",
  accounts: "Accounts", connected: "Connected", notConnected: "Not connected",
  accSite: "Website · yashilqollar.uz",
  accSiteOn: "Sign in with email & password: {email}",
  accSiteNoPw: "Email set, no password — set one to sign in on the website",
  accSiteNoEmail: "Add an email first to sign in on the website",
  accSiteTg: "You can also sign in on the website with Telegram",
  setPw: "Set password", changePw: "Change password", addEmail: "Add email", openSite: "Open website",
  pwTitle: "Website password", pwHint: "At least 8 characters. Sign in on the website with {email} and this password.", pwShort: "At least 8 characters",
  filterMine: "My region", filterAll: "All", filterJoined: "My events", noJoined: "You haven't registered anywhere yet",
  share: "Share", shareText: "Let's go together: {title} 🌿",
  startsIn: "Starts in", live: "Happening now", cdD: "d", cdH: "h", cdM: "min", cdS: "sec",
  badges: "Achievements", badgesN: "{n} of {m} unlocked",
  b_first: "First step", b_first_d: "Attend 1 event",
  b_five: "Activist", b_five_d: "5 events",
  b_ten: "Nature's friend", b_ten_d: "10 events",
  b_legend: "Legend", b_legend_d: "25 events",
  b_tree: "Tree", b_tree_d: "Earn 150 points",
  b_guard: "Guardian", b_guard_d: "Earn 300 points",
  b_plan: "Planner", b_plan_d: "Register for an upcoming event",
  b_team: "Team member", b_team_d: "Become a coordinator or organizer",
  community: "Our impact", cVol: "volunteers", cEvents: "events held", cCheck: "check-ins", cRegions: "regions",
  invite: "Invite a friend", inviteText: "Together we do more 🌍", inviteBtn: "Invite",
  inviteMsg: "I'm a Yashil Qo'llar volunteer! Join me 🌿",
  theme: "Theme", themeDark: "Dark", themeLight: "Light", themeAuto: "Auto",
  newBadge: "New achievement!",
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
