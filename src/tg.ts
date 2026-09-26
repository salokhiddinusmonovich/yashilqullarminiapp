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
