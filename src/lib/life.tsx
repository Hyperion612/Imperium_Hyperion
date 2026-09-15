import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ACHIEVEMENTS,
  AUTOS,
  FURNITURE,
  HOUSE_LEVELS,
  HOUSE_SIZE,
  LOTTERY,
  LOTTERY_PRIZES,
  MATERIALS,
  MINE_TIERS,
  PLANTS,
  PLOTS,
  RECIPES,
  RESOURCES,
  TOOLS,
  type AutoId,
  type FurnitureId,
  type MaterialId,
  type PlantId,
  type Recipe,
  type ResourceId,
} from "./lifeData";
import { useEmpire } from "./state";
import { sfx } from "./sfx";

export interface GardenPlot {
  crop: PlantId | null;
  plantedAt: number;
  watered: boolean;
}
export interface PlacedItem {
  uid: number;
  id: FurnitureId;
  cell: number;
}
export interface CraftJob {
  uid: number;
  recipeId: string;
  doneAt: number;
}
export interface LotteryTicket {
  nums: number[];
  drawAt: number;
}
export interface LifeSave {
  energy: number;
  mood: number;
  prestige: number;
  clicks: number;
  earnedTotal: number;
  house: number;
  plot: number;
  tool: number;
  autos: Record<AutoId, number>;
  res: Record<string, number>;
  owned: FurnitureId[];
  placed: PlacedItem[];
  guests: string[];
  profs: Record<string, number>;
  queue: CraftJob[];
  mine: { depth: number; hp: number; broken: boolean; brokenAt: number };
  fish: { rod: number; bait: number; boat: number; best: string };
  garden: GardenPlot[];
  lottery: { tickets: LotteryTicket[]; jackpot: number; lastResult: { nums: number[]; matches: number; prize: number } | null };
  ach: string[];
  cooldowns: { sleep: number; eat: number };
  hyperBuffer: number;
  pendingMsgs: { msg: string; kind: "gold" | "hyper" | "ember" }[];
  lastTick: number;
}

const LS_KEY = "hyperion_life_v2";
const TICK_MS = 1000;
const OFFLINE_CAP_H = 8;

function defaultSave(): LifeSave {
  const now = Date.now();
  return {
    energy: 100,
    mood: 70,
    prestige: 0,
    clicks: 0,
    earnedTotal: 0,
    house: 0,
    plot: 0,
    tool: 0,
    autos: { worker: 0, crew: 0, factory: 0, corp: 0 },
    res: {},
    owned: [],
    placed: [],
    guests: [],
    profs: {},
    queue: [],
    mine: { depth: 1, hp: mineMaxHp(1), broken: false, brokenAt: 0 },
    fish: { rod: 0, bait: 0, boat: 0, best: "" },
    garden: [emptyPlot(), emptyPlot()],
    lottery: { tickets: [], jackpot: LOTTERY.jackpotBase, lastResult: null },
    ach: [],
    cooldowns: { sleep: 0, eat: 0 },
    hyperBuffer: 0,
    pendingMsgs: [],
    lastTick: now,
  };
}

function emptyPlot(): GardenPlot {
  return { crop: null, plantedAt: 0, watered: false };
}
export function mineMaxHp(depth: number): number {
  const boss = depth % 10 === 0 ? 5 : 1;
  return Math.round((8 + depth * 2.2) * boss);
}
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function loadAll(): Record<string, LifeSave> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, Partial<LifeSave>>;
      const out: Record<string, LifeSave> = {};
      for (const [k, v] of Object.entries(parsed)) out[k] = { ...defaultSave(), ...v, hyperBuffer: 0, pendingMsgs: [] };
      return out;
    }
  } catch {
    /* повреждённые данные — заново */
  }
  return {};
}

