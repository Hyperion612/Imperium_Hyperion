import { fmtDate, useEmpire } from "../lib/state";
import Reveal from "./Reveal";
import { CrownIcon, HyperCoin, MailIcon } from "./Symbols";

const TAG_META = {
  decree: { label: "Эдикт", cls: "border-ember/50 text-ember", icon: CrownIcon },
  news: { label: "Новость", cls: "border-gold/50 text-gold", icon: MailIcon },
  treasury: { label: "Казначейство", cls: "border-hyper/50 text-hyper", icon: HyperCoin },
} as const;

export default function NewsFeed() {
  const { data } = useEmpire();
  return (
    <div>
      <h3 className="font-display text-xl font-bold text-ink uppercase">Вестник Империи</h3>
      <p className="mt-1 text-[13px] text-mist">Эдикты, новости и отчёты Казначейства — из первых рук, за подписью Императора.</p>

      <div className="mt-7 space-y-4">
        {data.news.map((n, i) => {
          const meta = TAG_META[n.tag];
          const Icon = meta.icon;
          return (
            <Reveal key={n.id} delay={Math.min(i * 60, 240)}>
              <article className="group relative border border-line bg-panel p-5 transition-all duration-300 hover:border-gold/40 sm:p-6">
                <span aria-hidden className="absolute top-0 left-0 h-full w-[3px] bg-gradient-to-b from-gold/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[9px] tracking-[0.2em] uppercase ${meta.cls}`}>
                    <Icon className="h-3.5 w-3.5" />
                    {meta.label}
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.15em] text-dim uppercase">{fmtDate(n.date)}</span>
                  <span className="ml-auto font-mono text-[10px] tracking-[0.15em] text-mist uppercase">✍ {n.author}</span>
                </div>
                <h4 className="font-display mt-3 text-[16px] font-bold text-ink transition-colors group-hover:text-goldsoft sm:text-[17px]">
                  {n.title}
                </h4>
                <p className="mt-2 text-[13.5px] leading-relaxed text-mist">{n.text}</p>
              </article>
            </Reveal>
          );
        })}
        {data.news.length === 0 && (
          <p className="border border-dashed border-line p-10 text-center font-mono text-[12px] tracking-[0.2em] text-dim uppercase">
            Вестник пуст — Император готовит обращение
          </p>
        )}
      </div>
    </div>
  );
}
