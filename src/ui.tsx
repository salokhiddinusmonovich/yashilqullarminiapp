// Общие компоненты: иконки, аватар, карточка мероприятия, шторка.
import type { ComponentChildren } from "preact";
import { useEffect } from "preact/hooks";
import type { EventItem } from "./types";
import { t, fmt, relDay } from "./i18n";
import { useBackButton } from "./tg";

const P = { fill: "none", stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round" } as const;

export const Icon = {
  home: () => <svg viewBox="0 0 24 24" {...P}><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></svg>,
  cal: () => <svg viewBox="0 0 24 24" {...P}><rect x="3" y="4.5" width="18" height="16.5" rx="3" /><path d="M3 9.5h18M8 3v3M16 3v3" /></svg>,
  qr: () => <svg viewBox="0 0 24 24" {...P}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><path d="M14 14h3v3M21 14v.01M17 21h4v-4M14 18v3" /></svg>,
  scan: () => <svg viewBox="0 0 24 24" {...P}><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M4 12h16" /></svg>,
  trophy: () => <svg viewBox="0 0 24 24" {...P}><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" /></svg>,
  user: () => <svg viewBox="0 0 24 24" {...P}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>,
  pin: () => <svg viewBox="0 0 24 24" {...P}><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>,
  clock: () => <svg viewBox="0 0 24 24" {...P}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>,
  users: () => <svg viewBox="0 0 24 24" {...P}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6" /></svg>,
  check: () => <svg viewBox="0 0 24 24" {...P}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>,
  chevron: () => <svg viewBox="0 0 24 24" {...P}><path d="m9 6 6 6-6 6" /></svg>,
  search: () => <svg viewBox="0 0 24 24" {...P}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>,
  leaf: () => <svg viewBox="0 0 24 24" {...P}><path d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15zM5 19l7-7" /></svg>,
  send: () => <svg viewBox="0 0 24 24" {...P}><path d="M21 3 3 10.5l7 2.5 2.5 7z" /><path d="m10 13 4-4" /></svg>,
};

export function Avatar({ src, name, size = 44 }: { src: string | null; name: string; size?: number }) {
  const letter = (name || "?").trim().charAt(0).toUpperCase();
  return (
    <div class="avatar" style={{ width: size, height: size, fontSize: size * 0.42 }}>
      {src ? <img src={src} alt="" loading="lazy" decoding="async" /> : letter}
    </div>
  );
}

export function DateBadge({ iso }: { iso: string }) {
  return (
    <div class="datebadge">
      <b>{fmt.day(iso)}</b>
      <span>{fmt.monthShort(iso)}</span>
    </div>
  );
}

export function seatsInfo(e: EventItem) {
  const reg = e.registered ?? 0;
  const left = Math.max(0, e.max - reg);
  return { reg, left, pct: e.max ? Math.min(100, Math.round((reg / e.max) * 100)) : 0, full: left === 0 };
}

export function StatusPill({ e }: { e: EventItem }) {
  if (e.my_status === "attended") return <span class="pill pill-ok"><Icon.check />{t("attended")}</span>;
  if (e.my_status) return <span class="pill pill-ok"><Icon.check />{t("registered")}</span>;
  const s = seatsInfo(e);
  if (s.full) return <span class="pill pill-muted">{t("full")}</span>;
  if (s.left <= 10) return <span class="pill pill-warn">{t("spotsLeft", { n: s.left })}</span>;
  return null;
}

export function EventCard({ e, onOpen }: { e: EventItem; onOpen: () => void }) {
  const s = seatsInfo(e);
  const rel = relDay(e.date);
  return (
    <button class="ecard tap" onClick={onOpen}>
      <div class="ecard-media">
        {e.photo ? <img src={e.photo} alt="" loading="lazy" decoding="async" /> : <div class="ecard-ph"><Icon.leaf /></div>}
        <DateBadge iso={e.date} />
        {rel && <span class="rel">{rel}</span>}
      </div>
      <div class="ecard-body">
        <div class="ecard-title">{e.title}</div>
        <div class="meta">
          <span><Icon.clock />{fmt.time(e.date)}</span>
          <span><Icon.pin />{e.location}</span>
        </div>
        <div class="ecard-foot">
          <div class="bar"><i style={{ width: `${s.pct}%` }} /></div>
          <span class="muted small">{t("spots", { n: s.reg, max: e.max })}</span>
        </div>
        <div class="ecard-status"><StatusPill e={e} /></div>
      </div>
    </button>
  );
}

/** Шторка снизу поверх экрана; закрывается системной кнопкой «назад» Telegram. */
export function Sheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ComponentChildren }) {
  useEffect(() => useBackButton(open, onClose), [open]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);
  if (!open) return null;
  return (
    <div class="sheet-wrap" onClick={onClose}>
      <div class="sheet" onClick={(ev) => ev.stopPropagation()}>
        <div class="grab" />
        {children}
      </div>
    </div>
  );
}

export function Empty({ icon, title, text }: { icon: string; title: string; text?: string }) {
  return (
    <div class="empty">
      <div class="empty-ico">{icon}</div>
      <div class="empty-title">{title}</div>
      {text && <div class="muted">{text}</div>}
    </div>
  );
}