interface LifeApi {
  s: LifeSave | null;
  energyMax: number;
  moodMult: number;
  trophyMult: number;
  incomePerSec: number;
  craftSlots: number;
  resCount: (id: string) => number;
  clickResource: (id: ResourceId) => number;
  sellAll: () => void;
  buyTool: (idx: number) => void;
  buyAuto: (id: AutoId) => void;
  buyHouse: (idx: number) => void;
  buyPlot: (idx: number) => void;
  buyFurniture: (id: FurnitureId) => void;
  placeFurniture: (id: FurnitureId, cell: number) => boolean;
  pickupFurniture: (uid: number) => void;
  inviteGuest: (citizenId: string) => void;
  removeGuest: (citizenId: string) => void;
  craft: (recipeId: string) => void;
  buyMaterial: (id: MaterialId) => void;
  mineHit: () => { dmg: number; crit: boolean; broke: boolean; reward: number; treasure: boolean } | null;
  fishUpgrade: (kind: "rod" | "bait" | "boat") => void;
  addCatch: (name: string, value: number, tier: string) => void;
  plant: (i: number, crop: PlantId) => void;
  water: (i: number) => void;
  harvest: (i: number) => number;
  buyTicket: (nums: number[]) => boolean;
  sleep: () => void;
  eat: () => void;
  profLevel: (id: string) => number;
}

const Ctx = createContext<LifeApi | null>(null);

