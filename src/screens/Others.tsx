import { useEffect, useState } from "preact/hooks";
import type { Bootstrap, Lang, Top as TopData } from "../types";
import { t, LANG_LABELS } from "../i18n";
import { api } from "../api";
import { Avatar, Empty, Icon, Seg, SecHead, Stamp } from "../ui";
import { getThemePref, haptic, openLink, setThemePref, share, type ThemePref } from "../tg";
import { badgesFor, tilt } from "../fx";
import { PassportCard } from "./Home";
import { EditProfile, PasswordSheet } from "./ProfileEdit";

const QR_KEY = "yq_qr_v1";

// ─────────────────── QR — посадочный талон ───────────────────

export function QR({ data }: { data: Bootstrap }) {
  // QR у человека не меняется — кэшируем SVG, чтобы на мероприятии
  // (где интернет часто плохой) код открывался мгновенно и офлайн.
  const cacheKey = `${QR_KEY}:${data.user.tg_id}`;
  const [svg, setSvg] = useState<string | null>(() => localStorage.getItem(cacheKey));
  const next = data.events.find((e) => e.my_status === "approved");

  useEffect(() => {
    if (svg) return;
    api.qrSvg().then((s) => {
      setSvg(s);
      try { localStorage.setItem(cacheKey, s); } catch { /* */ }
    }).catch(() => {});
  }, []);

  return (
    <div class="screen qr-screen">
      <div class="pass">
        <div class="pass-top">
          <span class="mono label-xs">{t("passTitle").toUpperCase()} · YASHIL QO'LLAR</span>
          <div class="pass-person">
            <Avatar src={data.user.photo} name={data.user.fullname} size={44} />
            <div>
              <b>{data.user.fullname}</b>
              <div class="mono small">№ {String(data.user.id).padStart(6, "0")} · {data.user.balance} {t("points")}</div>
            </div>
          </div>
          {next && (
            <div class="pass-grid mono">
              <div><small>{t("tabEvents").toUpperCase()}</small><b>{next.title}</b></div>
              <div><small>{t("dateLbl").toUpperCase()}</small><b>{new Date(next.date).getDate()}.{String(new Date(next.date).getMonth() + 1).padStart(2, "0")}</b></div>
            </div>
          )}
        </div>
        <div class="perf light" />
        <div class="pass-qr">
          {svg ? <div class="qr-svg" dangerouslySetInnerHTML={{ __html: svg }} /> : <div class="qr-skel" />}
        </div>
        <div class="pass-foot">
          <b>{t("qrTitle")}</b>
          <span>{t("qrHint")}</span>
        </div>
      </div>
      <div class="tip">{t("qrTip")}</div>
    </div>
  );
}

// ─────────────────── Рейтинг — табло ───────────────────

export function Top() {
  const [d, setD] = useState<TopData | null>(null);
  useEffect(() => { api.top().then(setD).catch(() => {}); }, []);

  if (!d) return <div class="screen"><h1 class="title">{t("topTitle")}</h1><div class="skel-list" /></div>;

  return (
    <div class="screen">
      <h1 class="title">{t("topTitle")}</h1>
      <div class="podium">
        {[d.top[1], d.top[0], d.top[2]].map((p, i) => p && (
          <div class={`pod pod-${[2, 1, 3][i]}`} key={p.id}>
            <Avatar src={p.photo} name={p.fullname} size={[58, 72, 58][i]} />
            <span class="medal" style={{ transform: `rotate(${tilt(i + 1, 10)})` }}>{[2, 1, 3][i]}</span>
            <div class="pod-name">{p.me ? t("you") : p.fullname.split(" ")[0]}</div>
            <div class="pod-pts mono">{p.balance}</div>
          </div>
        ))}
      </div>
      <div class="board-list">
        {d.top.slice(3).map((p, i) => (
          <div class={`board-row ${p.me ? "me" : ""}`} key={p.id}>
            <span class="board-place mono">{String(i + 4).padStart(2, "0")}</span>
            <Avatar src={p.photo} name={p.fullname} size={34} />
            <span class="lname">{p.me ? `${p.fullname} · ${t("you")}` : p.fullname}</span>
            <b class="mono">{p.balance}</b>
          </div>
        ))}
      </div>
      <div class="myplace">
        <span class="mono label-xs">{t("myPlace").toUpperCase()}</span>
        <b class="display">#{d.my_place}</b>
        <span class="mono">{d.my_balance} {t("points")}</span>
      </div>
    </div>
  );
}

// ─────────────────── Профиль — паспорт ───────────────────

