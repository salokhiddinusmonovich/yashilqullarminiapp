import type { Bootstrap, EventItem } from "../types";
import { t, fmt, relDay } from "../i18n";
import { Avatar, EventCard, Flap, Icon, Empty, Name, Seal, SecHead } from "../ui";
import { openLink, share } from "../tg";
import { badgesFor, eventStyle, isFounder, sameRegion, tilt, useCountUp, useCountdown } from "../fx";

interface Props {
  data: Bootstrap;
  onOpenEvent: (e: EventItem) => void;
  onGo: (tab: "events" | "qr" | "scan" | "profile") => void;
}

/** То, что нужно паспорту, — есть и у меня (Bootstrap.user), и у чужого профиля. */
export interface PassportUser {
  id: number;
  fullname: string;
  photo: string | null;
  role: string;
  role_label: string;
  region_label: string | null;
  rank: string;
  balance: number;
  rank_next_at: number | null;
  attended_count: number;
}

/** Машиночитаемая строка, как внизу настоящего паспорта: YQ<UZB<<ISM<<FAMILIYA<<<… */
export function mrz(user: PassportUser) {
  const latin = (s: string) => s.toUpperCase().replace(/[^A-Z]+/g, "<");
  const [first = "", ...rest] = user.fullname.trim().split(/\s+/);
  const line1 = `YQ<UZB${latin(rest.join(" ") || first)}<<${latin(first)}`.padEnd(36, "<").slice(0, 36);
  const line2 = `${String(user.id).padStart(9, "0")}<${String(user.balance).padStart(4, "0")}<<${String(user.attended_count).padStart(3, "0")}`.padEnd(36, "<").slice(0, 36);
  return [line1, line2];
}

export function PassportCard({ user, onGo }: { user: PassportUser; onGo?: () => void }) {
  const points = useCountUp(user.balance);
  const prev = user.rank_next_at === 300 ? 150 : 0;
  const progress = user.rank_next_at ? ((user.balance - prev) / (user.rank_next_at - prev)) * 100 : 100;
  const [l1, l2] = mrz(user);
  const founder = isFounder(user.role);

  return (
    <section class={`passport ${founder ? "founder" : ""}`} onClick={onGo}>
      {founder && <div class="founder-ribbon mono">★ {t("founderLine")} ★</div>}
      <div class="pp-top">
        <Seal size={30} />
        <span class="mono">{t("passport").toUpperCase()}</span>
        <span class="mono pp-no">№ {String(user.id).padStart(6, "0")}</span>
      </div>
      <div class="pp-body">
        <div class="pp-photo"><Avatar src={user.photo} name={user.fullname} size={78} /></div>
        <div class="pp-id">
          <span class="mono label-xs">{t("fName")}</span>
          <b class="pp-name"><Name name={user.fullname} role={user.role} /></b>
          <span class="mono label-xs">{t("role")} · {t("region")}</span>
          <span class="pp-meta">{user.role_label}{user.region_label ? ` · ${user.region_label}` : ""}</span>
        </div>
        <span class="rank-stamp" style={{ transform: `rotate(${tilt(user.id, 8)})` }}>{founder ? t("founder") : user.rank}</span>
      </div>
      <div class="pp-points">
        <b class="display">{points}</b>
        <span class="mono">{t("points").toUpperCase()}</span>
      </div>
      <div class="ruler">
        <div class="ruler-fill" style={{ width: `${Math.max(3, Math.min(100, progress))}%` }} />
        <div class="ruler-ticks" />
      </div>
      <div class="pp-foot mono">
        <span>{user.rank_next_at ? t("rankLeft", { n: user.rank_next_at - user.balance }) : t("rankMax")}</span>
        <span>{t("attendedN", { n: user.attended_count })}</span>
      </div>
      <div class="mrz mono"><span>{l1}</span><span>{l2}</span></div>
    </section>
  );
}

