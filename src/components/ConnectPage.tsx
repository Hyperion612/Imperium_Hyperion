import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Crest from "./Crest";
import { getSupabase, resetSupabase } from "../lib/supabase";

export default function ConnectPage() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [key, setKey] = useState("");
  const [status, setStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleConnect = async () => {
    if (!url || !key) {
      setStatus("error");
      setMessage("Заполните оба поля");
      return;
    }

    setStatus("testing");
    setMessage("Проверка подключения...");

    try {
      // Сохраняем credentials в localStorage
      localStorage.setItem("supabase_url", url);
      localStorage.setItem("supabase_key", key);

      // Сбрасываем клиент, чтобы он пересоздался с новыми credentials
      resetSupabase();
      const client = getSupabase();

      // Проверяем подключение
      const { error } = await client.from("empire_state").select("count").limit(1);

      if (error) {
        setStatus("error");
        setMessage(`Ошибка: ${error.message}`);
      } else {
        setStatus("success");
        setMessage("Подключение установлено! Перенаправление...");
        setTimeout(() => navigate("/"), 1500);
      }
    } catch (err) {
      setStatus("error");
      setMessage(`Ошибка подключения: ${err instanceof Error ? err.message : "Неизвестная ошибка"}`);
    }
  };

  return (
    <div className="min-h-screen bg-void flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <Crest className="h-16 w-16 text-gold mx-auto mb-4" />
          <h1 className="font-display text-3xl font-bold text-gold mb-2">
            Подключение к Supabase
          </h1>
          <p className="text-mist text-sm">
            Введите credentials вашего проекта Supabase для синхронизации данных
          </p>
        </div>

        <div className="bg-panel border border-line rounded-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gold mb-2">
              Project URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="w-full px-4 py-3 bg-abyss border border-line rounded text-ink placeholder-dim focus:outline-none focus:border-gold"
            />
            <p className="text-xs text-dim mt-1">
              Найдите в Settings → API → Project URL
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gold mb-2">
              Anon Key
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-4 py-3 bg-abyss border border-line rounded text-ink placeholder-dim focus:outline-none focus:border-gold font-mono text-sm"
            />
            <p className="text-xs text-dim mt-1">
              Найдите в Settings → API → anon public key
            </p>
          </div>

          {message && (
            <div
              className={`p-4 rounded border ${
                status === "error"
                  ? "bg-ember/10 border-ember text-ember"
                  : status === "success"
                  ? "bg-hyper/10 border-hyper text-hyper"
                  : "bg-gold/10 border-gold text-gold"
              }`}
            >
              {message}
            </div>
          )}

          <button
            onClick={handleConnect}
            disabled={status === "testing"}
            className="w-full py-3 bg-gold text-void font-bold rounded hover:bg-goldsoft transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "testing" ? "Проверка..." : "Подключиться"}
          </button>

          <div className="text-center">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-mist hover:text-gold transition-colors"
            >
              ← Вернуться на главную
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-dim">
          <p>После подключения все данные будут синхронизироваться через Supabase</p>
          <p className="mt-1">Инструкция по настройке: см. README.md</p>
        </div>
      </div>
    </div>
  );
}
