// Профиль другого человека (из рейтинга или команды) — только публичное.
import { useEffect, useState } from "preact/hooks";
import type { PublicUser } from "../types";
import { t } from "../i18n";
import { api } from "../api";
import { Empty, SecHead, Sheet, Stamp } from "../ui";
import { badgesFrom, tilt } from "../fx";
import { PassportCard } from "./Home";

export function ProfileSheet({ id, onClose }: { id: number | null; onClose: () => void }) {
  const [u, setU] = useState<PublicUser | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (id === null) return;
    setU(null);
    setFailed(false);
    api.user(id).then(setU).catch(() => setFailed(true));
  }, [id]);

  const badges = u ? badgesFrom({ attended: u.attended_count, balance: u.balance, staff: u.is_staff }) : [];

  return (
    <Sheet open={id !== null} onClose={onClose}>
      <div class="sheet-pad">
        {failed && <Empty title={t("notFound")} />}
        {!u && !failed && <div class="skel-list" />}
        {u && (
          <>
            <PassportCard user={u} />

            <SecHead n="01" title={t("stamps")} action={<span class="mono small muted">{u.history.length}</span>} />
            {u.history.length ? (
              <div class="stamps">
                {u.history.map((h, i) => <Stamp key={h.id} title={h.title} date={h.date} seed={h.id + i} />)}
              </div>
            ) : (
              <Empty title={t("noHistory")} />
            )}

            <SecHead n="02" title={t("badges")} action={<span class="mono small muted">{badges.filter((b) => b.done).length}/{badges.length}</span>} />
            <div class="patches">
              {badges.map((b, i) => (
                <div key={b.id} class={`patch big ${b.done ? "done" : ""}`} style={{ transform: `rotate(${tilt(i + 7, 5)})` }}>
                  <span class="patch-ico">{b.icon}</span>
                  <b class="patch-name">{t(b.name)}</b>
                  <small>{t(b.desc)}</small>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Sheet>
  );
}
