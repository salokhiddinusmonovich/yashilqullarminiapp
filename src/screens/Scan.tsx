// Сканер для координаторов: выбрать мероприятие → сканировать людей подряд.
// Не записан — сервер записывает автоматически (как в боте).
import { useEffect, useRef, useState } from "preact/hooks";
import type { CheckInResult, EventItem, Person } from "../types";
import { t, fmt } from "../i18n";
import { api } from "../api";
import { Avatar, Empty, Icon } from "../ui";
import { canScan, haptic, tg } from "../tg";
import { confetti } from "../fx";

interface FeedItem extends CheckInResult { key: number }

export function Scan() {
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [eventId, setEventId] = useState<number | null>(null);
  const [counts, setCounts] = useState<{ registered: number; attended: number } | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [last, setLast] = useState<FeedItem | null>(null);
  const [continuous, setContinuous] = useState(true);
  const [q, setQ] = useState("");
  const [found, setFound] = useState<Person[]>([]);

  const stoppedByUser = useRef(false);
  const lastText = useRef<{ text: string; at: number }>({ text: "", at: 0 });

  useEffect(() => {
    api.staffEvents().then((d) => {
      setEvents(d.events);
      setEventId(d.default);
    }).catch(() => setEvents([]));
  }, []);

  useEffect(() => {
    const ev = events?.find((e) => e.id === eventId);
    if (ev) setCounts({ registered: ev.registered ?? 0, attended: ev.attended ?? 0 });
  }, [eventId, events]);

  // Пользователь сам закрыл сканер — прекращаем «сканировать подряд»
  useEffect(() => {
    if (!tg) return;
    const onClosed = () => { stoppedByUser.current = true; };
    tg.onEvent("scanQrPopupClosed", onClosed);
    return () => tg!.offEvent("scanQrPopupClosed", onClosed);
  }, []);

  async function submit(payload: { qr?: string; user_id?: number }) {
    if (!eventId) return;
    try {
      const r = await api.checkIn(eventId, payload);
      haptic(r.result === "ok" ? "success" : r.result === "already" ? "warning" : "error");
      if (r.result === "ok") confetti();
      const item = { ...r, key: Date.now() };
      setLast(item);
      setFeed((f) => [item, ...f].slice(0, 30));
      if (r.counts) setCounts(r.counts);
    } catch {
      haptic("error");
    }
  }

  function openScanner() {
    if (!tg || !eventId) return;
    stoppedByUser.current = false;
    tg.showScanQrPopup({ text: t("scanPopup") }, (text) => {
      // камера отдаёт один и тот же код много раз в секунду — фильтруем повторы
      const now = Date.now();
      if (text === lastText.current.text && now - lastText.current.at < 4000) return;
      lastText.current = { text, at: now };
      submit({ qr: text }).then(() => {
        if (continuous && !stoppedByUser.current) setTimeout(openScanner, 1300);
      });
      return true; // закрыть сканер, показать результат
    });
  }

  async function search(v: string) {
    setQ(v);
    if (v.trim().length < 2) { setFound([]); return; }
    try { setFound((await api.search(v)).results); } catch { /* */ }
  }

  if (events === null) return <div class="screen"><h1 class="title">{t("scanTitle")}</h1><div class="skel-list" /></div>;
  if (!events.length) return <div class="screen"><h1 class="title">{t("scanTitle")}</h1><Empty icon="🗓" title={t("noStaffEvents")} /></div>;

  return (
    <div class="screen">
      <h1 class="title">{t("scanTitle")}</h1>

      <div class="muted small label">{t("pickEvent")}</div>
      <div class="chips">
        {events.map((e) => (
          <button key={e.id} class={`echip tap ${e.id === eventId ? "on" : ""}`} onClick={() => { haptic("light"); setEventId(e.id); }}>
            <b>{fmt.dayMonth(e.date)}</b>
            <span>{e.title}</span>
          </button>
        ))}
      </div>

      {counts && (
        <div class="counter">
          <div class="counter-num"><b>{counts.attended}</b><span>/ {counts.registered}</span></div>
          <div class="muted">{t("cameFrom")}</div>
          <div class="bar big"><i style={{ width: `${counts.registered ? Math.round((counts.attended / counts.registered) * 100) : 0}%` }} /></div>
        </div>
      )}

      {canScan() ? (
        <button class="scan-btn tap" onClick={() => { haptic("medium"); openScanner(); }}>
          <span class="scan-ring"><Icon.scan /></span>
          {t("scanBtn")}
        </button>
      ) : (
        <div class="card warn small">{t("scanUnsupported")}</div>
      )}
      <label class="toggle">
        <input type="checkbox" checked={continuous} onChange={(e) => setContinuous((e.target as HTMLInputElement).checked)} />
        <span class="track"><i /></span>
        {t("continuous")}
      </label>

      {last && <ResultCard r={last} />}

      <div class="search">
        <Icon.search />
        <input value={q} placeholder={t("searchPh")} onInput={(e) => search((e.target as HTMLInputElement).value)} />
      </div>
      {found.map((p) => (
        <div class="lrow card" key={p.id}>
          <Avatar src={p.photo} name={p.fullname} size={36} />
          <span class="lname">{p.fullname}{p.username ? <span class="muted small"> @{p.username}</span> : null}</span>
          <button class="btn btn-small tap" onClick={() => { submit({ user_id: p.id }); setQ(""); setFound([]); }}>{t("mark")}</button>
        </div>
      ))}

      {feed.length > 1 && (
        <div class="card list-card feed">
          {feed.slice(1).map((r) => (
            <div class="lrow" key={r.key}>
              <span class={`dot dot-${r.result}`} />
              <span class="lname">{r.person?.fullname ?? t(r.result === "bad_qr" ? "scanBadQr" : "scanNotFound")}</span>
              <span class="muted small">{r.result === "ok" ? "+10" : r.result === "already" ? "✓" : "✕"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResultCard({ r }: { r: FeedItem }) {
  const ok = r.result === "ok";
  const text = ok ? (r.auto_added ? t("scanAdded") : t("scanOk"))
    : r.result === "already" ? t("scanAlready")
    : r.result === "bad_qr" ? t("scanBadQr") : t("scanNotFound");
  return (
    <div class={`result result-${r.result}`} key={r.key}>
      {r.person ? <Avatar src={r.person.photo} name={r.person.fullname} size={52} /> : <div class="result-x">✕</div>}
      <div>
        <b>{r.person?.fullname ?? "—"}</b>
        <div>{text}</div>
      </div>
      {ok && <div class="result-pts">+10</div>}
    </div>
  );
}
