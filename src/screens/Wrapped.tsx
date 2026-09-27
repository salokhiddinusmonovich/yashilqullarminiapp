// 🎁 Yashil Qo'llar Wrapped — итоги года историями (как Spotify Wrapped):
// слайды листаются сами, тап слева — назад, справа — вперёд, удержание — пауза.
// Последний слайд — картинка 1080×1920 с сервера и кнопки «в сторис / сохранить / отправить».
import { useEffect, useRef, useState } from "preact/hooks";
import type { WrappedData } from "../types";
import { fmt, getLang, t } from "../i18n";
import { api } from "../api";
import { canStory, haptic, saveFile, share, shareStory, useBackButton } from "../tg";
import { confetti, useCountUp } from "../fx";
import { Icon } from "../ui";

const SLIDE_MS = 5200;
const MONTHS: Record<string, string[]> = {
  uz: ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"],
  ru: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};
const SEASON_EMOJI = { kuz: "🍂", qish: "❄️", bahor: "🌸", yoz: "☀️" } as const;
const num = (v: number) => (v < 10 ? String(Math.round(v * 10) / 10) : Math.round(v).toLocaleString("ru-RU"));

type Kind = "intro" | "events" | "zero" | "impact" | "months" | "season" | "top" | "together" | "share";

function slidesFor(d: WrappedData): Kind[] {
  if (!d.events) return ["intro", "zero", "together", "share"];
  const k: Kind[] = ["intro", "events"];
  if (d.share.events > 0 && (d.share.kg || d.share.trees || d.share.bags)) k.push("impact");
  k.push("months");
  if (d.season) k.push("season");
  if (d.top_pct && (d.region_total ?? 0) >= 5) k.push("top");
  k.push("together", "share");
  return k;
}

export function WrappedBanner({ year, preview, onOpen }: { year: number; preview: boolean; onOpen: () => void }) {
  return (
    <button class="wr-banner tap" onClick={onOpen}>
      <span class="wr-banner-gift" aria-hidden="true">🎁</span>
      <span class="wr-banner-text">
        <b>{t("wrBanner", { y: year })}</b>
        <small>{preview ? t("wrPreview") : t("wrBannerText")}</small>
      </span>
      <Icon.chevron />
    </button>
  );
}

export function Wrapped({ onClose, shareLink }: { onClose: () => void; shareLink: string }) {
  const [d, setD] = useState<WrappedData | null>(null);
  const [failed, setFailed] = useState(false);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(0);

  useEffect(() => useBackButton(true, onClose), []);
  useEffect(() => {
    document.body.style.overflow = "hidden";
    api.wrapped().then(setD).catch(() => setFailed(true));
    return () => { document.body.style.overflow = ""; };
  }, []);

  const slides = d ? slidesFor(d) : [];
  const last = slides.length - 1;

  useEffect(() => {
    if (!d || paused || i >= last) return;
    timer.current = window.setTimeout(() => setI((x) => Math.min(x + 1, last)), SLIDE_MS);
    return () => clearTimeout(timer.current);
  }, [d, i, paused]);
  useEffect(() => { if (d && i === last) confetti(); }, [i, d]);

  function tap(ev: MouseEvent) {
    if ((ev.target as HTMLElement).closest("button")) return;
    haptic("light");
    if (ev.clientX < window.innerWidth / 3) setI((x) => Math.max(0, x - 1));
    else if (i < last) setI(i + 1);
  }

  if (failed) {
    return (
      <div class="wr wr-intro" onClick={onClose}>
        <div class="wr-body"><div class="wr-emoji">🎁</div><p class="wr-sub">{t("errText")}</p></div>
      </div>
    );
  }
  if (!d) return <div class="wr wr-intro"><div class="wr-body"><div class="wr-spin" /></div></div>;

  const kind = slides[i];
  return (
    <div class={`wr wr-k-${kind} ${d.season && kind === "season" ? `wr-season-${d.season}` : ""}`}
      onClick={tap} onPointerDown={() => setPaused(true)} onPointerUp={() => setPaused(false)} onPointerCancel={() => setPaused(false)}>
      <div class="wr-bars">
        {slides.map((_, k) => (
          <i key={k}><b class={k < i ? "done" : k === i ? (paused ? "run paused" : "run") : ""} style={{ animationDuration: `${SLIDE_MS}ms` }} /></i>
        ))}
      </div>
      <button class="wr-x" onClick={onClose} aria-label="close">✕</button>
      <div class="wr-body" key={i}>
        <Slide kind={kind} d={d} shareLink={shareLink} />
      </div>
      {i === 0 && <div class="wr-hint mono">{t("wrTap")} →</div>}
    </div>
  );
}

