import { useEffect, useState } from "react";
import { ENDPOINTS } from "./config/api";

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        ready: () => void;
        expand: () => void;
        setHeaderColor?: (color: string) => void;
        setBackgroundColor?: (color: string) => void;
        colorScheme?: "light" | "dark";
      };
    };
  }
}

interface MeUser {
  fullname: string; photo: string | null; role: string; balance: number; rank: string;
}

export default function App() {
  const [status, setStatus] = useState<"loading" | "ready" | "not-telegram" | "error">("loading");
  const [user, setUser] = useState<MeUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Красим html/body напрямую — иначе после tg.expand() реальная высота
    // вьюпорта может оказаться больше нашего контента, и в "хвосте" будет
    // видна дефолтная тема Telegram (тот самый серо-синий фон).
    document.documentElement.style.background = "#060606";
    document.body.style.background = "#060606";
    document.body.style.minHeight = "100vh";
  }, []);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    if (!tg || !tg.initData) {
      // Локальная разработка (npm run dev) без реального Telegram —
      // подставляем тестового юзера, чтобы можно было верстать/тестировать
      // экраны, не открывая настоящий Telegram каждый раз.
      // import.meta.env.DEV — true ТОЛЬКО при `npm run dev`, в проде
      // (`npm run build`) это условие никогда не сработает.
      if (import.meta.env.DEV) {
        setUser({
          fullname: "Test Volunteer",
          photo: null,
          role: "volunteer",
          balance: 120,
          rank: "🌱 Nihol (Росток)",
        });
        setToken("dev-fake-token");
        setStatus("ready");
        return;
      }
      setStatus("not-telegram");
      return;
    }

    tg.ready();
    tg.expand();
    tg.setBackgroundColor?.("#060606");
    tg.setHeaderColor?.("#060606");

    fetch(ENDPOINTS.loginTelegramWebApp, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ init_data: tg.initData }),
    })
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => {
        setToken(data.access);
        setUser(data.user);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  if (status === "loading") {
    return (
      <div style={styles.center}>
        <div style={styles.spinner} />
      </div>
    );
  }

  if (status === "not-telegram") {
    return (
      <div style={styles.center}>
        <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", padding: 24, fontSize: 14 }}>
          Bu ilova faqat Telegram ichida ochiladi.<br />Botga o'ting va menyu tugmasini bosing.
        </p>
      </div>
    );
  }

  if (status === "error" || !user) {
    return (
      <div style={styles.center}>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Kirishda xatolik yuz berdi. Qayta urinib ko'ring.</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#060606", color: "#fff", padding: "24px 18px", fontFamily: "'Inter',sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", overflow: "hidden", background: "rgba(34,197,94,0.15)", border: "1.5px solid rgba(34,197,94,0.4)", flexShrink: 0 }}>
          {user.photo && <img src={user.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
        </div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700 }}>{user.fullname}</div>
          <div style={{ fontSize: 12, color: "#22c55e", fontWeight: 600 }}>{user.rank}</div>
        </div>
      </div>

      <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 14, padding: "16px 18px", marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: ".05em" }}>Eco-points</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#22c55e" }}>{user.balance}</div>
      </div>

      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
        Bu — Mini App uchun boshlang'ich ekran. Bu yerga loyihalar ro'yxati, ularga yozilish, va boshqa funksiyalarni qo'shish mumkin.
      </p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  center: { minHeight: "100vh", background: "#060606", display: "flex", alignItems: "center", justifyContent: "center" },
  spinner: { width: 32, height: 32, borderRadius: "50%", border: "3px solid rgba(34,197,94,0.15)", borderTopColor: "#22c55e", animation: "spin .8s linear infinite" },
};