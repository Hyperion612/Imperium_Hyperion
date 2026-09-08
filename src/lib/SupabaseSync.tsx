import { useEffect, useState } from "react";
import { getState, saveState, subscribeToChanges } from "../lib/supabase";
import type { EmpireData } from "./state";

interface Props {
  data: EmpireData;
  onDataChange: (data: EmpireData) => void;
}

export default function SupabaseSync({ data, onDataChange }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "syncing" | "error">("idle");
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Загрузка данных из Supabase при монтировании
  useEffect(() => {
    const loadFromCloud = async () => {
      setStatus("loading");
      const cloudData = await getState();
      
      if (cloudData) {
        try {
          const parsed = cloudData as EmpireData;
          // Проверяем, что данные новее локальных
          if (parsed.updatedAt > data.updatedAt) {
            onDataChange(parsed);
            setLastSync(new Date().toLocaleTimeString("ru-RU"));
          }
        } catch (err) {
          console.error("Ошибка парсинга данных из Supabase:", err);
        }
      }
      setStatus("idle");
    };

    loadFromCloud();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Подписка на изменения в реальном времени
  useEffect(() => {
    const unsubscribe = subscribeToChanges((cloudData) => {
      try {
        const parsed = cloudData as EmpireData;
        if (parsed.updatedAt > data.updatedAt) {
          onDataChange(parsed);
          setLastSync(new Date().toLocaleTimeString("ru-RU"));
          setStatus("syncing");
          setTimeout(() => setStatus("idle"), 2000);
        }
      } catch (err) {
        console.error("Ошибка синхронизации:", err);
      }
    });

    return unsubscribe;
  }, [data.updatedAt, onDataChange]);

  // Сохранение в Supabase при изменении данных
  useEffect(() => {
    const saveToCloud = async () => {
      // Небольшая задержка для дебаунса
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setStatus("syncing");
      const success = await saveState(data);
      
      if (success) {
        setLastSync(new Date().toLocaleTimeString("ru-RU"));
        setError(null);
        setTimeout(() => setStatus("idle"), 1000);
      } else {
        setError("Не удалось сохранить в облако");
        setStatus("error");
      }
    };

    // Сохраняем только если данные изменились
    if (data.updatedAt > 0) {
      saveToCloud();
    }
  }, [data]);

  return (
    <div className="mt-4 border-t border-line pt-4">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${
            status === "syncing" ? "bg-hyper animate-pulse" :
            status === "error" ? "bg-ember" :
            status === "loading" ? "bg-gold animate-pulse" :
            "bg-dim"
          }`} />
          <span className="text-dim">
            {status === "syncing" && "Синхронизация..."}
            {status === "loading" && "Загрузка из облака..."}
            {status === "error" && "Ошибка синхронизации"}
            {status === "idle" && lastSync && `Облако: ${lastSync}`}
            {status === "idle" && !lastSync && "Облако не настроено"}
          </span>
        </div>
        {error && <span className="text-ember text-xs">{error}</span>}
      </div>
    </div>
  );
}
