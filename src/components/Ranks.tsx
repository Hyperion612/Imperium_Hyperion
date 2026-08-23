import { COUNCIL, RANKS } from "../lib/data";
import Reveal from "./Reveal";
import SectionHead, { Corners } from "./SectionHead";
import Insignia from "./Insignia";

const ACCENTS = {
  ember: { text: "text-ember", border: "hover:border-ember/60", chip: "border-ember/30 text-ember" },
  gold: { text: "text-gold", border: "hover:border-gold/60", chip: "border-gold/30 text-gold" },
  hyper: { text: "text-hyper", border: "hover:border-hyper/50", chip: "border-hyper/30 text-hyper" },
} as const;

export default function Ranks() {
  const emperor = RANKS[0];
  const ladder = RANKS.slice(1);

  return (
    <section id="ranks" className="relative border-t border-line bg-abyss px-5 py-24 sm:px-10 md:px-16 md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -right-40 h-[28rem] w-[28rem] rounded-full blur-[140px]"
        style={{ background: "radial-gradient(circle, rgba(226,96,76,0.07), transparent 65%)" }}
      />
      <div className="relative mx-auto max-w-7xl">
        <SectionHead
          index="§ 05"
          kicker="Иерархия"
          title="Лестница рангов Империи"
          sub="Ранг — это обязанность и честь, а не привилегия. Путь от Резидента до Сенатора открыт каждому, кто служит Порядку."
        />

        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
          {/* emperor + council */}
          <div className="space-y-6">
            <Reveal>
              <div className="relative overflow-hidden border border-ember/35 bg-panel p-7 sm:p-8">
                <Corners className="text-ember/50" />
                <div
                  aria-hidden
                  className="absolute -top-20 -right-20 h-56 w-56 rounded-full blur-[90px]"
                  style={{ background: "radial-gradient(circle, rgba(226,96,76,0.18), transparent 70%)" }}
                />
                <div className="flex items-center gap-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-ember/40 bg-abyss text-ember">
                    <Insignia rankId="emperor" className="h-9 w-9" />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.3em] text-ember uppercase">Ранг I · абсолютная власть</p>
                    <h3 className="font-display mt-1 text-2xl font-extrabold text-ink">Император</h3>
                  </div>
                </div>
                <p className="mt-5 text-[14px] leading-relaxed text-mist">{emperor.role}</p>
                <blockquote className="mt-5 border-l-2 border-ember/60 pl-4">
                  <p className="font-display text-[15px] leading-relaxed font-semibold text-goldsoft">
                    «Я подписал Хартию, ограничившую меня самого. В этом — сила Империи: власть, добровольно стоящая на
                    страже закона.»
                  </p>
                  <footer className="mt-2 font-mono text-[10px] tracking-[0.25em] text-dim uppercase">
                    — Гиперион I, речь на Первом Собрании
                  </footer>
                </blockquote>
                <div className="mt-5 flex items-center gap-3 font-mono text-[10px] tracking-[0.2em] text-dim uppercase">
                  <span className="inline-block h-8 w-8 rounded-full border border-ember/50 text-center text-[16px] leading-8 text-ember">✠</span>
                  Гербовая печать Императора · верифицировано Сенатом
                </div>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <p className="font-mono text-[11px] tracking-[0.3em] text-gold uppercase">Совет Империи</p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {COUNCIL.map((m) => (
                  <div
                    key={m.name}
                    className="group flex items-center gap-4 border border-line bg-panel p-4 transition-all duration-300 hover:-translate-y-1 hover:border-gold/50"
                  >
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center border border-gold/40 bg-abyss">
                      <span className="font-display text-sm font-bold text-gold">{m.initials}</span>
                      <span aria-hidden className="absolute -top-1 -right-1 h-2 w-2 rotate-45 bg-gold" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-bold text-ink transition-colors group-hover:text-goldsoft">{m.name}</p>
                      <p className="font-mono text-[10px] tracking-[0.12em] text-mist uppercase">{m.post}</p>
                      <p className="mt-0.5 truncate font-mono text-[9px] tracking-[0.1em] text-dim uppercase">{m.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* ladder */}
          <div className="relative">
            <span aria-hidden className="absolute top-3 bottom-3 left-[27px] w-px bg-gradient-to-b from-gold via-line to-transparent" />
            <div className="space-y-4">
              {ladder.map((r, i) => {
                const a = ACCENTS[r.accent];
                return (
                  <Reveal key={r.id} delay={i * 80}>
                    <div
                      className={`group relative ml-0 border border-line bg-panel p-5 pl-5 transition-all duration-300 sm:p-6 sm:pl-6 ${a.border} hover:translate-x-2 hover:bg-panel2`}
                    >
                      <div className="flex items-start gap-5">
                        <div className={`relative z-10 flex h-[54px] w-[54px] shrink-0 items-center justify-center border border-line bg-abyss transition-colors duration-300 group-hover:border-gold/60 ${a.text}`}>
                          <Insignia rankId={r.id} className="h-7 w-7" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <span className={`font-mono text-[11px] font-bold tracking-[0.2em] ${a.text}`}>РАНГ {r.numeral}</span>
                            <h3 className="font-display text-lg font-bold text-ink">{r.title}</h3>
                          </div>
                          <p className="mt-2 text-[13px] leading-relaxed text-mist">{r.role}</p>
                          <p className="mt-3 font-mono text-[10px] tracking-[0.18em] text-dim uppercase">
                            Условие: <span className="text-mist">{r.requirement}</span>
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {r.privileges.map((p) => (
                              <span key={p} className={`border px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] uppercase ${a.chip}`}>
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
