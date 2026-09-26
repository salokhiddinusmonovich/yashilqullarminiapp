import { useEffect, useState } from "preact/hooks";
import type { Bootstrap, Lang, Top as TopData } from "../types";
import { t, fmt, LANG_LABELS } from "../i18n";
import { api } from "../api";
import { Avatar, Empty, Icon, Seg } from "../ui";
import { getThemePref, haptic, openLink, setThemePref, share, type ThemePref } from "../tg";
import { badgesFor, useCountUp } from "../fx";

const QR_KEY = "yq_qr_v1";

// ─────────────────── QR ───────────────────

export function QR({ data }: { data: Bootstrap }) {
  // QR у человека не меняется — кэшируем SVG, чтобы на мероприятии
  // (где интернет часто плохой) код открывался мгновенно и офлайн.
  const cacheKey = `${QR_KEY}:${data.user.tg_id}`;
  const [svg, setSvg] = useState<string | null>(() => localStorage.getItem(cacheKey));

  useEffect(() => {
    if (svg) return;
    api.qrSvg().then((s) => {
      setSvg(s);
      try { localStorage.setItem(cacheKey, s); } catch { /* */ }
    }).catch(() => {});
  }, []);

  return (
    <div class="screen qr-screen">
      <div class="aurora" aria-hidden="true"><i /><i /><i /></div>
      <div class="qr-card">
        <div class="qr-head">
          <Avatar src={data.user.photo} name={data.user.fullname} size={44} />
          <div>
            <b>{data.user.fullname}</b>
            <div class="muted small">{data.user.rank} · {data.user.balance} {t("points")}</div>
          </div>
        </div>
        <div class="qr-box">
          <span class="qr-corner tl" /><span class="qr-corner tr" /><span class="qr-corner bl" /><span class="qr-corner br" />
          {svg ? <div class="qr-svg" dangerouslySetInnerHTML={{ __html: svg }} /> : <div class="qr-skel" />}
        </div>
        <div class="qr-title">{t("qrTitle")}</div>
        <div class="muted center">{t("qrHint")}</div>
      </div>
      <div class="tip">💡 {t("qrTip")}</div>
    </div>
  );
}

// ─────────────────── Рейтинг ───────────────────

export function Top() {
  const [d, setD] = useState<TopData | null>(null);
  useEffect(() => { api.top().then(setD).catch(() => {}); }, []);

  if (!d) return <div class="screen"><h1 class="title">{t("topTitle")}</h1><div class="skel-list" /></div>;
  const [a, b, c] = d.top;
  const rest = d.top.slice(3);

  return (
    <div class="screen">
      <div class="aurora" aria-hidden="true"><i /><i /><i /></div>
      <h1 class="title">🏆 {t("topTitle")}</h1>
      <div class="podium">
        {[b, a, c].map((p, i) => p && (
          <div class={`pod pod-${[2, 1, 3][i]}`} key={p.id}>
            <div class="pod-crown">{["🥈", "👑", "🥉"][i]}</div>
            <Avatar src={p.photo} name={p.fullname} size={[56, 70, 56][i]} />
            <div class="pod-name">{p.me ? t("you") : p.fullname.split(" ")[0]}</div>
            <div class="pod-pts">{p.balance}</div>
            <div class="pod-step">{[2, 1, 3][i]}</div>
          </div>
        ))}
      </div>
      <div class="card list-card stagger">
        {rest.map((p, i) => (
          <div class={`lrow ${p.me ? "me" : ""}`} key={p.id}>
            <span class="lplace">{i + 4}</span>
            <Avatar src={p.photo} name={p.fullname} size={36} />
            <span class="lname">{p.me ? `${p.fullname} · ${t("you")}` : p.fullname}</span>
            <b class="lpts">{p.balance}</b>
          </div>
        ))}
      </div>
      <div class="myplace">
        <span>{t("myPlace")}</span>
        <b>#{d.my_place}</b>
        <span class="muted">{d.my_balance} {t("points")}</span>
      </div>
    </div>
  );
}

// ─────────────────── Профиль ───────────────────

export function Profile({ data, onLang }: { data: Bootstrap; onLang: (l: Lang) => void }) {
  const { user, history } = data;
  const [theme, setTheme] = useState<ThemePref>(getThemePref());
  const badges = badgesFor(data);
  const points = useCountUp(user.balance);

  return (
    <div class="screen">
      <div class="aurora" aria-hidden="true"><i /><i /><i /></div>
      <div class="profile-head">
        <div class="ring"><Avatar src={user.photo} name={user.fullname} size={92} /></div>
        <h1>{user.fullname}</h1>
        <div class="row gap center-x">
          <span class="pill pill-ok">{user.role_label}</span>
          {user.region_label && <span class="pill pill-muted"><Icon.pin />{user.region_label}</span>}
        </div>
      </div>

      <div class="stats">
        <div class="stat tone-a"><b>{points}</b><span>{t("points")}</span></div>
        <div class="stat tone-b"><b>{user.attended_count}</b><span>{t("tabEvents")}</span></div>
        <div class="stat tone-c"><b>{user.rank.split(" ")[0]}</b><span>{user.rank.split(" ").slice(1).join(" ")}</span></div>
      </div>

      <div class="sec-row">
        <h2 class="sec">🏅 {t("badges")}</h2>
        <span class="muted small">{t("badgesN", { n: badges.filter((b) => b.done).length, m: badges.length })}</span>
      </div>
      <div class="badges">
        {badges.map((b) => (
          <div key={b.id} class={`badge ${b.done ? "done" : ""}`}>
            <div class="badge-ico">{b.icon}</div>
            <b>{t(b.name)}</b>
            <small>{t(b.desc)}</small>
            {!b.done && b.progress && (
              <div class="bar"><i style={{ width: `${Math.round((b.progress[0] / b.progress[1]) * 100)}%` }} /></div>
            )}
          </div>
        ))}
      </div>

      <h2 class="sec">🎨 {t("theme")}</h2>
      <Seg<ThemePref>
        value={theme}
        onChange={(v) => { haptic("light"); setTheme(v); setThemePref(v); }}
        options={[["dark", `🌙 ${t("themeDark")}`], ["light", `☀️ ${t("themeLight")}`], ["auto", `⚙️ ${t("themeAuto")}`]]}
      />

      <h2 class="sec">🌐 {t("language")}</h2>
      <Seg<Lang>
        value={user.lang}
        onChange={(l) => { haptic("light"); onLang(l); }}
        options={(Object.keys(LANG_LABELS) as Lang[]).map((l) => [l, LANG_LABELS[l]])}
      />

      <h2 class="sec">📜 {t("history")}</h2>
      {history.length ? (
        <div class="card list-card">
          {history.map((h) => (
            <div class="lrow" key={h.id}>
              <span class="hist-ico"><Icon.check /></span>
              <span class="lname">{h.title}</span>
              <span class="muted small">{fmt.dayMonth(h.date)}</span>
            </div>
          ))}
        </div>
      ) : (
        <Empty icon="🌿" title={t("noHistory")} />
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

      <button class="btn btn-ghost wide tap" onClick={() => openLink(`https://t.me/${data.bot_username}`)}>
        <Icon.send />{t("openBot")}
      </button>
    </div>
  );
}
