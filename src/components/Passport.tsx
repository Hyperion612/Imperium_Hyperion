import { useEffect, useRef, useState, type FormEvent } from "react";
import confetti from "canvas-confetti";
import { REGIONS } from "../lib/data";
import { hashMatrix, usePrefersReducedMotion } from "../lib/hooks";
import Reveal from "./Reveal";
import SectionHead, { Corners } from "./SectionHead";
import Crest from "./Crest";

interface PassportData {
  name: string;
  regionId: string;
  id: string;
  issued: string;
  expires: string;
}

const genId = () => {
  const n = () => String(Math.floor(1000 + Math.random() * 9000));
  return `HY-${n()}-${n()}`;
};

const fmtDate = (d: Date) => d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });

function QrBlock({ seed }: { seed: string }) {
  const m = hashMatrix(seed, 21);
  const cell = 5;
  return (
    <svg width={21 * cell} height={21 * cell} viewBox={`0 0 ${21 * cell} ${21 * cell}`} aria-label="Гербовый код">
      <rect width={21 * cell} height={21 * cell} fill="#0a0f1e" />
      {m.map((row, y) =>
        row.map((on, x) =>
          on ? <rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell - 0.8} height={cell - 0.8} fill="#e3b54a" /> : null,
        ),
      )}
    </svg>
  );
}

