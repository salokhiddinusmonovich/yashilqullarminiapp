// Сканер для координаторов: выбрать мероприятие → сканировать людей подряд.
// Не записан — сервер записывает автоматически (как в боте).
import { useEffect, useRef, useState } from "preact/hooks";
import type { CheckInResult, EventItem, Person } from "../types";
import { t, fmt } from "../i18n";
import { api } from "../api";
import { Avatar, Empty, Icon } from "../ui";
import { canScan, haptic, tg } from "../tg";
import { confetti } from "../fx";

interface FeedItem extends CheckInResult { key: number; undone?: boolean }
interface Pending { payload: { qr?: string; user_id?: number }; r: CheckInResult }

/** QR с картинки (скриншот, который прислал человек): встроенный BarcodeDetector, иначе jsQR (грузится только тут). */
async function readQrFromFile(file: File): Promise<string | null> {
  const bmp = await createImageBitmap(file).catch(() => null);
  const img = bmp ?? await new Promise<HTMLImageElement | null>((res) => {
    const i = new Image(); const u = URL.createObjectURL(file);
    i.onload = () => res(i); i.onerror = () => res(null); i.src = u;
  });
  if (!img) return null;
  const BD = (window as unknown as { BarcodeDetector?: new (o: object) => { detect(s: CanvasImageSource): Promise<{ rawValue: string }[]> } }).BarcodeDetector;
  if (BD) {
    try { const r = await new BD({ formats: ["qr_code"] }).detect(img); if (r[0]) return r[0].rawValue; } catch { /* нет поддержки — jsQR */ }
  }
  const w = "naturalWidth" in img ? img.naturalWidth : img.width, h = "naturalHeight" in img ? img.naturalHeight : img.height;
  const k = Math.min(1, 1400 / Math.max(w, h));
  const c = document.createElement("canvas"); c.width = Math.round(w * k); c.height = Math.round(h * k);
  const ctx = c.getContext("2d")!; ctx.drawImage(img, 0, 0, c.width, c.height);
  const { default: jsQR } = await import("jsqr");
  const data = ctx.getImageData(0, 0, c.width, c.height);
  return jsQR(data.data, c.width, c.height, { inversionAttempts: "attemptBoth" })?.data ?? null;
}

