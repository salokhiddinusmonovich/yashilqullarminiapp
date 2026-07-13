import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ENDPOINTS, baseHeaders, fixMediaUrl } from "../config/api";

const GREEN = "#22C55E";

/* ─────────────────────────────────────────
   ФОНОВЫЙ CANVAS — общий паттерн сайта
───────────────────────────────────────── */
function ForestCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!; const ctx = c.getContext("2d")!;
    let id: number, w: number, h: number;
    const nodes: any[] = [], leaves: any[] = [], pulses: any[] = [];
    const resize = () => { w = c.width = window.innerWidth; h = c.height = window.innerHeight; };
    const init = () => {
      resize(); nodes.length = 0; leaves.length = 0; pulses.length = 0;
      for (let i = 0; i < 80; i++) nodes.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .45, vy: (Math.random() - .5) * .45, r: Math.random() * 2 + .5, a: Math.random() * .65 + .2, pulse: Math.random() * Math.PI * 2, ps: Math.random() * .028 + .01 });
      for (let i = 0; i < 24; i++) leaves.push({ x: Math.random() * w, y: Math.random() * h + h, vx: (Math.random() - .5) * .65, vy: -(Math.random() * .85 + .28), size: Math.random() * 12 + 5, rot: Math.random() * Math.PI * 2, vrot: (Math.random() - .5) * .022, a: Math.random() * .38 + .13, wobble: Math.random() * Math.PI * 2, ws: Math.random() * .022 + .008, hue: Math.random() * 30 });
      for (let i = 0; i < 5; i++) pulses.push({ x: Math.random() * w, y: Math.random() * h, r: 0, maxR: Math.random() * 180 + 80, speed: Math.random() * .8 + .4, delay: i * 40 });
    };
    const drawLeaf = (x: number, y: number, sz: number, rot: number, alpha: number, hue: number) => { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = alpha; ctx.beginPath(); ctx.moveTo(0, -sz); ctx.bezierCurveTo(sz * .7, -sz * .6, sz * .7, sz * .5, 0, sz * .35); ctx.bezierCurveTo(-sz * .7, sz * .5, -sz * .7, -sz * .6, 0, -sz); const g = ctx.createLinearGradient(0, -sz, 0, sz * .35); g.addColorStop(0, `hsl(${142 + hue},80%,52%)`); g.addColorStop(1, `hsl(${155 + hue},72%,38%)`); ctx.fillStyle = g; ctx.fill(); ctx.beginPath(); ctx.moveTo(0, -sz * .85); ctx.quadraticCurveTo(sz * .08, 0, 0, sz * .3); ctx.strokeStyle = "rgba(255,255,255,0.22)"; ctx.lineWidth = .85; ctx.stroke(); ctx.restore(); ctx.globalAlpha = 1; };
    let frame = 0;
    const tick = () => { frame++; ctx.clearRect(0, 0, w, h); for (const p of pulses) { if (frame < p.delay) continue; p.r += p.speed; if (p.r > p.maxR) { p.r = 0; p.x = Math.random() * w; p.y = Math.random() * h; } const fade = 1 - p.r / p.maxR; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.strokeStyle = `rgba(34,197,94,${.18 * fade})`; ctx.lineWidth = 1.5; ctx.stroke(); } for (let i = 0; i < nodes.length; i++)for (let j = i + 1; j < nodes.length; j++) { const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y, d = Math.sqrt(dx * dx + dy * dy); if (d < 155) { ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.strokeStyle = `rgba(34,197,94,${.17 * (1 - d / 155)})`; ctx.lineWidth = .78; ctx.stroke(); } } for (const n of nodes) { n.pulse += n.ps; n.x += n.vx; n.y += n.vy; if (n.x < 0) n.x = w; if (n.x > w) n.x = 0; if (n.y < 0) n.y = h; if (n.y > h) n.y = 0; const pa = n.a * (.65 + .35 * Math.sin(n.pulse)); const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 5); grd.addColorStop(0, `rgba(34,197,94,${pa * .55})`); grd.addColorStop(1, "transparent"); ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 5, 0, Math.PI * 2); ctx.fillStyle = grd; ctx.fill(); ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(34,197,94,${pa})`; ctx.fill(); } for (const l of leaves) { l.wobble += l.ws; l.x += l.vx + Math.sin(l.wobble) * .5; l.y += l.vy; l.rot += l.vrot; if (l.y < -30) { l.y = h + 30; l.x = Math.random() * w; } drawLeaf(l.x, l.y, l.size, l.rot, l.a, l.hue); } id = requestAnimationFrame(tick); };
    init(); tick(); window.addEventListener("resize", init); return () => { cancelAnimationFrame(id); window.removeEventListener("resize", init); };
  }, []);
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }} />;
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null); const [vis, setVis] = useState(false);
  useEffect(() => { const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.05 }); if (ref.current) obs.observe(ref.current); return () => obs.disconnect(); }, []);
  return <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(20px)", transition: `opacity .7s cubic-bezier(.16,1,.3,1) ${delay}ms,transform .7s cubic-bezier(.16,1,.3,1) ${delay}ms` }}>{children}</div>;
}

function Spinner() {
  return <div style={{ width: 30, height: 30, margin: "40px auto", borderRadius: "50%", border: "3px solid rgba(34,197,94,0.15)", borderTopColor: GREEN, animation: "yq-spin .8s linear infinite" }} />;
}

/* ─────────────────────────────────────────
   TAB: PROFILE
───────────────────────────────────────── */
const FIELD_ICONS: Record<string, string> = { email: "✉️", phone: "📱", age: "🎂", education_place: "🎓", experience: "💬" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "13px 14px 13px 42px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 11, color: "#fff", fontSize: 13.5, fontFamily: "'Inter',sans-serif", outline: "none", boxSizing: "border-box", transition: "border-color .2s, background .2s" };
const labelStyle: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.32)", letterSpacing: ".14em", textTransform: "uppercase", display: "block", marginBottom: 8 };
const focusIn = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = GREEN + "55"; e.target.style.background = "rgba(34,197,94,0.06)"; };
const blurIn = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = "rgba(255,255,255,0.09)"; e.target.style.background = "rgba(255,255,255,0.04)"; };

function IconField({ icon, children }: { icon: string; children: React.ReactNode }) {
  return <div style={{ position: "relative" }}><span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15, pointerEvents: "none", opacity: .7 }}>{icon}</span>{children}</div>;
}

function ProfileTab() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ email: "", phone: "", age: "", education_place: "", experience: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) setForm({ email: user.email || "", phone: user.phone || "", age: user.age?.toString() || "", education_place: user.education_place || "", experience: user.experience || "" });
  }, [user]);

  if (!user) return <Spinner />;

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const photoUrl = fixMediaUrl(user.photo);
  const initials = user.fullname.split(" ").filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSaved(false); setSaving(true);
    const res = await updateProfile({ email: form.email, phone: form.phone, age: form.age ? Number(form.age) : null, education_place: form.education_place, experience: form.experience } as any);
    setSaving(false);
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    else setError(res.error || "Failed to save.");
  };

  return (
    <div>
      <FadeIn>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", padding: "26px 24px", marginBottom: 20, borderRadius: 20, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(34,197,94,0.2)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${GREEN}70,transparent)` }} />
          <div style={{ width: 76, height: 76, borderRadius: "50%", flexShrink: 0, overflow: "hidden", background: GREEN, border: `2px solid ${GREEN}80`, boxShadow: `0 0 26px rgba(34,197,94,0.32)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800, color: "#04140a" }}>
            {photoUrl ? <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <h2 style={{ margin: "0 0 6px", fontSize: 21, fontWeight: 800, letterSpacing: "-0.01em" }}>{user.fullname}</h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", padding: "4px 11px", borderRadius: 6, background: `${GREEN}18`, color: GREEN, border: `1px solid ${GREEN}35` }}>{user.role}</span>
              {user.username && <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.35)" }}>@{user.username}</span>}
            </div>
            {user.rank && <div style={{ marginTop: 8, fontSize: 13, color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>{user.rank}</div>}
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={60}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 1, background: `${GREEN}10`, borderRadius: 16, overflow: "hidden", border: `1px solid ${GREEN}20`, marginBottom: 20 }}>
          {[{ icon: "⭐", val: user.balance, lbl: "Eco-points" }, { icon: "📋", val: user.projects_count, lbl: "Projects" }].map((s, i) => (
            <div key={i} style={{ padding: "22px 18px", background: "rgba(6,6,6,0.92)", textAlign: "center" }}>
              <div style={{ fontSize: 20, marginBottom: 5 }}>{s.icon}</div>
              <div style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: 800, color: GREEN, letterSpacing: "-0.02em", lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 7, letterSpacing: ".1em", textTransform: "uppercase" }}>{s.lbl}</div>
            </div>
          ))}
        </div>
      </FadeIn>

      <FadeIn delay={110}>
        <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(34,197,94,0.18)", borderRadius: 18, padding: "26px 22px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${GREEN}60,transparent)` }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <span style={{ width: 22, height: 1.5, background: GREEN, borderRadius: 2, display: "inline-block" }} />
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".22em", textTransform: "uppercase", color: GREEN }}>Дозаполнить профиль</span>
          </div>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label style={labelStyle}>Email</label><IconField icon={FIELD_ICONS.email}><input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@example.com" style={inputStyle} onFocus={focusIn} onBlur={blurIn} /></IconField></div>
              <div><label style={labelStyle}>Phone</label><IconField icon={FIELD_ICONS.phone}><input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+998901234567" style={inputStyle} onFocus={focusIn} onBlur={blurIn} /></IconField></div>
            </div>
            <div><label style={labelStyle}>Age</label><IconField icon={FIELD_ICONS.age}><input type="number" value={form.age} onChange={e => set("age", e.target.value)} placeholder="20" style={inputStyle} onFocus={focusIn} onBlur={blurIn} /></IconField></div>
            <div><label style={labelStyle}>Education place</label><IconField icon={FIELD_ICONS.education_place}><input type="text" value={form.education_place} onChange={e => set("education_place", e.target.value)} placeholder="TDTU" style={inputStyle} onFocus={focusIn} onBlur={blurIn} /></IconField></div>
            <div><label style={labelStyle}>Experience</label><IconField icon={FIELD_ICONS.experience}><input type="text" value={form.experience} onChange={e => set("experience", e.target.value)} placeholder="Tell about yourself" style={inputStyle} onFocus={focusIn} onBlur={blurIn} /></IconField></div>

            {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, padding: "11px 15px", fontSize: 13, color: "#f87171" }}>{error}</div>}
            {saved && <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 10, padding: "11px 15px", fontSize: 13, color: GREEN, fontWeight: 600 }}>✓ Сохранено</div>}

            <button type="submit" disabled={saving} style={{ padding: "14px", background: saving ? "rgba(34,197,94,0.4)" : GREEN, border: "none", color: saving ? GREEN : "#000", borderRadius: 12, fontSize: 12, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", cursor: saving ? "wait" : "pointer", fontFamily: "'Montserrat',sans-serif", boxShadow: saving ? "none" : "0 0 24px rgba(34,197,94,0.25)", transition: "all .25s" }}>
              {saving ? "Сохраняем…" : "Сохранить изменения"}
            </button>
          </form>
        </div>
      </FadeIn>
    </div>
  );
}