function PassportCard({ data, onReissue }: { data: PassportData; onReissue: () => void }) {
  const reduced = usePrefersReducedMotion();
  const cardRef = useRef<HTMLDivElement | null>(null);
  const region = REGIONS.find((r) => r.id === data.regionId) ?? REGIONS[4];
  const initials = data.name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const onMove = (e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el || reduced) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(950px) rotateY(${x * 9}deg) rotateX(${-y * 7}deg)`;
  };
  const onLeave = () => {
    const el = cardRef.current;
    if (el) el.style.transform = "perspective(950px) rotateY(0deg) rotateX(0deg)";
  };

  return (
    <div className="flex justify-center lg:justify-start">
      <div
        ref={cardRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="relative w-full max-w-[440px] transition-transform duration-200 ease-out will-change-transform"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="clip-notch relative overflow-hidden border border-gold/40 bg-gradient-to-br from-panel2 via-panel to-abyss p-6 shadow-[0_30px_80px_-30px_rgba(227,181,74,0.25)]">
          <div className="holo-sweep" aria-hidden />
          {/* header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[9px] tracking-[0.35em] text-dim uppercase">Imperium Hyperion</p>
              <p className="font-display mt-1 text-[13px] font-semibold tracking-[0.18em] text-goldsoft uppercase">
                Цифровой паспорт
              </p>
            </div>
            <Crest className="h-10 w-10 text-gold" />
          </div>

          {/* body */}
          <div className="mt-5 flex gap-5">
            <div className="flex h-24 w-20 shrink-0 flex-col items-center justify-center gap-1.5 border border-line bg-abyss">
              <svg viewBox="0 0 48 48" className="h-10 w-10 text-gold/80" fill="none" aria-hidden>
                <path d="M8 34l4-16 8 9 4-13 4 13 8-9 4 16z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
                <path d="M10 39h28" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
              <span className="font-display text-sm font-bold text-gold">{initials}</span>
            </div>
            <dl className="min-w-0 flex-1 space-y-2.5 font-mono text-[11px]">
              <div>
                <dt className="text-[9px] tracking-[0.25em] text-dim uppercase">Гражданское имя</dt>
                <dd className="mt-0.5 truncate text-[14px] font-bold tracking-wide text-ink uppercase">{data.name}</dd>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <dt className="text-[9px] tracking-[0.25em] text-dim uppercase">Ранг</dt>
                  <dd className="mt-0.5 text-gold">Гражданин</dd>
                </div>
                <div>
                  <dt className="text-[9px] tracking-[0.25em] text-dim uppercase">Провинция</dt>
                  <dd className="mt-0.5 truncate text-hyper">{region.code}</dd>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <dt className="text-[9px] tracking-[0.25em] text-dim uppercase">Выдан</dt>
                  <dd className="mt-0.5 text-mist">{data.issued}</dd>
                </div>
                <div>
                  <dt className="text-[9px] tracking-[0.25em] text-dim uppercase">Действителен</dt>
                  <dd className="mt-0.5 text-mist">{data.expires}</dd>
                </div>
              </div>
            </dl>
          </div>

          {/* footer: id + qr */}
          <div className="mt-5 flex items-center justify-between gap-4 border-t border-line pt-4">
            <div className="min-w-0">
              <p className="font-mono text-[9px] tracking-[0.25em] text-dim uppercase">Гербовый код</p>
              <p className="font-mono mt-1 text-[15px] font-bold tracking-[0.14em] text-gold">{data.id}</p>
              <p className="mt-2 font-mono text-[9px] tracking-[0.2em] text-dim uppercase">
                Ст. IV Хартии · анонимность гарантирована
              </p>
            </div>
            <div className="shrink-0 border border-line p-1">
              <QrBlock seed={data.id + data.name} />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="font-mono text-[10px] tracking-[0.2em] text-hyper uppercase">
            <span className="mr-2 inline-block h-1.5 w-1.5 animate-soft-pulse rounded-full bg-hyper align-middle" />
            Запись внесена в реестр Сената
          </p>
          <button
            onClick={onReissue}
            className="font-mono text-[11px] tracking-[0.15em] text-mist uppercase transition-colors hover:text-gold"
          >
            [перевыпустить]
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Passport({ preferredRegion }: { preferredRegion: string }) {
  const [name, setName] = useState("");
  const [regionId, setRegionId] = useState(preferredRegion);
  const [oath, setOath] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; oath?: string }>({});
  const [issued, setIssued] = useState<PassportData | null>(null);
  const [shake, setShake] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (preferredRegion) setRegionId(preferredRegion);
  }, [preferredRegion]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: { name?: string; oath?: string } = {};
    if (name.trim().length < 2) next.name = "Имя должно содержать не менее 2 символов";
    if (!oath) next.oath = "Необходимо принять присягу Хартии";
    setErrors(next);
    if (next.name || next.oath) {
      setShake((s) => s + 1);
      return;
    }
    const now = new Date();
    const exp = new Date(now);
    exp.setFullYear(exp.getFullYear() + 10);
    setIssued({
      name: name.trim(),
      regionId,
      id: genId(),
      issued: fmtDate(now),
      expires: fmtDate(exp),
    });
    if (!reduced) {
      confetti({
        particleCount: 140,
        spread: 75,
        origin: { y: 0.55 },
        colors: ["#e3b54a", "#f2d790", "#57ddc4", "#e2604c"],
      });
    }
  };

  return (
    <section id="passport" className="relative border-t border-line bg-abyss px-5 py-24 sm:px-10 md:px-16 md:py-32">
      <div className="hud-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div className="relative mx-auto max-w-7xl">
        <SectionHead
          index="§ 03"
          kicker="Гражданство"
          title="Цифровой паспорт Империи"
          sub="Единственный документ, удостоверяющий личность внутри государства. Имя может отличаться от мирского — Статья IV гарантирует анонимность."
        />

        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <form onSubmit={submit} className={`relative border border-line bg-panel p-7 sm:p-8 ${shake ? "animate-shake" : ""}`} noValidate key={`f${shake}`}>
              <Corners />
              <p className="font-mono text-[11px] tracking-[0.3em] text-gold uppercase">Форма H-01 · Прошение о приёме</p>

              <label className="mt-6 block">
                <span className="mb-2 block font-mono text-[11px] tracking-[0.2em] text-mist uppercase">Гражданское имя *</span>
                <input
                  type="text"
                  value={name}
                  maxLength={24}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Например: Орион Вест"
                  className={`field ${errors.name ? "field-error" : ""}`}
                />
                {errors.name && <span className="mt-2 block font-mono text-[11px] text-ember">▲ {errors.name}</span>}
              </label>

              <label className="mt-5 block">
                <span className="mb-2 block font-mono text-[11px] tracking-[0.2em] text-mist uppercase">Провинция приписки</span>
                <select value={regionId} onChange={(e) => setRegionId(e.target.value)} className="field">
                  {REGIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} · {r.capital}
                    </option>
                  ))}
                </select>
              </label>

              <label className={`mt-5 flex cursor-pointer items-start gap-3 border p-4 transition-colors ${oath ? "border-gold/50 bg-panel2" : "border-line bg-abyss"} ${errors.oath ? "field-error" : ""}`}>
                <input type="checkbox" checked={oath} onChange={(e) => setOath(e.target.checked)} className="mt-1 h-4 w-4 accent-[#e3b54a]" />
                <span className="text-[13px] leading-relaxed text-mist">
                  Клянусь хранить <span className="text-ink">Порядок</span>, подчиняться Хартии, беречь гербовый код в тайне
                  и участвовать в Великих Собраниях. <span className="font-mono text-[11px] text-dim">— текст присяги, ст. I</span>
                </span>
              </label>
              {errors.oath && <span className="mt-2 block font-mono text-[11px] text-ember">▲ {errors.oath}</span>}

              <button
                type="submit"
                className="clip-notch mt-7 w-full bg-gold px-6 py-3.5 font-mono text-[13px] font-bold tracking-[0.25em] text-[#171006] uppercase transition-all duration-300 hover:bg-goldsoft hover:shadow-[0_0_40px_rgba(227,181,74,0.35)] active:translate-y-0.5"
              >
                Принести присягу ✦
              </button>
              <p className="mt-4 text-center font-mono text-[10px] tracking-[0.15em] text-dim uppercase">
                Пошлина: 0 HY · срок рассмотрения: мгновенно
              </p>
            </form>
          </Reveal>

          <Reveal delay={120}>
            {issued ? (
              <PassportCard data={issued} onReissue={() => setIssued(null)} />
            ) : (
              <div className="relative flex min-h-[420px] items-center justify-center border border-dashed border-line bg-panel/40 p-10">
                <div className="max-w-xs text-center">
                  <svg viewBox="0 0 96 96" className="mx-auto h-20 w-20 text-gold/40" fill="none" aria-hidden>
                    <rect x="16" y="22" width="64" height="52" stroke="currentColor" strokeWidth="2.5" />
                    <path d="M16 34h64" stroke="currentColor" strokeWidth="2.5" />
                    <circle cx="36" cy="54" r="8" stroke="currentColor" strokeWidth="2.5" />
                    <path d="M52 48h20M52 56h20M52 64h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  <p className="font-display mt-6 text-[15px] font-semibold tracking-wide text-ink uppercase">
                    Паспорт ещё не выпущен
                  </p>
                  <p className="mt-3 text-[13px] leading-relaxed text-dim">
                    Заполните прошение слева и принесите присягу — документ с персональным гербовым кодом будет отчеканен
                    мгновенно.
                  </p>
                  <p className="mt-5 font-mono text-[10px] tracking-[0.3em] text-gold/60 uppercase animate-soft-pulse">
                    Ожидание прошений…
                  </p>
                </div>
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
