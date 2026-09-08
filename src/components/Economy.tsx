import { useEffect, useMemo, useState } from "react";
import { DECREES } from "../lib/data";
import { useCountUp, useInView, usePrefersReducedMotion } from "../lib/hooks";
import Reveal from "./Reveal";
import SectionHead, { Corners } from "./SectionHead";

const W = 620;
const H = 210;

function seedWalk(): number[] {
  const pts: number[] = [];
  let v = 121.6;
  for (let i = 0; i < 44; i++) {
    v += (Math.sin(i / 3.1) * 1.1 + (Math.random() - 0.47) * 2.4) * 0.9;
    v = Math.min(188, Math.max(96, v));
    pts.push(v);
  }
  return pts;
}

function Stat({ label, value, suffix = "", decimals = 0, accent = "text-ink" }: { label: string; value: number; suffix?: string; decimals?: number; accent?: string }) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const display = useCountUp(value, inView, 1800, decimals);
  return (
    <div ref={ref} className="group relative border border-line bg-panel p-5 transition-colors duration-300 hover:border-gold/50">
      <span aria-hidden className="absolute top-0 left-0 h-px w-0 bg-gold transition-all duration-500 group-hover:w-full" />
      <p className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase">{label}</p>
      <p className={`font-display mt-2 text-[clamp(1.3rem,2.4vw,1.9rem)] font-bold ${accent}`}>
        {display}
        {suffix && <span className="ml-1 text-[0.6em] text-gold">{suffix}</span>}
      </p>
    </div>
  );
}

function Chart({ points }: { points: number[] }) {
  const { linePath, areaPath, last, coords } = useMemo(() => {
    const min = Math.min(...points);
    const max = Math.max(...points);
    const pad = 14;
    const coords = points.map((v, i) => {
      const x = (i / (points.length - 1)) * W;
      const y = pad + (1 - (v - min) / (max - min || 1)) * (H - pad * 2);
      return [x, y] as const;
    });
    const linePath = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    const areaPath = `${linePath} L${W},${H} L0,${H} Z`;
    return { linePath, areaPath, last: coords[coords.length - 1], coords };
  }, [points]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(227,181,74,0.32)" />
          <stop offset="100%" stopColor="rgba(227,181,74,0)" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" y1={H * f} x2={W} y2={H * f} stroke="#1c2740" strokeDasharray="3 6" />
      ))}
      <path d={areaPath} fill="url(#chartFill)" />
      <path d={linePath} fill="none" stroke="#e3b54a" strokeWidth="2" strokeLinejoin="round" className="drop-shadow-[0_0_8px_rgba(227,181,74,0.5)]" />
      {coords.filter((_, i) => i % 6 === 0).map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.2" fill="#0c1222" stroke="#e3b54a" strokeWidth="1.2" />
      ))}
      <circle cx={last[0]} cy={last[1]} r="12" fill="none" stroke="#57ddc4" strokeWidth="1.4" className="pulse-dot" />
      <circle cx={last[0]} cy={last[1]} r="4" fill="#57ddc4" />
    </svg>
  );
}

const ALLOCATION = [
  { name: "Резерв Империи", pct: 40, color: "from-brass to-gold" },
  { name: "Флот Нереид", pct: 18, color: "from-[#2a8f7f] to-hyper" },
  { name: "Бюджеты провинций", pct: 18, color: "from-[#8a6d2f] to-goldsoft" },
  { name: "Академия Авроры", pct: 14, color: "from-[#2a6f8f] to-[#6fc3dd]" },
  { name: "Чрезвычайный фонд", pct: 10, color: "from-[#8f3a2a] to-ember" },
];