function Big({ v, suffix = "" }: { v: number; suffix?: string }) {
  const n = useCountUp(Math.round(v * 10), 1400) / 10;
  return <div class="wr-big display">{num(n)}{suffix}</div>;
}

function Slide({ kind, d, shareLink }: { kind: Kind; d: WrappedData; shareLink: string }) {
  const lang = getLang();
  const first = d.name.split(" ")[0];
  switch (kind) {
    case "intro":
      return (
        <>
          <span class="wr-kicker mono">YASHIL QO'LLAR · WRAPPED</span>
          <div class="wr-year display">{d.year}</div>
          <p class="wr-sub">{t("wrHi", { name: first, y: d.year })}</p>
        </>
      );
    case "events":
      return (
        <>
          <Big v={d.events} />
          <p class="wr-sub">{t("wrEvents")}</p>
          {d.first && <p class="wr-note">{t("wrFirst", { t: d.first.title, d: fmt.dayMonth(d.first.date) })}</p>}
          {d.titles.length > 1 && <div class="wr-tags">{d.titles.slice(-4).map((x) => <span key={x}>{x}</span>)}</div>}
        </>
      );
    case "zero":
      return (<><div class="wr-emoji">🌱</div><p class="wr-sub">{t("wrZero")}</p></>);
    case "impact": {
      const rows = ([["kg", t("impKg")], ["trees", t("impTrees")], ["bags", t("impBags")]] as const).filter(([k]) => d.share[k] > 0);
      return (
        <>
          <span class="wr-kicker mono">{t("wrImpact").toUpperCase()}</span>
          {rows.map(([k, label]) => (
            <div key={k} class="wr-row"><Big v={d.share[k]} /><span>{label}</span></div>
          ))}
          <p class="wr-note">{t("impHint", { n: d.share.events })}</p>
        </>
      );
    }
    case "months":
      return (
        <>
          <span class="wr-kicker mono">{t("wrMonths").toUpperCase()}</span>
          <div class="wr-months">
            {MONTHS[lang].map((m, k) => <span key={m} class={d.months.includes(k + 1) ? "on" : ""} style={{ animationDelay: `${k * 70}ms` }}>{m}</span>)}
          </div>
          {d.streak >= 2 && <p class="wr-sub">🔥 {t("wrStreak", { n: d.streak })}</p>}
        </>
      );
    case "season":
      return (
        <>
          <span class="wr-kicker mono">{t("wrSeason").toUpperCase()}</span>
          <div class="wr-emoji big">{SEASON_EMOJI[d.season!]}</div>
          <div class="wr-title display">{t(`s_${d.season!}` as "s_kuz")}</div>
        </>
      );
    case "top":
      return (
        <>
          <span class="wr-kicker mono">{t("wrAmong", { region: d.region_label ?? "" }).toUpperCase()}</span>
          <div class="wr-big top display">TOP {d.top_pct}%</div>
          <p class="wr-sub">{t("wrPlace", { n: d.place ?? 0, total: d.region_total ?? 0 })}</p>
        </>
      );
    case "together":
      return (
        <>
          <span class="wr-kicker mono">{t("wrTogether", { y: d.year }).toUpperCase()}</span>
          <div class="wr-row"><Big v={d.community.volunteers} /><span>{t("wrVol")}</span></div>
          <div class="wr-row"><Big v={d.community.events} /><span>{t("impEvents")}</span></div>
          {d.community.kg > 0 && <div class="wr-row"><Big v={d.community.kg} /><span>{t("impKg")}</span></div>}
          {d.community.trees > 0 && <div class="wr-row"><Big v={d.community.trees} /><span>{t("impTrees")}</span></div>}
        </>
      );
    case "share": {
      const text = t("wrShareText", { y: d.year });
      return (
        <div class="wr-share">
          <span class="wr-kicker mono">{t("wrShareTitle").toUpperCase()}</span>
          <img class="wr-img" src={d.image} alt="" />
          {canStory() && <button class="btn btn-primary tap" onClick={() => shareStory(d.image, text)}>📲 {t("wrStory")}</button>}
          <button class="btn btn-ghost wr-btn tap" onClick={() => saveFile(d.image, `YashilQollar_${d.year}.jpg`)}>⬇️ {t("wrSave")}</button>
          <button class="btn btn-ghost wr-btn tap" onClick={() => share(shareLink, text)}><Icon.plane />{t("wrSend")}</button>
          <small class="wr-note">{t("wrSaveHint")}</small>
        </div>
      );
    }
  }
}
