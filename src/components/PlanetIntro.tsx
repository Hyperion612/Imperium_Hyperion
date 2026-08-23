import { useEffect, useState } from "react";
import { REGIONS } from "../lib/data";
import { smoothstep, useParallax, usePrefersReducedMotion, useSceneProgress, useScramble } from "../lib/hooks";
import Starfield from "./Starfield";
import HyperionMap from "./HyperionMap";
import Reveal from "./Reveal";
import SectionHead, { Corners } from "./SectionHead";

interface PlanetIntroProps {
  onSettle: (regionId: string) => void;
}

function PlanetArt() {
  return (
    <svg viewBox="0 0 600 600" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id="pBase" cx="38%" cy="34%" r="75%">
          <stop offset="0%" stopColor="#1b3a5c" />
          <stop offset="55%" stopColor="#0d1e36" />
          <stop offset="100%" stopColor="#060b17" />
        </radialGradient>
        <linearGradient id="pLand" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b08d3f" />
          <stop offset="60%" stopColor="#7d6231" />
          <stop offset="100%" stopColor="#4d3f24" />
        </linearGradient>
        <radialGradient id="pShade" cx="30%" cy="28%" r="85%">
          <stop offset="0%" stopColor="rgba(0,0,0,0)" />
          <stop offset="58%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(2,4,10,0.92)" />
        </radialGradient>
        <radialGradient id="pHi" cx="32%" cy="26%" r="30%">
          <stop offset="0%" stopColor="rgba(242,215,144,0.28)" />
          <stop offset="100%" stopColor="rgba(242,215,144,0)" />
        </radialGradient>
        <filter id="atmoBlur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <clipPath id="pClip">
          <circle cx="300" cy="300" r="228" />
        </clipPath>
      </defs>

      {/* atmosphere */}
      <circle cx="300" cy="300" r="238" fill="none" stroke="#e3b54a" strokeOpacity="0.16" strokeWidth="26" filter="url(#atmoBlur)" />
      <circle cx="300" cy="300" r="230" fill="none" stroke="#57ddc4" strokeOpacity="0.1" strokeWidth="10" filter="url(#atmoBlur)" />

      {/* HUD degree ring */}
      <g className="animate-orbit" style={{ transformOrigin: "300px 300px" }}>
        <circle cx="300" cy="300" r="266" fill="none" stroke="#e3b54a" strokeOpacity="0.22" strokeDasharray="2 10" />
        {Array.from({ length: 36 }).map((_, i) => {
          const a = (i / 36) * Math.PI * 2;
          const r1 = 258;
          const r2 = i % 9 === 0 ? 274 : 264;
          return (
            <line
              key={i}
              x1={300 + Math.cos(a) * r1}
              y1={300 + Math.sin(a) * r1}
              x2={300 + Math.cos(a) * r2}
              y2={300 + Math.sin(a) * r2}
              stroke="#e3b54a"
              strokeOpacity={i % 9 === 0 ? 0.5 : 0.22}
              strokeWidth="1"
            />
          );
        })}
        <text x="300" y="24" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" letterSpacing="3" fill="#e3b54a" fillOpacity="0.7">
          47.3°N
        </text>
        <text x="300" y="586" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" letterSpacing="3" fill="#93a0b8" fillOpacity="0.6">
          12.8°E
        </text>
      </g>

      {/* orbit rings + satellites */}
      <ellipse cx="300" cy="300" rx="292" ry="104" fill="none" stroke="#e3b54a" strokeOpacity="0.18" strokeDasharray="3 8" transform="rotate(-16 300 300)" />
      <g className="animate-orbit-fast" style={{ transformOrigin: "300px 300px" }}>
        <circle cx="592" cy="300" r="9" fill="#57ddc4" opacity="0.22" />
        <circle cx="592" cy="300" r="3.5" fill="#57ddc4" />
      </g>
      <g className="animate-orbit-rev" style={{ transformOrigin: "300px 300px" }}>
        <circle cx="300" cy="44" r="8" fill="#e3b54a" opacity="0.22" />
        <circle cx="300" cy="44" r="3" fill="#e3b54a" />
      </g>

      {/* sphere */}
      <circle cx="300" cy="300" r="228" fill="url(#pBase)" />

      <g clipPath="url(#pClip)">
        {/* continents */}
        <g fill="url(#pLand)" stroke="#c9a44e" strokeOpacity="0.35" strokeWidth="1">
          <path d="M180 190 C230 150 320 140 380 170 C430 195 440 240 400 275 C360 310 300 300 250 310 C200 320 150 290 150 250 C150 220 158 208 180 190 Z" opacity="0.92" />
          <path d="M330 330 C380 305 450 310 490 345 C530 380 520 430 470 455 C420 480 350 470 320 435 C290 400 295 355 330 330 Z" opacity="0.85" />
          <path d="M150 360 C180 340 230 345 250 375 C270 405 255 440 215 448 C175 456 140 435 135 405 C132 385 135 372 150 360 Z" opacity="0.8" />
          <path d="M420 160 C450 145 490 150 505 175 C520 200 505 228 470 232 C435 236 410 215 408 192 C407 176 410 168 420 160 Z" opacity="0.75" />
        </g>
        {/* polar cap */}
        <path d="M210 84 C260 66 360 66 400 84 C380 108 250 108 210 84 Z" fill="#e9edf6" opacity="0.16" />

        {/* rotating clouds */}
        <g className="animate-orbit" style={{ transformOrigin: "300px 300px" }} fill="#e9edf6" opacity="0.09">
          <ellipse cx="230" cy="210" rx="90" ry="22" />
          <ellipse cx="390" cy="300" rx="110" ry="26" />
          <ellipse cx="280" cy="410" rx="80" ry="20" />
          <ellipse cx="420" cy="170" rx="60" ry="16" />
        </g>

        {/* city lights */}
        <g fill="#f2d790">
          <circle cx="262" cy="238" r="2.6" className="animate-soft-pulse" />
          <circle cx="352" cy="258" r="2" className="animate-soft-pulse" style={{ animationDelay: "0.6s" }} />
          <circle cx="404" cy="372" r="2.4" className="animate-soft-pulse" style={{ animationDelay: "1.2s" }} />
          <circle cx="222" cy="398" r="1.8" className="animate-soft-pulse" style={{ animationDelay: "0.9s" }} />
          <circle cx="308" cy="352" r="1.8" className="animate-soft-pulse" style={{ animationDelay: "1.6s" }} />
        </g>

        {/* graticule on sphere */}
        <g fill="none" stroke="#57ddc4" strokeOpacity="0.09">
          <ellipse cx="300" cy="300" rx="228" ry="80" />
          <ellipse cx="300" cy="300" rx="228" ry="160" />
          <ellipse cx="300" cy="300" rx="80" ry="228" />
          <ellipse cx="300" cy="300" rx="160" ry="228" />
        </g>

        {/* terminator + highlight */}
        <circle cx="300" cy="300" r="228" fill="url(#pShade)" />
        <circle cx="300" cy="300" r="228" fill="url(#pHi)" />
      </g>

      <circle cx="300" cy="300" r="228" fill="none" stroke="#f2d790" strokeOpacity="0.28" strokeWidth="1.2" />
    </svg>
  );
}

