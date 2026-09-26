import { useEffect, useState } from "preact/hooks";
import type { JSX } from "preact";
import type { Bootstrap, EventItem, Lang } from "./types";
import { api, cachedBootstrap, login } from "./api";
import { setLang, t } from "./i18n";
import { haptic, openLink, tg } from "./tg";
import { Icon } from "./ui";
import { Home } from "./screens/Home";
import { Events, EventSheet } from "./screens/Events";
import { Profile, QR, Top } from "./screens/Others";
import { Scan } from "./screens/Scan";
import { DEV_DATA } from "./dev";

type Tab = "home" | "events" | "qr" | "scan" | "top" | "profile";
type Status = "loading" | "ready" | "unregistered" | "error" | "outside";

export default function App() {
  // Мгновенный старт: показываем прошлые данные из кэша, свежие подменят их через ~300 мс
  const [data, setData] = useState<Bootstrap | null>(() => {
    const c = cachedBootstrap();
    if (c) setLang(c.user.lang);
    return c;
  });
  const [status, setStatus] = useState<Status>(data ? "ready" : "loading");
  const [tab, setTab] = useState<Tab>("home");
  const [sheet, setSheet] = useState<EventItem | null>(null);
  const [bot, setBot] = useState("yashilqollarbot");

  async function load() {
    if (!tg) {
      if (import.meta.env.DEV) { apply(DEV_DATA); return; }
      setStatus("outside");
      return;
    }
    const r = await login();
    if (r.kind === "ok") apply(r.data, true);
    else if (r.kind === "unregistered") { setBot(r.bot); setStatus("unregistered"); }
    else if (!data) setStatus("error");
  }

  function apply(d: Bootstrap, fresh = false) {
    setLang(d.user.lang);
    setData(d);
    setStatus("ready");
    // Ссылка из бота «открыть мероприятие»: ...?event=42
    if (fresh) {
      const raw = new URLSearchParams(location.search).get("event") || tg?.initDataUnsafe.start_param?.replace("event_", "");
      const ev = raw ? d.events.find((e) => e.id === Number(raw)) : undefined;
      if (ev) setSheet(ev);
    }
  }

  useEffect(() => { load(); }, []);

  function go(next: Tab) {
    if (next === tab) return;
    haptic("light");
    setTab(next);
    window.scrollTo({ top: 0 });
  }

  function onJoined(ev: EventItem) {
    setData((d) => d && { ...d, events: d.events.map((e) => (e.id === ev.id ? ev : e)) });
    setSheet(ev);
    api.bootstrap().then((d) => apply(d)).catch(() => {});
  }

  async function changeLang(l: Lang) {
    setLang(l);
    setData((d) => d && { ...d, user: { ...d.user, lang: l } });
    try { apply(await api.setLang(l)); } catch { /* */ }
  }

  if (status === "loading") return <Splash />;
  if (status === "outside") return <Message icon="📱" title={t("onlyTelegram")} />;
  if (status === "error") {
    return <Message icon="📡" title={t("errTitle")} text={t("errText")} action={[t("retry"), () => { setStatus("loading"); load(); }]} />;
  }
  if (status === "unregistered" || !data) {
    return <Message icon="🌱" title={t("unregTitle")} text={t("unregText")} action={[t("openBot"), () => openLink(`https://t.me/${bot}?start=`)]} />;
  }

  const staff = data.user.is_staff;
  const tabs: { id: Tab; label: string; icon: () => JSX.Element; center?: boolean }[] = [
    { id: "home", label: t("tabHome"), icon: Icon.home },
    { id: "events", label: t("tabEvents"), icon: Icon.cal },
    staff
      ? { id: "scan", label: t("tabScan"), icon: Icon.scan, center: true }
      : { id: "qr", label: t("tabQr"), icon: Icon.qr, center: true },
    { id: "top", label: t("tabTop"), icon: Icon.trophy },
    { id: "profile", label: t("tabProfile"), icon: Icon.user },
  ];

  return (
    <div class="app">
      <main key={tab} class="fade">
        {tab === "home" && <Home data={data} onOpenEvent={setSheet} onGo={go} />}
        {tab === "events" && <Events events={data.events} onOpen={setSheet} />}
        {tab === "qr" && <QR data={data} />}
        {tab === "scan" && staff && <Scan />}
        {tab === "top" && <Top />}
        {tab === "profile" && <Profile data={data} onLang={changeLang} />}
      </main>

      <nav class="tabbar">
        {tabs.map((x) => (
          <button key={x.id} class={`tab tap ${tab === x.id ? "on" : ""} ${x.center ? "center" : ""}`} onClick={() => go(x.id)}>
            <span class="tab-ico"><x.icon /></span>
            <span class="tab-label">{x.label}</span>
          </button>
        ))}
      </nav>

      <EventSheet key={sheet?.id} e={sheet} onClose={() => setSheet(null)} onJoined={onJoined} onShowQr={() => go("qr")} />
    </div>
  );
}

function Splash() {
  return (
    <div class="splash">
      <div class="splash-logo"><Icon.leaf /></div>
      <div class="splash-name">Yashil Qo'llar</div>
    </div>
  );
}

function Message({ icon, title, text, action }: { icon: string; title: string; text?: string; action?: [string, () => void] }) {
  return (
    <div class="splash">
      <div class="big-emoji">{icon}</div>
      <div class="msg-title">{title}</div>
      {text && <div class="muted center">{text}</div>}
      {action && <button class="btn btn-primary tap" onClick={action[1]}>{action[0]}</button>}
    </div>
  );
}
