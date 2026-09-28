// 🗺 Эко-карта: места, о которых сообщили волонтёры, и что с ними стало.
// Красные — грязно, жёлтые — назначено мероприятие, зелёные — убрано; свои непроверенные — серые со ★.
// «📍 Сообщить» — прямо здесь: фото (сжимаем на телефоне, грузим по одному) → точка на карте → ответы.
// Грузится отдельным файлом (Leaflet) — только когда карту открыли.
import { useEffect, useRef, useState } from "preact/hooks";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { SpotFull, SpotPoint, SpotStatus } from "../types";
import { fmt, t, type Key } from "../i18n";
import { api } from "../api";
import { getLocation, haptic, openLink, useBackButton } from "../tg";
import { confetti } from "../fx";

type Filter = "all" | "accepted" | "planned" | "cleaned" | "mine";

// Центры регионов — откуда начинать карту (свой регион сразу крупно, а не вся Азия)
const CENTERS: Record<string, [number, number]> = {
  karakalpakstan: [42.46, 59.61], andijon: [40.78, 72.34], bukhara: [39.77, 64.42], fargona: [40.39, 71.78],
  jizzakh: [40.12, 67.84], khorezm: [41.55, 60.63], namangan: [41.0, 71.67], navoi: [40.1, 65.37],
  qashqadaryo: [38.86, 65.79], samarkand: [39.65, 66.96], sirdaryo: [40.49, 68.78], surkhandaryo: [37.22, 67.28],
  tashkent_v: [41.0, 69.6], tashkent_s: [41.31, 69.28],
};
const TASH = ["tashkent_s", "tashkent_v"];
const sameRegion = (a: string | null, b: string | null) => !!a && !!b && (a === b || (TASH.includes(a) && TASH.includes(b)));

/** Подложка OpenStreetMap — один лёгкий слой; тёмная тема — тот же слой, затемнённый CSS-фильтром. */
function baseLayer(m: L.Map) {
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19, attribution: "© OpenStreetMap", updateWhenZooming: false, keepBuffer: 1,
  }).addTo(m);
}
const isDark = () => document.documentElement.dataset.theme !== "light";

const pin = (s: SpotPoint) => L.divIcon({
  className: "",
  html: `<div class="spot-pin s-${s.status}${s.mine ? " mine" : ""}"><i></i></div>`,
  iconSize: [30, 38], iconAnchor: [15, 36],
});

export function EcoMap({ focus, region, report, onClose }: {
  focus?: number | null; region: string | null; report?: boolean; onClose: () => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const fitted = useRef(false);
  const [all, setAll] = useState<SpotPoint[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<number | null>(focus ?? null);
  const [reporting, setReporting] = useState(!!report);

  // одна кнопка «назад» Telegram: форма → шторка → выход с карты
  const st = useRef({ open, reporting });
  st.current = { open, reporting };
  useEffect(() => useBackButton(true, () => {
    if (st.current.reporting) setReporting(false);
    else if (st.current.open !== null) setOpen(null);
    else onClose();
  }), []);

  const load = () => api.spots().then((r) => setAll(r.spots)).catch(() => setAll([]));

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const start = (region && CENTERS[region]) || [41.3, 64.6];
    const m = L.map(box.current!, { zoomControl: false, zoomSnap: 0.5 }).setView(start as L.LatLngTuple, region ? 10 : 6);
    baseLayer(m);
    L.control.zoom({ position: "bottomright" }).addTo(m);
    map.current = m;
    layer.current = L.layerGroup().addTo(m);
    load();
    return () => { m.remove(); document.body.style.overflow = ""; };
  }, []);

  const shown = (all ?? []).filter((s) => (filter === "all" ? true : filter === "mine" ? s.mine : s.status === filter));

  useEffect(() => {
    const m = map.current, g = layer.current;
    if (!m || !g || !all) return;
    g.clearLayers();
    shown.forEach((s) => L.marker([s.lat, s.lon], { icon: pin(s) }).on("click", () => { haptic("light"); setOpen(s.id); }).addTo(g));
    const pad = { paddingTopLeft: [24, 130] as L.PointTuple, paddingBottomRight: [24, 140] as L.PointTuple, maxZoom: 14 };
    const f = focus ? all.find((s) => s.id === focus) : null;
    if (f && !fitted.current) m.setView([f.lat, f.lon], 15);
    else if (filter !== "all" && shown.length) m.fitBounds(L.latLngBounds(shown.map((s) => [s.lat, s.lon] as L.LatLngTuple)), pad);
    else if (!fitted.current) {
      // первый раз: точки своего региона, если есть; иначе — остаёмся на своём регионе
      const mine = shown.filter((s) => sameRegion(s.region, region));
      if (mine.length) m.fitBounds(L.latLngBounds(mine.map((s) => [s.lat, s.lon] as L.LatLngTuple)), pad);
      else if (!region && shown.length) m.fitBounds(L.latLngBounds(shown.map((s) => [s.lat, s.lon] as L.LatLngTuple)), pad);
    }
    fitted.current = true;
  }, [all, filter]);

  const n = (s: SpotStatus) => (all ?? []).filter((x) => x.status === s).length;
  const chips: [Filter, string, number | null][] = [
    ["all", t("mapAll"), null], ["accepted", t("mapDirty"), n("accepted")], ["planned", t("mapPlanned"), n("planned")],
    ["cleaned", t("mapCleaned"), n("cleaned")], ["mine", t("mapMine"), (all ?? []).filter((s) => s.mine).length],
  ];

  return (
    <div class="ecomap">
      <div ref={box} class={`ecomap-map ${isDark() ? "dark" : ""}`} />
      <div class="ecomap-top">
        <div class="ecomap-head">
          <div>
            <b class="display">🗺 {t("mapTitle")}</b>
            <small>{t("mapHint")}</small>
          </div>
          <button class="ecomap-x tap" onClick={onClose} aria-label="close">✕</button>
        </div>
        <div class="ecomap-chips">
          {chips.map(([k, label, c]) => (
            <button key={k} class={`ecomap-chip tap f-${k} ${filter === k ? "on" : ""}`} onClick={() => { haptic("light"); setFilter(k); }}>
              {k !== "all" && k !== "mine" && <i />}{label}{c !== null && <span>{c}</span>}
            </button>
          ))}
        </div>
      </div>
      {!all && <div class="ecomap-empty"><span class="spin-sm" /></div>}
      {all && shown.length === 0 && <div class="ecomap-empty">{t("mapEmpty")}</div>}
      <div class="ecomap-bottom">
        <button class="btn btn-primary tap" onClick={() => { haptic("medium"); setReporting(true); }}>{t("mapReport")}</button>
        <small>{t("mapReportHint")}</small>
      </div>
      <SpotSheet id={open} onClose={() => setOpen(null)} />
      {reporting && (
        <ReportForm region={region} onClose={() => setReporting(false)}
          onDone={(id) => { load(); if (id) setTimeout(() => setOpen(id), 300); }} />
      )}
    </div>
  );
}