export function LifeProvider({ children }: { children: ReactNode }) {
  const { me, earnHyper, earnLight, notify } = useEmpire();
  const [saves, setSaves] = useState<Record<string, LifeSave>>(loadAll);
  const saveTimer = useRef(0);

  const mutate = useCallback((fn: (s: LifeSave) => LifeSave) => {
    setSaves((prev) => {
      if (!me) return prev;
      const cur = prev[me.id] ?? defaultSave();
      return { ...prev, [me.id]: fn(cur) };
    });
  }, [me]);

  // ── тик каждую секунду ────────────────────────────────
  useEffect(() => {
    if (!me) return;
    const id = window.setInterval(() => {
      const now = Date.now();
      setSaves((prev) => {
        const s = prev[me.id];
        if (!s) return prev;
        const beds = s.owned.filter((f) => f === "bed").length;
        const eMax = 100 + beds * 5;
        const trophies = s.owned.filter((f) => f === "trophy").length;
        const tMult = Math.min(1.25, 1 + trophies * 0.05);
        const moodMult = s.mood >= 70 ? 1.1 : s.mood <= 30 ? 0.8 : 1;
        const autoRate = AUTOS.reduce((sum, a) => sum + a.rate * (s.autos[a.id] || 0), 0);

        // офлайн-доход с потолком
        let elapsed = (now - s.lastTick) / 1000;
        const offline = elapsed > 5;
        elapsed = Math.min(elapsed, OFFLINE_CAP_H * 3600);

        const energy = clamp(s.energy + elapsed / 300, 0, eMax);
        const moodDrift = -0.012 + s.guests.length * 0.007 + s.owned.filter((f) => f === "carpet").length * 0.004;
        const mood = clamp(s.mood + moodDrift * Math.min(elapsed, 60), 5, 100);

        let buffer = s.hyperBuffer + autoRate * tMult * moodMult * elapsed;
        const msgs = [...s.pendingMsgs];

        if (offline && autoRate > 0) {
          msgs.push({ msg: `Автодобыча за отсутствие: +${Math.floor(autoRate * tMult * moodMult * elapsed).toLocaleString("ru-RU")} HY`, kind: "hyper" });
        }

        // крафт-очередь
        const done = s.queue.filter((q) => q.doneAt <= now);
        const queue = s.queue.filter((q) => q.doneAt > now);
        for (const job of done) {
          const r = RECIPES.find((x) => x.id === job.recipeId);
          if (r) {
            buffer += r.value;
            msgs.push({ msg: `Создано: ${r.name} (+${r.value} HY)`, kind: "gold" });
          }
        }

        // лотерея: розыгрыш каждый час
        const lottery = { ...s.lottery };
        const due = lottery.tickets.filter((t) => t.drawAt <= now);
        if (due.length) {
          const drawAt = due[0].drawAt;
          const win = drawNumbers(drawAt);
          let best = 0;
          for (const t of due) {
            const matches = t.nums.filter((n) => win.includes(n)).length;
            const prize = matches === 5 ? lottery.jackpot : LOTTERY_PRIZES[matches] ?? 0;
            if (prize > 0) {
              buffer += prize;
              if (matches === 5) lottery.jackpot = LOTTERY.jackpotBase;
              if (prize > best) best = prize;
              lottery.lastResult = { nums: win, matches, prize };
            }
          }
          lottery.tickets = lottery.tickets.filter((t) => t.drawAt > now);
          if (best > 0) msgs.push({ msg: `Лотерея: выигрыш ${best.toLocaleString("ru-RU")} HY!`, kind: "gold" });
          else lottery.lastResult = { nums: win, matches: 0, prize: 0 };
        }

        // починка кирки
        const mine = { ...s.mine };
        if (mine.broken && now - mine.brokenAt > 15000) {
          mine.broken = false;
          msgs.push({ msg: "Кирка починена мастерской.", kind: "hyper" });
        }

        return {
          ...prev,
          [me.id]: {
            ...s,
            energy,
            mood,
            hyperBuffer: buffer,
            pendingMsgs: msgs.slice(-6),
            queue,
            lottery,
            mine,
            earnedTotal: s.earnedTotal + autoRate * tMult * moodMult * elapsed,
            lastTick: now,
          },
        };
      });
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [me?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── сброс буфера HYPER и сообщений в империю ──────────
  const s = me ? saves[me.id] ?? null : null;
  useEffect(() => {
    if (!s || !me) return;
    if (s.hyperBuffer >= 1) {
      const amt = Math.floor(s.hyperBuffer);
      earnHyper(amt);
      mutate((x) => ({ ...x, hyperBuffer: x.hyperBuffer - amt }));
    }
    if (s.pendingMsgs.length) {
      const msgs = s.pendingMsgs;
      mutate((x) => ({ ...x, pendingMsgs: [] }));
      for (const m of msgs) notify(m.msg, m.kind);
      if (msgs.some((m) => m.msg.includes("выигрыш"))) sfx.rare();
    }
  }, [s?.hyperBuffer, s?.pendingMsgs.length, me, earnHyper, mutate, notify, s]);

  // ── автосохранение: каждые 30 с + при выходе ──────────
  useEffect(() => {
    const write = () => {
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(saves));
      } catch {
        /* quota */
      }
    };
    const id = window.setInterval(write, 30000);
    const onHide = () => write();
    window.addEventListener("beforeunload", onHide);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("beforeunload", onHide);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [saves]);

  // при первом входе гражданина — создать сохранение
  useEffect(() => {
    if (me) setSaves((p) => (p[me.id] ? p : { ...p, [me.id]: defaultSave() }));
  }, [me?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const ensure = (x: LifeSave): LifeSave => x;

  // ── производные ───────────────────────────────────────
  const beds = s?.owned.filter((f) => f === "bed").length ?? 0;
  const trophies = s?.owned.filter((f) => f === "trophy").length ?? 0;
  const energyMax = 100 + beds * 5;
  const trophyMult = Math.min(1.25, 1 + trophies * 0.05);
  const moodMult = !s ? 1 : s.mood >= 70 ? 1.1 : s.mood <= 30 ? 0.8 : 1;
  const incomePerSec = !s ? 0 : AUTOS.reduce((sum, a) => sum + a.rate * (s.autos[a.id] || 0), 0) * trophyMult * moodMult;
  const craftSlots = 1 + (s?.owned.filter((f) => f === "table").length ?? 0);

  const resCount = useCallback((id: string) => s?.res[id] ?? 0, [s]);
  const profLevel = useCallback((id: string) => Math.floor((s?.profs[id] ?? 0) / 100) + 1, [s]);

  // ── действия ──────────────────────────────────────────
  const clickResource = useCallback(
    (id: ResourceId): number => {
      if (!s) return 0;
      if (s.energy < 0.2) {
        notify("Нет энергии — отдохните или поешьте.", "ember");
        return 0;
      }
      const tool = TOOLS[s.tool];
      const res = RESOURCES.find((r) => r.id === id);
      if (!res) return 0;
      let units = tool.mult;
      let flash = false;
      if (Math.random() < 0.02) {
        units *= 5;
        flash = true;
      }
      sfx.click();
      if (flash) sfx.rare();
      mutate((x) => {
        const byproduct = Math.random() < 0.05 ? (["herb", "canvas", "paint"] as MaterialId[])[Math.floor(Math.random() * 3)] : null;
        const achMsgs: LifeSave["pendingMsgs"] = [];
        let buffer = x.hyperBuffer;
        const clicks = x.clicks + 1;
        let ach = x.ach;
        for (const a of ACHIEVEMENTS) {
          if (clicks >= a.clicks && !ach.includes(a.id)) {
            ach = [...ach, a.id];
            buffer += a.reward;
            achMsgs.push({ msg: `Достижение «${a.name}»: +${a.reward.toLocaleString("ru-RU")} HY`, kind: "gold" });
          }
        }
        return ensure({
          ...x,
          clicks,
          energy: x.energy - 0.2,
          mood: clamp(x.mood - 0.015, 5, 100),
          res: { ...x.res, [id]: (x.res[id] ?? 0) + units, ...(byproduct ? { [byproduct]: (x.res[byproduct] ?? 0) + 1 } : {}) },
          hyperBuffer: buffer,
          ach,
          pendingMsgs: [...x.pendingMsgs, ...achMsgs].slice(-6),
        });
      });
      return units;
    },
    [s, mutate, notify],
  );

  const sellAll = useCallback(() => {
    if (!s) return;
    let total = 0;
    for (const r of RESOURCES) total += (s.res[r.id] ?? 0) * r.value;
    for (const m of MATERIALS) total += (s.res[m.id] ?? 0) * Math.floor(m.price / 2);
    if (total <= 0) {
      notify("Нечего продавать — добудьте ресурсы.", "ember");
      return;
    }
    const gained = Math.floor(total * moodMult * trophyMult);
    sfx.buy();
    earnHyper(gained);
    mutate((x) => ({
      ...x,
      res: {},
      earnedTotal: x.earnedTotal + gained,
      mood: clamp(x.mood + 1, 5, 100),
    }));
    notify(`Продано ресурсов на ${gained.toLocaleString("ru-RU")} HY.`, "hyper");
  }, [s, moodMult, trophyMult, earnHyper, mutate, notify]);

  const buyTool = useCallback(
    (idx: number) => {
      if (!s || !me) return;
      const t = TOOLS[idx];
      if (idx <= s.tool) return;
      if (me.hyper < t.price) return notify("Недостаточно HYPER.", "ember");
      earnHyper(-t.price);
      sfx.buy();
      mutate((x) => ({ ...x, tool: idx }));
      notify(`Инструмент «${t.name}» — доход ×${t.mult}.`, "gold");
    },
    [s, me, earnHyper, mutate, notify],
  );

  const buyAuto = useCallback(
    (id: AutoId) => {
      if (!s || !me) return;
      const a = AUTOS.find((x) => x.id === id);
      if (!a) return;
      if (me.hyper < a.price) return notify("Недостаточно HYPER.", "ember");
      earnHyper(-a.price);
      sfx.buy();
      mutate((x) => ({ ...x, autos: { ...x.autos, [id]: (x.autos[id] || 0) + 1 } }));
      notify(`Нанят: ${a.name} (+${a.rate} HY/сек).`, "hyper");
    },
    [s, me, earnHyper, mutate, notify],
  );

  const buyHouse = useCallback(
    (idx: number) => {
      if (!s || !me) return;
      if (idx !== s.house + 1) return;
      const h = HOUSE_LEVELS[idx];
      if (me.hyper < h.price) return notify("Недостаточно HYPER.", "ember");
      earnHyper(-h.price);
      sfx.buy();
      const gardenPlots = 2 + idx;
      mutate((x) => ({
        ...x,
        house: idx,
        garden: [...x.garden, ...Array.from({ length: gardenPlots - x.garden.length }, emptyPlot)],
      }));
      notify(`Новое жилище: ${h.name}!`, "gold");
    },
    [s, me, earnHyper, mutate, notify],
  );

  const buyPlot = useCallback(
    (idx: number) => {
      if (!s || !me) return;
      if (idx !== s.plot + 1) return;
      const p = PLOTS[idx];
      if (me.hyper < p.price) return notify("Недостаточно HYPER.", "ember");
      earnHyper(-p.price);
      sfx.buy();
      mutate((x) => ({ ...x, plot: idx }));
      notify(`Участок расширен до ${p.size}×${p.size}.`, "gold");
    },
    [s, me, earnHyper, mutate, notify],
  );

  const buyFurniture = useCallback(
    (id: FurnitureId) => {
      if (!s || !me) return;
      const f = FURNITURE.find((x) => x.id === id);
      if (!f) return;
      if (me.hyper < f.price) return notify("Недостаточно HYPER.", "ember");
      earnHyper(-f.price);
      sfx.buy();
      if (f.effect.light) earnLight(f.effect.light);
      mutate((x) => ({
        ...x,
        owned: [...x.owned, id],
        mood: clamp(x.mood + (f.effect.mood ?? 0), 5, 100),
        prestige: x.prestige + (f.effect.prestige ?? 0),
      }));
      notify(`Куплено: ${f.name} (${f.bonus}). Расставьте на участке.`, "gold");
    },
    [s, me, earnHyper, earnLight, mutate, notify],
  );

  const placeFurniture = useCallback(
    (id: FurnitureId, cell: number): boolean => {
      if (!s) return false;
      const unplaced = [...s.owned];
      const placedCells = new Set(s.placed.map((p) => p.cell));
      const idx = unplaced.lastIndexOf(id);
      if (idx === -1 || placedCells.has(cell)) return false;
      const cap = 6 + s.plot * 4;
      if (s.placed.length >= cap) {
        notify("Участок заполнен — расширьте его.", "ember");
        return false;
      }
      sfx.click();
      mutate((x) => {
        const own = [...x.owned];
        own.splice(own.lastIndexOf(id), 1);
        return { ...x, owned: own, placed: [...x.placed, { uid: Date.now() + Math.floor(Math.random() * 999), id, cell }] };
      });
      return true;
    },
    [s, mutate, notify],
  );

  const pickupFurniture = useCallback(
    (uid: number) => {
      if (!s) return;
      const item = s.placed.find((p) => p.uid === uid);
      if (!item) return;
      sfx.click();
      mutate((x) => ({
        ...x,
        placed: x.placed.filter((p) => p.uid !== uid),
        owned: [...x.owned, item.id],
      }));
    },
    [s, mutate],
  );

  const inviteGuest = useCallback(
    (citizenId: string) => {
      if (!s) return;
      if (s.guests.includes(citizenId)) return;
      if (s.guests.length >= 5) return notify("Больше 5 гостей одновременно — нельзя.", "ember");
      sfx.buy();
      mutate((x) => ({ ...x, guests: [...x.guests, citizenId], mood: clamp(x.mood + 4, 5, 100) }));
      notify("Гость приглашён: настроение растёт от общения.", "hyper");
    },
    [s, mutate, notify],
  );

  const removeGuest = useCallback(
    (citizenId: string) => {
      mutate((x) => ({ ...x, guests: x.guests.filter((g) => g !== citizenId) }));
    },
    [mutate],
  );

  const craft = useCallback(
    (recipeId: string) => {
      if (!s) return;
      const r = RECIPES.find((x) => x.id === recipeId);
      if (!r) return;
      if (s.queue.length >= craftSlots) return notify(`Все слоты крафта заняты (столы: ${craftSlots}).`, "ember");
      for (const [k, v] of Object.entries(r.inputs)) {
        if ((s.res[k] ?? 0) < (v ?? 0)) return notify(`Не хватает материала: ${k}.`, "ember");
      }
      sfx.click();
      mutate((x) => {
        const res = { ...x.res };
        for (const [k, v] of Object.entries(r.inputs)) res[k] = (res[k] ?? 0) - (v ?? 0);
        const profs = r.profession ? { ...x.profs, [r.profession]: (x.profs[r.profession] ?? 0) + 10 } : x.profs;
        return { ...x, res, profs, queue: [...x.queue, { uid: Date.now() + Math.floor(Math.random() * 999), recipeId, doneAt: Date.now() + r.time * 1000 }] };
      });
    },
    [s, craftSlots, mutate, notify],
  );

  const buyMaterial = useCallback(
    (id: MaterialId) => {
      if (!s || !me) return;
      const m = MATERIALS.find((x) => x.id === id);
      if (!m) return;
      if (me.hyper < m.price) return notify("Недостаточно HYPER.", "ember");
      earnHyper(-m.price);
      sfx.buy();
      mutate((x) => ({ ...x, res: { ...x.res, [id]: (x.res[id] ?? 0) + 1 } }));
    },
    [s, me, earnHyper, mutate, notify],
  );

  const mineHit = useCallback((): { dmg: number; crit: boolean; broke: boolean; reward: number; treasure: boolean } | null => {
    if (!s) return null;
    if (s.mine.broken) {
      notify("Кирка сломана — идёт починка…", "ember");
      return null;
    }
    if (s.energy < 0.3) {
      notify("Нет энергии для работы в шахте.", "ember");
      return null;
    }
    const tool = TOOLS[s.tool];
    const crit = Math.random() < 0.05;
    const dmg = tool.mult * (crit ? 10 : 1);
    let result = { dmg, crit, broke: false, reward: 0, treasure: false };
    if (crit) sfx.crit();
    else sfx.click();
    mutate((x) => {
      const mine = { ...x.mine };
      mine.hp -= dmg;
      let buffer = x.hyperBuffer;
      const msgs = [...x.pendingMsgs];
      if (mine.hp <= 0) {
        const tier = MINE_TIERS.find((t) => mine.depth <= t.upTo) ?? MINE_TIERS[MINE_TIERS.length - 1];
        const boss = mine.depth % 10 === 0;
        let reward = Math.round((tier.min + Math.random() * (tier.max - tier.min)) * (boss ? 5 : 1));
        const treasure = Math.random() < 0.08;
        if (treasure) reward *= 2;
        buffer += reward;
        result = { ...result, broke: true, reward, treasure };
        if (treasure) msgs.push({ msg: `Сокровище в породе! +${reward.toLocaleString("ru-RU")} HY`, kind: "gold" as const });
        if (boss) msgs.push({ msg: `Босс глубин повержен! Уровень ${mine.depth}`, kind: "ember" as const });
        mine.depth = Math.min(100, mine.depth + 1);
        mine.hp = mineMaxHp(mine.depth);
      }
      if (!mine.broken && Math.random() < 0.03) {
        mine.broken = true;
        mine.brokenAt = Date.now();
        msgs.push({ msg: "Кирка сломалась! Мастерская чинит (15 сек).", kind: "ember" });
      }
      return ensure({
        ...x,
        mine,
        energy: x.energy - 0.3,
        clicks: x.clicks + 1,
        hyperBuffer: buffer,
        earnedTotal: x.earnedTotal + result.reward,
        pendingMsgs: msgs.slice(-6),
      });
    });
    return result;
  }, [s, mutate, notify]);

  const fishUpgrade = useCallback(
    (kind: "rod" | "bait" | "boat") => {
      if (!s || !me) return;
      const prices = { rod: [300, 1500, 6000], bait: [200, 1000, 4000], boat: [2500, 12000] } as const;
      const lvl = s.fish[kind];
      const list = prices[kind];
      if (lvl >= list.length) return;
      const price = list[lvl];
      if (me.hyper < price) return notify("Недостаточно HYPER.", "ember");
      earnHyper(-price);
      sfx.buy();
      mutate((x) => ({ ...x, fish: { ...x.fish, [kind]: lvl + 1 } }));
    },
    [s, me, earnHyper, mutate, notify],
  );

  const addCatch = useCallback(
    (name: string, value: number, tier: string) => {
      earnHyper(value);
      sfx.splash();
      mutate((x) => ({
        ...x,
        earnedTotal: x.earnedTotal + value,
        mood: clamp(x.mood + 3, 5, 100),
        fish: { ...x.fish, best: tier === "Золотая" || tier === "Легендарная" ? name : x.fish.best },
        pendingMsgs: [...x.pendingMsgs, { msg: `Улов: ${name} (${tier}) +${value.toLocaleString("ru-RU")} HY`, kind: (tier === "Обычная" ? "hyper" : "gold") as "hyper" | "gold" }].slice(-6),
      }));
      if (tier !== "Обычная") sfx.rare();
    },
    [earnHyper, mutate],
  );

  const plant = useCallback(
    (i: number, crop: PlantId) => {
      if (!s || !me) return;
      const p = PLANTS.find((x) => x.id === crop);
      const plot = s.garden[i];
      if (!p || !plot || plot.crop) return;
      if (me.hyper < p.seed) return notify("Недостаточно HYPER на семена.", "ember");
      if (s.energy < 1) return notify("Нет энергии для посадки.", "ember");
      earnHyper(-p.seed);
      sfx.click();
      mutate((x) => ({
        ...x,
        energy: x.energy - 1,
        garden: x.garden.map((g, gi) => (gi === i ? { crop, plantedAt: Date.now(), watered: false } : g)),
      }));
    },
    [s, me, earnHyper, mutate, notify],
  );

  const water = useCallback(
    (i: number) => {
      if (!s) return;
      const plot = s.garden[i];
      if (!plot?.crop || plot.watered) return;
      sfx.splash();
      mutate((x) => ({
        ...x,
        garden: x.garden.map((g, gi) => (gi === i && g.crop ? { ...g, watered: true, plantedAt: g.plantedAt - (PLANTS.find((p) => p.id === g.crop)?.time ?? 60) * 500 } : g)),
      }));
    },
    [s, mutate],
  );

  const harvest = useCallback(
    (i: number): number => {
      if (!s) return 0;
      const plot = s.garden[i];
      if (!plot?.crop) return 0;
      const p = PLANTS.find((x) => x.id === plot.crop);
      if (!p) return 0;
      const elapsed = (Date.now() - plot.plantedAt) / 1000;
      if (elapsed < p.time) return 0;
      const rare = p.rare && Math.random() < 0.2;
      const value = Math.round(p.min + Math.random() * (p.max - p.min)) + (rare ? 200 : 0);
      earnHyper(value);
      sfx.buy();
      if (rare) sfx.rare();
      mutate((x) => ({
        ...x,
        earnedTotal: x.earnedTotal + value,
        mood: clamp(x.mood + (p.mood ?? 2), 5, 100),
        energy: clamp(x.energy + (p.food ? p.food / 4 : 0), 0, 100 + x.owned.filter((f) => f === "bed").length * 5),
        garden: x.garden.map((g, gi) => (gi === i ? emptyPlot() : g)),
        pendingMsgs: [...x.pendingMsgs, { msg: `Урожай: ${p.name} +${value} HY${rare ? " (редкое растение!)" : ""}`, kind: (rare ? "gold" : "hyper") as "gold" | "hyper" }].slice(-6),
      }));
      return value;
    },
    [s, earnHyper, mutate],
  );

  const buyTicket = useCallback(
    (nums: number[]): boolean => {
      if (!s || !me) return false;
      if (me.hyper < LOTTERY.ticketPrice) {
        notify("Билет стоит 10 HY.", "ember");
        return false;
      }
      if (nums.length !== LOTTERY.pick) return false;
      earnHyper(-LOTTERY.ticketPrice);
      sfx.buy();
      const nextHour = new Date();
      nextHour.setMinutes(0, 0, 0);
      nextHour.setHours(nextHour.getHours() + 1);
      mutate((x) => ({
        ...x,
        lottery: {
          ...x.lottery,
          tickets: [...x.lottery.tickets, { nums: [...nums], drawAt: nextHour.getTime() }],
          jackpot: x.lottery.jackpot + LOTTERY.jackpotPerTicket,
        },
        mood: clamp(x.mood + 2, 5, 100),
      }));
      notify("Билет куплен — розыгрыш в начале следующего часа.", "gold");
      return true;
    },
    [s, me, earnHyper, mutate, notify],
  );

  const sleep = useCallback(() => {
    if (!s) return;
    if (Date.now() < s.cooldowns.sleep) return notify("Вы только что отдыхали.", "ember");
    sfx.click();
    mutate((x) => ({
      ...x,
      energy: clamp(x.energy + 30, 0, 100 + x.owned.filter((f) => f === "bed").length * 5),
      mood: clamp(x.mood - 3, 5, 100),
      cooldowns: { ...x.cooldowns, sleep: Date.now() + 60000 },
    }));
    notify("Отдых: +30 энергии (рутина слегка гнетёт).", "hyper");
  }, [s, mutate, notify]);

  const eat = useCallback(() => {
    if (!s || !me) return;
    if (Date.now() < s.cooldowns.eat) return notify("Слишком рано для новой трапезы.", "ember");
    if (me.hyper < 20) return notify("Трапеза стоит 20 HY.", "ember");
    earnHyper(-20);
    sfx.buy();
    mutate((x) => ({
      ...x,
      energy: clamp(x.energy + 25, 0, 100 + x.owned.filter((f) => f === "bed").length * 5),
      mood: clamp(x.mood + 5, 5, 100),
      cooldowns: { ...x.cooldowns, eat: Date.now() + 30000 },
    }));
    notify("Трапеза: +25 энергии, +5 настроения.", "hyper");
  }, [s, me, earnHyper, mutate, notify]);

  const api = useMemo<LifeApi>(
    () => ({
      s,
      energyMax,
      moodMult,
      trophyMult,
      incomePerSec,
      craftSlots,
      resCount,
      clickResource,
      sellAll,
      buyTool,
      buyAuto,
      buyHouse,
      buyPlot,
      buyFurniture,
      placeFurniture,
      pickupFurniture,
      inviteGuest,
      removeGuest,
      craft,
      buyMaterial,
      mineHit,
      fishUpgrade,
      addCatch,
      plant,
      water,
      harvest,
      buyTicket,
      sleep,
      eat,
      profLevel,
    }),
    [s, energyMax, moodMult, trophyMult, incomePerSec, craftSlots, resCount, clickResource, sellAll, buyTool, buyAuto, buyHouse, buyPlot, buyFurniture, placeFurniture, pickupFurniture, inviteGuest, removeGuest, craft, buyMaterial, mineHit, fishUpgrade, addCatch, plant, water, harvest, buyTicket, sleep, eat, profLevel],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useLife(): LifeApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLife вне LifeProvider");
  return ctx;
}

/** Детерминированные выигрышные номера для часа розыгрыша. */
export function drawNumbers(drawAt: number): number[] {
  let h = drawAt ^ 0x5f356495;
  const rand = () => {
    h = Math.imul(h ^ (h >>> 15), h | 1);
    h ^= h + Math.imul(h ^ (h >>> 7), h | 61);
    return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
  };
  const set = new Set<number>();
  while (set.size < LOTTERY.pick) set.add(1 + Math.floor(rand() * LOTTERY.maxN));
  return [...set];
}

export { HOUSE_LEVELS, HOUSE_SIZE, PLOTS, FURNITURE, TOOLS, AUTOS, RESOURCES, RECIPES, MATERIALS, PLANTS, ACHIEVEMENTS, LOTTERY, LOTTERY_PRIZES, MINE_TIERS };
export type { Recipe, ResourceId };
