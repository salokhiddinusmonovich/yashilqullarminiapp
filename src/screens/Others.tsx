import { useEffect, useState } from "preact/hooks";
import type { Bootstrap, Lang, RegionRow, TeamMember, Top as TopData } from "../types";
import { t, fmt, LANG_LABELS, type Key } from "../i18n";
import { api } from "../api";
import { Avatar, Empty, Icon, Name, Seg, SecHead, Stamp } from "../ui";
import { getThemePref, haptic, openLink, setThemePref, share, type ThemePref } from "../tg";
import { badgesFor, isFounder, tilt } from "../fx";
import { PassportCard } from "./Home";
import { APP_VERSION } from "../version";
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

// ─────────────────── Рейтинг и команда ───────────────────

type TopTab = "rating" | "team" | "regions";

export function Top({ onOpenProfile }: { onOpenProfile: (id: number) => void }) {
  const [tab, setTab] = useState<TopTab>("rating");
  const [d, setD] = useState<TopData | null>(null);
  const [team, setTeam] = useState<TeamMember[] | null>(null);
  const [regs, setRegs] = useState<{ regions: RegionRow[]; mine: string | null } | null>(null);

  useEffect(() => { api.top().then(setD).catch(() => {}); }, []);
  useEffect(() => {
    if (tab === "team" && !team) api.team().then((r) => setTeam(r.team)).catch(() => setTeam([]));
    if (tab === "regions" && !regs) api.regions().then(setRegs).catch(() => setRegs({ regions: [], mine: null }));
  }, [tab]);

  const open = (id: number) => { haptic("light"); onOpenProfile(id); };

  return (
    <div class="screen">
      <h1 class="title">{tab === "rating" ? t("topTitle") : tab === "team" ? t("tabTeam") : t("tabRegions")}</h1>
      <Seg<TopTab> value={tab} onChange={(v) => { haptic("light"); setTab(v); }}
        options={[["rating", t("tabRating")], ["regions", t("tabRegions")], ["team", t("tabTeam")]]} />
      <div class="gap-y" />

      {tab === "rating" && (!d ? <div class="skel-list" /> : (
        <>
          <div class="podium">
            {[d.top[1], d.top[0], d.top[2]].map((p, i) => p && (
              <button class={`pod pod-${[2, 1, 3][i]} tap`} key={p.id} onClick={() => open(p.id)}>
                <Avatar src={p.photo} name={p.fullname} size={[58, 72, 58][i]} />
                <span class="medal" style={{ transform: `rotate(${tilt(i + 1, 10)})` }}>{[2, 1, 3][i]}</span>
                <div class="pod-name"><Name name={p.me ? t("you") : p.fullname.split(" ")[0]} role={p.role} /></div>
                <div class="pod-pts mono">{p.balance}</div>
              </button>
            ))}
          </div>
          <div class="board-list">
            {d.top.slice(3).map((p, i) => (
              <button class={`board-row tap ${p.me ? "me" : ""}`} key={p.id} onClick={() => open(p.id)}>
                <span class="board-place mono">{String(i + 4).padStart(2, "0")}</span>
                <Avatar src={p.photo} name={p.fullname} size={34} />
                <span class="lname"><Name name={p.me ? `${p.fullname} · ${t("you")}` : p.fullname} role={p.role} /></span>
                <b class="mono">{p.balance}</b>
              </button>
            ))}
          </div>
          <div class="myplace">
            <span class="mono label-xs">{t("myPlace").toUpperCase()}</span>
            <b class="display">#{d.my_place}</b>
            <span class="mono">{d.my_balance} {t("points")}</span>
          </div>
        </>
      ))}

      {tab === "regions" && (!regs ? <div class="skel-list" /> : regs.regions.length === 0 ? <Empty title={t("notFound")} /> : (
        <>
          <p class="muted small team-hint">{t("regHint")}</p>
          <div class="regions">
            {regs.regions.map((r, i) => {
              const max = Math.max(1, regs.regions[0].month);
              return (
                <div key={r.key} class={`region-row ${r.key === regs.mine ? "me" : ""} ${i < 3 ? "top" + (i + 1) : ""}`}>
                  <span class="board-place mono">{i < 3 ? ["🥇", "🥈", "🥉"][i] : String(i + 1).padStart(2, "0")}</span>
                  <div class="region-main">
                    <b>{r.label}{r.key === regs.mine && <span class="region-mine mono">{t("regMine")}</span>}</b>
                    <div class="bar"><i style={{ width: `${Math.round((r.month / max) * 100)}%` }} /></div>
                    <small class="muted">{r.total} {t("regTotal")} · {r.volunteers} {t("regVols")}</small>
                  </div>
                  <div class="region-num"><b class="mono">{r.month}</b><small class="muted">{t("regMonth")}</small></div>
                </div>
              );
            })}
          </div>
        </>
      ))}

      {tab === "team" && (!team ? <div class="skel-list" /> : team.length === 0 ? <Empty title={t("teamEmpty")} /> : (
        <>
          <p class="muted small team-hint">{t("teamHint")}</p>
          <div class="team">
            {team.map((m) => (
              <button key={m.id} class={`member tap ${isFounder(m.role) ? "founder" : ""}`} onClick={() => open(m.id)}>
                <Avatar src={m.photo} name={m.fullname} size={52} />
                <div class="member-text">
                  <b><Name name={m.fullname} role={m.role} /></b>
                  <span class="mono small">{isFounder(m.role) ? t("founder") : m.role_label}</span>
                </div>
                <Icon.chevron />
              </button>
            ))}
          </div>
        </>
      ))}
    </div>
  );
}

