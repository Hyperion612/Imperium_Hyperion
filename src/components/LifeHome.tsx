import { useState } from "react";
import { useLife } from "../lib/life";
import { useEmpire } from "../lib/state";
import { FURNITURE, HOUSE_LEVELS, HOUSE_SIZE, PLOTS, type FurnitureId } from "../lib/lifeData";
import { LifeHud } from "./LifeWork";

const FURN_GLYPH: Record<FurnitureId, { g: string; c: string }> = {
  bed: { g: "Кр", c: "#7fc4bf" },
  table: { g: "Ст", c: "#c98d4f" },
  lamp: { g: "Лм", c: "#FFD700" },
  carpet: { g: "Кв", c: "#e2604c" },
  painting: { g: "Ка", c: "#c9a4ff" },
  trophy: { g: "Тр", c: "#f2d790" },
};

const SUBTABS = [
  { id: "house", label: "Дом" },
  { id: "plot", label: "Участок" },
  { id: "furniture", label: "Мебель" },
  { id: "guests", label: "Гости" },
] as const;

export default function LifeHome() {
  const life = useLife();
  const { s, buyHouse, buyPlot, buyFurniture, placeFurniture, pickupFurniture, inviteGuest, removeGuest } = life;
  const { data, me } = useEmpire();
  const [tab, setTab] = useState<(typeof SUBTABS)[number]["id"]>("house");
  const [placing, setPlacing] = useState<FurnitureId | null>(null);

  if (!s || !me) return null;

  const house = HOUSE_LEVELS[s.house];
  const plot = PLOTS[s.plot];
  const hs = HOUSE_SIZE[s.house];
  const houseCells = new Set<number>();
  const start = Math.floor((10 - hs) / 2);
  for (let y = start; y < start + hs; y++) for (let x = start; x < start + hs; x++) houseCells.add(y * 10 + x);

  const unplacedCount = (id: FurnitureId) => s.owned.filter((f) => f === id).length;
  const capacity = 6 + s.plot * 4;
  const candidates = data.citizens.filter((c) => c.status === "approved" && c.passportIssuedAt && c.id !== me.id);
  const guests = s.guests.map((id) => data.citizens.find((c) => c.id === id)).filter(Boolean);

  const bonusSummary = [
    { n: "Кровати", v: s.owned.filter((f) => f === "bed").length, b: "+5⚡ макс." },
    { n: "Столы", v: s.owned.filter((f) => f === "table").length, b: "+1 слот крафта" },
    { n: "Лампы", v: s.owned.filter((f) => f === "lamp").length, b: "+2 Света" },
    { n: "Ковры", v: s.owned.filter((f) => f === "carpet").length, b: "+настроение/тик" },
    { n: "Картины", v: s.owned.filter((f) => f === "painting").length, b: "+10 престижа" },
    { n: "Трофеи", v: s.owned.filter((f) => f === "trophy").length, b: "+5% доход" },
  ];

  return (
    <div className="space-y-6">
      <LifeHud />

      <div className="flex flex-wrap gap-1 border-b border-line">
        {SUBTABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative px-4 py-2.5 font-mono text-[11px] font-bold tracking-[0.18em] uppercase transition-colors ${
              tab === t.id ? "text-gold" : "text-dim hover:text-mist"
            }`}
          >
            {t.label}
            <span aria-hidden className={`absolute inset-x-2 bottom-0 h-[2px] bg-gold transition-transform duration-300 ${tab === t.id ? "scale-x-100" : "scale-x-0"}`} />
          </button>
        ))}
      </div>

      {tab === "house" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="border border-line bg-panel p-6">
            <p className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase">Текущее жилище</p>
            <h3 className="font-display mt-2 text-2xl font-extrabold text-goldsoft uppercase">{house.name}</h3>
            <p className="mt-1 font-mono text-[12px] text-mist">{house.note}</p>
            {/* силуэт дома */}
            <div className="mt-6 flex items-end justify-center gap-1">
              {Array.from({ length: Math.min(house.rooms, 10) }).map((_, i) => (
                <div
                  key={i}
                  className="animate-float border border-gold/40 bg-gradient-to-b from-panel2 to-abyss"
                  style={{ width: `${26 - s.house}px`, height: `${30 + ((i * 13 + s.house * 7) % 34)}px`, animationDelay: `${i * 0.35}s` }}
                  aria-hidden
                />
              ))}
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2 border-t border-line pt-4 text-center font-mono text-[11px]">
              <div>
                <p className="text-[18px] font-bold text-gold">{house.rooms}</p>
                <p className="text-[9px] tracking-[0.2em] text-dim uppercase">комнат</p>
              </div>
              <div>
                <p className="text-[18px] font-bold text-hyper">{s.garden.length}</p>
                <p className="text-[9px] tracking-[0.2em] text-dim uppercase">грядок</p>
              </div>
              <div>
                <p className="text-[18px] font-bold text-ink">{s.prestige}</p>
                <p className="text-[9px] tracking-[0.2em] text-dim uppercase">престиж</p>
              </div>
            </div>
          </div>
          <div className="border border-line bg-panel p-6">
            <p className="font-mono text-[10px] tracking-[0.25em] text-gold uppercase">Прокачка дома</p>
            <div className="mt-3 space-y-2">
              {HOUSE_LEVELS.map((h, i) => {
                const owned = i <= s.house;
                const next = i === s.house + 1;
                return (
                  <button
                    key={h.name}
                    disabled={owned || !next}
                    onClick={() => buyHouse(i)}
                    className={`flex w-full items-center justify-between border px-3.5 py-2.5 transition-all ${
                      owned ? "border-gold/40 bg-gold/5 text-gold" : next ? (me.hyper >= h.price ? "border-line hover:border-gold/60 hover:bg-panel2" : "border-line opacity-55") : "border-line opacity-40"
                    }`}
                  >
                    <span className="font-mono text-[12px] text-ink">
                      {h.name} <span className="ml-1 text-[10px] text-dim">{h.note}</span>
                    </span>
                    <span className={`font-mono text-[11px] ${owned ? "text-gold" : "text-mist"}`}>{owned ? "✓" : h.price === 0 ? "бесплатно" : `${h.price.toLocaleString("ru-RU")} HY`}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === "plot" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="border border-line bg-panel p-6">
            <p className="font-mono text-[10px] tracking-[0.25em] text-gold uppercase">Расширение участка</p>
            <div className="mt-3 space-y-2">
              {PLOTS.map((p, i) => {
                const owned = i <= s.plot;
                const next = i === s.plot + 1;
                return (
                  <button
                    key={p.size}
                    disabled={owned || !next}
                    onClick={() => buyPlot(i)}
                    className={`flex w-full items-center justify-between border px-3.5 py-2.5 transition-all ${
                      owned ? "border-gold/40 bg-gold/5 text-gold" : next ? (me.hyper >= p.price ? "border-line hover:border-gold/60 hover:bg-panel2" : "border-line opacity-55") : "border-line opacity-40"
                    }`}
                  >
                    <span className="font-mono text-[12px] text-ink">
                      {p.size}×{p.size} <span className="ml-1 text-[10px] text-dim">вместимость: {6 + i * 4} предметов</span>
                    </span>
                    <span className={`font-mono text-[11px] ${owned ? "text-gold" : "text-mist"}`}>{owned ? "✓" : p.price === 0 ? "бесплатно" : `${p.price.toLocaleString("ru-RU")} HY`}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-4 font-mono text-[10px] tracking-[0.15em] text-dim uppercase">
              Размещено: {s.placed.length}/{capacity}
            </p>
          </div>
          <div className="border border-line bg-panel p-6">
            <p className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase">Бонусы от мебели</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {bonusSummary.map((b) => (
                <div key={b.n} className="border border-line/70 bg-abyss px-3 py-2.5">
                  <p className="font-mono text-[11px] text-ink">
                    {b.n} <span className="text-gold">×{b.v}</span>
                  </p>
                  <p className="font-mono text-[9.5px] tracking-[0.1em] text-dim uppercase">{b.b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "furniture" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="border border-line bg-panel p-5">
            <p className="font-mono text-[10px] tracking-[0.25em] text-gold uppercase">Лавка мебели</p>
            <div className="mt-3 space-y-2">
              {FURNITURE.map((f) => (
                <div key={f.id} className="flex items-center justify-between gap-2 border border-line px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="font-mono text-[12px] text-ink">
                      {f.name} {unplacedCount(f.id) > 0 && <span className="ml-1 border border-gold/40 px-1.5 text-[10px] text-gold">в наличии ×{unplacedCount(f.id)}</span>}
                    </p>
                    <p className="font-mono text-[9.5px] tracking-[0.1em] text-hyper uppercase">{f.bonus}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {unplacedCount(f.id) > 0 && (
                      <button
                        onClick={() => setPlacing(placing === f.id ? null : f.id)}
                        className={`border px-2.5 py-1.5 font-mono text-[10px] tracking-[0.12em] uppercase transition-colors ${placing === f.id ? "border-gold bg-gold/15 text-gold" : "border-line text-mist hover:text-gold"}`}
                      >
                        {placing === f.id ? "Ставим…" : "Ставить"}
                      </button>
                    )}
                    <button
                      onClick={() => buyFurniture(f.id)}
                      className={`border px-2.5 py-1.5 font-mono text-[10px] tracking-[0.12em] uppercase transition-colors ${me.hyper >= f.price ? "border-gold/50 text-gold hover:bg-gold hover:text-[#171006]" : "border-line text-dim"}`}
                    >
                      {f.price} HY
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* сетка участка */}
          <div className="border border-line bg-panel p-5">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase">
                Участок {plot.size}×{plot.size} · вид сверху
              </p>
              {placing && (
                <button onClick={() => setPlacing(null)} className="font-mono text-[10px] tracking-[0.15em] text-ember uppercase hover:underline">
                  [отменить]
                </button>
              )}
            </div>
            <div className={`relative mx-auto mt-4 aspect-square w-full max-w-[440px] border-2 p-1.5 transition-all ${placing ? "border-gold shadow-[0_0_40px_rgba(227,181,74,0.2)]" : "border-line2"}`} style={{ background: "radial-gradient(circle at 50% 40%, #101a30, #0a0f22 75%)" }}>
              <div className="grid h-full w-full grid-cols-10 grid-rows-10 gap-[3px]">
                {Array.from({ length: 100 }).map((_, cell) => {
                  const isHouse = houseCells.has(cell);
                  const item = s.placed.find((p) => p.cell === cell);
                  return (
                    <button
                      key={cell}
                      disabled={isHouse || (!!placing && !!item) || (!placing && !item)}
                      onClick={() => {
                        if (placing) {
                          if (placeFurniture(placing, cell)) setPlacing(null);
                        } else if (item) {
                          pickupFurniture(item.uid);
                        }
                      }}
                      className={`relative flex items-center justify-center transition-all duration-150 ${
                        isHouse
                          ? "border border-gold/50 bg-gradient-to-b from-[#2a3350] to-[#151d36] shadow-[inset_0_0_10px_rgba(227,181,74,0.15)]"
                          : item
                            ? "cursor-pointer border border-line bg-panel2 hover:border-ember/60"
                            : placing
                              ? "cursor-pointer border border-dashed border-line hover:border-gold hover:bg-gold/10"
                              : "border border-line/40"
                      }`}
                      title={isHouse ? `${house.name}` : item ? `${FURNITURE.find((f) => f.id === item.id)?.name} — клик, чтобы убрать` : placing ? "Поставить сюда" : undefined}
                    >
                      {isHouse && cell === start * 10 + start && (
                        <span className="font-display text-[10px] font-bold tracking-widest text-gold/80 sm:text-[12px]">⌂</span>
                      )}
                      {item && (
                        <span className="font-mono text-[9px] font-bold sm:text-[10px]" style={{ color: FURN_GLYPH[item.id].c, textShadow: `0 0 8px ${FURN_GLYPH[item.id].c}66` }}>
                          {FURN_GLYPH[item.id].g}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <p className="mt-3 text-center font-mono text-[10px] tracking-[0.15em] text-dim uppercase">
              {placing ? "Кликните по свободной клетке — мебель встанет" : "Клик по мебели вернёт её в инвентарь"}
            </p>
          </div>
        </div>
      )}

      {tab === "guests" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="border border-line bg-panel p-6">
            <p className="font-mono text-[10px] tracking-[0.25em] text-hyper uppercase">У вас в гостях · {s.guests.length}/5</p>
            <div className="mt-3 space-y-2">
              {guests.length === 0 && <p className="border border-dashed border-line p-6 text-center font-mono text-[11px] text-dim uppercase">Пока никого — пригласите граждан</p>}
              {guests.map(
                (g) =>
                  g && (
                    <div key={g.id} className="flex items-center gap-3 border border-line bg-abyss px-3.5 py-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-hyper/40 font-mono text-[10px] font-bold text-hyper">
                        {g.name.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-bold text-ink">{g.name}</p>
                        <p className="font-mono text-[9px] tracking-[0.15em] text-dim uppercase">{g.id} · общение +настроение</p>
                      </div>
                      <button onClick={() => removeGuest(g.id)} className="font-mono text-[10px] text-dim uppercase transition-colors hover:text-ember">
                        [проводить]
                      </button>
                    </div>
                  ),
              )}
            </div>
            <p className="mt-4 font-mono text-[10px] tracking-[0.15em] text-dim uppercase">Каждый гость: +4 к настроению при встрече и фон восстановления</p>
          </div>
          <div className="border border-line bg-panel p-6">
            <p className="font-mono text-[10px] tracking-[0.25em] text-gold uppercase">Кого пригласить</p>
            <div className="mt-3 space-y-2">
              {candidates.length === 0 && <p className="border border-dashed border-line p-6 text-center font-mono text-[11px] text-dim uppercase">Других граждан с паспортом пока нет</p>}
              {candidates.map((c) => {
                const invited = s.guests.includes(c.id);
                return (
                  <div key={c.id} className="flex items-center gap-3 border border-line px-3.5 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-bold text-ink">{c.name}</p>
                      <p className="font-mono text-[9px] tracking-[0.15em] text-dim uppercase">{c.id}</p>
                    </div>
                    <button
                      disabled={invited}
                      onClick={() => inviteGuest(c.id)}
                      className={`border px-3 py-1.5 font-mono text-[10px] tracking-[0.15em] uppercase transition-colors ${invited ? "border-hyper/50 text-hyper" : "border-gold/50 text-gold hover:bg-gold hover:text-[#171006]"}`}
                    >
                      {invited ? "✓ в гостях" : "Позвать"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