// ─────────────────── 📍 форма «Iflos joy» ───────────────────

/** Сжать фото на телефоне: длинная сторона ≤ 1600 px, JPEG — ~250 КБ вместо 3–8 МБ. */
function shrink(file: File, max = 1600): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement("canvas");
      c.width = Math.round(img.naturalWidth * k);
      c.height = Math.round(img.naturalHeight * k);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob((b) => (b ? resolve(b) : reject(new Error("blob"))), "image/jpeg", 0.82);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("image")); };
    img.src = url;
  });
}

interface Pic { key: string; preview: string; token: string | null; failed: boolean }
type Phase = "form" | "sending" | "ok" | "near" | "confirmed" | "not_uz" | "limit" | "error";

const SIZES = ["small", "medium", "large"] as const;
const KINDS = ["household", "plastic", "construction", "mixed"] as const;
const ACCESS = ["easy", "hard", "unknown"] as const;

function Chips({ items, value, on, prefix }: { items: readonly string[]; value: string | null; on: (v: string) => void; prefix: string }) {
  return (
    <div class="rp-chips">
      {items.map((v) => (
        <button key={v} class={`rp-chip tap ${value === v ? "on" : ""}`} onClick={() => { haptic("light"); on(v); }}>{t(`${prefix}_${v}` as Key)}</button>
      ))}
    </div>
  );
}