export default function Economy() {
  const reduced = usePrefersReducedMotion();
  const [points, setPoints] = useState<number[]>(seedWalk);
  const [amount, setAmount] = useState("100");
  const [allocRef, allocInView] = useInView<HTMLDivElement>();

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      setPoints((prev) => {
        const last = prev[prev.length - 1];
        const next = Math.min(188, Math.max(96, last + (Math.random() - 0.47) * 2.6));
        return [...prev.slice(1), next];
      });
    }, 1700);
    return () => window.clearInterval(id);
  }, [reduced]);

  const rate = points[points.length - 1];
  const prev = points[points.length - 2] ?? rate;
  const change = ((rate - prev) / prev) * 100;
  const up = change >= 0;

  const amt = parseFloat(amount.replace(",", ".")) || 0;
  const usd = amt * rate;
  const rub = usd * 92.4;

  return (
    <section id="economy" className="relative border-t border-line bg-void">
      {/* decrees ticker */}
      <div className="overflow-hidden border-y border-line bg-panel/60 py-3">
        <div className="marquee-track gap-12">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 gap-12" aria-hidden={dup === 1}>
              {DECREES.map((d) => (
                <span key={`${dup}-${d}`} className="animate-ticker-glow font-mono text-[11px] tracking-[0.25em] whitespace-nowrap text-gold/85 uppercase">
                  ✦ {d}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-10 md:px-16 md:py-32">
        <div
          aria-hidden
          className="pointer-events-none absolute top-20 -left-40 h-[26rem] w-[26rem] rounded-full blur-[130px]"
          style={{ background: "radial-gradient(circle, rgba(87,221,196,0.08), transparent 65%)" }}
        />
        <SectionHead
          index="§ 04"
          kicker="Казначейство"
          title="Экономика и валюта Hyper"
          sub="Hyper (HY) — единственная платёжная единица Империи. Эмиссия ограничена Хартией: 21 000 000 HY, ни единицей больше. Казначейство отчитывается ежемесячно."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Предел эмиссии" value={21000000} suffix="HY" accent="text-gold" />
          <Stat label="В обращении" value={8412330} suffix="HY" />
          <Stat label="Транзакций / сутки" value={118204} accent="text-hyper" />
          <Stat label="Комиссия Империи" value={0} suffix="%" decimals={0} />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          {/* live chart */}
          <Reveal className="relative border border-line bg-panel p-6">
            <Corners />
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] tracking-[0.3em] text-dim uppercase">Биржа Гелиос-Дельта · HY/USD</p>
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="font-display text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold text-ink">
                    ${rate.toFixed(2)}
                  </span>
                  <span className={`font-mono text-[13px] font-bold ${up ? "text-hyper" : "text-ember"}`}>
                    {up ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="text-right font-mono text-[10px] leading-relaxed tracking-[0.2em] text-dim uppercase">
                <div>
                  Макс: <span className="text-mist">${Math.max(...points).toFixed(2)}</span>
                </div>
                <div>
                  Мин: <span className="text-mist">${Math.min(...points).toFixed(2)}</span>
                </div>
                <div className="mt-1 flex items-center justify-end gap-2 text-hyper">
                  <span className="inline-block h-1.5 w-1.5 animate-soft-pulse rounded-full bg-hyper" /> поток торгов: живой
                </div>
              </div>
            </div>
            <div className="mt-5 h-52 sm:h-60">
              <Chart points={points} />
            </div>
            <div className="mt-3 flex justify-between font-mono text-[9px] tracking-[0.25em] text-dim uppercase">
              <span>-72ч</span>
              <span>-48ч</span>
              <span>-24ч</span>
              <span className="text-gold">сейчас</span>
            </div>
          </Reveal>

          {/* converter */}
          <Reveal delay={100} className="flex flex-col gap-6">
            <div className="relative flex-1 border border-line bg-panel p-6">
              <Corners />
              <p className="font-mono text-[10px] tracking-[0.3em] text-gold uppercase">Обмен HY</p>
              <label className="mt-4 block">
                <span className="mb-1.5 block font-mono text-[10px] tracking-[0.2em] text-dim uppercase">Сумма в Hyper</span>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="field pr-12 font-mono text-lg"
                    placeholder="100"
                  />
                  <span className="absolute top-1/2 right-3 -translate-y-1/2 font-mono text-[12px] font-bold text-gold">HY</span>
                </div>
              </label>
              <div className="mt-3 flex gap-2">
                {[10, 100, 1000, 5000].map((q) => (
                  <button
                    key={q}
                    onClick={() => setAmount(String(q))}
                    className={`flex-1 border px-2 py-1.5 font-mono text-[11px] transition-all ${
                      amount === String(q)
                        ? "border-gold bg-gold/10 text-gold"
                        : "border-line text-mist hover:border-gold/50 hover:text-gold"
                    }`}
                  >
                    {q.toLocaleString("ru-RU")}
                  </button>
                ))}
              </div>
              <div className="mt-5 space-y-2.5 border-t border-line pt-4 font-mono text-[13px]">
                <div className="flex items-baseline justify-between">
                  <span className="text-dim">USD</span>
                  <span className="text-[17px] font-bold text-ink">${usd.toLocaleString("ru-RU", { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-dim">RUB</span>
                  <span className="text-[17px] font-bold text-hyper">₽{rub.toLocaleString("ru-RU", { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
              <p className="mt-4 font-mono text-[9px] tracking-[0.2em] text-dim uppercase">Курс фиксируется Казначейством · 1 HY = ${rate.toFixed(2)}</p>
            </div>

            {/* allocation */}
            <div ref={allocRef} className="relative border border-line bg-panel p-6">
              <p className="font-mono text-[10px] tracking-[0.3em] text-gold uppercase">Распределение казны · Q-I 2026</p>
              <div className="mt-4 space-y-3.5">
                {ALLOCATION.map((a, i) => (
                  <div key={a.name}>
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-mist">{a.name}</span>
                      <span className="text-ink">{a.pct}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full bg-line/70">
                      <div
                        className={`h-full bg-gradient-to-r ${a.color} transition-all duration-1000 ease-out`}
                        style={{ width: allocInView ? `${a.pct}%` : "0%", transitionDelay: `${i * 120}ms` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