export function Scan({ regionLabel, admin }: { regionLabel: string | null; admin?: boolean }) {
  const shotIn = useRef<HTMLInputElement>(null);
  const [reading, setReading] = useState(false);
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [eventId, setEventId] = useState<number | null>(null);
  const [counts, setCounts] = useState<{ registered: number; attended: number } | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [last, setLast] = useState<FeedItem | null>(null);
  const [continuous, setContinuous] = useState(true);
  const [q, setQ] = useState("");
  const [found, setFound] = useState<Person[]>([]);
  const [pending, setPending] = useState<Pending | null>(null);

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

  async function submit(payload: { qr?: string; user_id?: number }, force = false) {
    if (!eventId) return;
    try {
      const r = await api.checkIn(eventId, force ? { ...payload, force: true } : payload);
      if (r.result === "confirm_region") {
        // человек из другого региона — скорее всего выбрано не то мероприятие: спрашиваем
        stoppedByUser.current = true;
        haptic("warning");
        setPending({ payload, r });
        return;
      }
      setPending(null);
      // человек из другого региона — ошибка, не отмечаем; сканирование подряд останавливаем, чтобы заметили
      if (r.result === "wrong_region") stoppedByUser.current = true;
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

  async function undo(item: FeedItem) {
    if (!eventId || !item.person) return;
    try {
      const r = await api.undo(eventId, item.person.id, !!item.auto_added);
      haptic("warning");
      const upd = { ...item, undone: true };
      setLast(upd);
      setFeed((f) => f.map((x) => (x.key === item.key ? upd : x)));
      if (r.counts) setCounts(r.counts);
    } catch {
      haptic("error");
    }
  }

  function openScanner() {
    if (!tg || !eventId) return;
    stoppedByUser.current = false;
    const title = events?.find((e) => e.id === eventId)?.title ?? "";
    // у Telegram лимит 64 символа на подсказку
    const hint = t("scanPopupFor", { title: title.length > 28 ? title.slice(0, 27) + "…" : title });
    tg.showScanQrPopup({ text: hint.length <= 64 ? hint : t("scanPopup") }, (text) => {
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

  async function fromScreenshot(files: FileList | null) {
    const f = files?.[0];
    if (shotIn.current) shotIn.current.value = "";
    if (!f || !eventId) return;
    setReading(true);
    const text = await readQrFromFile(f).catch(() => null);
    setReading(false);
    if (!text) {
      haptic("error");
      const item = { result: "bad_qr" as const, key: Date.now() };
      setLast(item); setFeed((x) => [item, ...x].slice(0, 30));
      return;
    }
    submit({ qr: text });
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
      {regionLabel && <div class="scan-region small"><span>📍</span>{t("scanRegionOnly", { region: regionLabel })}</div>}
      {admin && <div class="scan-region small admin"><span>👑</span>{t("scanAdminAll")}</div>}
      <div class="chips">
        {events.map((e) => (
          <button key={e.id} class={`echip tap ${e.id === eventId ? "on" : ""}`} onClick={() => { haptic("light"); setEventId(e.id); }}>
            <b>{fmt.dayMonth(e.date)}</b>
            <span>{e.title}</span>
          </button>
        ))}
      </div>

      {(() => {
        const ev = events.find((e) => e.id === eventId);
        return ev && (
          <div class="scan-now">
            <span class="mono label-xs">{t("scanNow")}</span>
            <b>{ev.title}</b>
            <small>📍 {ev.region_label} · {fmt.dayMonth(ev.date)} · {fmt.time(ev.date)}</small>
          </div>
        );
      })()}

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
      <button class="btn btn-ghost shot-btn tap" disabled={reading} onClick={() => shotIn.current?.click()}>
        🖼 {reading ? t("scanReading") : t("scanFromShot")}
      </button>
      <input ref={shotIn} type="file" accept="image/*" hidden onChange={(e) => fromScreenshot((e.target as HTMLInputElement).files)} />
      <label class="toggle">
        <input type="checkbox" checked={continuous} onChange={(e) => setContinuous((e.target as HTMLInputElement).checked)} />
        <span class="track"><i /></span>
        {t("continuous")}
      </label>

      {pending && (
        <div class="confirm-region">
          <b>⚠️ {t("scanConfirmTitle")}</b>
          <div>{t("scanConfirmText", {
            name: pending.r.person?.fullname ?? "—", pregion: pending.r.person_region ?? "?",
            title: pending.r.event_title ?? "", eregion: pending.r.event_region ?? "?",
          })}</div>
          <div class="row gap wide">
            <button class="btn btn-primary grow-btn tap" onClick={() => submit(pending.payload, true)}>{t("scanConfirmYes")}</button>
            <button class="btn btn-line grow-btn tap" onClick={() => { setPending(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}>{t("scanConfirmNo")}</button>
          </div>
        </div>
      )}

      {last && !pending && <ResultCard r={last} onUndo={() => undo(last)} />}

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
              <span class="lname">{r.person?.fullname ?? t(r.result === "bad_qr" ? "scanBadQr" : r.result === "other_region" ? "scanOtherRegion" : "scanNotFound")}{r.result === "wrong_region" && <span class="muted small"> · ⛔️ {r.person_region}</span>}</span>
              <span class="muted small">{r.undone ? "↩" : r.result === "ok" ? "+10" : r.result === "already" ? "✓" : "✕"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResultCard({ r, onUndo }: { r: FeedItem; onUndo: () => void }) {
  const ok = r.result === "ok";
  const text = r.undone ? t("scanUndone")
    : ok ? (r.auto_added ? t("scanAdded") : t("scanOk"))
    : r.result === "already" ? t("scanAlready")
    : r.result === "bad_qr" ? t("scanBadQr")
    : r.result === "wrong_region" ? t("scanWrongRegion", { pregion: r.person_region ?? "?", eregion: r.event_region ?? "?" })
    : r.result === "other_region" ? t("scanOtherRegion") : t("scanNotFound");
  return (
    <div class={`result result-${r.undone ? "undone" : r.result}`} key={r.key}>
      {r.person ? <Avatar src={r.person.photo} name={r.person.fullname} size={52} /> : <div class="result-x">✕</div>}
      <div>
        <b>{r.person?.fullname ?? "—"}</b>
        <div>{text}</div>
        {ok && !r.undone && <button class="undo tap" onClick={onUndo}>↩ {t("scanUndo")}</button>}
      </div>
      {ok && !r.undone && <div class="result-pts">+10</div>}
    </div>
  );
}
