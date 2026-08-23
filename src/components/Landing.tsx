import { useNavigate } from "react-router-dom";
import Nav from "./Nav";
import PlanetIntro from "./PlanetIntro";
import Constitution from "./Constitution";
import Footer from "./Footer";
import Reveal, { MaskLine } from "./Reveal";
import Flag from "./Flag";
import Crest from "./Crest";
import { useEmpire } from "../lib/state";
import { Fist, YinYang } from "./Symbols";

export default function Landing() {
  const navigate = useNavigate();
  const { me } = useEmpire();

  return (
    <div className="relative min-h-screen bg-void font-body text-ink">
      <Nav />
      <main>
        <PlanetIntro onSettle={(id) => navigate(`/gate?prov=${id}`)} />
        <Constitution />

        {/* манифест / врата */}
        <section id="manifest" className="relative overflow-hidden border-t border-line bg-abyss px-5 py-24 sm:px-10 md:px-16 md:py-32">
          <div className="hud-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden />
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 h-[30rem] w-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[160px]"
            style={{ background: "radial-gradient(circle, rgba(227,181,74,0.1), transparent 65%)" }}
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.2fr_1fr]">
            <Reveal>
              <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.3em] text-gold uppercase">
                <span className="inline-block h-px w-8 bg-gold/60" aria-hidden />
                § 08 — Манифест
              </div>
              <h2 className="font-display mt-5 text-[clamp(2rem,5.5vw,4rem)] leading-[1.05] font-extrabold">
                <MaskLine delay={0}>
                  <span className="text-ink">Устал от хаоса?</span>
                </MaskLine>
                <MaskLine delay={140}>
                  <span className="text-gold">Империя ждёт</span>
                </MaskLine>
                <MaskLine delay={280}>
                  <span className="text-ink">тебя.</span>
                </MaskLine>
              </h2>
              <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-mist">
                Подай прошение Императору — получи государственный ID, войди в государство и отчекань цифровой паспорт.
                Внутри: собственная валюта, провинции, ранги, Великие Собрания и закон, одинаковый для всех — от
                резидента до Императора.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => navigate(me ? "/imperium" : "/gate")}
                  className="clip-notch group bg-gold px-8 py-4 font-mono text-[13px] font-bold tracking-[0.22em] text-[#171006] uppercase transition-all duration-300 hover:bg-goldsoft hover:shadow-[0_0_44px_rgba(227,181,74,0.4)] active:translate-y-0.5"
                >
                  {me ? "Войти в государство →" : "Подать прошение →"}
                </button>
                <a
                  href="#constitution"
                  className="border border-line px-7 py-4 font-mono text-[12px] tracking-[0.2em] text-mist uppercase transition-colors duration-300 hover:border-gold/60 hover:text-gold"
                >
                  Прочитать Хартию
                </a>
              </div>
              <div className="mt-8 flex items-center gap-6 font-mono text-[10px] tracking-[0.25em] text-dim uppercase">
                <span>Пошлина — 0 HY</span>
                <span aria-hidden className="h-px w-10 bg-line" />
                <span>Решение — лично Императора</span>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div className="relative border border-line bg-panel/70 p-8">
                <span aria-hidden className="pointer-events-none absolute top-0 left-0 h-4 w-4 border-t border-l border-gold/60" />
                <span aria-hidden className="pointer-events-none absolute right-0 bottom-0 h-4 w-4 border-r border-b border-gold/60" />
                <div className="flex items-center justify-center gap-6">
                  <div className="w-[86px] border border-gold/35 shadow-[0_0_30px_rgba(227,181,74,0.18)]">
                    <Flag className="h-14 w-[86px]" />
                  </div>
                  <Crest className="h-16 w-16 text-gold" />
                </div>
                <div className="mt-7 flex items-center justify-center gap-10 text-gold/90">
                  <div className="flex flex-col items-center gap-2">
                    <Fist className="h-9 w-9" />
                    <span className="font-mono text-[9px] tracking-[0.3em] text-dim uppercase">Справедливость</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <YinYang className="h-9 w-9" />
                    <span className="font-mono text-[9px] tracking-[0.3em] text-dim uppercase">Равновесие</span>
                  </div>
                </div>
                <p className="font-display mt-7 text-center text-[13px] font-semibold tracking-[0.14em] text-goldsoft uppercase">
                  Свет ведёт тебя
                  <br />
                  Порядок защищает
                  <br />
                  Равновесие хранит
                </p>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
