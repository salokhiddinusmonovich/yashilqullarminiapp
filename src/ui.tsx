// Общие компоненты в стиле «паспорт волонтёра»: билеты, печати, нашивки, табло.
import type { ComponentChildren } from "preact";
import { useEffect } from "preact/hooks";
import type { EventItem } from "./types";
import { t, fmt, relDay } from "./i18n";
import { useBackButton } from "./tg";
import { eventStyle, tilt } from "./fx";

const P = { fill: "none", stroke: "currentColor", "stroke-width": 1.8, "stroke-linecap": "round", "stroke-linejoin": "round" } as const;

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
  send: () => <svg viewBox="0 0 24 24" {...P}><path d="M21 3 3 10.5l7 2.5 2.5 7z" /><path d="m10 13 4-4" /></svg>,
  edit: () => <svg viewBox="0 0 24 24" {...P}><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z" /><path d="m13.5 6.5 4 4" /></svg>,
  camera: () => <svg viewBox="0 0 24 24" {...P}><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>,
  lock: () => <svg viewBox="0 0 24 24" {...P}><rect x="5" y="10.5" width="14" height="10" rx="2" /><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" /></svg>,
  globe: () => <svg viewBox="0 0 24 24" {...P}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" /></svg>,
  plane: () => <svg viewBox="0 0 24 24" {...P}><path d="M21.5 4.5 2.5 11l7 2.5 2.5 7 9.5-16z" /></svg>,
  // рисованный лист — фирменный знак
  leaf: () => (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 52C10 30 24 12 52 10c2 26-14 42-38 42z" />
      <path d="M12 52C22 40 32 30 44 20M24 40l-1-9M31 33l8-1M28 36l-3-6" />
    </svg>
  ),
};

/** Фирменный знак: лист в круге, как печать организации. */
export function Seal({ size = 44 }: { size?: number }) {
  return (
    <span class="seal" style={{ width: size, height: size }}>
      <Icon.leaf />
    </span>
  );
}

export function Avatar({ src, name, size = 44 }: { src: string | null; name: string; size?: number }) {
  const letter = (name || "?").trim().charAt(0).toUpperCase();
  return (
    <div class="avatar" style={{ width: size, height: size, fontSize: size * 0.42 }}>
      {src ? <img src={src} alt="" loading="lazy" decoding="async" /> : letter}
    </div>
  );
}

/** Редакционный заголовок раздела: «01 — Ближайшее мероприятие». */
export function SecHead({ n, title, action }: { n: string; title: string; action?: ComponentChildren }) {
  return (
    <div class="sechead">
      <span class="sechead-n">{n}</span>
      <h2>{title}</h2>
      <span class="sechead-rule" />
      {action}
    </div>
  );
}

export function seatsInfo(e: EventItem) {
  const reg = e.registered ?? 0;
  const left = Math.max(0, e.max - reg);
  return { reg, left, pct: e.max ? Math.min(100, Math.round((reg / e.max) * 100)) : 0, full: left === 0 };
}

export function StatusPill({ e }: { e: EventItem }) {
  if (e.my_status === "attended") return <span class="tag tag-ok"><Icon.check />{t("attended")}</span>;
  if (e.my_status) return <span class="tag tag-ok"><Icon.check />{t("registered")}</span>;
  const s = seatsInfo(e);
  if (s.full) return <span class="tag tag-muted">{t("full")}</span>;
  if (s.left <= 10) return <span class="tag tag-warn">{t("spotsLeft", { n: s.left })}</span>;
  return null;
}

/** Мероприятие как билет: основная часть + отрывной корешок с датой. */
export function EventCard({ e, onOpen, showRegion, compact, foreign }: {
  e: EventItem; onOpen: () => void; showRegion?: boolean; compact?: boolean; foreign?: boolean;
}) {
  const s = seatsInfo(e);
  const rel = relDay(e.date);
  return (
    <button class={`ticket tap ${compact ? "compact" : ""}`} style={eventStyle(e.id)} onClick={onOpen}>
      {e.photo && !compact && (
        <div class="ticket-photo"><img src={e.photo} alt="" loading="lazy" decoding="async" /></div>
      )}
      <div class="ticket-row">
        <div class="ticket-main">
          <div class="ticket-kicker">
            <span class="ticket-no">№ {String(e.id).padStart(4, "0")}</span>
            {rel && <span class="ticket-rel">{rel}</span>}
          </div>
          <div class="ticket-title">{e.title}</div>
          <div class="meta">
            <span><Icon.pin />{showRegion ? `${e.location} · ${e.region_label}` : e.location}</span>
          </div>
          <div class="ticket-seats">
            <div class="dots">
              {Array.from({ length: 10 }, (_, i) => <i key={i} class={i < Math.round(s.pct / 10) ? "on" : ""} />)}
            </div>
            <span class="mono small">{s.reg}/{e.max}</span>
          </div>
          {foreign && !e.my_status ? <span class="tag tag-muted"><Icon.pin />{t("otherRegion")}</span> : <StatusPill e={e} />}
        </div>
        <div class="ticket-stub">
          <span class="stub-day">{fmt.day(e.date)}</span>
          <span class="stub-mon">{fmt.monthShort(e.date)}</span>
          <span class="stub-time">{fmt.time(e.date)}</span>
          <span class="stub-admit">{t("admit")}</span>
        </div>
      </div>
    </button>
  );
}

/** Табло с перекидными цифрами (как на вокзале). */
export function Flap({ value, label }: { value: number; label: string }) {
  const v = String(value).padStart(2, "0");
  return (
    <div class="flap">
      <div class="flap-digits">{v.split("").map((d, i) => <span key={i + d} class="flap-d">{d}</span>)}</div>
      <small>{label}</small>
    </div>
  );
}

/** Печать в паспорте за посещённое мероприятие. */
export function Stamp({ title, date, seed }: { title: string; date: string; seed: number }) {
  const inks = ["#3f9d63", "#d4623a", "#3f86a8", "#b34a6c", "#7f9a35"];
  return (
    <div class={`stamp stamp-${seed % 3}`} style={{ "--ink-s": inks[seed % inks.length], transform: `rotate(${tilt(seed, 9)})` } as any}>
      <span class="stamp-top">YASHIL QO'LLAR</span>
      <b class="stamp-title">{title}</b>
      <span class="stamp-date">{fmt.dayMonth(date)} · {new Date(date).getFullYear()}</span>
      <span class="stamp-ok">✓</span>
    </div>
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

export function Seg<T extends string>({ value, options, onChange }: {
  value: T; options: [T, string][]; onChange: (v: T) => void;
}) {
  return (
    <div class="seg">
      {options.map(([v, label]) => (
        <button key={v} class={`tap ${value === v ? "on" : ""}`} onClick={() => onChange(v)}>{label}</button>
      ))}
    </div>
  );
}

export function Empty({ title, text }: { icon?: string; title: string; text?: string }) {
  return (
    <div class="empty">
      <Seal size={56} />
      <div class="empty-title">{title}</div>
      {text && <div class="muted">{text}</div>}
    </div>
  );
}