export function Home({ data, onOpenEvent, onGo }: Props) {
  const { user, events, community } = data;
  const now = Date.now() - 6 * 3600e3;
  const next = events.find((e) => e.my_status && new Date(e.date).getTime() >= now);
  const open = events.filter((e) => !e.my_status && sameRegion(user.region, e.region)).slice(0, 6);
  const badges = badgesFor(data);
  const unlocked = badges.filter((b) => b.done).length;
  const first = user.fullname.split(" ")[0];

  return (
    <div class="screen home">
      <header class="hello">
        <span class="muted">{t("hello")}, <b class="hello-name">{first}</b></span>
        <span class="mono small muted">{fmt.dayMonth(new Date().toISOString())}</span>
      </header>

      <PassportCard user={user} onGo={() => onGo("profile")} />

      {user.is_staff && (
        <button class="duty tap" onClick={() => onGo("scan")}>
          <span class="duty-ico"><Icon.scan /></span>
          <span class="duty-text"><b>{t("scanTitle")}</b><small>{t("scanPopup")}</small></span>
          <Icon.chevron />
        </button>
      )}

      <SecHead n="01" title={t("nextEvent")} />
      {next ? <NextEvent e={next} onOpen={() => onOpenEvent(next)} onQr={() => onGo("qr")} /> : (
        <div class="card center">
          <Seal size={52} />
          <b>{t("noNext")}</b>
          <div class="muted">{t("noNextHint")}</div>
        </div>
      )}

      <SecHead
        n="02"
        title={t("upcoming")}
        action={events.length > 0 ? <button class="link tap" onClick={() => onGo("events")}>{t("seeAll")} →</button> : undefined}
      />
      {!user.region && <div class="card warn small">{t("noRegion")}</div>}
      {open.length ? (
        <div class="carousel">
          {open.map((e) => <EventCard key={e.id} e={e} compact onOpen={() => onOpenEvent(e)} />)}
        </div>
      ) : (
        !next && <Empty title={t("noEvents")} text={t("noEventsHint")} />
      )}

      <SecHead
        n="03"
        title={t("badges")}
        action={<button class="link tap" onClick={() => onGo("profile")}>{unlocked}/{badges.length}</button>}
      />
      <div class="patch-strip">
        {[...badges].sort((a, b) => Number(b.done) - Number(a.done)).map((b, i) => (
          <div key={b.id} class={`patch ${b.done ? "done" : ""}`} style={{ transform: `rotate(${tilt(i + 3, 6)})` }}>
            <span class="patch-ico">{b.icon}</span>
            <span class="patch-name">{t(b.name)}</span>
          </div>
        ))}
      </div>

      {community && (
        <>
          <SecHead n="04" title={t("community")} />
          <div class="ledger">
            <Ledger n={community.volunteers} label={t("cVol")} />
            <Ledger n={community.events} label={t("cEvents")} />
            <Ledger n={community.checkins} label={t("cCheck")} />
            <Ledger n={community.regions} label={t("cRegions")} />
          </div>
        </>
      )}

      <div class="postcard">
        <div class="postcard-stamp"><Seal size={34} /></div>
        <span class="mono label-xs">POSTCARD · OTKRITKA</span>
        <b class="postcard-title">{t("invite")}</b>
        <span class="muted">{t("inviteText")}</span>
        <button class="btn btn-ink tap" onClick={() => share(`https://t.me/${data.bot_username}`, t("inviteMsg"))}>
          <Icon.plane />{t("inviteBtn")}
        </button>
      </div>
    </div>
  );
}

function NextEvent({ e, onOpen, onQr }: { e: EventItem; onOpen: () => void; onQr: () => void }) {
  const cd = useCountdown(e.date);
  return (
    <div class="bigticket tap" style={eventStyle(e.id)} onClick={onOpen}>
      {e.photo && <img class="bigticket-photo" src={e.photo} alt="" />}
      <div class="bigticket-body">
        <div class="ticket-kicker">
          <span class="ticket-no">№ {String(e.id).padStart(4, "0")}</span>
          <span class="ticket-rel">{relDay(e.date) ?? fmt.dayMonthLong(e.date)}</span>
        </div>
        <div class="bigticket-title">{e.title}</div>
        <div class="meta">
          <span><Icon.clock />{fmt.weekdayTime(e.date)}</span>
          <span><Icon.pin />{e.location}</span>
        </div>
      </div>
      <div class="perf" />
      <div class="bigticket-board">
        {cd ? (
          <>
            <span class="mono label-xs">{t("startsIn").toUpperCase()}</span>
            <div class="board">
              {cd.d > 0 && <Flap value={cd.d} label={t("cdD")} />}
              <Flap value={cd.h} label={t("cdH")} />
              <Flap value={cd.m} label={t("cdM")} />
              <Flap value={cd.s} label={t("cdS")} />
            </div>
          </>
        ) : (
          <span class="live"><i />{t("live")}</span>
        )}
        <div class="row gap">
          <button class="btn btn-ink tap" onClick={(ev) => { ev.stopPropagation(); onQr(); }}><Icon.qr />{t("showQr")}</button>
          {e.chat_link && (
            <button class="btn btn-line tap" onClick={(ev) => { ev.stopPropagation(); openLink(e.chat_link!); }}>
              <Icon.send />{t("joinGroup")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Ledger({ n, label }: { n: number; label: string }) {
  const v = useCountUp(n, 1200);
  return (
    <div class="ledger-row">
      <b class="display">{v.toLocaleString("ru-RU")}</b>
      <span class="ledger-dots" />
      <span class="ledger-label">{label}</span>
    </div>
  );
}
