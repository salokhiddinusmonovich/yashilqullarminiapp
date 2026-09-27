// «Что нового» — список версий. Открывается сам один раз после обновления и из профиля.
import { getLang, t } from "../i18n";
import { Sheet } from "../ui";
import { APP_VERSION, CHANGELOG } from "../version";

export function WhatsNew({ open, onClose }: { open: boolean; onClose: () => void }) {
  const lang = getLang();
  return (
    <Sheet open={open} onClose={onClose}>
      <div class="sheet-pad wn">
        <span class="mono label-xs">YASHIL QO'LLAR · v{APP_VERSION}</span>
        <h2 class="wn-title">{t("whatsNew")}</h2>
        {CHANGELOG.map((r, i) => (
          <section key={r.v} class={`wn-rel ${i === 0 ? "cur" : ""}`}>
            <div class="wn-head">
              <span class="wn-v mono">v{r.v}</span>
              {i === 0 && <span class="wn-new mono">{t("wnNew")}</span>}
              <small class="muted">{r.date[lang]}</small>
            </div>
            <ul>{r.items[lang].map((x) => <li key={x}>{x}</li>)}</ul>
          </section>
        ))}
        <button class="btn btn-primary wide tap" onClick={onClose}>{t("wnGot")}</button>
      </div>
    </Sheet>
  );
}
