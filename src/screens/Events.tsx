import { useEffect, useState } from "preact/hooks";
import type { EventItem } from "../types";
import { t, fmt } from "../i18n";
import { EventCard, Empty, Icon, Seg, Sheet, StatusPill, seatsInfo } from "../ui";
import { api } from "../api";
import { haptic, openLink, share } from "../tg";
import { confetti, eventStyle } from "../fx";

type Filter = "mine" | "all" | "joined";

export function Events({ events, onOpen }: { events: EventItem[]; onOpen: (e: EventItem) => void }) {
  const [filter, setFilter] = useState<Filter>("mine");
  const [all, setAll] = useState<EventItem[] | null>(null);

  // «Все регионы» грузим только когда их действительно открыли
  useEffect(() => {
    if (filter === "all" && !all) api.allEvents().then((r) => setAll(r.events)).catch(() => setAll([]));
  }, [filter]);

  const list =
    filter === "mine" ? events
    : filter === "joined" ? events.filter((e) => e.my_status)
    : all;

  return (
    <div class="screen">
      <h1 class="title">{t("tabEvents")}</h1>
      <Seg<Filter>
        value={filter}
        onChange={(v) => { haptic("light"); setFilter(v); }}
        options={[["mine", t("filterMine")], ["all", t("filterAll")], ["joined", t("filterJoined")]]}
      />
      <div class="gap-y" />
      {list === null ? (
        <div class="skel-list" />
      ) : list.length ? (
        <div class="list stagger">
          {list.map((e) => <EventCard key={e.id} e={e} showRegion={filter === "all"} onOpen={() => onOpen(e)} />)}
        </div>
      ) : (
        <Empty
          icon={filter === "joined" ? "📝" : "🗓"}
          title={filter === "joined" ? t("noJoined") : t("noEvents")}
          text={filter === "joined" ? t("noNextHint") : t("noEventsHint")}
        />
      )}
    </div>
  );
}

type JoinState = "idle" | "loading" | "done" | "subscribe" | "gone" | "full";

export function EventSheet({ e, bot, onClose, onJoined, onShowQr }: {
  e: EventItem | null;
  bot: string;
  onClose: () => void;
  onJoined: (e: EventItem) => void;
  onShowQr: () => void;
}) {
  const [state, setState] = useState<JoinState>("idle");
  const [channel, setChannel] = useState("yashilqollar");

  if (!e) return <Sheet open={false} onClose={onClose}>{null}</Sheet>;
  const s = seatsInfo(e);

  async function join() {
    if (!e) return;
    setState("loading");
    haptic("medium");
    try {
      const r = await api.join(e.id);
      if (r.result === "ok" || r.result === "already") {
        haptic("success");
        confetti();
        setState("done");
        if (r.event) onJoined(r.event);
      } else {
        haptic("warning");
        if (r.channel) setChannel(r.channel);
        setState(r.result);
      }
    } catch {
      haptic("error");
      setState("idle");
    }
  }

  const close = () => { setState("idle"); onClose(); };
  const joined = !!e.my_status || state === "done";
  const link = `https://t.me/${bot}?startapp=event_${e.id}`;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${e.location}, ${e.region_label}, Uzbekistan`)}`;

  return (
    <Sheet open onClose={close}>
      <div class="sheet-hero" style={eventStyle(e.id)}>
        {e.photo ? <img src={e.photo} alt="" /> : <div class="ecard-ph big"><Icon.leaf /></div>}
        <div class="ecard-shade" />
        <div class="sheet-hero-text">
          <StatusPill e={e} />
          <h2 class="sheet-title">{e.title}</h2>
        </div>
      </div>
      <div class="sheet-body">
        <div class="facts">
          <div><span class="fact-ico"><Icon.cal /></span><span>{fmt.full(e.date)}</span></div>
          <div><span class="fact-ico"><Icon.clock /></span><span>{fmt.time(e.date)}</span></div>
          <div><span class="fact-ico"><Icon.pin /></span><span>{e.location} · {e.region_label}</span></div>
          <div>
            <span class="fact-ico"><Icon.users /></span>
            <span class="grow">{t("spots", { n: s.reg, max: e.max })}<div class="bar"><i style={{ width: `${s.pct}%` }} /></div></span>
          </div>
        </div>

        <div class="quick">
          <button class="tap" onClick={() => share(link, t("shareText", { title: e.title }))}><Icon.send />{t("share")}</button>
          <button class="tap" onClick={() => openLink(mapUrl)}><Icon.pin />{t("map")}</button>
        </div>

        {e.description && <p class="desc">{e.description}</p>}

        {state === "done" && (
          <div class="notice ok"><b>{t("joinedOk")}</b><div>{t("joinedHint")}</div></div>
        )}
        {state === "subscribe" && (
          <div class="notice warn">
            <b>{t("subscribeFirst")}</b>
            <button class="btn btn-ghost tap" onClick={() => { openLink(`https://t.me/${channel}`); setState("idle"); }}>
              {t("openChannel")}
            </button>
          </div>
        )}
        {state === "gone" && <div class="notice warn">{t("gone")}</div>}
        {state === "full" && <div class="notice warn">{t("fullErr")}</div>}

        {joined && <div class="muted small cert">{t("certHint")}</div>}
      </div>

      <div class="sheet-actions">
        {joined ? (
          <>
            <button class="btn btn-primary tap" onClick={() => { close(); onShowQr(); }}><Icon.qr />{t("showQr")}</button>
            {e.chat_link && (
              <button class="btn btn-ghost tap" onClick={() => openLink(e.chat_link!)}><Icon.send />{t("joinGroup")}</button>
            )}
          </>
        ) : (
          <button class="btn btn-primary tap" disabled={s.full || state === "loading"} onClick={join}>
            {state === "loading" ? <span class="spin" /> : <Icon.check />}
            {state === "loading" ? t("registering") : s.full ? t("full") : t("register")}
          </button>
        )}
      </div>
    </Sheet>
  );
}