function ReportForm({ region, onClose, onDone }: { region: string | null; onClose: () => void; onDone: (id: number | null) => void }) {
  const [pics, setPics] = useState<Pic[]>([]);
  const [size, setSize] = useState<string | null>(null);
  const [kind, setKind] = useState<string | null>(null);
  const [access, setAccess] = useState<string>("easy");
  const [note, setNote] = useState("");
  const [placed, setPlaced] = useState(false);
  const [locating, setLocating] = useState(false);
  const [gpsFail, setGpsFail] = useState(false);
  const [phase, setPhase] = useState<Phase>("form");
  const [res, setRes] = useState<{ id?: number; status?: SpotStatus; n?: number }>({});
  const mapBox = useRef<HTMLDivElement>(null);
  const mini = useRef<L.Map | null>(null);
  const fileIn = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const start = (region && CENTERS[region]) || [41.31, 69.28];
    const m = L.map(mapBox.current!, { zoomControl: false, attributionControl: false }).setView(start as L.LatLngTuple, 12);
    baseLayer(m);
    m.on("dragstart zoomstart", () => setPlaced(true));
    mini.current = m;
    locate();                                  // сразу пробуем «где я» — обычно человек стоит у этого места
    return () => { m.remove(); };
  }, []);

  async function locate() {
    setLocating(true); setGpsFail(false);
    const p = await getLocation();
    setLocating(false);
    if (p && mini.current) { mini.current.setView([p.lat, p.lon], 17); setPlaced(true); haptic("light"); }
    else setGpsFail(true);
  }

  async function addFiles(list: FileList | null) {
    if (!list) return;
    const files = Array.from(list).slice(0, 5 - pics.length);
    for (const f of files) {
      const key = Math.random().toString(36).slice(2);
      const preview = URL.createObjectURL(f);
      setPics((p) => [...p, { key, preview, token: null, failed: false }]);
      try {
        const blob = await shrink(f);
        const { token } = await api.spotPhoto(blob);
        setPics((p) => p.map((x) => (x.key === key ? { ...x, token } : x)));
      } catch {
        setPics((p) => p.map((x) => (x.key === key ? { ...x, failed: true } : x)));
      }
    }
    if (fileIn.current) fileIn.current.value = "";
  }

  const tokens = pics.filter((p) => p.token).map((p) => p.token!);
  const uploading = pics.some((p) => !p.token && !p.failed);
  const ready = tokens.length > 0 && !uploading && placed && !!size && !!kind;

  async function send(force = false) {
    if (!ready || !mini.current) return;
    const c = mini.current.getCenter();
    setPhase("sending");
    try {
      const r = await api.spotCreate({ tokens, lat: c.lat, lon: c.lng, size: size!, kind: kind!, access, note: note.trim(), force });
      if (r.result === "ok" && r.spot) { setRes({ id: r.spot.id }); setPhase("ok"); haptic("success"); confetti(); onDone(null); }
      else if (r.result === "near" && r.spot) { setRes({ id: r.spot.id, status: r.spot.status }); setPhase("near"); }
      else if (r.result === "not_uz") setPhase("not_uz");
      else if (r.result === "limit") { setRes({ n: r.n }); setPhase("limit"); }
      else setPhase("error");
    } catch { setPhase("error"); }
  }

  async function confirmSame() {
    setPhase("sending");
    try { await api.spotConfirm(res.id!); setPhase("confirmed"); haptic("success"); onDone(null); }
    catch { setPhase("error"); }
  }

  const done = phase !== "form" && phase !== "sending";
  return (
    <div class="rp">
      <div class="rp-head">
        <b class="display">📍 {t("rpTitle")}</b>
        <button class="ecomap-x tap" onClick={onClose} aria-label="close">✕</button>
      </div>

      <div class="rp-body" style={{ display: done ? "none" : undefined }}>
        <section>
          <h3>1 · {t("rpPhotos")}</h3>
          <small class="muted">{t("rpPhotosHint")}</small>
          <div class="rp-pics">
            {pics.map((p) => (
              <div key={p.key} class={`rp-pic ${p.token ? "ok" : p.failed ? "bad" : "up"}`}>
                <img src={p.preview} alt="" />
                {!p.token && !p.failed && <span class="spin-sm" />}
                {p.failed && <span class="rp-pic-bad">!</span>}
                <button class="rp-pic-x" onClick={() => setPics((x) => x.filter((y) => y.key !== p.key))}>✕</button>
              </div>
            ))}
            {pics.length < 5 && (
              <button class="rp-add tap" onClick={() => fileIn.current?.click()}>
                <span>＋</span><small>{t("rpAdd")}</small>
              </button>
            )}
          </div>
          <input ref={fileIn} type="file" accept="image/*" multiple hidden onChange={(e) => addFiles((e.target as HTMLInputElement).files)} />
        </section>

        <section>
          <h3>2 · {t("rpLocation")}</h3>
          <div class="rp-map">
            <div ref={mapBox} class={`rp-map-box ${isDark() ? "dark" : ""}`} />
            <div class="rp-crosshair" aria-hidden="true"><div class="spot-pin s-accepted"><i /></div></div>
            <button class="rp-gps tap" onClick={locate} disabled={locating}>{locating ? t("rpLocating") : `📍 ${t("rpMyLoc")}`}</button>
          </div>
          <small class="muted">{gpsFail ? t("rpNoGps") : t("rpLocationHint")}</small>
        </section>

        <section>
          <h3>3 · {t("rpSize")}</h3>
          <Chips items={SIZES} value={size} on={setSize} prefix="sz" />
          <h3>4 · {t("rpKind")}</h3>
          <Chips items={KINDS} value={kind} on={setKind} prefix="kd" />
          <h3>5 · {t("rpAccess")}</h3>
          <Chips items={ACCESS} value={access} on={setAccess} prefix="ac" />
          <h3>6 · {t("rpNote")}</h3>
          <textarea class="rp-note" rows={2} maxLength={500} placeholder={t("rpNotePh")} value={note}
            onInput={(e) => setNote((e.target as HTMLTextAreaElement).value)} />
        </section>
      </div>

      {!done && (
        <div class="rp-foot">
          {!ready && phase === "form" && <small class="muted">{uploading ? t("rpUploading") : t("rpNeed")}</small>}
          <button class="btn btn-primary tap" disabled={!ready || phase === "sending"} onClick={() => send(false)}>
            {phase === "sending" ? t("rpSending") : `✅ ${t("rpSend")}`}
          </button>
        </div>
      )}

      {done && (
        <div class="rp-result">
          {phase === "ok" && (<><div class="rp-emoji">🙌</div><b class="display">{t("rpOkTitle")}</b><p>{t("rpOkText", { id: res.id! })}</p></>)}
          {phase === "confirmed" && (<><div class="rp-emoji">👍</div><b class="display">{t("rpOkTitle")}</b><p>{t("rpConfirmed")}</p></>)}
          {phase === "near" && (
            <>
              <div class="rp-emoji">👀</div><b class="display">{t("rpNearTitle")}</b>
              <p>{t("rpNearText", { id: res.id!, status: t(`sp_${res.status}` as Key) })}</p>
              <button class="btn btn-primary tap" onClick={confirmSame}>👍 {t("rpSame")}</button>
              <button class="btn btn-ghost tap" onClick={() => send(true)}>➕ {t("rpOther")}</button>
            </>
          )}
          {phase === "not_uz" && (<><div class="rp-emoji">🌍</div><p>{t("rpNotUz")}</p><button class="btn btn-ghost tap" onClick={() => setPhase("form")}>{t("rpRetry")}</button></>)}
          {phase === "limit" && (<><div class="rp-emoji">⏳</div><p>{t("rpLimit", { n: res.n ?? 3 })}</p></>)}
          {phase === "error" && (<><div class="rp-emoji">📡</div><p>{t("rpError")}</p><button class="btn btn-primary tap" onClick={() => setPhase("form")}>{t("rpRetry")}</button></>)}
          {phase !== "near" && <button class="btn btn-ghost tap" onClick={onClose}>{t("rpBack")}</button>}
        </div>
      )}
    </div>
  );
}

