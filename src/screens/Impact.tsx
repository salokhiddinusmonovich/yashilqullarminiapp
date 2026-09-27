// 📊 Итоги мероприятий: «Mening hissam» на главной, шторка с итогами и фото, просмотр фото.
import { useEffect, useState } from "preact/hooks";
import type { ImpactEvent, MyImpact } from "../types";
import { fmt, t } from "../i18n";
import { api } from "../api";
import { Empty, SecHead, Sheet } from "../ui";
import { useBackButton } from "../tg";
import { useCountUp } from "../fx";

const num = (v: number) => (v < 10 ? String(Math.round(v * 10) / 10) : Math.round(v).toLocaleString("ru-RU"));

function Stat({ v, label, tone }: { v: number; label: string; tone: string }) {
  const n = useCountUp(Math.round(v * 10), 1100) / 10;
  return (
    <div class="imp-stat" style={{ "--tone": `var(--${tone})` } as Record<string, string>}>
      <b class="display">{v ? `≈${num(n)}` : "0"}</b>
      <span>{label}</span>
    </div>
  );
}

/** Главная: моя доля (кг / мешки / саженцы) + лента фото с моих мероприятий. */
export function ImpactCard({ impact, onOpen }: { impact: MyImpact; onOpen: (eventId: number) => void }) {
  const has = impact.events > 0;
  const stats = ([["kg", impact.kg, t("impKg"), "leaf"], ["trees", impact.trees, t("impTrees"), "sun"], ["bags", impact.bags, t("impBags"), "sky"]] as const)
    .filter(([k, v]) => v > 0 || k === "kg");
  return (
    <>
      <SecHead n="✦" title={t("impTitle")} />
      <div class="imp-card">
        {has ? (
          <>
            <div class="imp-stats">{stats.map(([k, v, label, tone]) => <Stat key={k} v={v} label={label} tone={tone} />)}</div>
            <small class="muted">{t("impHint", { n: impact.events })}</small>
          </>
        ) : (
          <div class="imp-empty"><span>🌍</span><small class="muted">{t("impEmpty")}</small></div>
        )}
        {impact.photos.length > 0 && (
          <div class="imp-strip">
            {impact.photos.map((p) => (
              <button key={p.url} class="imp-thumb tap" onClick={() => onOpen(p.event)} aria-label={p.title}>
                <img src={p.url} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/** Шторка «Итоги мероприятия»: вместе / моя доля / все фото. */
export function ImpactSheet({ id, onClose }: { id: number | null; onClose: () => void }) {
  const [d, setD] = useState<ImpactEvent | null>(null);
  const [failed, setFailed] = useState(false);
  const [photo, setPhoto] = useState<number | null>(null);

  useEffect(() => {
    if (id === null) return;
    setD(null); setFailed(false); setPhoto(null);
    api.impact(id).then(setD).catch(() => setFailed(true));
  }, [id]);

  const rows = d ? ([["kg", t("impKg")], ["bags", t("impBags")], ["trees", t("impTrees")]] as const).filter(([k]) => d[k] > 0) : [];

  return (
    <>
      <Sheet open={id !== null && photo === null} onClose={onClose}>
        <div class="sheet-pad">
          {failed && <Empty title={t("notFound")} />}
          {!d && !failed && <div class="skel-list" />}
          {d && (
            <>
              <span class="mono label-xs">{t("impEvTitle")} · {fmt.dayMonth(d.date)} · {d.region_label}</span>
              <h2 class="sheet-title plain">{d.title}</h2>
              <div class="imp-cols">
                <div class="imp-col">
                  <span class="mono label-xs">{t("impTogether")}</span>
                  {rows.map(([k, label]) => <div key={k} class="imp-line"><b class="display">{num(d[k])}</b><span>{label}</span></div>)}
                  <small class="muted">{t("impPeople", { n: d.attended })}</small>
                </div>
                {d.mine && (
                  <div class="imp-col mine">
                    <span class="mono label-xs">{t("impMine")}</span>
                    {rows.map(([k, label]) => <div key={k} class="imp-line"><b class="display">≈{num(d.mine![k])}</b><span>{label}</span></div>)}
                  </div>
                )}
              </div>
              {d.photos.length ? (
                <div class="imp-grid">
                  {d.photos.map((p, i) => (
                    <button key={p} class="tap" onClick={() => setPhoto(i)}><img src={p} alt="" loading="lazy" /></button>
                  ))}
                </div>
              ) : <div class="muted small center">{t("impNoPhotos")}</div>}
            </>
          )}
        </div>
      </Sheet>
      {d && photo !== null && <Viewer photos={d.photos} start={photo} onClose={() => setPhoto(null)} />}
    </>
  );
}

/** Фото на весь экран: тап справа/слева — следующее/предыдущее, «назад» — закрыть. */
function Viewer({ photos, start, onClose }: { photos: string[]; start: number; onClose: () => void }) {
  const [i, setI] = useState(start);
  useEffect(() => useBackButton(true, onClose), []);
  function tap(ev: MouseEvent) {
    const left = ev.clientX < window.innerWidth / 3;
    const next = i + (left ? -1 : 1);
    if (next < 0 || next >= photos.length) onClose();
    else setI(next);
  }
  return (
    <div class="viewer" onClick={tap}>
      <img key={photos[i]} src={photos[i]} alt="" />
      <span class="viewer-n mono">{i + 1} / {photos.length}</span>
      <button class="viewer-x" onClick={(e) => { e.stopPropagation(); onClose(); }}>✕</button>
    </div>
  );
}
