// Карточка «🗺 Eko-xarita» на главной — отдельно от самой карты, чтобы Leaflet не попадал в основной файл.
import { t } from "../i18n";

/** Главная: карточка «🗺 Eko-xarita» с цифрами. */
export function EcoMapCard({ spots, onOpen }: { spots: { open: number; cleaned: number; mine: number }; onOpen: () => void }) {
  return (
    <button class="mapcard tap" onClick={onOpen}>
      <div class="mapcard-art" aria-hidden="true">
        <i class="p1" /><i class="p2" /><i class="p3" /><i class="p4" />
      </div>
      <div class="mapcard-text">
        <b class="display">🗺 {t("mapTitle")}</b>
        <small>{t("homeMapText", { open: spots.open, cleaned: spots.cleaned })}</small>
        {spots.mine > 0 && <small class="mapcard-mine">★ {t("homeMapMine", { n: spots.mine })}</small>}
      </div>
    </button>
  );
}