// ─────────────────── шторка места ───────────────────

function SpotSheet({ id, onClose }: { id: number | null; onClose: () => void }) {
  const [s, setS] = useState<SpotFull | null>(null);
  useEffect(() => {
    if (id === null) return;
    setS(null);
    api.spot(id).then(setS).catch(() => onClose());
  }, [id]);
  if (id === null) return null;
  const cleaned = s?.status === "cleaned" && s.after.length > 0;
  return (
    <div class="sheet-wrap" onClick={onClose}>
      <div class="sheet" onClick={(ev) => ev.stopPropagation()}>
        <div class="grab" />
        <div class="sheet-pad spot">
          {!s ? <div class="skel-list" /> : (
            <>
              <div class="row gap">
                <span class={`spot-status s-${s.status}`}>{t(`sp_${s.status}` as Key)}</span>
                {s.mine && <span class="spot-mine mono">★ {t("spotMine")}</span>}
              </div>
              <h2 class="sheet-title plain">#{s.id} · {s.region_label}</h2>
              {s.address && <div class="muted">🏠 {s.address}</div>}
              {cleaned ? (
                <div class="spot-ba">
                  <figure><img src={s.photos[0]} alt="" /><figcaption>{t("spotBefore")}</figcaption></figure>
                  <figure><img src={s.after[0]} alt="" /><figcaption class="after">{t("spotAfter")}</figcaption></figure>
                </div>
              ) : (
                <div class="spot-photos">{s.photos.map((p) => <img key={p} src={p} alt="" loading="lazy" />)}</div>
              )}
              <div class="spot-facts">
                <span>🗑 {t(`sz_${s.size}` as Key)}</span>
                <span>♻️ {t(`kd_${s.kind}` as Key)}</span>
                {s.confirms > 0 && <span>👍 {t("spotConfirms", { n: s.confirms + 1 })}</span>}
                <span>🕒 {t("spotReported", { d: fmt.dayMonth(new Date(s.created * 1000).toISOString()) })}</span>
              </div>
              {s.note && <div class="spot-note">✍️ {s.note}</div>}
              {s.event && (
                <div class="spot-event">
                  <span class="mono label-xs">{t("spotEvent")}</span>
                  <b>{s.event.title}</b>
                  <small class="muted">{fmt.dayMonth(s.event.date)}{!s.event.active && ` · ${t("spotSoon")}`}</small>
                </div>
              )}
              <button class="btn btn-ghost tap" onClick={() => openLink(s.maps.google)}>🧭 {t("spotMaps")}</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