/* ─────────────────────────────────────────
   TAB: MY PROJECTS
───────────────────────────────────────── */
type Participation = { id: number; project_title: string; project_photo: string | null; project_date: string; project_location: string; status: string; applied_at: string };

const STATUS_META: Record<string, { label: string; color: string }> = {
  pending: { label: "⏳ Ожидание", color: "#facc15" },
  approved: { label: "✅ Принят", color: "#38bdf8" },
  attended: { label: "🌟 Пришёл", color: GREEN },
  rejected: { label: "❌ Отклонён", color: "#f87171" },
};

function MyProjectsTab() {
  const [items, setItems] = useState<Participation[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const access = localStorage.getItem("yq_access_token");
    if (!access) { setError(true); return; }
    fetch(ENDPOINTS.myProjects, { headers: baseHeaders("en", { Authorization: `Bearer ${access}` }) })
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(setItems)
      .catch(() => setError(true));
  }, []);

  if (error) return <FadeIn><p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textAlign: "center", padding: "40px 0" }}>Не удалось загрузить проекты.</p></FadeIn>;
  if (!items) return <Spinner />;
  if (items.length === 0) return (
    <FadeIn>
      <div style={{ padding: "48px 32px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 14 }}>🌿</div>
        <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.35)" }}>Ты ещё не подавал заявки ни на один проект.</p>
      </div>
    </FadeIn>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {items.map((p, i) => {
        const meta = STATUS_META[p.status] || { label: p.status, color: "rgba(255,255,255,0.4)" };
        return (
          <FadeIn key={p.id} delay={i * 40}>
            <div style={{ display: "flex", gap: 14, alignItems: "center", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "14px 16px" }}>
              {p.project_photo && <img src={fixMediaUrl(p.project_photo) || ""} alt="" style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{p.project_title}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{p.project_location} · {new Date(p.project_date).toLocaleDateString()}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: meta.color, whiteSpace: "nowrap" }}>{meta.label}</span>
            </div>
          </FadeIn>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────
   TAB: LEADERBOARD
───────────────────────────────────────── */
type LeaderEntry = { tg_id: number; fullname: string; photo: string | null; balance: number; rank: string; region: string | null };

function LeaderboardTab() {
  const { user } = useAuth();
  const [items, setItems] = useState<LeaderEntry[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(ENDPOINTS.leaderboard, { headers: baseHeaders("en") })
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(setItems)
      .catch(() => setError(true));
  }, []);

  if (error) return <FadeIn><p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textAlign: "center", padding: "40px 0" }}>Не удалось загрузить рейтинг.</p></FadeIn>;
  if (!items) return <Spinner />;

  const medal = (i: number) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((entry, i) => {
        const isMe = user && entry.tg_id === user.tg_id;
        const initials = entry.fullname.split(" ").filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase();
        return (
          <FadeIn key={entry.tg_id} delay={Math.min(i * 25, 400)}>
            <div style={{
              display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderRadius: 12,
              background: isMe ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${isMe ? GREEN + "45" : "rgba(255,255,255,0.07)"}`,
            }}>
              <div style={{ width: 28, textAlign: "center", fontSize: i < 3 ? 18 : 13, fontWeight: 800, color: i < 3 ? "#fff" : "rgba(255,255,255,0.35)", flexShrink: 0 }}>{medal(i)}</div>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: GREEN, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#04140a", flexShrink: 0, overflow: "hidden" }}>
                {fixMediaUrl(entry.photo) ? <img src={fixMediaUrl(entry.photo)!} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: "#fff" }}>{entry.fullname}{isMe && <span style={{ color: GREEN, fontWeight: 600 }}> (ты)</span>}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{entry.rank}</div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: GREEN, flexShrink: 0 }}>{entry.balance} ⭐</div>
            </div>
          </FadeIn>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN — DASHBOARD С ВКЛАДКАМИ
───────────────────────────────────────── */
type Tab = "profile" | "projects" | "leaderboard";
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "profile", label: "Профиль", icon: "👤" },
  { id: "projects", label: "Мои проекты", icon: "📋" },
  { id: "leaderboard", label: "Рейтинг", icon: "🏆" },
];

export function ProfilePage() {
  const { isLoggedIn, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("profile");

  useEffect(() => { if (!loading && !isLoggedIn) navigate("/login"); }, [loading, isLoggedIn]);

  if (loading) {
    return <div style={{ minHeight: "100vh", background: "#060606", display: "flex", alignItems: "center", justifyContent: "center" }}><Spinner /></div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#060606", color: "#fff", fontFamily: "'Inter','Helvetica Neue',sans-serif", position: "relative", overflowX: "hidden" }}>
      <ForestCanvas />
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse 80% 60% at 12% 15%, rgba(34,197,94,0.12) 0%, transparent 60%), radial-gradient(ellipse 55% 50% at 88% 85%, rgba(16,185,129,0.08) 0%, transparent 55%)" }} />

      <main style={{ position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto", padding: "clamp(100px,12vw,130px) clamp(16px,5vw,40px) 100px" }}>

        {/* TAB SWITCHER */}
        <FadeIn>
          <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 13, padding: 4, marginBottom: 24 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex: 1, padding: "10px 8px", borderRadius: 10, border: "none", cursor: "pointer",
                background: tab === t.id ? GREEN : "transparent",
                color: tab === t.id ? "#000" : "rgba(255,255,255,0.5)",
                fontSize: 12.5, fontWeight: 800, letterSpacing: ".02em",
                fontFamily: "'Montserrat',sans-serif", transition: "all .2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                <span>{t.icon}</span><span>{t.label}</span>
              </button>
            ))}
          </div>
        </FadeIn>

        {tab === "profile" && <ProfileTab />}
        {tab === "projects" && <MyProjectsTab />}
        {tab === "leaderboard" && <LeaderboardTab />}
      </main>

      <style>{`@keyframes yq-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}