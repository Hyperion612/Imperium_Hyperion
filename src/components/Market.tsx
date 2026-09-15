import { useState } from "react";
import { fmtHyper, useEmpire } from "../lib/state";
import Reveal from "./Reveal";
import { Corners } from "./SectionHead";
import { HyperCoin } from "./Symbols";

export default function Market({ locked }: { locked: boolean }) {
  const { data, me, buy, notify } = useEmpire();
  const [filter, setFilter] = useState<"all" | "good" | "service">("all");
  const [buying, setBuying] = useState<string | null>(null);

  const items = data.market.filter((m) => m.active && (filter === "all" || m.category === filter));

  const doBuy = (id: string, name: string) => {
    setBuying(id);
    window.setTimeout(() => {
      const res = buy(id);
      notify(res.msg, res.ok ? "hyper" : "ember");
      setBuying(null);
    }, 450);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-xl font-bold text-ink uppercase">Рынок Империи</h3>
          <p className="mt-1 text-[13px] text-mist">
            Товары и услуги, утверждённые Императором. Оплата — HYPER, комиссия 0%.
          </p>
        </div>
        <div className="flex gap-2 font-mono text-[11px] tracking-[0.15em] uppercase">
          {(["all", "good", "service"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`border px-3.5 py-2 transition-all ${
                filter === f ? "border-gold bg-gold/10 text-gold" : "border-line text-mist hover:border-gold/40 hover:text-gold"
              }`}
            >
              {f === "all" ? "Всё" : f === "good" ? "Товары" : "Услуги"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item, i) => {
          const affordable = !!me && me.hyper >= item.price;
          return (
            <Reveal key={item.id} delay={Math.min(i * 60, 240)}>
              <article className="group relative flex h-full flex-col border border-line bg-panel p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-[0_18px_50px_-20px_rgba(227,181,74,0.25)]">
                <Corners className="text-line2 group-hover:text-gold/50" />
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`border px-2 py-0.5 font-mono text-[9px] tracking-[0.2em] uppercase ${
                      item.category === "good" ? "border-gold/40 text-gold" : "border-hyper/40 text-hyper"
                    }`}
                  >
                    {item.category === "good" ? "Товар" : "Услуга"}
                  </span>
                  <span className="font-mono text-[10px] text-dim">продано: {item.sold}</span>
                </div>
                <h4 className="font-display mt-3 text-[15px] font-bold text-ink transition-colors group-hover:text-goldsoft">
                  {item.name}
                </h4>
                <p className="mt-2 flex-1 text-[12.5px] leading-relaxed text-mist">{item.desc}</p>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
                  <span className="flex items-center gap-1.5 font-mono text-[15px] font-bold text-gold tabular-nums">
                    <HyperCoin className="h-4 w-4" />
                    {fmtHyper(item.price)}
                  </span>
                  <button
                    onClick={() => doBuy(item.id, item.name)}
                    disabled={locked || buying === item.id}
                    className={`clip-notch px-4 py-2 font-mono text-[11px] font-bold tracking-[0.15em] uppercase transition-all duration-300 ${
                      locked
                        ? "cursor-not-allowed border border-line text-dim"
                        : affordable
                          ? "bg-gold text-[#171006] hover:bg-goldsoft hover:shadow-[0_0_24px_rgba(227,181,74,0.35)]"
                          : "border border-ember/50 text-ember"
                    }`}
                  >
                    {buying === item.id ? "Обработка…" : locked ? "Нужен паспорт" : affordable ? "Купить" : "Мало HY"}
                  </button>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>

      {items.length === 0 && (
        <p className="mt-10 border border-dashed border-line p-10 text-center font-mono text-[12px] tracking-[0.2em] text-dim uppercase">
          В этой категории пока пусто — Император скоро наполнит рынок
        </p>
      )}
    </div>
  );
}
