import { useEffect, useState } from "preact/hooks";
import type { Bootstrap, Lang, Top as TopData } from "../types";
import { t, fmt, LANG_LABELS } from "../i18n";
import { api } from "../api";
import { Avatar, Empty, Icon } from "../ui";
import { haptic, openLink } from "../tg";

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
      <div class="qr-card">
        <div class="qr-head">
          <Avatar src={data.user.photo} name={data.user.fullname} size={40} />
          <div>
            <b>{data.user.fullname}</b>
            <div class="muted small">{data.user.rank}</div>
          </div>
        </div>
        <div class="qr-box">
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
      <h1 class="title">{t("topTitle")}</h1>
      <div class="podium">
        {[b, a, c].map((p, i) => p && (
          <div class={`pod pod-${[2, 1, 3][i]}`} key={p.id}>
            <Avatar src={p.photo} name={p.fullname} size={[52, 64, 52][i]} />
            <div class="pod-name">{p.me ? t("you") : p.fullname.split(" ")[0]}</div>
            <div class="pod-pts">{p.balance}</div>
            <div class="pod-step">{[2, 1, 3][i]}</div>
          </div>
        ))}
      </div>
      <div class="card list-card">
        {rest.map((p, i) => (
          <div class={`lrow ${p.me ? "me" : ""}`} key={p.id}>
            <span class="lplace">{i + 4}</span>
            <Avatar src={p.photo} name={p.fullname} size={34} />
            <span class="lname">{p.me ? `${p.fullname} · ${t("you")}` : p.fullname}</span>
            <b>{p.balance}</b>
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
  return (
    <div class="screen">
      <div class="profile-head">
        <Avatar src={user.photo} name={user.fullname} size={84} />
        <h1>{user.fullname}</h1>
        <div class="row gap center-x">
          <span class="pill pill-ok">{user.role_label}</span>
          {user.region_label && <span class="pill pill-muted"><Icon.pin />{user.region_label}</span>}
        </div>
      </div>

      <div class="stats">
        <div class="stat"><b>{user.balance}</b><span>{t("points")}</span></div>
        <div class="stat"><b>{user.attended_count}</b><span>{t("tabEvents")}</span></div>
        <div class="stat"><b>{user.rank.split(" ")[0]}</b><span>{user.rank.split(" ").slice(1).join(" ")}</span></div>
      </div>

      <h2 class="sec">{t("language")}</h2>
      <div class="seg">
        {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
          <button key={l} class={`tap ${user.lang === l ? "on" : ""}`} onClick={() => { haptic("light"); onLang(l); }}>
            {LANG_LABELS[l]}
          </button>
        ))}
      </div>

      <h2 class="sec">{t("history")}</h2>
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

      <button class="btn btn-ghost wide tap" onClick={() => openLink(`https://t.me/${data.bot_username}`)}>
        <Icon.send />{t("openBot")}
      </button>
    </div>
  );
}
