import { useState } from "preact/hooks";
import type { EventItem } from "../types";
import { t, fmt } from "../i18n";
import { EventCard, Empty, Icon, Sheet, StatusPill, seatsInfo } from "../ui";
import { api } from "../api";
import { haptic, openLink } from "../tg";

export function Events({ events, onOpen }: { events: EventItem[]; onOpen: (e: EventItem) => void }) {
  return (
    <div class="screen">
      <h1 class="title">{t("tabEvents")}</h1>
      {events.length ? (
        <div class="list">{events.map((e) => <EventCard key={e.id} e={e} onOpen={() => onOpen(e)} />)}</div>
      ) : (
        <Empty icon="🗓" title={t("noEvents")} text={t("noEventsHint")} />
      )}
    </div>
  );
}

type JoinState = "idle" | "loading" | "done" | "subscribe" | "gone" | "full";

export function EventSheet({ e, onClose, onJoined, onShowQr }: {
  e: EventItem | null;
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

  return (
    <Sheet open onClose={close}>
      {e.photo && <img class="sheet-img" src={e.photo} alt="" />}
      <div class="sheet-body">
        <StatusPill e={e} />
        <h2 class="sheet-title">{e.title}</h2>
        <div class="facts">
          <div><Icon.cal /><span>{fmt.full(e.date)}</span></div>
          <div><Icon.clock /><span>{fmt.time(e.date)}</span></div>
          <div><Icon.pin /><span>{e.location} · {e.region_label}</span></div>
          <div><Icon.users /><span>{t("spots", { n: s.reg, max: e.max })}</span></div>
        </div>
        <div class="bar big"><i style={{ width: `${s.pct}%` }} /></div>
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
