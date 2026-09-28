// Тонкая обёртка над Telegram WebApp API: тема, вибрация, кнопка «назад», сканер QR.
// Вне Telegram (npm run dev в браузере) всё это тихо ничего не делает.

type Haptic = "light" | "medium" | "success" | "warning" | "error";

interface TgWebApp {
  initData: string;
  initDataUnsafe: { start_param?: string; user?: { first_name?: string } };
  colorScheme: "light" | "dark";
  themeParams: Record<string, string | undefined>;
  version: string;
  ready(): void;
  expand(): void;
  isVersionAtLeast(v: string): boolean;
  setHeaderColor(c: string): void;
  setBackgroundColor(c: string): void;
  setBottomBarColor?(c: string): void;
  enableClosingConfirmation(): void;
  disableVerticalSwipes?(): void;
  openTelegramLink(url: string): void;
  openLink(url: string): void;
  showScanQrPopup(params: { text?: string }, cb?: (text: string) => boolean | void): void;
  requestContact?(cb: (ok: boolean, res?: { responseUnsafe?: { contact?: { phone_number?: string } } }) => void): void;
  closeScanQrPopup(): void;
  LocationManager?: {
    isInited: boolean; isLocationAvailable: boolean;
    init(cb?: () => void): void;
    getLocation(cb: (data: { latitude: number; longitude: number } | null) => void): void;
  };
  shareToStory?(mediaUrl: string, params?: { text?: string; widget_link?: { url: string; name?: string } }): void;
  downloadFile?(params: { url: string; file_name: string }, cb?: (ok: boolean) => void): void;
  onEvent(event: string, cb: (...args: unknown[]) => void): void;
  offEvent(event: string, cb: (...args: unknown[]) => void): void;
  HapticFeedback: {
    impactOccurred(s: "light" | "medium" | "heavy"): void;
    notificationOccurred(s: "success" | "warning" | "error"): void;
    selectionChanged(): void;
  };
  BackButton: { show(): void; hide(): void; onClick(cb: () => void): void; offClick(cb: () => void): void };
}

declare global {
  interface Window { Telegram?: { WebApp: TgWebApp } }
}

export const tg: TgWebApp | undefined = window.Telegram?.WebApp?.initData ? window.Telegram.WebApp : undefined;

export function haptic(kind: Haptic) {
  const h = tg?.HapticFeedback;
  if (!h) return;
  try {
    if (kind === "light" || kind === "medium") h.impactOccurred(kind);
    else h.notificationOccurred(kind);
  } catch { /* старые клиенты */ }
}

export function initTelegram() {
  if (!tg) return;
  tg.ready();
  tg.expand();
  try { tg.disableVerticalSwipes?.(); } catch { /* < 7.7 */ }
  applyTheme();
  tg.onEvent("themeChanged", applyTheme);
}

export type ThemePref = "dark" | "light" | "auto";
const THEME_KEY = "yq_theme";

export function getThemePref(): ThemePref {
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v === "dark" || v === "light" || v === "auto") return v;
  } catch { /* */ }
  return "dark"; // по умолчанию — фирменная тёмная тема
}

export function setThemePref(p: ThemePref) {
  try { localStorage.setItem(THEME_KEY, p); } catch { /* */ }
  applyTheme();
}

/** Фирменная палитра (не берём фон Telegram — у нас свой дизайн), шапку Telegram красим в тон. */
export function applyTheme() {
  const pref = getThemePref();
  const sysDark = tg ? tg.colorScheme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = pref === "dark" || (pref === "auto" && sysDark);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  const bg = dark ? "#0e1712" : "#efe7d6";
  try {
    tg?.setHeaderColor(bg);
    tg?.setBackgroundColor(bg);
    tg?.setBottomBarColor?.(bg);
  } catch { /* старые клиенты */ }
}

export function share(url: string, text: string) {
  openLink(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
}

/** Системная кнопка «назад» Telegram — пока открыт экран поверх основного. */
export function useBackButton(active: boolean, onBack: () => void) {
  if (!tg) return () => {};
  if (active) {
    tg.BackButton.onClick(onBack);
    tg.BackButton.show();
  }
  return () => {
    tg.BackButton.offClick(onBack);
    tg.BackButton.hide();
  };
}

/** Сторис в Telegram (Bot API 7.8+). false — клиент не умеет. */
export function shareStory(mediaUrl: string, text: string): boolean {
  if (!tg?.shareToStory || !tg.isVersionAtLeast("7.8")) return false;
  try {
    tg.shareToStory(mediaUrl, { text });
    return true;
  } catch { return false; }
}

/** Где я сейчас: геолокация Telegram (Bot API 8.0+), иначе браузерная. null — нет доступа / не удалось. */
export function getLocation(): Promise<{ lat: number; lon: number } | null> {
  const browser = () => new Promise<{ lat: number; lon: number } | null>((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => resolve(null), { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
  });
  const lm = tg?.LocationManager;
  if (!lm || !tg!.isVersionAtLeast("8.0")) return browser();
  return new Promise((resolve) => {
    const ask = () => {
      if (!lm.isLocationAvailable) return browser().then(resolve);
      lm.getLocation((d) => (d ? resolve({ lat: d.latitude, lon: d.longitude }) : browser().then(resolve)));
    };
    try { lm.isInited ? ask() : lm.init(ask); } catch { browser().then(resolve); }
  });
}

export const canStory = () => !!tg?.shareToStory && tg.isVersionAtLeast("7.8");

/** Сохранить файл на телефон (Bot API 8.0+), иначе — открыть ссылку (долгое нажатие → сохранить). */
export function saveFile(url: string, name: string) {
  if (tg?.downloadFile && tg.isVersionAtLeast("8.0")) {
    try { tg.downloadFile({ url, file_name: name }); return; } catch { /* */ }
  }
  openLink(url);
}

export const canScan = () => !!tg && tg.isVersionAtLeast("6.4");

export function openLink(url: string) {
  if (url.startsWith("https://t.me/") && tg) tg.openTelegramLink(url);
  else if (tg) tg.openLink(url);
  else window.open(url, "_blank");
}

/** Номер телефона из Telegram одним нажатием (Bot API 6.9+). null — отказ/не поддерживается. */
export function requestPhone(): Promise<string | null> {
  return new Promise((resolve) => {
    if (!tg?.requestContact || !tg.isVersionAtLeast("6.9")) return resolve(null);
    tg.requestContact((ok, res) => {
      const phone = res?.responseUnsafe?.contact?.phone_number;
      resolve(ok && phone ? (phone.startsWith("+") ? phone : `+${phone}`) : null);
    });
  });
}
