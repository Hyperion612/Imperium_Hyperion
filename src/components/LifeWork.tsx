import { useEffect, useRef, useState } from "react";
import { useLife } from "../lib/life";
import { useEmpire } from "../lib/state";
import { usePrefersReducedMotion } from "../lib/hooks";
import { ACHIEVEMENTS, AUTOS, RESOURCES, TOOLS, type ResourceId } from "../lib/lifeData";
import { HyperCoin, SunIcon } from "./Symbols";
import { fmtHyper } from "../lib/state";

interface Floater {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
}

let floatId = 0;

/** Общий HUD жизни гражданина: энергия, настроение, доход, Свет, престиж. */
export function LifeHud() {
  const { s, energyMax, moodMult, incomePerSec } = useLife();
  const { me } = useEmpire();
  if (!s || !me) return null;
  const moodLabel = s.mood >= 70 ? "вдохновлён" : s.mood <= 30 ? "утомлён" : "спокоен";
  return (
    <div className="grid gap-3 border border-line bg-panel p-4 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <div className="flex justify-between font-mono text-[10px] tracking-[0.2em] text-dim uppercase">
          <span>⚡ Энергия</span>
          <span className="text-ink tabular-nums">
            {Math.floor(s.energy)}/{energyMax}
          </span>
        </div>
        <div className="mt-1.5 h-2 w-full bg-line/70">
          <div
            className="h-full bg-gradient-to-r from-[#2a8f7f] to-hyper transition-all duration-500"
            style={{ width: `${(s.energy / energyMax) * 100}%` }}
          />
        </div>
      </div>
      <div>
        <div className="flex justify-between font-mono text-[10px] tracking-[0.2em] text-dim uppercase">
          <span>☾ Настроение · {moodLabel}</span>
          <span className="text-ink tabular-nums">{Math.round(s.mood)} · ×{moodMult.toFixed(2)}</span>
        </div>
        <div className="mt-1.5 h-2 w-full bg-line/70">
          <div
            className={`h-full transition-all duration-500 ${s.mood >= 70 ? "bg-gradient-to-r from-brass to-gold" : s.mood <= 30 ? "bg-ember" : "bg-gradient-to-r from-[#8a6d2f] to-goldsoft"}`}
            style={{ width: `${s.mood}%` }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 border border-line/70 bg-abyss px-3 py-2">
        <span className="font-mono text-[10px] tracking-[0.2em] text-dim uppercase">Пассив</span>
        <span className="font-mono text-[13px] font-bold text-hyper tabular-nums">+{incomePerSec.toFixed(1)} HY/с</span>
      </div>
      <div className="flex items-center justify-between gap-3 border border-line/70 bg-abyss px-3 py-2">
        <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.2em] text-dim uppercase">
          <SunIcon className="h-3.5 w-3.5 text-gold" /> Свет
        </span>
        <span className="font-mono text-[13px] font-bold text-gold tabular-nums">{me.light}</span>
        <span className="font-mono text-[10px] text-dim">✦ {s.prestige} престиж</span>
      </div>
    </div>
  );
}

