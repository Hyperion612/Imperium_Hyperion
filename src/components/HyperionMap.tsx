import { useState } from "react";
import { REGIONS } from "../lib/data";
import { Corners } from "./SectionHead";

interface HyperionMapProps {
  selected: string | null;
  interactive: boolean;
  onSelect: (id: string | null) => void;
  onSettle: (id: string) => void;
}

const GOLD = "#e3b54a";
const GOLD_SOFT = "#f2d790";
const MIST = "#93a0b8";
const DIM = "#5c6880";
const HYPER = "#57ddc4";
const MONO = "JetBrains Mono, monospace";

export default function HyperionMap({ selected, interactive, onSelect, onSettle }: HyperionMapProps) {
  const [hover, setHover] = useState<string | null>(null);
  const region = REGIONS.find((r) => r.id === selected) ?? null;

  return (
    <div className="relative h-full w-full">
      <svg viewBox="0 0 1000 640" className="h-full w-full" role="img" aria-label="Гербовая карта Империи Гиперион">
        <defs>
          <radialGradient id="seaVig" cx="50%" cy="50%" r="72%">
            <stop offset="0%" stopColor="rgba(16,26,46,0.55)" />
            <stop offset="65%" stopColor="rgba(8,12,24,0.15)" />
            <stop offset="100%" stopColor="rgba(5,7,15,0.9)" />
          </radialGradient>
          <filter id="landGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="7" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect x="0" y="0" width="1000" height="640" fill="url(#seaVig)" />

        {/* graticule */}
        <g stroke={GOLD} strokeOpacity="0.06">
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={`v${i}`} x1={(i + 1) * 100} y1="0" x2={(i + 1) * 100} y2="640" />
          ))}
          {Array.from({ length: 7 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={(i + 1) * 80} x2="1000" y2={(i + 1) * 80} />
          ))}
        </g>
        <g fontFamily={MONO} fontSize="10" fill={DIM}>
          {Array.from({ length: 9 }).map((_, i) => (
            <text key={`xl${i}`} x={(i + 1) * 100 + 4} y="14">
              {(i + 1) * 10}°E
            </text>
          ))}
          {Array.from({ length: 7 }).map((_, i) => (
            <text key={`yl${i}`} x="6" y={(i + 1) * 80 - 4}>
              {52 - i * 2}°N
            </text>
          ))}
        </g>

        {/* sea routes */}
        <polyline
          points="505,500 592,328 470,148"
          fill="none"
          stroke={HYPER}
          strokeOpacity="0.35"
          strokeWidth="1.4"
          className="route-dash"
        />
        <polyline
          points="505,500 754,492 880,326 592,328"
          fill="none"
          stroke={HYPER}
          strokeOpacity="0.3"
          strokeWidth="1.4"
          className="route-dash"
        />
        <polyline
          points="505,500 300,332 470,148"
          fill="none"
          stroke={HYPER}
          strokeOpacity="0.28"
          strokeWidth="1.4"
          className="route-dash"
        />

        {/* provinces */}
        {REGIONS.map((r) => {
          const isSel = selected === r.id;
          const isHov = hover === r.id;
          return (
            <g
              key={r.id}
              className={interactive ? "cursor-pointer" : undefined}
              style={{ pointerEvents: interactive ? "auto" : "none" }}
              onMouseEnter={() => setHover(r.id)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onSelect(isSel ? null : r.id)}
            >
              <path
                d={r.d}
                fill={isSel ? "#1e3757" : isHov ? "#182c49" : "#12203a"}
                stroke={isSel ? GOLD_SOFT : isHov ? GOLD : "#2c3d61"}
                strokeWidth={isSel ? 2.2 : 1.3}
                filter={isSel ? "url(#landGlow)" : undefined}
                style={{ transition: "fill 0.3s, stroke 0.3s" }}
              />
              <text
                x={r.label[0]}
                y={r.label[1]}
                textAnchor="middle"
                fontFamily={MONO}
                fontSize="13"
                letterSpacing="2.5"
                fill={isSel ? GOLD_SOFT : isHov ? "#c8d2e4" : MIST}
                style={{ textTransform: "uppercase", transition: "fill 0.3s", pointerEvents: "none" }}
              >
                {r.name}
              </text>
              <text
                x={r.label[0]}
                y={r.label[1] + 16}
                textAnchor="middle"
                fontFamily={MONO}
                fontSize="10"
                fill={DIM}
                style={{ pointerEvents: "none" }}
              >
                {r.code} · {r.population}
              </text>
              {r.marker && (
                <g style={{ pointerEvents: "none" }}>
                  <circle cx={r.marker[0]} cy={r.marker[1]} r="10" fill="none" stroke={GOLD} strokeWidth="1" className="pulse-dot" />
                  <circle cx={r.marker[0]} cy={r.marker[1]} r="3.2" fill={GOLD} />
                </g>
              )}
              {r.capitalStar && (
                <g style={{ pointerEvents: "none" }}>
                  <path
                    d={`M${r.marker![0]} ${r.marker![1] - 13} l3.4 9.6 9.6 3.4 -9.6 3.4 -3.4 9.6 -3.4 -9.6 -9.6 -3.4 9.6 -3.4z`}
                    fill={GOLD_SOFT}
                  />
                  <text
                    x={r.marker![0]}
                    y={r.marker![1] - 22}
                    textAnchor="middle"
                    fontFamily={MONO}
                    fontSize="10"
                    letterSpacing="1.5"
                    fill={GOLD_SOFT}
                  >
                    СТОЛИЦА
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* compass */}
        <g transform="translate(84,86)" stroke={MIST} fill="none" opacity="0.8">
          <circle r="30" strokeWidth="1" />
          <circle r="24" strokeWidth="0.6" opacity="0.5" />
          <path d="M0 -26 L5 0 L0 8 L-5 0 Z" fill={GOLD} stroke="none" />
          <path d="M-26 0 H-18 M18 0 H26 M0 18 V26" strokeWidth="1" />
          <text x="0" y="-36" textAnchor="middle" fontFamily={MONO} fontSize="11" fill={GOLD} stroke="none">
            N
          </text>
        </g>

        {/* scale bar */}
        <g transform="translate(64,596)" fontFamily={MONO} fontSize="10" fill={MIST}>
          <line x1="0" y1="0" x2="160" y2="0" stroke={MIST} strokeWidth="1.4" />
          {[0, 80, 160].map((x) => (
            <line key={x} x1={x} y1="-5" x2={x} y2="5" stroke={MIST} strokeWidth="1.4" />
          ))}
          <text x="0" y="18">0</text>
          <text x="68" y="18">500</text>
          <text x="140" y="18">1000 км</text>
        </g>

        <text x="986" y="624" textAnchor="end" fontFamily={MONO} fontSize="10" letterSpacing="2" fill={DIM}>
          ГЕРБОВАЯ КАРТА · М 1:12 000 000 · СЕТОЧНАЯ ПРОЕКЦИЯ
        </text>
      </svg>

      {/* region dossier panel */}
      <div
        className={`absolute top-20 right-4 w-[290px] max-w-[86vw] border border-line bg-abyss/92 p-5 backdrop-blur-sm transition-all duration-500 md:top-24 ${
          region ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-6 opacity-0"
        }`}
      >
        <Corners />
        {region && (
          <>
            <div className="flex items-start justify-between gap-2">
              <div className="font-mono text-[10px] tracking-[0.25em] text-gold">{region.code}</div>
              <button
                onClick={() => onSelect(null)}
                aria-label="Закрыть"
                className="font-mono text-mist transition-colors hover:text-gold"
              >
                [×]
              </button>
            </div>
            <h3 className="font-display mt-2 text-lg leading-tight font-semibold text-ink">{region.name}</h3>
            <dl className="mt-4 space-y-2.5 font-mono text-[12px]">
              <div className="flex justify-between gap-3 border-b border-line/60 pb-2">
                <dt className="text-dim">Столица</dt>
                <dd className="text-ink">{region.capital}</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-line/60 pb-2">
                <dt className="text-dim">Население</dt>
                <dd className="text-ink">{region.population}</dd>
              </div>
              <div className="border-b border-line/60 pb-2">
                <dt className="text-dim">Промысел</dt>
                <dd className="mt-1 text-hyper">{region.industry}</dd>
              </div>
            </dl>
            <div className="mt-3">
              <div className="flex justify-between font-mono text-[10px] tracking-widest text-dim">
                <span>ИНДЕКС БЛАГОПОЛУЧИЯ</span>
                <span className="text-gold">{region.index}/100</span>
              </div>
              <div className="mt-1.5 h-1 w-full bg-line">
                <div
                  className="h-full bg-gradient-to-r from-brass to-gold transition-all duration-700"
                  style={{ width: `${region.index}%` }}
                />
              </div>
            </div>
            <button
              onClick={() => onSettle(region.id)}
              className="clip-notch mt-5 w-full bg-gold px-4 py-2.5 font-mono text-[12px] font-bold tracking-[0.2em] text-[#171006] uppercase transition-all hover:bg-goldsoft hover:shadow-[0_0_28px_rgba(227,181,74,0.35)]"
            >
              Оформить резиденцию →
            </button>
          </>
        )}
      </div>

      {!region && (
        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 border border-line bg-abyss/80 px-5 py-2 font-mono text-[11px] tracking-[0.25em] text-mist uppercase backdrop-blur-sm">
          <span className="mr-2 inline-block h-1.5 w-1.5 animate-soft-pulse rounded-full bg-hyper align-middle" />
          Выберите провинцию на карте
        </div>
      )}
    </div>
  );
}