export default function PlanetIntro({ onSettle }: PlanetIntroProps) {
  const reduced = usePrefersReducedMotion();
  const [setSceneRef, p] = useSceneProgress<HTMLElement>();
  const [setPlanetParallax] = useParallax<HTMLDivElement>(18, reduced);
  const [setMapParallax] = useParallax<HTMLDivElement>(8, reduced);
  const [selected, setSelected] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useState(() => {
    const t = window.setTimeout(() => setMounted(true), 150);
    return () => window.clearTimeout(t);
  });

  const line1 = useScramble("ИМПЕРИЯ", mounted);
  const line2 = useScramble("ГИПЕРИОН", mounted, 30);

  const titleO = 1 - smoothstep(0.06, 0.26, p);
  const hudO = 1 - smoothstep(0.09, 0.32, p);
  const planetO = 1 - smoothstep(0.44, 0.64, p);
  const mapO = smoothstep(0.5, 0.74, p);
  const mapScale = 1.18 - 0.18 * smoothstep(0.5, 0.9, p);
  const planetScale = 1 + smoothstep(0, 0.72, p) * 6.2;
  const starO = 1 - smoothstep(0.55, 0.9, p) * 0.6;
  const interactive = p > 0.7;

  const settle = (id: string) => {
    onSettle(id);
    document.getElementById("passport")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <>
      {/* ── SCENE: space → planet → map ─────────────────────── */}
      <section id="planet" ref={setSceneRef} className="relative h-[340vh]">
        <div className="sticky top-0 h-screen overflow-hidden bg-void">
          <div className="absolute inset-0" style={{ opacity: starO }}>
            <Starfield />
          </div>

          {/* ambient nebulas */}
          <div
            aria-hidden
            className="absolute -top-40 -left-40 h-[46rem] w-[46rem] rounded-full opacity-25 blur-[120px]"
            style={{ background: "radial-gradient(circle, rgba(227,181,74,0.32), transparent 65%)", opacity: 0.22 * (1 - smoothstep(0.4, 0.8, p)) }}
          />
          <div
            aria-hidden
            className="absolute -right-52 -bottom-52 h-[42rem] w-[42rem] rounded-full blur-[130px]"
            style={{ background: "radial-gradient(circle, rgba(87,221,196,0.22), transparent 65%)", opacity: 0.2 * (1 - smoothstep(0.4, 0.8, p)) }}
          />

          {/* planet layer */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: planetO }}>
            <div ref={setPlanetParallax} className="will-change-transform">
              <div
                className="h-[min(74vh,88vw)] w-[min(74vh,88vw)] will-change-transform"
                style={{ transform: `scale(${planetScale})`, transformOrigin: "60% 42%" }}
              >
                <PlanetArt />
              </div>
            </div>
          </div>

          {/* title layer */}
          <div
            className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between px-5 py-24 sm:px-10 md:px-16 md:py-28"
            style={{ opacity: titleO }}
          >
            <div className="mt-2 max-w-3xl">
              <p className="flex items-center gap-3 font-mono text-[11px] tracking-[0.32em] text-hyper uppercase">
                <span className="inline-block h-1.5 w-1.5 animate-soft-pulse rounded-full bg-hyper" />
                Сектор 7G · система Гелиос-Прайм · орбита стабильна
                <span className="animate-blink text-gold">▍</span>
              </p>
              <h1 className="font-display mt-6 text-[clamp(2.7rem,9.5vw,7rem)] leading-[0.98] font-extrabold tracking-tight">
                <span className="block text-ink">{line1}</span>
                <span className="block text-gold drop-shadow-[0_0_34px_rgba(227,181,74,0.3)]">{line2}</span>
              </h1>
              <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-mist md:text-base">
                Цифровое государство нового типа. Своя конституция, валюта Hyper, шесть провинций,
                цифровой паспорт и еженедельные Великие Собрания. Добровольно. Навсегда. По Порядку.
              </p>
            </div>

            <div className="flex items-end justify-between font-mono text-[11px] tracking-[0.22em] text-dim uppercase" style={{ opacity: hudO }}>
              <div className="hidden sm:block">
                <div className="text-gold/80">Широта 47.3°N · Долгота 12.8°E</div>
                <div className="mt-1">Ядро: стабильно · Флот: патруль 12 · Связь: 100%</div>
              </div>
              <div className="flex items-center gap-3 text-mist">
                <span>Прокрутите — приближение к поверхности</span>
                <span className="animate-float inline-flex flex-col items-center gap-0.5 text-gold">
                  <span className="block h-8 w-px bg-gradient-to-b from-transparent to-gold" />
                  ▼
                </span>
              </div>
            </div>
          </div>

          {/* vertical side label */}
          <div
            aria-hidden
            className="absolute top-1/2 right-6 hidden -translate-y-1/2 rotate-90 font-mono text-[10px] tracking-[0.6em] whitespace-nowrap text-dim uppercase lg:block"
            style={{ opacity: titleO * 0.8 }}
          >
            Imperium Hyperion · MMXXVI
          </div>

          {/* map layer */}
          <div
            className="absolute inset-0 z-20"
            style={{ opacity: mapO, pointerEvents: interactive ? "auto" : "none" }}
          >
            <div
              ref={setMapParallax}
              className="h-full w-full will-change-transform"
              style={{ transform: `scale(${mapScale})` }}
            >
              <HyperionMap selected={selected} interactive={interactive} onSelect={setSelected} onSettle={settle} />
            </div>
            <div className="scan-band" style={{ opacity: mapO * 0.8 }} />
            <div className="pointer-events-none absolute top-20 left-5 hidden font-mono text-[10px] tracking-[0.3em] text-gold/70 uppercase md:block" style={{ opacity: mapO }}>
              Гербовая карта · поверхность планеты
            </div>
            <div className="pointer-events-none absolute right-5 bottom-5 hidden font-mono text-[10px] tracking-[0.3em] text-hyper/70 uppercase md:block" style={{ opacity: mapO }}>
              Синхронизация 100%
            </div>
          </div>
        </div>
      </section>

      {/* ── TERRITORIES ─────────────────────────────────────── */}
      <section id="territories" className="hud-grid relative border-t border-line bg-abyss px-5 py-24 sm:px-10 md:px-16 md:py-32">
        <SectionHead
          index="§ 01"
          kicker="Территории"
          title="Шесть провинций Империи"
          sub="Каждая провинция — самоуправляемая земля со своей столицей, промыслом и бюджетом в Hyper. Выберите землю, которой присягнёте."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REGIONS.map((r, i) => (
            <Reveal key={r.id} delay={i * 70}>
              <button
                onClick={() => settle(r.id)}
                className="group relative w-full border border-line bg-panel p-6 text-left transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/70 hover:bg-panel2 hover:shadow-[0_18px_50px_-18px_rgba(227,181,74,0.25)]"
              >
                <Corners className="text-gold/0 transition-colors duration-300 group-hover:text-gold/60" />
                <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.25em]">
                  <span className="text-gold">{r.code}</span>
                  <span className="text-dim">ИНДЕКС {r.index}</span>
                </div>
                <h3 className="font-display mt-3 text-[17px] font-semibold text-ink transition-colors group-hover:text-goldsoft">
                  {r.name}
                </h3>
                <p className="mt-1 font-mono text-[12px] text-mist">
                  Столица: <span className="text-ink">{r.capital}</span> · {r.population}
                </p>
                <p className="mt-3 text-[13px] leading-relaxed text-dim">{r.industry}</p>
                <div className="mt-4 h-0.5 w-full bg-line">
                  <div
                    className="h-full bg-gradient-to-r from-brass via-gold to-hyper transition-all duration-700"
                    style={{ width: `${r.index}%` }}
                  />
                </div>
                <span className="mt-4 inline-block font-mono text-[11px] tracking-[0.2em] text-gold opacity-0 uppercase transition-all duration-300 group-hover:opacity-100">
                  Переселиться →
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
