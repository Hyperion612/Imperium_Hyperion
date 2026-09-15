import Crest from "./Crest";
import Flag from "./Flag";

const NAV = [
  { href: "#planet", label: "Планета" },
  { href: "#territories", label: "Территории" },
  { href: "#constitution", label: "Конституция" },
  { href: "#passport", label: "Паспорт" },
  { href: "#economy", label: "Казначейство" },
  { href: "#ranks", label: "Иерархия" },
  { href: "#assemblies", label: "Собрания" },
  { href: "#community", label: "Сообщество" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-line bg-void">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-10 md:px-16">
        <div className="grid gap-12 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-4">
              <Crest className="h-12 w-12 text-gold" />
              <div>
                <p className="font-display text-lg font-extrabold tracking-wide text-ink">ИМПЕРИЯ ГИПЕРИОН</p>
                <p className="font-mono text-[10px] tracking-[0.35em] text-gold uppercase">Imperium Hyperion</p>
              </div>
            </div>
            <p className="mt-6 max-w-sm text-[14px] leading-relaxed text-mist">
              Добровольное цифровое государство на началах Порядка, Справедливости и Равновесия. Не игра и не социальная
              сеть — полноценная экосистема с конституцией, экономикой и гражданами.
            </p>
            <p className="font-display mt-6 text-[13px] font-semibold tracking-[0.2em] text-goldsoft">
              DUM ORDO — IMPERIUM
            </p>
            <div className="mt-7 flex items-center gap-4">
              <div className="w-[66px] shrink-0 border border-line shadow-[0_0_20px_rgba(227,181,74,0.12)]">
                <Flag className="h-11 w-[66px]" />
              </div>
              <p className="font-mono text-[10px] leading-relaxed tracking-[0.22em] text-dim uppercase">
                Государственный флаг
                <br />
                <span className="text-mist">утверждён статьёй X Хартии</span>
              </p>
            </div>
          </div>

          <div>
            <p className="font-mono text-[11px] tracking-[0.3em] text-gold uppercase">Навигация</p>
            <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2.5">
              {NAV.map((n) => (
                <li key={n.href}>
                  <a
                    href={n.href}
                    className="group inline-flex items-center gap-2 text-[13px] text-mist transition-colors hover:text-gold"
                  >
                    <span aria-hidden className="inline-block h-px w-3 bg-line transition-all duration-300 group-hover:w-5 group-hover:bg-gold" />
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-[11px] tracking-[0.3em] text-gold uppercase">Координаты ядра</p>
            <dl className="mt-5 space-y-3 font-mono text-[12px]">
              <div className="flex justify-between gap-4 border-b border-line/60 pb-2">
                <dt className="text-dim">Сектор</dt>
                <dd className="text-mist">7G · Гелиос-Прайм</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-line/60 pb-2">
                <dt className="text-dim">Широта / долгота</dt>
                <dd className="text-mist">47.3°N / 12.8°E</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-line/60 pb-2">
                <dt className="text-dim">Столица</dt>
                <dd className="text-mist">Гиперион-Прайм</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-dim">Собрания</dt>
                <dd className="text-hyper">СБ · 20:00 UTC</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-line pt-7 sm:flex-row">
          <p className="font-mono text-[11px] tracking-[0.2em] text-dim uppercase">
            © MMXXVI Империя Гиперион · все права скреплены печатью
          </p>
          <p className="font-mono text-[11px] tracking-[0.3em] text-gold/70 uppercase">
            Порядок ✦ Справедливость ✦ Равновесие
          </p>
          <p className="font-mono text-[10px] tracking-[0.2em] text-dim uppercase">
            rev 2.0 · ядро стабильно
          </p>
        </div>
      </div>
    </footer>
  );
}
