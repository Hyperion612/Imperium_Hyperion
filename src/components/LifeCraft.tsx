import { useLife } from "../lib/life";
import { useEmpire } from "../lib/state";
import { MATERIALS, RECIPES, RESOURCES } from "../lib/lifeData";
import { LifeHud } from "./LifeWork";

const PROFS = [
  { id: "carpenter", name: "Плотник", note: "мебель и доски" },
  { id: "blacksmith", name: "Кузнец", note: "инструменты и механизмы" },
  { id: "jeweler", name: "Ювелир", note: "украшения и роскошь" },
  { id: "alchemist", name: "Алхимик", note: "зелья" },
];

const RES_NAME: Record<string, string> = {
  ...Object.fromEntries(RESOURCES.map((r) => [r.id, r.name])),
  ...Object.fromEntries(MATERIALS.map((m) => [m.id, m.name])),
};

export default function LifeCraft() {
  const { s, craft, buyMaterial, craftSlots, resCount, profLevel } = useLife();
  const { me } = useEmpire();
  if (!s || !me) return null;

  const canCraft = (rid: string) => {
    const r = RECIPES.find((x) => x.id === rid)!;
    return Object.entries(r.inputs).every(([k, v]) => resCount(k) >= (v ?? 0));
  };

  return (
    <div className="space-y-6">
      <LifeHud />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          {/* инвентарь */}
          <div className="border border-line bg-panel p-5">
            <p className="font-mono text-[10px] tracking-[0.25em] text-gold uppercase">Склад ресурсов</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[...RESOURCES, ...MATERIALS].map((r) => (
                <div key={r.id} className="flex items-center justify-between border border-line/70 bg-abyss px-3 py-2">
                  <span className="font-mono text-[11px] text-mist">{r.name}</span>
                  <span className="font-mono text-[12px] font-bold text-ink tabular-nums">{resCount(r.id)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* покупка материалов */}
          <div className="border border-line bg-panel p-5">
            <p className="font-mono text-[10px] tracking-[0.25em] text-hyper uppercase">Рынок материалов</p>
            <div className="mt-3 space-y-2">
              {MATERIALS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => buyMaterial(m.id)}
                  className={`flex w-full items-center justify-between border px-3.5 py-2.5 transition-all ${me.hyper >= m.price ? "border-line hover:border-hyper/60 hover:bg-panel2" : "border-line opacity-55"}`}
                >
                  <span className="font-mono text-[12px] text-ink">+1 {m.name}</span>
                  <span className="font-mono text-[11px] text-mist">{m.price} HY</span>
                </button>
              ))}
            </div>
            <p className="mt-3 font-mono text-[9.5px] leading-relaxed tracking-[0.1em] text-dim uppercase">
              Травы, холст и краски также выпадают при добыче (шанс 5%)
            </p>
          </div>

          {/* профессии */}
          <div className="border border-line bg-panel p-5">
            <p className="font-mono text-[10px] tracking-[0.25em] text-gold uppercase">Профессии · опыт за крафт</p>
            <div className="mt-3 space-y-3">
              {PROFS.map((p) => {
                const xp = s.profs[p.id] ?? 0;
                const lvl = profLevel(p.id);
                return (
                  <div key={p.id}>
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-ink">
                        {p.name} <span className="text-dim">· {p.note}</span>
                      </span>
                      <span className="text-gold">ур. {lvl} · {xp % 100}/100</span>
                    </div>
                    <div className="mt-1 h-1 w-full bg-line/70">
                      <div className="h-full bg-gradient-to-r from-brass to-gold transition-all duration-500" style={{ width: `${xp % 100}%` }} />
                    </div>
                  </div>
                );
              })}
              <p className="border-t border-line pt-3 font-mono text-[9.5px] leading-relaxed tracking-[0.1em] text-dim uppercase">
                Новые вакансии открывает Император указом с Трона
              </p>
            </div>
          </div>
        </div>

        {/* рецепты + очередь */}
        <div className="space-y-6">
          <div className="border border-line bg-panel p-5">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] tracking-[0.25em] text-hyper uppercase">Производственные цепочки</p>
              <span className="font-mono text-[10px] text-dim">
                слоты: <b className="text-gold">{s.queue.length}/{craftSlots}</b> (столы +)
              </span>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {RECIPES.map((r) => {
                const ok = canCraft(r.id);
                const slotFree = s.queue.length < craftSlots;
                return (
                  <div key={r.id} className="group border border-line bg-abyss p-3.5 transition-all duration-200 hover:border-gold/50">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-[13px] font-bold text-ink">{r.name}</p>
                      <p className="font-mono text-[11px] font-bold text-gold tabular-nums">+{r.value} HY</p>
                    </div>
                    <p className="mt-0.5 font-mono text-[9px] tracking-[0.1em] text-dim uppercase">{r.desc}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {Object.entries(r.inputs).map(([k, v]) => {
                        const have = resCount(k) >= (v ?? 0);
                        return (
                          <span key={k} className={`border px-1.5 py-0.5 font-mono text-[9.5px] tabular-nums ${have ? "border-hyper/40 text-hyper" : "border-ember/40 text-ember"}`}>
                            {RES_NAME[k]} {resCount(k)}/{v}
                          </span>
                        );
                      })}
                      <span className="border border-line px-1.5 py-0.5 font-mono text-[9.5px] text-dim">{r.time}с</span>
                    </div>
                    <button
                      disabled={!ok || !slotFree}
                      onClick={() => craft(r.id)}
                      className={`mt-2.5 w-full border px-3 py-1.5 font-mono text-[10px] font-bold tracking-[0.18em] uppercase transition-all ${
                        ok && slotFree ? "border-gold/60 text-gold hover:bg-gold hover:text-[#171006]" : "cursor-not-allowed border-line text-dim opacity-60"
                      }`}
                    >
                      {!slotFree ? "Слоты заняты" : ok ? "Создать" : "Нет материалов"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* очередь */}
          <div className="border border-line bg-panel p-5">
            <p className="font-mono text-[10px] tracking-[0.25em] text-gold uppercase">Верстак · очередь</p>
            {s.queue.length === 0 ? (
              <p className="mt-3 border border-dashed border-line p-6 text-center font-mono text-[11px] text-dim uppercase">Верстак пуст — запустите производство</p>
            ) : (
              <div className="mt-3 space-y-2.5">
                {s.queue.map((q) => {
                  const r = RECIPES.find((x) => x.id === q.recipeId)!;
                  const total = r.time * 1000;
                  const left = Math.max(0, q.doneAt - Date.now());
                  const pct = Math.min(100, ((total - left) / total) * 100);
                  return (
                    <div key={q.uid} className="border border-line bg-abyss px-3.5 py-2.5">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-ink">{r.name}</span>
                        <span className="text-hyper tabular-nums">{Math.ceil(left / 1000)} с</span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full bg-line/70">
                        <div className="h-full bg-gradient-to-r from-[#2a8f7f] to-hyper transition-all duration-1000 ease-linear" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="mt-3 font-mono text-[9.5px] tracking-[0.1em] text-dim uppercase">Готовые изделия продаются автоматически в казну гражданина</p>
          </div>
        </div>
      </div>
    </div>
  );
}
