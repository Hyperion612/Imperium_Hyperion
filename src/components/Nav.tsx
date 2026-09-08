import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmpire } from "../lib/state";
import Crest from "./Crest";

const LINKS = [
  { href: "#territories", label: "Территории" },
  { href: "#constitution", label: "Хартия" },
  { href: "#manifest", label: "Манифест" },
];

export default function Nav() {
  const { me } = useEmpire();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setScrolled(window.scrollY > 40);
        const total = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(total > 0 ? Math.min(1, window.scrollY / total) : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "border-b border-line bg-void/88 backdrop-blur-md" : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 sm:px-10 md:px-16">
        <a href="#planet" className="group flex items-center gap-3" aria-label="Империя Гиперион — к планете">
          <Crest className="h-9 w-9 text-gold transition-transform duration-500 group-hover:rotate-45" />
          <span className="hidden flex-col leading-none sm:flex">
            <span className="font-display text-[13px] font-extrabold tracking-[0.14em] text-ink">ИМПЕРИЯ ГИПЕРИОН</span>
            <span className="mt-1 font-mono text-[9px] tracking-[0.4em] text-gold/80 uppercase">Imperium · MMXXVI</span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Основная навигация">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="group relative font-mono text-[11px] tracking-[0.2em] text-mist uppercase transition-colors hover:text-gold"
            >
              {l.label}
              <span aria-hidden className="absolute -bottom-1.5 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {me ? (
            <>
              {me.rank === "emperor" && (
                <button
                  onClick={() => navigate("/emperor")}
                  className="clip-notch hidden border border-ember/60 px-5 py-2.5 font-mono text-[11px] font-bold tracking-[0.2em] text-ember uppercase transition-all duration-300 hover:bg-ember/10 md:block"
                >
                  Трон
                </button>
              )}
              <button
                onClick={() => navigate("/imperium")}
                className="clip-notch bg-gold px-5 py-2.5 font-mono text-[11px] font-bold tracking-[0.2em] text-[#171006] uppercase transition-all duration-300 hover:bg-goldsoft hover:shadow-[0_0_26px_rgba(227,181,74,0.35)]"
              >
                Войти в государство
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/gate")}
              className="clip-notch bg-gold px-5 py-2.5 font-mono text-[11px] font-bold tracking-[0.2em] text-[#171006] uppercase transition-all duration-300 hover:bg-goldsoft hover:shadow-[0_0_26px_rgba(227,181,74,0.35)]"
            >
              Врата Империи
            </button>
          )}
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={open}
            className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] border border-line bg-panel/60 lg:hidden"
          >
            <span className={`h-px w-4 bg-gold transition-all duration-300 ${open ? "translate-y-[6px] rotate-45" : ""}`} />
            <span className={`h-px w-4 bg-gold transition-all duration-300 ${open ? "opacity-0" : ""}`} />
            <span className={`h-px w-4 bg-gold transition-all duration-300 ${open ? "-translate-y-[6px] -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 h-px w-full bg-line/40" aria-hidden>
        <div className="h-full bg-gradient-to-r from-gold to-hyper" style={{ width: `${progress * 100}%` }} />
      </div>

      <div
        className={`overflow-hidden border-b border-line bg-void/96 backdrop-blur-md transition-all duration-400 lg:hidden ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col px-5 py-4 sm:px-10" aria-label="Мобильная навигация">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="border-b border-line/50 py-3 font-mono text-[12px] tracking-[0.25em] text-mist uppercase transition-colors last:border-0 hover:text-gold"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={() => {
              setOpen(false);
              navigate(me ? "/imperium" : "/gate");
            }}
            className="clip-notch mt-3 bg-gold px-5 py-3 text-center font-mono text-[11px] font-bold tracking-[0.2em] text-[#171006] uppercase"
          >
            {me ? "Войти в государство" : "Врата Империи"}
          </button>
        </nav>
      </div>
    </header>
  );
}
