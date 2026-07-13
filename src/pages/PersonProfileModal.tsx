import { useState, useEffect } from "react";
import { ENDPOINTS, baseHeaders, fixMediaUrl } from "../config/api";

export interface PublicProfile {
  id: number; fullname: string; photo: string | null;
  role: string; role_display: string; region_display: string | null;
  balance: number; username: string | null; bio: string | null;
}

/**
 * Единый профиль для всего сайта — один и тот же вид для автора статьи,
 * комментатора, участника региональной команды. Открывается по id,
 * сам делает запрос на /users/<id>/profile/.
 * Лейаут сознательно повторяет структуру профиля Instagram:
 * аватар с градиентным кольцом → статы → био → компактная кнопка действия.
 */
export function PersonProfileModal({ userId, onClose }: { userId: number; onClose: () => void }) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setProfile(null);
    setError(false);
    fetch(ENDPOINTS.userProfile(userId), { headers: baseHeaders("en") })
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(setProfile)
      .catch(() => setError(true));
  }, [userId]);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <style>{`
        @keyframes yq-profile-spin { to { transform: rotate(360deg); } }
        .yq-profile-msg-btn { transition: filter .15s, transform .15s; }
        .yq-profile-msg-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }
      `}</style>
      <div onClick={e => e.stopPropagation()} style={{ background: "#0f0f0f", border: "1px solid rgba(34,197,94,0.22)", borderRadius: 20, padding: "26px 24px 28px", width: "100%", maxWidth: 380 }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 2 }}>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 14 }}>✕</button>
        </div>

        {error && <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>Couldn't load this profile.</p>}

        {!error && !profile && (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid rgba(34,197,94,0.15)", borderTopColor: "#22c55e", animation: "yq-profile-spin .8s linear infinite" }} />
          </div>
        )}

        {profile && (
          <div>
            {/* ── Header: аватар с градиентным кольцом (как IG story-ring) + имя ── */}
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 18 }}>
              <div style={{
                width: 82, height: 82, borderRadius: "50%", flexShrink: 0, padding: 3,
                background: "conic-gradient(from 220deg, #22c55e, #86efac, #22c55e, #16a34a, #22c55e)",
              }}>
                <div style={{ width: "100%", height: "100%", borderRadius: "50%", padding: 2, background: "#0f0f0f" }}>
                  <div style={{
                    width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden",
                    background: "rgba(34,197,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#22c55e", fontWeight: 800, fontSize: 24,
                  }}>
                    {profile.photo
                      ? <img src={fixMediaUrl(profile.photo) || ""} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      : profile.fullname.split(" ").filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                </div>
              </div>
              <div style={{ minWidth: 0 }}>
                <h2 style={{ margin: "0 0 5px", fontSize: 17, fontWeight: 800, color: "#fff", lineHeight: 1.25 }}>{profile.fullname}</h2>
                <span style={{ display: "inline-block", fontSize: 10, fontWeight: 800, color: "#22c55e", textTransform: "uppercase", letterSpacing: ".06em", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 999, padding: "3px 10px" }}>
                  {profile.role_display}
                </span>
              </div>
            </div>

            {/* ── Статы — как ряд "posts / followers / following" в IG, но с реальными данными ── */}
            <div style={{ display: "flex", borderTop: "1px solid rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "14px 0", marginBottom: 18 }}>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{profile.balance}</div>
                <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: ".05em", marginTop: 2 }}>Eco-points</div>
              </div>
              <div style={{ width: 1, background: "rgba(255,255,255,0.07)" }} />
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", lineHeight: 1.3 }}>{profile.region_display || "—"}</div>
                <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: ".05em", marginTop: 2 }}>Region</div>
              </div>
              <div style={{ width: 1, background: "rgba(255,255,255,0.07)" }} />
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", lineHeight: 1.3 }}>{profile.role_display}</div>
                <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: ".05em", marginTop: 2 }}>Role</div>
              </div>
            </div>

            {/* ── Био ── */}
            {profile.bio && (
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: "0 0 20px" }}>{profile.bio}</p>
            )}

            {/* ── Кнопка действия — компактная, как "Message" в IG, не на всю ширину ── */}
            {profile.username ? (
              <a
                href={`https://t.me/${profile.username.replace(/^@/, "")}`}
                target="_blank" rel="noreferrer"
                className="yq-profile-msg-btn"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  background: "#22c55e", color: "#04120a", fontWeight: 800, fontSize: 12.5,
                  padding: "10px 22px", borderRadius: 999, textDecoration: "none", margin: "0 auto",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                Message
              </a>
            ) : (
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textAlign: "center" }}>No Telegram username on file.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}