// ─────────────────── Профиль — паспорт ───────────────────

export function Profile({ data, onLang, onData, onShop, onWhatsNew, onImpact }: {
  data: Bootstrap; onLang: (l: Lang) => void; onData: (d: Bootstrap) => void; onShop: () => void; onWhatsNew: () => void; onImpact?: (id: number) => void;
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

      <PassportCard user={user} onGo={() => setEditing(true)} />

      <SecHead n="01" title={t("stamps")} action={<span class="mono small muted">{history.length}</span>} />
      {history.length ? (
        <div class="stamps">
          {history.map((h, i) => h.has_impact && onImpact ? (
            <button key={h.id} class="stamp-btn tap" onClick={() => onImpact(h.id)} aria-label={t("impOpen")}>
              <Stamp title={h.title} date={h.date} seed={h.id + i} /><span class="stamp-imp mono">📊 {t("impOpen")}</span>
            </button>
          ) : <Stamp key={h.id} title={h.title} date={h.date} seed={h.id + i} />)}
        </div>
      ) : (
        <Empty title={t("stampsEmpty")} />
      )}

      <Certificates history={history} />
      {data.cv_url && (
        <button class="cvbtn tap" onClick={() => openLink(data.cv_url!)}>
          <span class="cvbtn-ico">📄</span>
          <span class="cvbtn-text"><b>{t("cvBtn")}</b><small>{t("cvHint")}</small></span>
          <Icon.chevron />
        </button>
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

      <button class="duty tap" onClick={onShop}>
        <span class="duty-ico">🛍</span>
        <span class="duty-text"><b>{t("shop")} <span class="beta-chip mono">{t("shopSoon")}</span></b><small>{t("shopTeaser")}</small></span>
        <Icon.chevron />
      </button>

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

      {data.referral && (
        <div class="refbox">
          <span class="refbox-ico">👥</span>
          <div>
            <b>{t("refTitle")}</b>
            <small>{t("refStats", { invited: data.referral.invited, joined: data.referral.joined, earned: data.referral.joined * data.referral.bonus })}</small>
            <small class="muted">{t("refHint", { bonus: data.referral.bonus })}</small>
          </div>
        </div>
      )}
      <div class="row gap wide">
        <button class="btn btn-line grow-btn tap" onClick={() => share(data.referral?.link ?? `https://t.me/${data.bot_username}`, t("inviteMsg"))}>
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
        <button class="ver tap mono" onClick={onWhatsNew}>v{APP_VERSION} · {t("whatsNew")} →</button>
      </div>

      <EditProfile key={String(editing)} data={data} open={editing} onClose={() => setEditing(false)} onSaved={onData} />
      <PasswordSheet data={data} open={pwOpen} onClose={() => setPwOpen(false)} onSaved={onData} />
    </div>
  );
}

/** Сезон по дате: «🍂 Kuz 2025», «❄️ Qish 2025–26» (декабрь — начало зимы следующего года). Как на сервере. */
function seasonOf(iso: string): { key: number; label: string } {
  const d = new Date(iso); const m = d.getMonth() + 1; const y = d.getFullYear();
  const s = m >= 3 && m <= 5 ? "bahor" : m >= 6 && m <= 8 ? "yoz" : m >= 9 && m <= 11 ? "kuz" : "qish";
  const emoji = { kuz: "🍂", qish: "❄️", bahor: "🌸", yoz: "☀️" }[s];
  if (s === "qish") { const start = m === 12 ? y : y - 1; return { key: start * 10 + 4, label: `${emoji} ${t("s_qish")} ${start}–${String(start + 1).slice(2)}` }; }
  return { key: y * 10 + { bahor: 1, yoz: 2, kuz: 3 }[s], label: `${emoji} ${t(`s_${s}` as Key)} ${y}` };
}

/** 🎓 Мои сертификаты: по сезонам, миниатюры, «Открыть» (PDF) и «Прислать в бот». */
function Certificates({ history }: { history: Bootstrap["history"] }) {
  const items = history.filter((h) => h.cert);
  const groups: { key: number; label: string; items: typeof items }[] = [];
  for (const h of [...items].sort((a, b) => +new Date(b.date) - +new Date(a.date))) {
    const s = seasonOf(h.date);
    const g = groups.find((x) => x.key === s.key);
    if (g) g.items.push(h); else groups.push({ ...s, items: [h] });
  }
  const [sent, setSent] = useState<Record<number, boolean>>({});
  async function send(pid: number) {
    haptic("light");
    try { await api.certSend(pid); setSent((x) => ({ ...x, [pid]: true })); haptic("success"); } catch { haptic("error"); }
  }
  return (
    <>
      <SecHead n="🎓" title={t("certs")} action={<span class="mono small muted">{items.length}</span>} />
      {items.length === 0 ? <Empty title={t("certNone")} /> : (
        <>
          {groups.map((g) => (
          <div key={g.key}>
          <div class="season-head"><b>{g.label}</b><span class="mono small muted">{g.items.length}</span></div>
          <div class="certs">
            {g.items.map((h) => (
              <div class="cert-card" key={h.cert!.pid}>
                <button class="cert-thumb tap" onClick={() => openLink(h.cert!.pdf)}>
                  <img src={h.cert!.jpg} alt="" loading="lazy" />
                </button>
                <b class="cert-title">{h.title}</b>
                <small class="mono muted">{fmt.dayMonthLong(h.date)} · № {h.cert!.number}</small>
                <div class="cert-actions">
                  <button class="btn btn-line btn-small tap" onClick={() => openLink(h.cert!.pdf)}>{t("certOpen")}</button>
                  <button class="btn btn-small tap" disabled={sent[h.cert!.pid]} onClick={() => send(h.cert!.pid)}>
                    {sent[h.cert!.pid] ? t("certSent") : t("certSend")}
                  </button>
                </div>
              </div>
            ))}
          </div>
          </div>
          ))}
          <p class="muted small cert-hint">{t("certHint")}</p>
        </>
      )}
    </>
  );
}
