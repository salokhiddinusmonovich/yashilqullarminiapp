import type { Bootstrap, EventItem } from "../types";
import { t, fmt, relDay } from "../i18n";
import { Avatar, EventCard, Icon, Empty } from "../ui";
import { openLink } from "../tg";

interface Props {
  data: Bootstrap;
  onOpenEvent: (e: EventItem) => void;
  onGo: (tab: "events" | "qr" | "scan") => void;
}

export function Home({ data, onOpenEvent, onGo }: Props) {
  const { user, events } = data;
  const now = Date.now() - 6 * 3600e3;
  const mine = events.filter((e) => e.my_status && new Date(e.date).getTime() >= now);
  const next = mine[0];
  const open = events.filter((e) => !e.my_status).slice(0, 3);
  const first = user.fullname.split(" ")[0];

  const prevStep = user.rank_next_at === 300 ? 150 : 0;
  const progress = user.rank_next_at
    ? Math.round(((user.balance - prevStep) / (user.rank_next_at - prevStep)) * 100)
    : 100;

  return (
    <div class="screen">
      <header class="hello">
        <div>
          <div class="muted">{t("hello")},</div>
          <h1>{first} 👋</h1>
        </div>
        <Avatar src={user.photo} name={user.fullname} size={48} />
      </header>

      <section class="hero">
        <div class="hero-leaf" aria-hidden="true"><Icon.leaf /></div>
        <div class="hero-rank">{user.rank}</div>
        <div class="hero-points"><b>{user.balance}</b> {t("points")}</div>
        <div class="hero-bar"><i style={{ width: `${Math.max(4, Math.min(100, progress))}%` }} /></div>
        <div class="hero-foot">
          <span>{user.rank_next_at ? t("rankLeft", { n: user.rank_next_at - user.balance }) : t("rankMax")}</span>
          <span>{t("attendedN", { n: user.attended_count })}</span>
        </div>
      </section>

      {user.is_staff && (
        <button class="staff-cta tap" onClick={() => onGo("scan")}>
          <span class="staff-ico"><Icon.scan /></span>
          <span><b>{t("scanTitle")}</b><br /><small>{t("scanPopup")}</small></span>
          <Icon.chevron />
        </button>
      )}

      <h2 class="sec">{t("nextEvent")}</h2>
      {next ? (
        <div class="next tap" onClick={() => onOpenEvent(next)}>
          {next.photo && <img class="next-bg" src={next.photo} alt="" />}
          <div class="next-body">
            <span class="chip">{relDay(next.date) ?? fmt.dayMonthLong(next.date)}</span>
            <div class="next-title">{next.title}</div>
            <div class="meta light">
              <span><Icon.clock />{fmt.weekdayTime(next.date)}</span>
              <span><Icon.pin />{next.location}</span>
            </div>
            <div class="row gap">
              <button class="btn btn-light tap" onClick={(ev) => { ev.stopPropagation(); onGo("qr"); }}>
                <Icon.qr />{t("showQr")}
              </button>
              {next.chat_link && (
                <button class="btn btn-glass tap" onClick={(ev) => { ev.stopPropagation(); openLink(next.chat_link!); }}>
                  <Icon.send />{t("joinGroup")}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div class="card soft center">
          <div class="big-emoji">🌱</div>
          <b>{t("noNext")}</b>
          <div class="muted">{t("noNextHint")}</div>
        </div>
      )}

      <div class="sec-row">
        <h2 class="sec">{t("upcoming")}</h2>
        {events.length > 3 && <button class="link tap" onClick={() => onGo("events")}>{t("seeAll")}</button>}
      </div>
      {!user.region && <div class="card warn small">📍 {t("noRegion")}</div>}
      {open.length ? (
        <div class="list">{open.map((e) => <EventCard key={e.id} e={e} onOpen={() => onOpenEvent(e)} />)}</div>
      ) : (
        !next && <Empty icon="🗓" title={t("noEvents")} text={t("noEventsHint")} />
      )}
    </div>
  );
}
