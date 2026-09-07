import { useEffect, useState } from "react";
import { useEmpire } from "../lib/state";
import { Corners } from "./SectionHead";

const fmtTime = (t: number) =>
  new Date(t).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

const fmtAgo = (t: number, now: number) => {
  const s = Math.floor((now - t) / 1000);
  if (s < 5) return "только что";
  if (s < 60) return `${s} сек назад`;
  if (s < 3600) return `${Math.floor(s / 60)} мин назад`;
  return `${Math.floor(s / 3600)} ч назад`;
};

/** Панель облачной синхронизации: один реестр Империи на все устройства. */
export default function SyncPanel({ compact = false }: { compact?: boolean }) {
  const {
    data,
    syncBusy,
    syncErr,
    lastSync,
    createCloudLink,
    connectCloud,
    pushNow,
    pullNow,
    exportCode,
    importCode,
    notify,
  } = useEmpire();

  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [showCodes, setShowCodes] = useState(false);
  const [exportVal, setExportVal] = useState("");
  const [importVal, setImportVal] = useState("");
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(Date.now());

  // обновляем "сейчас" каждую секунду для индикатора
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const cloudId = data.cloudId;

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      notify("Не удалось скопировать — выделите код вручную.", "ember");
    }
  };

  const onCreate = async () => {
    setBusy(true);
    setMsg(null);
    const res = await createCloudLink();
    setBusy(false);
    setMsg({ ok: res.ok, text: res.ok ? `Готово! Код синхронизации: ${res.code}` : res.msg });
  };

  const onConnect = async () => {
    setBusy(true);
    setMsg(null);
    const res = await connectCloud(code);
    setBusy(false);
    setMsg({ ok: res.ok, text: res.msg });
    if (res.ok) setCode("");
  };

  return (
    <div className="relative border border-hyper/30 bg-panel p-6">
      <Corners className="text-hyper/50" />
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center border border-hyper/40 text-hyper">
          <svg viewBox="0 0 48 48" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
            <path d="M14 36a9 9 0 0 1-1-17.9A12 12 0 0 1 36.5 20 8 8 0 0 1 35 36z" strokeLinejoin="round" />
            <path d="M24 24v9M20 28l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <div>
          <h3 className="font-display text-[15px] font-bold tracking-wide text-ink uppercase">Облако Империи</h3>
          <p className="font-mono text-[10px] tracking-[0.2em] text-dim uppercase">
            один реестр — телефон, ноутбук, все устройства
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2 font-mono text-[10px] tracking-[0.15em] uppercase">
          {syncBusy && <span className="animate-soft-pulse text-hyper">⇅ синхронизация…</span>}
          {!syncBusy && syncErr && <span className="text-ember">● офлайн</span>}
          {!syncBusy && !syncErr && cloudId && lastSync && (
            <span className="flex items-center gap-1.5 text-hyper">
              <span className="inline-block h-1.5 w-1.5 animate-soft-pulse rounded-full bg-hyper" />
              авто-синхр. {fmtAgo(lastSync, now)}
            </span>
          )}
          {!cloudId && <span className="text-dim">● не подключено</span>}
        </div>
      </div>

      {cloudId ? (
        <div className="mt-5">
          <p className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase">Код синхронизации Империи</p>
          <div className="mt-2 flex items-center gap-3">
            <code className="flex-1 border border-hyper/40 bg-abyss px-4 py-2.5 font-mono text-[17px] font-bold tracking-[0.3em] text-hyper">
              {cloudId}
            </code>
            <button
              onClick={() => copy(cloudId)}
              className="border border-hyper/50 px-4 py-2.5 font-mono text-[11px] tracking-[0.15em] text-hyper uppercase transition-colors hover:bg-hyper/10"
            >
              {copied ? "✓ copied" : "копир."}
            </button>
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-mist">
            Введите этот код на любом другом устройстве (вкладка «Синхронизация» на Вратах) — заявки, граждане и казна
            станут общими. <span className="text-hyper">Синхронизация в реальном времени:</span> изменения автоматически
            передаются каждые 5 секунд.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={pushNow} disabled={syncBusy} className="border border-line px-4 py-2 font-mono text-[10px] tracking-[0.18em] text-mist uppercase transition-colors hover:border-hyper/60 hover:text-hyper disabled:opacity-40">
              ↑ Выгрузить сейчас
            </button>
            <button onClick={pullNow} disabled={syncBusy} className="border border-line px-4 py-2 font-mono text-[10px] tracking-[0.18em] text-mist uppercase transition-colors hover:border-hyper/60 hover:text-hyper disabled:opacity-40">
              ↓ Обновить сейчас
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-[12.5px] leading-relaxed text-mist">
              Создайте облачный реестр на этом устройстве — получите код, по которому подключите остальные.
            </p>
            <button
              onClick={onCreate}
              disabled={busy || syncBusy}
              className="clip-notch mt-3 w-full bg-hyper px-5 py-3 font-mono text-[12px] font-bold tracking-[0.2em] text-[#04211c] uppercase transition-all hover:brightness-110 disabled:opacity-40"
            >
              {busy ? "Создание…" : "Создать облачный реестр"}
            </button>
          </div>
          <div>
            <p className="text-[12.5px] leading-relaxed text-mist">Или подключитесь к уже созданному реестру по коду.</p>
            <div className="mt-3 flex gap-2">
              <input
                className="field flex-1 font-mono"
                placeholder="Код синхронизации"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                inputMode="numeric"
              />
              <button
                onClick={onConnect}
                disabled={busy || syncBusy || code.trim().length < 4}
                className="border border-hyper/60 px-5 py-2 font-mono text-[11px] font-bold tracking-[0.15em] text-hyper uppercase transition-colors hover:bg-hyper/10 disabled:opacity-40"
              >
                Войти
              </button>
            </div>
          </div>
        </div>
      )}

      {msg && (
        <p className={`mt-3 border px-3 py-2 font-mono text-[11px] ${msg.ok ? "border-hyper/50 text-hyper" : "border-ember/50 text-ember"}`}>
          {msg.ok ? "✓ " : "▲ "}
          {msg.text}
        </p>
      )}

      {!compact && (
        <div className="mt-5 border-t border-line pt-4">
          <button
            onClick={() => {
              setShowCodes((v) => !v);
              setExportVal("");
            }}
            className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase transition-colors hover:text-gold"
          >
            {showCodes ? "▾ Свернуть резервные коды" : "▸ Резервные коды (без облака)"}
          </button>
          {showCodes && (
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <div>
                <p className="font-mono text-[10px] tracking-[0.2em] text-dim uppercase">Экспорт реестра</p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => setExportVal(exportCode())}
                    className="border border-line px-4 py-2 font-mono text-[10px] tracking-[0.15em] text-mist uppercase transition-colors hover:border-gold/60 hover:text-gold"
                  >
                    Сформировать код
                  </button>
                  {exportVal && (
                    <button onClick={() => copy(exportVal)} className="border border-gold/50 px-4 py-2 font-mono text-[10px] tracking-[0.15em] text-gold uppercase transition-colors hover:bg-gold/10">
                      {copied ? "✓ copied" : "копировать"}
                    </button>
                  )}
                </div>
                {exportVal && (
                  <textarea readOnly value={exportVal} onFocus={(e) => e.target.select()} className="field mt-2 h-20 resize-none font-mono text-[10px]" />
                )}
              </div>
              <div>
                <p className="font-mono text-[10px] tracking-[0.2em] text-dim uppercase">Импорт реестра</p>
                <textarea
                  value={importVal}
                  onChange={(e) => setImportVal(e.target.value)}
                  placeholder="Вставьте код HYP2.… с другого устройства"
                  className="field mt-2 h-20 resize-none font-mono text-[10px]"
                />
                <button
                  onClick={() => {
                    const res = importCode(importVal);
                    setMsg({ ok: res.ok, text: res.msg });
                    if (res.ok) setImportVal("");
                  }}
                  disabled={importVal.trim().length < 10}
                  className="mt-2 border border-gold/50 px-4 py-2 font-mono text-[10px] tracking-[0.15em] text-gold uppercase transition-colors hover:bg-gold/10 disabled:opacity-40"
                >
                  Импортировать
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
