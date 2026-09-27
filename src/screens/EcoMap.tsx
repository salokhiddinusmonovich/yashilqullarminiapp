// 🗺 Эко-карта: места, о которых сообщили волонтёры («📍 Iflos joy» в боте), и что с ними стало.
// Красные — грязно, жёлтые — назначено мероприятие, зелёные — убрано; свои непроверенные — серые.
// Грузится отдельным файлом (Leaflet ~40 КБ) — только когда карту открыли.
import { useEffect, useRef, useState } from "preact/hooks";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { SpotFull, SpotPoint, SpotStatus } from "../types";
import { fmt, t, type Key } from "../i18n";
import { api } from "../api";
import { haptic, openLink, useBackButton } from "../tg";

type Filter = "all" | "accepted" | "planned" | "cleaned" | "mine";
const UZ_CENTER: L.LatLngExpression = [41.4, 64.6];

// Подложка Esri — без ключа. Тёмная тема: тёмно-серая основа + слой с названиями; светлая — обычная карта улиц.
const ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services/";
const tileLayers = () => document.documentElement.dataset.theme === "light"
  ? [`${ESRI}World_Street_Map/MapServer/tile/{z}/{y}/{x}`]
  : [`${ESRI}Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`, `${ESRI}Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}`];

const pin = (s: SpotPoint) => L.divIcon({
  className: "",
  html: `<div class="spot-pin s-${s.status}${s.mine ? " mine" : ""}"><i></i></div>`,
  iconSize: [30, 38], iconAnchor: [15, 36],
});

export function EcoMap({ bot, focus, onClose }: { bot: string; focus?: number | null; onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const [all, setAll] = useState<SpotPoint[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<number | null>(focus ?? null);

  // одна кнопка «назад» Telegram: открыта шторка — закрыть её, иначе — выйти с карты
  const openRef = useRef(open);
  openRef.current = open;
  useEffect(() => useBackButton(true, () => (openRef.current !== null ? setOpen(null) : onClose())), []);
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const m = L.map(box.current!, { zoomControl: false, attributionControl: true, zoomSnap: 0.25 }).setView(UZ_CENTER, 5.5);
    tileLayers().forEach((u, i) => L.tileLayer(u, { maxZoom: 18, attribution: i ? "" : "Tiles © Esri" }).addTo(m));
    L.control.zoom({ position: "bottomright" }).addTo(m);
    map.current = m;
    layer.current = L.layerGroup().addTo(m);
    api.spots().then((r) => setAll(r.spots)).catch(() => setAll([]));
    return () => { m.remove(); document.body.style.overflow = ""; };
  }, []);

  const shown = (all ?? []).filter((s) =>
    filter === "all" ? true : filter === "mine" ? s.mine : s.status === filter);

  useEffect(() => {
    const m = map.current, g = layer.current;
    if (!m || !g || !all) return;
    g.clearLayers();
    shown.forEach((s) => {
      L.marker([s.lat, s.lon], { icon: pin(s) }).on("click", () => { haptic("light"); setOpen(s.id); }).addTo(g);
    });
    const f = focus ? all.find((s) => s.id === focus) : null;
    if (f) m.setView([f.lat, f.lon], 15);
    else if (shown.length) m.fitBounds(L.latLngBounds(shown.map((s) => [s.lat, s.lon] as [number, number])),
      { maxZoom: 13, paddingTopLeft: [24, 130], paddingBottomRight: [24, 130] });   // сверху фильтры, снизу кнопка
  }, [all, filter]);

  const n = (st: SpotStatus) => (all ?? []).filter((s) => s.status === st).length;
  const chips: [Filter, string, number | null][] = [
    ["all", t("mapAll"), null], ["accepted", t("mapDirty"), n("accepted")], ["planned", t("mapPlanned"), n("planned")],
    ["cleaned", t("mapCleaned"), n("cleaned")], ["mine", t("mapMine"), (all ?? []).filter((s) => s.mine).length],
  ];

  return (
    <div class="ecomap">
      <div ref={box} class="ecomap-map" />
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
      {all && shown.length === 0 && <div class="ecomap-empty">{t("mapEmpty")}</div>}
      <div class="ecomap-bottom">
        <button class="btn btn-primary tap" onClick={() => openLink(`https://t.me/${bot}?start=spot`)}>{t("mapReport")}</button>
        <small>{t("mapReportHint")}</small>
      </div>
      <SpotSheet id={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function SpotSheet({ id, onClose }: { id: number | null; onClose: () => void }) {
  const [s, setS] = useState<SpotFull | null>(null);
  useEffect(() => {
    if (id === null) return;
    setS(null);
    api.spot(id).then(setS).catch(() => onClose());
  }, [id]);
  const cleaned = s?.status === "cleaned" && s.after.length > 0;
  return (
    id === null ? null : (
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
    )
  );
}
