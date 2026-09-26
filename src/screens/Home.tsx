import type { Bootstrap, EventItem } from "../types";
import { t, fmt, relDay } from "../i18n";
import { Avatar, EventCard, Icon, Empty } from "../ui";
import { openLink, share } from "../tg";
import { badgesFor, eventStyle, useCountUp, useCountdown } from "../fx";

interface Props {
  data: Bootstrap;
  onOpenEvent: (e: EventItem) => void;
  onGo: (tab: "events" | "qr" | "scan" | "profile") => void;
}

export function Home({ data, onOpenEvent, onGo }: Props) {
  const { user, events, community } = data;
  const now = Date.now() - 6 * 3600e3;
  const mine = events.filter((e) => e.my_status && new Date(e.date).getTime() >= now);
  const next = mine[0];
  const open = events.filter((e) => !e.my_status).slice(0, 6);
  const first = user.fullname.split(" ")[0];
  const points = useCountUp(user.balance);
  const badges = badgesFor(data);
  const unlocked = badges.filter((b) => b.done).length;

  const prevStep = user.rank_next_at === 300 ? 150 : 0;
  const progress = user.rank_next_at
    ? Math.round(((user.balance - prevStep) / (user.rank_next_at - prevStep)) * 100)
    : 100;

  return (
    <div class="screen home">
      <div class="aurora" aria-hidden="true"><i /><i /><i /></div>

      <header class="hello">
        <div>
          <div class="muted">{t("hello")},</div>
          <h1>{first} <span class="wave">👋</span></h1>
        </div>
        <button class="tap" onClick={() => onGo("profile")}>
          <Avatar src={user.photo} name={user.fullname} size={50} />
        </button>
      </header>

      <section class="hero">
        <div class="hero-glow" />
        <div class="hero-top">
          <span class="hero-rank">{user.rank}</span>
          <span class="hero-badges">🏅 {unlocked}/{badges.length}</span>
        </div>
        <div class="hero-points"><b>{points}</b><span>{t("points")}</span></div>
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
      {next ? <NextEvent e={next} onOpen={() => onOpenEvent(next)} onQr={() => onGo("qr")} /> : (
        <div class="card glass center">
          <div class="big-emoji">🌱</div>
          <b>{t("noNext")}</b>
          <div class="muted">{t("noNextHint")}</div>
        </div>
      )}

      <div class="sec-row">
        <h2 class="sec">{t("upcoming")}</h2>
        {events.length > 0 && <button class="link tap" onClick={() => onGo("events")}>{t("seeAll")} →</button>}
      </div>
      {!user.region && <div class="card warn small">📍 {t("noRegion")}</div>}
      {open.length ? (
        <div class="carousel">
          {open.map((e) => <EventCard key={e.id} e={e} compact onOpen={() => onOpenEvent(e)} />)}
        </div>
      ) : (
        !next && <Empty icon="🗓" title={t("noEvents")} text={t("noEventsHint")} />
      )}

      <div class="sec-row">
        <h2 class="sec">{t("badges")}</h2>
        <button class="link tap" onClick={() => onGo("profile")}>{t("badgesN", { n: unlocked, m: badges.length })}</button>
      </div>
      <div class="badge-strip">
        {[...badges].sort((a, b) => Number(b.done) - Number(a.done)).map((b) => (
          <div key={b.id} class={`bchip ${b.done ? "done" : ""}`}>
            <span class="bchip-ico">{b.icon}</span>
            <span>{t(b.name)}</span>
          </div>
        ))}
      </div>

      {community && (
        <>
          <h2 class="sec">🌍 {t("community")}</h2>
          <div class="impact">
            <Impact n={community.volunteers} label={t("cVol")} tone="a" />
            <Impact n={community.events} label={t("cEvents")} tone="b" />
            <Impact n={community.checkins} label={t("cCheck")} tone="c" />
            <Impact n={community.regions} label={t("cRegions")} tone="d" />
          </div>
        </>
      )}

      <div class="invite">
        <div>
          <b>{t("invite")}</b>
          <div class="small">{t("inviteText")}</div>
        </div>
        <button class="btn btn-white tap" onClick={() => share(`https://t.me/${data.bot_username}`, t("inviteMsg"))}>
          {t("inviteBtn")}
        </button>
      </div>
    </div>
  );
}

function NextEvent({ e, onOpen, onQr }: { e: EventItem; onOpen: () => void; onQr: () => void }) {
  const cd = useCountdown(e.date);
  return (
    <div class="next tap" style={eventStyle(e.id)} onClick={onOpen}>
      {e.photo && <img class="next-bg" src={e.photo} alt="" />}
      <div class="next-body">
        <span class="chip">{relDay(e.date) ?? fmt.dayMonthLong(e.date)}</span>
        <div class="next-title">{e.title}</div>
        <div class="meta light">
          <span><Icon.clock />{fmt.weekdayTime(e.date)}</span>
          <span><Icon.pin />{e.location}</span>
        </div>
        {cd ? (
          <div class="countdown">
            <span class="cd-label">{t("startsIn")}</span>
            <div class="cd-boxes">
              {cd.d > 0 && <div><b>{cd.d}</b><small>{t("cdD")}</small></div>}
              <div><b>{String(cd.h).padStart(2, "0")}</b><small>{t("cdH")}</small></div>
              <div><b>{String(cd.m).padStart(2, "0")}</b><small>{t("cdM")}</small></div>
              <div><b>{String(cd.s).padStart(2, "0")}</b><small>{t("cdS")}</small></div>
            </div>
          </div>
        ) : (
          <span class="live"><i />{t("live")}</span>
        )}
        <div class="row gap">
          <button class="btn btn-white tap" onClick={(ev) => { ev.stopPropagation(); onQr(); }}>
            <Icon.qr />{t("showQr")}
          </button>
          {e.chat_link && (
            <button class="btn btn-glass tap" onClick={(ev) => { ev.stopPropagation(); openLink(e.chat_link!); }}>
              <Icon.send />{t("joinGroup")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Impact({ n, label, tone }: { n: number; label: string; tone: string }) {
  const v = useCountUp(n, 1200);
  return (
    <div class={`impact-tile tone-${tone}`}>
      <b>{v.toLocaleString("ru-RU")}</b>
      <span>{label}</span>
    </div>
  );
}