export default function LifeWork() {
  const { s, clickResource, sellAll, buyTool, buyAuto, sleep, eat, resCount, moodMult, trophyMult } = useLife();
  const { me } = useEmpire();
  const reduced = usePrefersReducedMotion();
  const [sel, setSel] = useState<ResourceId>("stone");
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [flash, setFlash] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (floaters.length === 0) return;
    const t = window.setTimeout(() => setFloaters((f) => f.slice(1)), 800);
    return () => window.clearTimeout(t);
  }, [floaters]);

  if (!s || !me) return null;

  const res = RESOURCES.find((r) => r.id === sel)!;
  const tool = TOOLS[s.tool];
  const sellValue = RESOURCES.reduce((sum, r) => sum + (s.res[r.id] ?? 0) * r.value, 0);
  const nextAch = ACHIEVEMENTS.find((a) => !s.ach.includes(a.id));

  const onClickMine = (e: React.MouseEvent) => {
    const units = clickResource(sel);
    if (units <= 0) return;
    const rect = btnRef.current?.getBoundingClientRect();
    const x = rect ? e.clientX - rect.left : 60;
    const y = rect ? e.clientY - rect.top : 40;
    if (!reduced) {
      setFloaters((f) => [...f.slice(-14), { id: ++floatId, x, y, text: `+${units}`, color: units > tool.mult ? "#FFD700" : res.color }]);
      if (units > tool.mult) {
        setFlash(true);
        window.setTimeout(() => setFlash(false), 350);
      }
    }
  };

  return (
    <div className="space-y-6">
      <LifeHud />

      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        {/* ── кликер ── */}
        <div className="relative border border-line bg-panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-lg font-bold text-ink uppercase">Добыча ресурсов</h3>
            <span className="font-mono text-[11px] text-mist">
              инструмент: <b className="text-gold">{tool.name} ×{tool.mult}</b> · настроение ×{moodMult.toFixed(2)}
            </span>
          </div>

          {/* выбор ресурса */}
          <div className="mt-5 grid grid-cols-5 gap-2">
            {RESOURCES.map((r) => (
              <button
                key={r.id}
                onClick={() => setSel(r.id)}
                className={`relative border p-2.5 text-center transition-all duration-200 ${
                  sel === r.id ? "border-gold bg-panel2 shadow-[0_0_20px_rgba(227,181,74,0.15)]" : "border-line hover:border-line2"
                }`}
                title={`${r.name}: ${r.value} HY за единицу`}
              >
                <span
                  className={`mx-auto block h-3.5 w-3.5 rotate-45 ${r.rare ? "animate-soft-pulse" : ""}`}
                  style={{ background: r.color, boxShadow: r.rare ? `0 0 12px ${r.color}` : "none" }}
                />
                <span className="mt-2 block truncate font-mono text-[9.5px] tracking-[0.08em] text-mist uppercase">{r.name}</span>
                <span className="block font-mono text-[9px] text-dim">{r.value} HY</span>
                <span className="absolute top-1 right-1.5 font-mono text-[9px] text-ink tabular-nums">{resCount(r.id)}</span>
              </button>
            ))}
          </div>

          {/* большая кнопка */}
          <div className="relative mt-6 flex flex-col items-center">
            <button
              ref={btnRef}
              onClick={onClickMine}
              className={`clip-notch group relative flex h-52 w-52 select-none flex-col items-center justify-center border-2 transition-all duration-100 active:scale-[0.97] sm:h-60 sm:w-60 ${
                flash ? "border-[#FFD700] shadow-[0_0_70px_rgba(255,215,0,0.45)]" : "border-line2 hover:border-gold/70"
              }`}
              style={{ background: "radial-gradient(circle at 35% 30%, #16203a, #0a0f22 70%)" }}
            >
              <span
                className="block h-16 w-16 rotate-45 transition-transform duration-300 group-hover:rotate-[135deg] sm:h-20 sm:w-20"
                style={{ background: res.color, boxShadow: `0 0 ${res.rare ? 40 : 22}px ${res.color}66`, opacity: 0.92 }}
              />
              <span className="font-display mt-5 text-[15px] font-extrabold tracking-[0.2em] text-ink uppercase">{res.name}</span>
              <span className="mt-1 font-mono text-[10px] tracking-[0.25em] text-dim uppercase">клик = {tool.mult} ед · 0.2⚡</span>
              {floaters.map((f) => (
                <span
                  key={f.id}
                  className="pointer-events-none absolute font-mono text-[18px] font-bold"
                  style={{
                    left: f.x,
                    top: f.y,
                    color: f.color,
                    textShadow: `0 0 12px ${f.color}`,
                    animation: reduced ? "none" : "float-up 0.8s ease-out forwards",
                  }}
                >
                  {f.text}
                </span>
              ))}
            </button>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={sellAll}
                className="clip-notch bg-gold px-6 py-3 font-mono text-[12px] font-bold tracking-[0.18em] text-[#171006] uppercase transition-all hover:bg-goldsoft hover:shadow-[0_0_30px_rgba(227,181,74,0.35)] disabled:opacity-40"
                disabled={sellValue <= 0}
              >
                Продать всё · {fmtHyper(Math.floor(sellValue * moodMult * trophyMult))} HY
              </button>
              <button onClick={sleep} className="border border-line px-5 py-3 font-mono text-[11px] tracking-[0.15em] text-mist uppercase transition-colors hover:border-hyper/60 hover:text-hyper">
                Отдохнуть +30⚡
              </button>
              <button onClick={eat} className="border border-line px-5 py-3 font-mono text-[11px] tracking-[0.15em] text-mist uppercase transition-colors hover:border-hyper/60 hover:text-hyper">
                Поесть · 20 HY
              </button>
            </div>
          </div>

          {/* достижения */}
          <div className="mt-7 border-t border-line pt-4">
            <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-dim uppercase">
              <span>Достижения · кликов: {s.clicks.toLocaleString("ru-RU")}</span>
              <span className="text-gold">{s.ach.length}/{ACHIEVEMENTS.length}</span>
            </div>
            {nextAch && (
              <div className="mt-2.5">
                <div className="flex justify-between font-mono text-[10px] text-mist">
                  <span>«{nextAch.name}» — {nextAch.clicks.toLocaleString("ru-RU")} кликов</span>
                  <span className="text-gold">+{nextAch.reward.toLocaleString("ru-RU")} HY</span>
                </div>
                <div className="mt-1 h-1.5 w-full bg-line/70">
                  <div className="h-full bg-gradient-to-r from-brass to-gold transition-all duration-300" style={{ width: `${Math.min(100, (s.clicks / nextAch.clicks) * 100)}%` }} />
                </div>
              </div>
            )}
            <div className="mt-2.5 flex flex-wrap gap-2">
              {ACHIEVEMENTS.map((a) => (
                <span
                  key={a.id}
                  title={`${a.clicks.toLocaleString("ru-RU")} кликов`}
                  className={`border px-2 py-1 font-mono text-[9px] tracking-[0.12em] uppercase ${
                    s.ach.includes(a.id) ? "border-gold/60 text-gold" : "border-line text-dim opacity-60"
                  }`}
                >
                  {a.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── улучшения ── */}
        <div className="space-y-6">
          <div className="border border-line bg-panel p-5">
            <h4 className="font-mono text-[11px] tracking-[0.25em] text-gold uppercase">Инструменты</h4>
            <div className="mt-3 space-y-2">
              {TOOLS.map((t, i) => {
                const owned = i <= s.tool;
                const next = i === s.tool + 1;
                return (
                  <button
                    key={t.id}
                    disabled={owned || !next}
                    onClick={() => buyTool(i)}
                    className={`flex w-full items-center justify-between border px-3.5 py-2.5 transition-all ${
                      owned
                        ? "border-gold/40 bg-gold/5 text-gold"
                        : next
                          ? me.hyper >= t.price
                            ? "border-line hover:border-gold/60 hover:bg-panel2"
                            : "border-line opacity-55"
                          : "border-line opacity-40"
                    }`}
                  >
                    <span className="font-mono text-[12px] text-ink">
                      {t.name} <span className="ml-1 text-[10px] text-dim">×{t.mult}</span>
                    </span>
                    <span className={`font-mono text-[11px] ${owned ? "text-gold" : "text-mist"}`}>
                      {owned ? "✓ ваш" : `${fmtHyper(t.price)} HY`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border border-line bg-panel p-5">
            <h4 className="font-mono text-[11px] tracking-[0.25em] text-hyper uppercase">Автодобыча · наём</h4>
            <div className="mt-3 space-y-2">
              {AUTOS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => buyAuto(a.id)}
                  className={`flex w-full items-center justify-between border px-3.5 py-2.5 transition-all ${
                    me.hyper >= a.price ? "border-line hover:border-hyper/60 hover:bg-panel2" : "border-line opacity-55"
                  }`}
                >
                  <span className="text-left font-mono text-[12px] text-ink">
                    {a.name} <span className="ml-1 text-[10px] text-hyper">+{a.rate} HY/с</span>
                    <span className="ml-2 border border-line px-1.5 text-[10px] text-mist">×{s.autos[a.id] || 0}</span>
                  </span>
                  <span className="font-mono text-[11px] text-mist">{fmtHyper(a.price)} HY</span>
                </button>
              ))}
            </div>
            <p className="mt-3 font-mono text-[10px] tracking-[0.15em] text-dim uppercase">
              Добыто за всё время: <span className="text-ink">{fmtHyper(Math.floor(s.earnedTotal))} HY</span>
            </p>
          </div>

          <div className="flex items-center gap-3 border border-line bg-panel/60 p-4 font-mono text-[11px] text-mist">
            <HyperCoin className="h-5 w-5 shrink-0 text-gold" />
            Баланс: <b className="text-[14px] text-gold tabular-nums">{fmtHyper(me.hyper)} HY</b>
            <span className="ml-auto text-[10px] text-dim uppercase">сохранение каждые 30 с</span>
          </div>
        </div>
      </div>

    </div>
  );
}
