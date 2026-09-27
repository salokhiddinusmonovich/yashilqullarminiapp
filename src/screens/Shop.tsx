// Эко-магазин — бета, «скоро». Товары-бирки на верёвочке, прогресс до каждого
// подарка от баланса и «❤ Хочу» (счётчик на сервере — чтобы знать спрос до запуска).
import { useEffect, useState } from "preact/hooks";
import type { Bootstrap, ShopState } from "../types";
import { t } from "../i18n";
import { api } from "../api";
import { haptic, useBackButton } from "../tg";
import { Icon, SecHead } from "../ui";
import { tilt, useCountUp } from "../fx";
import { SHOP, itemDesc, itemName } from "../shop";

export function Shop({ data, onClose }: { data: Bootstrap; onClose: () => void }) {
  const balance = data.user.balance;
  const [state, setState] = useState<ShopState>({ counts: {}, mine: [] });
  const shown = useCountUp(balance);

  useEffect(() => useBackButton(true, onClose), []);
  useEffect(() => { window.scrollTo({ top: 0 }); api.shop().then(setState).catch(() => {}); }, []);

  async function wish(id: string) {
    haptic("light");
    const on = !state.mine.includes(id);
    // сразу на экране, сервер догонит
    setState((s) => ({
      counts: { ...s.counts, [id]: Math.max(0, (s.counts[id] || 0) + (on ? 1 : -1)) },
      mine: on ? [...s.mine, id] : s.mine.filter((x) => x !== id),
    }));
    try { setState(await api.wish(id)); } catch { /* офлайн — оставим как есть */ }
  }

  const next = SHOP.find((i) => i.price > balance);

  return (
    <div class="shop fade">
      <div class="shop-top">
        <button class="shop-back tap" onClick={onClose} aria-label={t("close")}><Icon.chevron /></button>
        <span class="mono label-xs">YASHIL QO'LLAR · {t("shopBeta").toUpperCase()}</span>
      </div>

      <header class="shop-head">
        <h1 class="title">{t("shop")}</h1>
        <span class="shop-stamp mono">{t("shopSoon")}</span>
      </header>
      <p class="muted shop-lead">{t("shopLead")}</p>

      <div class="wallet">
        <div>
          <span class="mono label-xs">{t("shopWallet")}</span>
          <div class="wallet-num"><b>{shown}</b><span>{t("shopPts")}</span></div>
          <small class="muted">{next ? t("shopNextGift", { n: next.price - balance }) : t("shopPerEvent")}</small>
        </div>
        <div class="wallet-coin" aria-hidden="true"><Icon.leaf /></div>
      </div>

      <SecHead n="01" title={t("shopGifts")} action={<span class="mono small muted">{SHOP.length}</span>} />
      <div class="tags">
        {SHOP.map((it, i) => {
          const pct = Math.min(100, Math.round((balance / it.price) * 100));
          const ok = balance >= it.price;
          const mine = state.mine.includes(it.id);
          const n = state.counts[it.id] || 0;
          return (
            <div key={it.id} class="tagcard" style={{ "--tag-ink": it.ink, transform: `rotate(${tilt(i + 11, 2.2)})` } as any}>
              <span class="tag-hole" />
              <div class="tag-art"><span>{it.emoji}</span><i class="mono">YQ</i></div>
              <b class="tag-name">{t(itemName(it.id))}</b>
              <small class="muted tag-desc">{t(itemDesc(it.id))}</small>
              <div class="tag-price"><Icon.leaf /><b>{it.price}</b></div>
              <div class="bar"><i style={{ width: `${pct}%` }} /></div>
              <small class={`tag-left ${ok ? "ok" : ""}`}>{ok ? <><Icon.check />{t("shopEnough")}</> : t("shopNeed", { n: it.price - balance })}</small>
              <button class={`tag-want tap ${mine ? "on" : ""}`} onClick={() => wish(it.id)}>
                <span>{mine ? "♥" : "♡"}</span>{t("shopWant")}
                <em class="mono">{n || ""}</em>
              </button>
              <div class="tag-lock"><Icon.lock />{t("shopSoon")}</div>
            </div>
          );
        })}
      </div>

      <SecHead n="02" title={t("shopHow")} />
      <div class="how">
        {([["1", "shopStep1", "shopStep1s"], ["2", "shopStep2", "shopStep2s"], ["3", "shopStep3", "shopStep3s"]] as const).map(([n, a, b]) => (
          <div class="how-step" key={n}><span class="how-n mono">{n}</span><b>{t(a)}</b><small class="muted">{t(b)}</small></div>
        ))}
      </div>

      <div class="card small muted shop-note">{t("shopNote")}</div>
    </div>
  );
}

/** Анонс магазина на главной. */
export function ShopTeaser({ balance, onOpen }: { balance: number; onOpen: () => void }) {
  return (
    <button class="shop-teaser tap" onClick={onOpen}>
      <span class="shop-teaser-tape mono">{t("shopSoon")} · {t("shopBeta")}</span>
      <div class="shop-teaser-row">
        <div>
          <b>{t("shop")}</b>
          <small class="muted">{t("shopTeaser")}</small>
        </div>
        <div class="shop-teaser-items">{SHOP.filter((i) => ["tshirt", "cap", "thermos", "bracelet"].includes(i.id)).map((i) => <span key={i.id}>{i.emoji}</span>)}</div>
      </div>
      <span class="shop-teaser-cta">{t("shopOpen")} <Icon.chevron /></span>
      <span class="mono shop-teaser-bal">{balance} {t("shopPts")}</span>
    </button>
  );
}
