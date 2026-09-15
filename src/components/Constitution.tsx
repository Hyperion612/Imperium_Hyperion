import { ARTICLES } from "../lib/data";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import Crest from "./Crest";

export default function Constitution() {
  return (
    <section id="constitution" className="relative border-t border-line bg-void px-5 py-24 sm:px-10 md:px-16 md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 h-[30rem] w-[30rem] rounded-full blur-[140px]"
        style={{ background: "radial-gradient(circle, rgba(227,181,74,0.09), transparent 65%)" }}
      />
      <div className="relative mx-auto max-w-7xl">
        <SectionHead
          index="§ 02"
          kicker="Хартия"
          title="Конституция Империи"
          sub="Двенадцать статей, скреплённых гербовой печатью. Хартия принята на Первом Великом Собрании и неизменна в основах — поправкам подлежат лишь детали."
        />

        <div className="grid gap-10 lg:grid-cols-[minmax(280px,380px)_1fr] lg:gap-16">
          {/* sticky preamble */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <div className="relative border border-line bg-panel p-8">
                <span aria-hidden className="pointer-events-none absolute top-0 left-0 h-3.5 w-3.5 border-t border-l border-gold/50" />
                <span aria-hidden className="pointer-events-none absolute right-0 bottom-0 h-3.5 w-3.5 border-r border-b border-gold/50" />
                <Crest className="h-16 w-16 text-gold" />
                <p className="font-mono mt-6 text-[11px] tracking-[0.3em] text-gold uppercase">Преамбула</p>
                <p className="mt-4 text-[15px] leading-relaxed text-mist">
                  Мы, свободные люди, уставшие от хаоса и неопределённости, учреждаем Империю Гиперион —
                  государство, где <span className="text-ink">Порядок</span> защищает,{" "}
                  <span className="text-ink">Справедливость</span> рассудит, а{" "}
                  <span className="text-ink">Равновесие</span> сохранит.
                </p>
                <div className="mt-6 space-y-2 border-t border-line pt-5 font-mono text-[12px] text-dim">
                  <div className="flex justify-between">
                    <span>Принята</span>
                    <span className="text-mist">I Великим Собранием</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Скрепил</span>
                    <span className="text-mist">Император Гиперион I</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Статей</span>
                    <span className="text-gold">XII · без изъятий</span>
                  </div>
                </div>
                <p className="font-display mt-6 text-sm font-semibold tracking-wide text-goldsoft">
                  DUM ORDO — IMPERIUM
                </p>
              </div>
            </Reveal>
          </div>

          {/* articles */}
          <ol className="relative space-y-5 border-l border-line pl-6 sm:pl-10">
            {ARTICLES.map((a, i) => (
              <Reveal as="li" key={a.numeral} delay={Math.min(i * 40, 200)}>
                <article className="group relative border border-line bg-panel/70 p-6 transition-all duration-300 hover:border-gold/50 hover:bg-panel sm:p-7">
                  <span aria-hidden className="absolute top-1/2 -left-6 h-2 w-2 -translate-y-1/2 rotate-45 border border-gold bg-void transition-colors duration-300 group-hover:bg-gold sm:-left-10" />
                  <div className="flex items-baseline gap-4">
                    <span className="font-display text-2xl font-extrabold text-gold/90 sm:text-3xl">{a.numeral}</span>
                    <h3 className="font-display text-[15px] font-semibold tracking-wide text-ink uppercase transition-colors group-hover:text-goldsoft sm:text-base">
                      {a.title}
                    </h3>
                    <span className="ml-auto hidden font-mono text-[10px] tracking-[0.25em] text-dim sm:block">
                      СТ. {String(i + 1).padStart(2, "0")}/12
                    </span>
                  </div>
                  <p className="mt-3 text-[14px] leading-relaxed text-mist">{a.text}</p>
                </article>
              </Reveal>
            ))}
            <Reveal as="li" delay={120}>
              <p className="pt-2 text-center font-mono text-[11px] tracking-[0.3em] text-dim uppercase">
                ✦ Конец Хартии · печать Империи ✦
              </p>
            </Reveal>
          </ol>
        </div>
      </div>
    </section>
  );
}