export function Profile({ data, onLang, onData }: {
  data: Bootstrap; onLang: (l: Lang) => void; onData: (d: Bootstrap) => void;
}) {
  const { user, history } = data;
  const [theme, setTheme] = useState<ThemePref>(getThemePref());
  const [editing, setEditing] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const badges = badgesFor(data);
  const site = "https://yashilqollar.uz";

  return (
    <div class="screen">
      <div class="title-row">
        <h1 class="title">{t("tabProfile")}</h1>
        <button class="btn btn-line small-btn tap" onClick={() => setEditing(true)}><Icon.edit />{t("edit")}</button>
      </div>

      <PassportCard data={data} onGo={() => setEditing(true)} />

      <SecHead n="01" title={t("stamps")} action={<span class="mono small muted">{history.length}</span>} />
      {history.length ? (
        <div class="stamps">
          {history.map((h, i) => <Stamp key={h.id} title={h.title} date={h.date} seed={h.id + i} />)}
        </div>
      ) : (
        <Empty title={t("stampsEmpty")} />
      )}

      <SecHead n="02" title={t("badges")} action={<span class="mono small muted">{badges.filter((b) => b.done).length}/{badges.length}</span>} />
      <div class="patches">
        {badges.map((b, i) => (
          <div key={b.id} class={`patch big ${b.done ? "done" : ""}`} style={{ transform: `rotate(${tilt(i + 7, 5)})` }}>
            <span class="patch-ico">{b.icon}</span>
            <b class="patch-name">{t(b.name)}</b>
            <small>{t(b.desc)}</small>
            {!b.done && b.progress && <span class="mono patch-prog">{b.progress[0]}/{b.progress[1]}</span>}
          </div>
        ))}
      </div>

      <SecHead n="03" title={t("accounts")} />
      <div class="accounts">
        <div class="acc">
          <span class="acc-ico tg"><Icon.send /></span>
          <div class="acc-text">
            <b>Telegram</b>
            <small>{user.username ? `@${user.username}` : `ID ${user.tg_id}`}</small>
          </div>
          <span class="tag tag-ok"><Icon.check />{t("connected")}</span>
        </div>

        <div class="acc">
          <span class="acc-ico site"><Icon.globe /></span>
          <div class="acc-text">
            <b>{t("accSite")}</b>
            <small>
              {user.email && user.has_password ? t("accSiteOn", { email: user.email })
                : user.email ? t("accSiteNoPw") : t("accSiteNoEmail")}
            </small>
            <small class="muted">{t("accSiteTg")}</small>
          </div>
          {user.email && user.has_password
            ? <span class="tag tag-ok"><Icon.check />{t("connected")}</span>
            : <span class="tag tag-muted">{t("notConnected")}</span>}
        </div>
        <div class="acc-actions">
          {!user.email && <button class="btn btn-line tap" onClick={() => setEditing(true)}>{t("addEmail")}</button>}
          {user.email && (
            <button class="btn btn-line tap" onClick={() => setPwOpen(true)}>
              <Icon.lock />{user.has_password ? t("changePw") : t("setPw")}
            </button>
          )}
          <button class="btn btn-line tap" onClick={() => openLink(site)}><Icon.globe />{t("openSite")}</button>
        </div>

        {user.auth_provider === "google" && (
          <div class="acc">
            <span class="acc-ico google">G</span>
            <div class="acc-text"><b>Google</b><small>{user.email}</small></div>
            <span class="tag tag-ok"><Icon.check />{t("connected")}</span>
          </div>
        )}
      </div>

      <SecHead n="04" title={t("theme")} />
      <Seg<ThemePref>
        value={theme}
        onChange={(v) => { haptic("light"); setTheme(v); setThemePref(v); }}
        options={[["dark", t("themeDark")], ["light", t("themeLight")], ["auto", t("themeAuto")]]}
      />

      <SecHead n="05" title={t("language")} />
      <Seg<Lang>
        value={user.lang}
        onChange={(l) => { haptic("light"); onLang(l); }}
        options={(Object.keys(LANG_LABELS) as Lang[]).map((l) => [l, LANG_LABELS[l]])}
      />

      <div class="row gap wide">
        <button class="btn btn-line grow-btn tap" onClick={() => share(`https://t.me/${data.bot_username}`, t("inviteMsg"))}>
          <Icon.plane />{t("inviteBtn")}
        </button>
        <button class="btn btn-line grow-btn tap" onClick={() => openLink(`https://t.me/${data.bot_username}`)}>
          <Icon.send />{t("openBot")}
        </button>
      </div>

      <div class="credit">
        <span>Made with <i>♥</i> by</span>
        <b>Salokhiddin Usmonov</b>
        <small class="mono">YASHIL QO'LLAR · {new Date().getFullYear()}</small>
      </div>

      <EditProfile key={String(editing)} data={data} open={editing} onClose={() => setEditing(false)} onSaved={onData} />
      <PasswordSheet data={data} open={pwOpen} onClose={() => setPwOpen(false)} onSaved={onData} />
    </div>
  );
}
