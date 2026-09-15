import { useState } from "react";
import { CHANNELS, EMPIRE_STATS } from "../lib/data";
import { useCountUp, useInView } from "../lib/hooks";
import Reveal, { MaskLine } from "./Reveal";
import SectionHead, { Corners } from "./SectionHead";

function BigStat({ label, value, suffix, decimals = 0 }: { label: string; value: number; suffix?: string; decimals?: number }) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const display = useCountUp(value, inView, 2000, decimals);
  return (
    <div ref={ref} className="border-l-2 border-gold/60 py-1 pl-5">
      <p className="font-display text-[clamp(1.6rem,3.4vw,2.6rem)] leading-none font-extrabold text-ink tabular-nums">
        {display}
        {suffix && <span className="text-gold">{suffix}</span>}
      </p>
      <p className="mt-2 font-mono text-[10px] tracking-[0.25em] text-dim uppercase">{label}</p>
    </div>
  );
}

export default function Community() {
  const [joined, setJoined] = useState<Record<string, boolean>>({});

  return (
    <section id="community" className="relative overflow-hidden border-t border-line bg-abyss px-5 py-24 sm:px-10 md:px-16 md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-1/3 h-[30rem] w-[30rem] rounded-full blur-[150px]"
        style={{ background: "radial-gradient(circle, rgba(227,181,74,0.08), transparent 65%)" }}
      />
      <div className="relative mx-auto max-w-7xl">
        <SectionHead
          index="§ 07"
          kicker="Сообщество"
          title="Жизнь внутри Империи"
          sub="Империя — это не территория, а люди. Форумы, гильдии, академии и флот: каждый находит своё место в Порядке."
        />

        {/* stats band */}
        <Reveal>
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 border border-line bg-panel/60 p-8 sm:p-10 lg:grid-cols-4">
            {EMPIRE_STATS.map((s) => (
              <BigStat key={s.label} label={s.label} value={s.value} suffix={s.suffix} decimals={s.decimals ?? 0} />
            ))}
          </div>
        </Reveal>

        <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* manifesto */}
          <Reveal>
            <div>
              <p className="font-mono text-[11px] tracking-[0.3em] text-gold uppercase">Манифест</p>
              <h3 className="font-display mt-5 text-[clamp(1.6rem,3.6vw,2.8rem)] leading-[1.12] font-extrabold">
                <MaskLine delay={0}>
                  <span className="text-ink">Порядок —</span>
                </MaskLine>
                <MaskLine delay={120}>
                  <span className="text-gold">защищает.</span>
                </MaskLine>
                <MaskLine delay={240}>
                  <span className="text-ink">Справедливость —</span>
                </MaskLine>
                <MaskLine delay={360}>
                  <span className="text-hyper">рассудит.</span>
                </MaskLine>
                <MaskLine delay={480}>
                  <span className="text-ink">Равновесие —</span>
                </MaskLine>
                <MaskLine delay={600}>
                  <span className="text-goldsoft">сохранит.</span>
                </MaskLine>
              </h3>
              <p className="mt-7 max-w-md text-[15px] leading-relaxed text-mist">
                Внешний мир полон шума, цензуры и неопределённости. Внутри Империи — прозрачные законы, честная валюта и
                уважение к личности. Мы не бежим от мира; мы строим тот, в котором стоит жить.
              </p>
              <div className="mt-8 flex items-center gap-4">
                <span aria-hidden className="h-px flex-1 bg-line" />
                <span className="font-mono text-[10px] tracking-[0.35em] text-dim uppercase">Хартия · Преамбула</span>
                <span aria-hidden className="h-px flex-1 bg-line" />
              </div>
            </div>
          </Reveal>

          {/* channels */}
          <Reveal delay={120}>
            <p className="font-mono text-[11px] tracking-[0.3em] text-gold uppercase">Каналы связи · Imperium Link</p>
            <div className="mt-5 space-y-3">
              {CHANNELS.map((c, i) => {
                const isIn = !!joined[c.name];
                const members = c.members + (isIn ? 1 : 0);
                return (
                  <div
                    key={c.name}
                    className="group flex items-center gap-4 border border-line bg-panel p-4 transition-all duration-300 hover:translate-x-1.5 hover:border-gold/50"
                    style={{ transitionDelay: `${i * 20}ms` }}
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-line bg-abyss font-mono text-[12px] font-bold text-gold transition-colors group-hover:border-gold/50">
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-bold text-ink">{c.name}</p>
                      <p className="truncate text-[12px] text-dim">{c.desc}</p>
                    </div>
                    <span className="hidden font-mono text-[11px] text-mist tabular-nums sm:block">
                      {members.toLocaleString("ru-RU")}
                    </span>
                    <button
                      onClick={() => setJoined((j) => ({ ...j, [c.name]: !j[c.name] }))}
                      className={`shrink-0 border px-3.5 py-2 font-mono text-[10px] font-bold tracking-[0.15em] uppercase transition-all duration-300 ${
                        isIn
                          ? "border-hyper/60 bg-hyper/10 text-hyper"
                          : "border-gold/50 text-gold hover:bg-gold hover:text-[#171006]"
                      }`}
                    >
                      {isIn ? "✓ внутри" : "Вступить"}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="relative mt-6 border border-line bg-panel/60 p-5">
              <Corners className="text-hyper/40" />
              <p className="font-mono text-[11px] leading-relaxed tracking-[0.12em] text-mist">
                <span className="text-hyper">SYS://</span> резидент? Путь к гражданству: паспорт → 30 дней → присяга →
                ранг Гражданина. Наставник-опекун назначается автоматически.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
