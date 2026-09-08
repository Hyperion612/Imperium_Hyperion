import { useState } from "react";
import { useEmpire } from "../lib/state";
import { Corners } from "./SectionHead";

/** Панель синхронизации: экспорт/импорт реестра кодом (без облака). */
export default function SyncPanel() {
  const { exportCode, importCode, notify } = useEmpire();

  const [exportVal, setExportVal] = useState("");
  const [importVal, setImportVal] = useState("");
  const [copied, setCopied] = useState(false);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      notify("Не удалось скопировать — выделите код вручную.", "ember");
    }
  };

  return (
    <div className="relative border border-gold/30 bg-panel p-6">
      <Corners className="text-gold/50" />
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center border border-gold/40 text-gold">
          <svg viewBox="0 0 48 48" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
            <path d="M14 36a9 9 0 0 1-1-17.9A12 12 0 0 1 36.5 20 8 8 0 0 1 35 36z" strokeLinejoin="round" />
            <path d="M24 24v9M20 28l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <div>
          <h3 className="font-display text-[15px] font-bold tracking-wide text-ink uppercase">Синхронизация Империи</h3>
          <p className="font-mono text-[10px] tracking-[0.2em] text-dim uppercase">
            перенос реестра между устройствами
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-6 md:grid-cols-2">
        <div>
          <p className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase">Экспорт реестра</p>
          <p className="mt-2 text-[12px] leading-relaxed text-mist">
            Создайте код реестра на этом устройстве и скопируйте его.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setExportVal(exportCode())}
              className="border border-line px-4 py-2 font-mono text-[10px] tracking-[0.15em] text-mist uppercase transition-colors hover:border-gold/60 hover:text-gold"
            >
              Сформировать код
            </button>
            {exportVal && (
              <button onClick={() => copy(exportVal)} className="border border-gold/50 px-4 py-2 font-mono text-[10px] tracking-[0.15em] text-gold uppercase transition-colors hover:bg-gold/10">
                {copied ? "✓ скопировано" : "копировать"}
              </button>
            )}
          </div>
          {exportVal && (
            <textarea readOnly value={exportVal} onFocus={(e) => e.target.select()} className="field mt-2 h-24 resize-none font-mono text-[9px]" />
          )}
        </div>
        <div>
          <p className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase">Импорт реестра</p>
          <p className="mt-2 text-[12px] leading-relaxed text-mist">
            Вставьте код реестра с другого устройства (телефон, ноутбук).
          </p>
          <textarea
            value={importVal}
            onChange={(e) => setImportVal(e.target.value)}
            placeholder="Вставьте код HYP2.… с другого устройства"
            className="field mt-3 h-24 resize-none font-mono text-[9px]"
          />
          <button
            onClick={() => {
              const res = importCode(importVal);
              if (res.ok) {
                setImportVal("");
                notify("Реестр импортирован. Все данные загружены.", "gold");
              } else {
                notify(res.msg, "ember");
              }
            }}
            disabled={importVal.trim().length < 10}
            className="mt-3 border border-gold/50 px-4 py-2 font-mono text-[10px] tracking-[0.15em] text-gold uppercase transition-colors hover:bg-gold/10 disabled:opacity-40"
          >
            Импортировать
          </button>
        </div>
      </div>

      <div className="mt-5 border-t border-line pt-4">
        <p className="font-mono text-[9px] tracking-[0.15em] text-dim uppercase leading-relaxed">
          Как синхронизировать: 1) На устройстве с данными нажмите «Сформировать код» и скопируйте. 2) На другом устройстве вставьте код в поле «Импорт» и нажмите «Импортировать». 3) Все данные (граждане, казна, рынок) будут перенесены.
        </p>
      </div>
    </div>
  );
}
