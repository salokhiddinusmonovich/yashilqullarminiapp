import { useEffect, useState } from "preact/hooks";
import type { ComponentType, JSX } from "preact";
import type { Bootstrap, EventItem, Lang } from "./types";
import { api, cachedBootstrap, login } from "./api";
import { setLang, t } from "./i18n";
import { haptic, openLink, tg } from "./tg";
import { Icon } from "./ui";
import { Home } from "./screens/Home";
import { Events, EventSheet } from "./screens/Events";
import { Profile, QR, Top } from "./screens/Others";
import { Scan } from "./screens/Scan";
import { ProfileSheet } from "./screens/People";
import { Shop } from "./screens/Shop";
import { WhatsNew } from "./screens/WhatsNew";
import { ImpactSheet } from "./screens/Impact";
import { Wrapped } from "./screens/Wrapped";
import { markWhatsNewSeen, shouldShowWhatsNew } from "./version";
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
  const [profileId, setProfileId] = useState<number | null>(null);
  const [shopOpen, setShopOpen] = useState(false);
  const [wnOpen, setWnOpen] = useState(false);
  const [impactId, setImpactId] = useState<number | null>(null);
  const [wrOpen, setWrOpen] = useState(false);
  // 🗺 эко-карта грузится отдельным файлом (Leaflet) — только когда её открыли
  const [MapView, setMapView] = useState<ComponentType<{ focus?: number | null; region: string | null; report?: boolean; onClose: () => void }> | null>(null);
  const [mapFocus, setMapFocus] = useState<number | null>(null);
  const [mapReport, setMapReport] = useState(false);
  function openMap(focus: number | null = null, report = false) {
    setMapFocus(focus);
    setMapReport(report);
    import("./screens/EcoMap").then((m) => setMapView(() => m.EcoMap)).catch(() => {});
  }

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
    // После обновления приложения — один раз показать «Что нового»
    if (fresh && shouldShowWhatsNew()) setTimeout(() => setWnOpen(true), 700);
    // Ссылка из бота «открыть мероприятие»: ...?event=42
    if (fresh) {
      const raw = new URLSearchParams(location.search).get("event") || tg?.initDataUnsafe.start_param?.replace("event_", "");
      const ev = raw ? d.events.find((e) => e.id === Number(raw)) : undefined;
      if (ev) setSheet(ev);
      // из бота: «📸 Rasmlarni ko'rish» (?impact=42) и «🎁 Hikoyani ochish» (?wrapped=1)
      const qs = new URLSearchParams(location.search);
      const sp = tg?.initDataUnsafe.start_param || "";
      const imp = qs.get("impact") || (sp.startsWith("impact_") ? sp.slice(7) : null);
      if (imp) setImpactId(Number(imp));
      if ((qs.get("wrapped") || sp === "wrapped") && d.wrapped) setWrOpen(true);
      // «🗺 Eko-xaritada ko'rish» из бота: ?spot=12 или ?map=1
      const spot = qs.get("spot") || (sp.startsWith("spot_") ? sp.slice(5) : null);
      if (spot || qs.get("map") || sp === "map") openMap(spot ? Number(spot) : null);
      if (qs.get("report") || sp === "report") openMap(null, true);
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
  // Сканер: основатель — все регионы, остальные — только свой (сервер проверяет так же)
  // 👑 is_admin — все регионы и прошедшие мероприятия (сервер проверяет так же)
  const scanRegion = data.user.role !== "Founder" && !data.user.is_admin && data.user.region ? data.user.region_label : null;
  const closeWn = () => { setWnOpen(false); markWhatsNewSeen(); };

  if (shopOpen) {
    return <div class="app"><Shop data={data} onClose={() => setShopOpen(false)} /><WhatsNew open={wnOpen} onClose={closeWn} /></div>;
  }
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
        {tab === "home" && <Home data={data} onOpenEvent={setSheet} onGo={go} onShop={() => { haptic("light"); setShopOpen(true); }}
          onImpact={(id) => { haptic("light"); setImpactId(id); }} onWrapped={() => { haptic("medium"); setWrOpen(true); }}
          onMap={(report) => { haptic("light"); openMap(null, report); }} />}
        {tab === "events" && <Events events={data.events} userRegion={data.user.region} onOpen={setSheet} />}
        {tab === "qr" && <QR data={data} />}
        {tab === "scan" && staff && <Scan regionLabel={scanRegion} admin={data.user.is_admin} />}
        {tab === "top" && <Top onOpenProfile={setProfileId} />}
        {tab === "profile" && <Profile data={data} onLang={changeLang} onData={(d) => apply(d)} onShop={() => setShopOpen(true)} onWhatsNew={() => setWnOpen(true)} onImpact={setImpactId} />}
      </main>

      <nav class="tabbar">
        {tabs.map((x) => (
          <button key={x.id} class={`tab tap ${tab === x.id ? "on" : ""} ${x.center ? "center" : ""}`} onClick={() => go(x.id)}>
            <span class="tab-ico"><x.icon /></span>
            <span class="tab-label">{x.label}</span>
          </button>
        ))}
      </nav>

      <ProfileSheet id={profileId} onClose={() => setProfileId(null)} />
      <ImpactSheet id={impactId} onClose={() => setImpactId(null)} />
      {MapView && <MapView focus={mapFocus} region={data.user.region} report={mapReport} onClose={() => setMapView(null)} />}
      {wrOpen && <Wrapped onClose={() => setWrOpen(false)} shareLink={data.referral?.link ?? `https://t.me/${data.bot_username}`} />}
      <WhatsNew open={wnOpen} onClose={closeWn} />
      <EventSheet key={sheet?.id} e={sheet} bot={data.bot_username} userRegion={data.user.region} onClose={() => setSheet(null)} onJoined={onJoined} onShowQr={() => go("qr")} />
    </div>
  );
}

function Splash() {
  return (
    <div class="splash">
      <div class="splash-logo"><img src="/logo.jpg" alt="" /></div>
      <div class="splash-name display">Yashil Qo'llar</div>
      <div class="mono label-xs">{t("passport").toUpperCase()}</div>
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
