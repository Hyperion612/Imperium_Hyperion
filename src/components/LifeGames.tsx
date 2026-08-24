import { useEffect, useRef, useState } from "react";
import { drawNumbers, mineMaxHp, useLife } from "../lib/life";
import { useEmpire } from "../lib/state";
import { FISH, LOTTERY, LOTTERY_PRIZES, MINE_TIERS, PLANTS, type PlantId } from "../lib/lifeData";
import { LifeHud } from "./LifeWork";

const GAMES = [
  { id: "mine", label: "Шахта" },
  { id: "fish", label: "Рыбалка" },
  { id: "garden", label: "Сад" },
  { id: "lottery", label: "Лотерея" },
] as const;

/* ─────────────── ШАХТА ─────────────── */
function MineGame() {
  const { s, mineHit } = useLife();
  const [hits, setHits] = useState<{ id: number; crit: boolean; treasure: boolean }[]>([]);
  const [shake, setShake] = useState(0);
  const idRef = useRef(0);
  if (!s) return null;
  const m = s.mine;
  const boss = m.depth % 10 === 0;
  const tier = MINE_TIERS.find((t) => m.depth <= t.upTo) ?? MINE_TIERS[MINE_TIERS.length - 1];
  const repairLeft = m.broken ? Math.max(0, 15 - Math.floor((Date.now() - m.brokenAt) / 1000)) : 0;

  const hit = () => {
    const r = mineHit();
    if (!r) return;
    setShake((x) => x + 1);
    setHits((h) => [...h.slice(-5), { id: ++idRef.current, crit: r.crit, treasure: r.treasure && r.broke }]);
    window.setTimeout(() => setHits((h) => h.slice(1)), 700);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="relative flex flex-col items-center border border-line bg-panel p-6">
        <div className="flex w-full items-center justify-between font-mono text-[11px]">
          <span className="tracking-[0.2em] text-dim uppercase">Глубина</span>
          <span className={`text-[15px] font-bold ${boss ? "text-ember" : "text-gold"}`}>
            ур. {m.depth}/100 {boss && "· БОСС"}
          </span>
        </div>
        <div className="mt-2 h-2.5 w-full border border-line bg-abyss">
          <div className={`h-full transition-all duration-200 ${boss ? "bg-gradient-to-r from-[#8f3a2a] to-ember" : "bg-gradient-to-r from-[#5c6880] to-[#b8c4d6]"}`} style={{ width: `${(m.hp / mineMaxHp(m.depth)) * 100}%` }} />
        </div>
        <p className="mt-1 w-full text-right font-mono text-[10px] text-dim tabular-nums">
          порода: {Math.max(0, Math.ceil(m.hp))}/{mineMaxHp(m.depth)}
        </p>

        <div key={shake} className={`relative mt-4 ${shake ? "animate-shake" : ""}`}>
          <button
            onClick={hit}
            disabled={m.broken}
            className={`clip-notch relative flex h-52 w-52 flex-col items-center justify-center border-2 transition-all active:scale-[0.96] sm:h-60 sm:w-60 ${
              m.broken ? "cursor-not-allowed border-ember/50 opacity-60" : boss ? "border-ember hover:shadow-[0_0_50px_rgba(226,96,76,0.35)]" : "border-line2 hover:border-gold/70 hover:shadow-[0_0_50px_rgba(227,181,74,0.25)]"
            }`}
            style={{ background: "radial-gradient(circle at 40% 30%, #1c2438, #0a0f22 72%)" }}
          >
            <svg viewBox="0 0 64 64" className="h-20 w-20 text-[#b8c4d6]" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M14 40 L34 20 l14 14 -20 20z" strokeLinejoin="round" />
              <path d="M34 20l8-8 10 10-8 8" strokeLinejoin="round" />
              <path d="M14 40l-6 14 14-6" strokeLinejoin="round" />
            </svg>
            <span className="font-display mt-3 text-[14px] font-extrabold tracking-[0.2em] text-ink uppercase">{boss ? "Крушить босса" : "Копать"}</span>
            <span className="mt-1 font-mono text-[9px] tracking-[0.2em] text-dim uppercase">0.3⚡ за удар · крит ×10</span>
            {hits.map((h) => (
              <span
                key={h.id}
                className={`pointer-events-none absolute top-8 left-1/2 font-mono font-bold ${h.treasure ? "text-[22px] text-[#FFD700]" : h.crit ? "text-[20px] text-ember" : "text-[15px] text-[#b8c4d6]"}`}
                style={{ animation: "float-up 0.7s ease-out forwards", textShadow: "0 0 14px currentColor" }}
              >
                {h.treasure ? "СОКРОВИЩЕ!" : h.crit ? "КРИТ ×10" : "⛏"}
              </span>
            ))}
          </button>
        </div>

        {m.broken && (
          <p className="mt-4 border border-ember/50 bg-ember/10 px-4 py-2 font-mono text-[11px] tracking-[0.15em] text-ember uppercase">
            Кирка сломана · починка {repairLeft} с
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div className="border border-line bg-panel p-5">
          <p className="font-mono text-[10px] tracking-[0.25em] text-gold uppercase">Награды по глубине</p>
          <div className="mt-3 space-y-2">
            {MINE_TIERS.map((t) => {
              const active = m.depth <= t.upTo;
              return (
                <div key={t.upTo} className={`flex justify-between border px-3 py-2 font-mono text-[11px] ${active ? "border-gold/50 text-gold" : "border-line text-dim"}`}>
                  <span>до ур. {t.upTo}</span>
                  <span className="tabular-nums">{t.min}–{t.max} HY</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="border border-line bg-panel p-5 font-mono text-[11px] leading-relaxed text-mist">
          <p className="tracking-[0.25em] text-hyper uppercase">Сводка шахт</p>
          <ul className="mt-2 space-y-1.5">
            <li>· Каждый 10-й уровень — босс (награда ×5)</li>
            <li>· Критический удар ×10 — шанс 5%</li>
            <li>· Сокровище в породе — шанс 8% (×2)</li>
            <li>· Инструмент ломается — шанс 3%</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── РЫБАЛКА ─────────────── */
function FishGame() {
  const { s, addCatch, fishUpgrade } = useLife();
  const { me } = useEmpire();
  const [phase, setPhase] = useState<"idle" | "waiting" | "bite" | "result">("idle");
  const [msg, setMsg] = useState("Закиньте удочку и ждите поклёвку.");
  const [lastCatch, setLastCatch] = useState<{ name: string; tier: string; value: number; color: string } | null>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  if (!s || !me) return null;

  const f = s.fish;
  const waitMax = Math.max(2, 10 - f.bait * 2.5);

  const cast = () => {
    setPhase("waiting");
    setMsg("Леска в воде… следите за поплавком.");
    setLastCatch(null);
    const wait = 2000 + Math.random() * (waitMax - 2) * 1000;
    timers.current.push(
      window.setTimeout(() => {
        setPhase("bite");
        setMsg("ПОКЛЁВКА! Жмите немедленно!");
        timers.current.push(
          window.setTimeout(() => {
            setPhase("result");
            setMsg("Слишком медленно — рыба ушла…");
            timers.current.push(window.setTimeout(() => setPhase("idle"), 1600));
          }, 1200),
        );
      }, wait),
    );
  };

  const catchFish = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    // редкость
    const rod = f.rod;
    const boat = f.boat;
    let r = Math.random() * 100;
    let tier: string;
    const goldenP = boat >= 2 ? 1.5 + rod * 0.5 : 0;
    const legP = boat >= 1 ? 5 + rod * 1.5 : 0;
    const rareP = 24 + rod * 5;
    if (r < goldenP) tier = "Золотая";
    else if (r < goldenP + legP) tier = "Легендарная";
    else if (r < goldenP + legP + rareP) tier = "Редкая";
    else tier = "Обычная";
    const pool = FISH.filter((x) => x.tier === tier);
    const fish = pool[Math.floor(Math.random() * pool.length)];
    const value = Math.round(fish.min + Math.random() * (fish.max - fish.min));
    addCatch(fish.name, value, fish.tier);
    setLastCatch({ name: fish.name, tier: fish.tier, value, color: fish.color });
    setPhase("result");
    setMsg("Есть!");
    timers.current.push(window.setTimeout(() => setPhase("idle"), 2200));
  };

  const upgrades = [
    { kind: "rod" as const, name: "Удочка", lvl: f.rod, prices: [300, 1500, 6000], note: "шанс редкой рыбы" },
    { kind: "bait" as const, name: "Наживка", lvl: f.bait, prices: [200, 1000, 4000], note: "быстрее поклёвка" },
    { kind: "boat" as const, name: "Лодка", lvl: f.boat, prices: [2500, 12000], note: "легендарная и золотая" },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="flex flex-col items-center border border-line bg-panel p-6">
        <div className="relative flex h-64 w-full max-w-md items-end justify-center overflow-hidden border border-line2" style={{ background: "linear-gradient(to bottom, #0c1428 0%, #0e2233 55%, #0a2a3a 100%)" }}>
          {/* поплавок */}
          <div className={`absolute bottom-16 left-1/2 -translate-x-1/2 transition-transform duration-300 ${phase === "bite" ? "translate-y-4" : phase === "waiting" ? "animate-float" : ""}`}>
            <div className={`mx-auto h-4 w-4 rounded-full ${phase === "bite" ? "animate-soft-pulse bg-ember" : "bg-gold"}`} style={{ boxShadow: "0 0 14px rgba(227,181,74,0.6)" }} />
            <div className="mx-auto h-10 w-px bg-line2" />
          </div>
          <div className="absolute inset-x-0 bottom-10 h-px bg-hyper/30" />
          {phase === "bite" && <div className="font-display absolute top-6 w-full animate-soft-pulse text-center text-2xl font-extrabold tracking-[0.2em] text-ember uppercase">Поклёвка!</div>}
          {lastCatch && phase === "result" && (
            <div className="absolute top-6 w-full text-center">
              <p className="font-display text-xl font-extrabold uppercase" style={{ color: lastCatch.color, textShadow: `0 0 20px ${lastCatch.color}` }}>
                {lastCatch.name}
              </p>
              <p className="mt-1 font-mono text-[11px] tracking-[0.2em] text-mist uppercase">
                {lastCatch.tier} · +{lastCatch.value.toLocaleString("ru-RU")} HY
              </p>
            </div>
          )}
        </div>
        <p className="mt-4 min-h-5 text-center font-mono text-[12px] tracking-[0.12em] text-mist">{msg}</p>
        <div className="mt-3 flex gap-3">
          {phase === "idle" && (
            <button onClick={cast} className="clip-notch bg-gold px-8 py-3.5 font-mono text-[12px] font-bold tracking-[0.2em] text-[#171006] uppercase transition-all hover:bg-goldsoft hover:shadow-[0_0_34px_rgba(227,181,74,0.35)]">
              Закинуть удочку
            </button>
          )}
          {phase === "bite" && (
            <button onClick={catchFish} className="clip-notch animate-soft-pulse bg-ember px-10 py-3.5 font-mono text-[13px] font-bold tracking-[0.2em] text-white uppercase">
              Подсечь!
            </button>
          )}
          {phase === "waiting" && <span className="border border-line px-8 py-3.5 font-mono text-[12px] tracking-[0.2em] text-dim uppercase">Ожидание…</span>}
        </div>
        {f.best && <p className="mt-4 font-mono text-[10px] tracking-[0.2em] text-gold uppercase">Лучший улов: {f.best}</p>}
      </div>

      <div className="space-y-4">
        <div className="border border-line bg-panel p-5">
          <p className="font-mono text-[10px] tracking-[0.25em] text-hyper uppercase">Снасти</p>
          <div className="mt-3 space-y-2">
            {upgrades.map((u) => {
              const maxed = u.lvl >= u.prices.length;
              const price = maxed ? 0 : u.prices[u.lvl];
              return (
                <div key={u.kind} className="flex items-center justify-between gap-2 border border-line px-3.5 py-2.5">
                  <div>
                    <p className="font-mono text-[12px] text-ink">
                      {u.name} <span className="text-gold">ур. {u.lvl}</span>
                    </p>
                    <p className="font-mono text-[9px] tracking-[0.12em] text-dim uppercase">{u.note}</p>
                  </div>
                  <button
                    disabled={maxed || me.hyper < price}
                    onClick={() => fishUpgrade(u.kind)}
                    className={`border px-3 py-1.5 font-mono text-[10px] tracking-[0.12em] uppercase transition-colors ${maxed ? "border-gold/40 text-gold" : me.hyper >= price ? "border-hyper/50 text-hyper hover:bg-hyper/10" : "border-line text-dim"}`}
                  >
                    {maxed ? "макс." : `${price.toLocaleString("ru-RU")} HY`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        <div className="border border-line bg-panel p-5">
          <p className="font-mono text-[10px] tracking-[0.25em] text-gold uppercase">Водоём Гелиос-Дельта</p>
          <div className="mt-3 space-y-1.5">
            {FISH.map((x) => (
              <div key={x.name} className="flex items-center justify-between font-mono text-[11px]">
                <span className="flex items-center gap-2 text-mist">
                  <span className="inline-block h-2 w-2 rotate-45" style={{ background: x.color }} />
                  {x.name}
                </span>
                <span className="text-dim tabular-nums">
                  {x.tier} · {x.min}–{x.max} HY
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── САД ─────────────── */
function GardenGame() {
  const { s, plant, water, harvest } = useLife();
  const [seed, setSeed] = useState<PlantId>("wheat");
  if (!s) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border border-line bg-panel p-4">
        <p className="font-mono text-[11px] text-mist">
          Грядки: <b className="text-gold">{s.garden.length}</b> (растут с уровнем дома)
        </p>
        <label className="flex items-center gap-2 font-mono text-[11px] text-mist">
          Семена:
          <select className="field !w-auto !py-1.5" value={seed} onChange={(e) => setSeed(e.target.value as PlantId)}>
            {PLANTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {p.seed} HY · {p.time}с
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {s.garden.map((g, i) => {
          const p = g.crop ? PLANTS.find((x) => x.id === g.crop) : null;
          const elapsed = g.crop ? (Date.now() - g.plantedAt) / 1000 : 0;
          const ready = p ? elapsed >= p.time : false;
          const pct = p ? Math.min(100, (elapsed / p.time) * 100) : 0;
          return (
            <div key={i} className={`relative border p-4 transition-all ${g.crop ? "border-[#2a8f7f]/50 bg-panel" : "border-dashed border-line bg-panel/40"}`}>
              <p className="font-mono text-[9px] tracking-[0.25em] text-dim uppercase">Грядка {i + 1}</p>
              {!g.crop ? (
                <button onClick={() => plant(i, seed)} className="mt-4 w-full border border-gold/50 px-3 py-2.5 font-mono text-[10px] font-bold tracking-[0.15em] text-gold uppercase transition-colors hover:bg-gold hover:text-[#171006]">
                  Посадить · 1⚡
                </button>
              ) : (
                <>
                  <p className={`mt-2 text-[13px] font-bold ${p?.rare ? "text-[#c9a4ff]" : "text-ink"}`}>{p?.name}</p>
                  <div className="mt-2 h-1.5 w-full bg-line/70">
                    <div className={`h-full transition-all duration-1000 ease-linear ${ready ? "bg-gradient-to-r from-brass to-gold" : "bg-gradient-to-r from-[#2a8f7f] to-hyper"}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-1.5 font-mono text-[10px] text-dim tabular-nums">{ready ? "созрело!" : `ещё ${Math.ceil((p?.time ?? 0) - elapsed)} с`} {g.watered && "· полито"}</p>
                  <div className="mt-3 flex gap-2">
                    {!ready && !g.watered && (
                      <button onClick={() => water(i)} className="flex-1 border border-hyper/50 px-2 py-1.5 font-mono text-[10px] tracking-[0.12em] text-hyper uppercase transition-colors hover:bg-hyper/10">
                        Полить
                      </button>
                    )}
                    {ready && (
                      <button onClick={() => harvest(i)} className="flex-1 animate-soft-pulse border border-gold bg-gold/10 px-2 py-1.5 font-mono text-[10px] font-bold tracking-[0.12em] text-gold uppercase transition-colors hover:bg-gold hover:text-[#171006]">
                        Собрать
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
      <p className="font-mono text-[10px] tracking-[0.15em] text-dim uppercase">Полив ускоряет рост · Кристальный цветок иногда даёт редкий приз +200 HY</p>
    </div>
  );
}

/* ─────────────── ЛОТЕРЕЯ ─────────────── */
function LotteryGame() {
  const { s, buyTicket } = useLife();
  const [picked, setPicked] = useState<number[]>([]);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  if (!s) return null;

  const nextHour = new Date(now);
  nextHour.setMinutes(0, 0, 0);
  nextHour.setHours(nextHour.getHours() + 1);
  const left = Math.max(0, nextHour.getTime() - now);
  const mm = String(Math.floor(left / 60000)).padStart(2, "0");
  const ss = String(Math.floor(left / 1000) % 60).padStart(2, "0");
  const toggle = (n: number) =>
    setPicked((p) => (p.includes(n) ? p.filter((x) => x !== n) : p.length < LOTTERY.pick ? [...p, n] : p));
  const lr = s.lottery.lastResult;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="border border-line bg-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[10px] tracking-[0.25em] text-gold uppercase">Выберите 5 чисел (1–50)</p>
          <p className="font-mono text-[11px] text-hyper tabular-nums">
            до розыгрыша: <b>{mm}:{ss}</b>
          </p>
        </div>
        <div className="mt-4 grid grid-cols-10 gap-1.5">
          {Array.from({ length: LOTTERY.maxN }).map((_, i) => {
            const n = i + 1;
            const on = picked.includes(n);
            return (
              <button
                key={n}
                onClick={() => toggle(n)}
                className={`aspect-square border font-mono text-[11px] transition-all duration-150 ${on ? "border-gold bg-gold font-bold text-[#171006] shadow-[0_0_14px_rgba(227,181,74,0.4)]" : "border-line text-mist hover:border-gold/50 hover:text-gold"}`}
              >
                {n}
              </button>
            );
          })}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <button
            disabled={picked.length !== LOTTERY.pick}
            onClick={() => {
              if (buyTicket(picked)) setPicked([]);
            }}
            className={`clip-notch px-7 py-3 font-mono text-[12px] font-bold tracking-[0.2em] uppercase transition-all ${picked.length === LOTTERY.pick ? "bg-gold text-[#171006] hover:bg-goldsoft hover:shadow-[0_0_30px_rgba(227,181,74,0.35)]" : "cursor-not-allowed bg-line text-dim"}`}
          >
            Билет · {LOTTERY.ticketPrice} HY
          </button>
          <span className="font-mono text-[11px] text-dim">
            выбрано: <b className="text-gold">{picked.length}/{LOTTERY.pick}</b>
          </span>
        </div>
        {s.lottery.tickets.length > 0 && (
          <div className="mt-5 border-t border-line pt-4">
            <p className="font-mono text-[9px] tracking-[0.25em] text-dim uppercase">Ваши билеты на ближайший розыгрыш</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {s.lottery.tickets.map((t, i) => (
                <span key={i} className="border border-gold/40 px-2.5 py-1 font-mono text-[11px] text-gold tabular-nums">
                  {t.nums.sort((a, b) => a - b).join(" · ")}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="border border-gold/40 bg-panel p-6 text-center">
          <p className="font-mono text-[10px] tracking-[0.3em] text-dim uppercase">Джекпот</p>
          <p className="font-display mt-2 text-[clamp(1.6rem,3vw,2.4rem)] font-extrabold text-gold tabular-nums">
            {s.lottery.jackpot.toLocaleString("ru-RU")} HY
          </p>
          <p className="mt-1 font-mono text-[9px] tracking-[0.2em] text-dim uppercase">растёт с каждым билетом</p>
        </div>
        <div className="border border-line bg-panel p-5">
          <p className="font-mono text-[10px] tracking-[0.25em] text-hyper uppercase">Таблица выигрышей</p>
          <div className="mt-3 space-y-2">
            {Object.entries(LOTTERY_PRIZES).map(([m, v]) => (
              <div key={m} className="flex justify-between border border-line/70 px-3 py-2 font-mono text-[11px]">
                <span className="text-mist">{m} совпадения</span>
                <span className="text-gold tabular-nums">{v.toLocaleString("ru-RU")} HY</span>
              </div>
            ))}
            <div className="flex justify-between border border-gold/40 px-3 py-2 font-mono text-[11px]">
              <span className="text-goldsoft">5 совпадений</span>
              <span className="font-bold text-gold">ДЖЕКПОТ</span>
            </div>
          </div>
        </div>
        {lr && (
          <div className="border border-line bg-panel p-5">
            <p className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase">Последний розыгрыш</p>
            <p className="mt-2 font-mono text-[14px] font-bold text-ink tabular-nums">{lr.nums.sort((a, b) => a - b).join(" · ")}</p>
            <p className={`mt-1 font-mono text-[11px] ${lr.prize > 0 ? "text-gold" : "text-dim"}`}>
              {lr.prize > 0 ? `Совпадений: ${lr.matches} · выигрыш ${lr.prize.toLocaleString("ru-RU")} HY` : "Без совпадений — удача переменчива"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────── ОБЁРТКА ─────────────── */
export default function LifeGames() {
  const [game, setGame] = useState<(typeof GAMES)[number]["id"]>("mine");
  return (
    <div className="space-y-6">
      <LifeHud />
      <div className="flex flex-wrap gap-1 border-b border-line">
        {GAMES.map((g) => (
          <button
            key={g.id}
            onClick={() => setGame(g.id)}
            className={`relative px-4 py-2.5 font-mono text-[11px] font-bold tracking-[0.18em] uppercase transition-colors ${game === g.id ? "text-hyper" : "text-dim hover:text-mist"}`}
          >
            {g.label}
            <span aria-hidden className={`absolute inset-x-2 bottom-0 h-[2px] bg-hyper transition-transform duration-300 ${game === g.id ? "scale-x-100" : "scale-x-0"}`} />
          </button>
        ))}
      </div>
      {game === "mine" && <MineGame />}
      {game === "fish" && <FishGame />}
      {game === "garden" && <GardenGame />}
      {game === "lottery" && <LotteryGame />}
    </div>
  );
}
