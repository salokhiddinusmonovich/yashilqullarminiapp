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

/** Своя палитра, но фон и текст — от Telegram, чтобы приложение выглядело «родным». */
export function applyTheme() {
  const dark = tg ? tg.colorScheme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  const root = document.documentElement;
  root.dataset.theme = dark ? "dark" : "light";
  const p = tg?.themeParams ?? {};
  const bg = p.bg_color || (dark ? "#0b1110" : "#f3f6f4");
  root.style.setProperty("--tg-bg", bg);
  if (p.text_color) root.style.setProperty("--tg-text", p.text_color);
  if (p.hint_color) root.style.setProperty("--tg-hint", p.hint_color);
  if (p.secondary_bg_color) root.style.setProperty("--tg-bg2", p.secondary_bg_color);
  try {
    tg?.setHeaderColor(bg);
    tg?.setBackgroundColor(bg);
    tg?.setBottomBarColor?.(bg);
  } catch { /* старые клиенты */ }
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
