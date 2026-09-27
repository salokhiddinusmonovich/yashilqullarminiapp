// Эко-магазин (бета): товары и цены в эко-баллах. Пока магазин закрыт —
// сервер хранит только «❤ Хочу» (API/webapp.py → ShopView, те же id).
import type { Key } from "./i18n";

export interface ShopItem { id: string; emoji: string; price: number; ink: string }

export const SHOP: ShopItem[] = [
  { id: "stickers", emoji: "🌿", price: 30, ink: "#3f9d63" },
  { id: "pin", emoji: "📍", price: 50, ink: "#e0a030" },
  { id: "bracelet", emoji: "📿", price: 70, ink: "#3f86a8" },
  { id: "notebook", emoji: "📓", price: 100, ink: "#7f9a35" },
  { id: "bag", emoji: "👜", price: 120, ink: "#d4623a" },
  { id: "cap", emoji: "🧢", price: 150, ink: "#3f9d63" },
  { id: "tree", emoji: "🌳", price: 200, ink: "#2f7d4f" },
  { id: "tshirt", emoji: "👕", price: 250, ink: "#b34a6c" },
  { id: "thermos", emoji: "🥤", price: 300, ink: "#3f86a8" },
  { id: "hoodie", emoji: "🧥", price: 500, ink: "#e0a030" },
];

export const itemName = (id: string) => `it_${id}` as Key;
export const itemDesc = (id: string) => `d_${id}` as Key;
