import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createCloud, decodeState, encodeState, pullCloud, pushCloud } from "./cloud";

export type RankId = "resident" | "citizen" | "governor" | "senator" | "chancellor" | "emperor";
export type CitizenStatus = "pending" | "approved" | "rejected" | "exiled";

export interface Citizen {
  id: string;
  name: string;
  email: string;
  pinHash: string;
  status: CitizenStatus;
  createdAt: number;
  decidedAt?: number;
  rejectReason?: string;
  province: string;
  rank: RankId;
  light: number; // уровень Света 0..100
  hyper: number; // баланс HYPER
  passportIssuedAt?: number;
  avatar?: string;
}

export interface NewsItem {
  id: string;
  tag: "decree" | "news" | "treasury";
  title: string;
  text: string;
  date: number;
  author: string;
}

export interface MarketItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  category: "good" | "service";
  active: boolean;
  sold: number;
}

export interface MailMsg {
  id: string;
  to: string;
  subject: string;
  body: string;
  date: number;
}

export interface CustomProvince {
  id: string;
  name: string;
  capital: string;
  note: string;
}

export interface CouncilSeat {
  seat: string;
  citizenId: string | null;
}

export interface EmpireData {
  citizens: Citizen[];
  news: NewsItem[];
  market: MarketItem[];
  mails: MailMsg[];
  provinces: CustomProvince[];
  council: CouncilSeat[];
  treasury: { reserve: number; rate: number; issued: number };
  sessionId: string | null;
  /** Код облачного реестра (jsonblob) — общий для всех устройств Империи. */
  cloudId: string | null;
  /** Метка последнего изменения — для синхронизации устройств. */
  updatedAt: number;
}

export interface Toast {
  id: number;
  msg: string;
  kind: "gold" | "hyper" | "ember";
}

export const PASSPORT_YEARS = 2;
export const WELCOME_BONUS = 500;

export const RANK_LABEL: Record<RankId, string> = {
  resident: "Резидент",
  citizen: "Гражданин",
  governor: "Губернатор",
  senator: "Сенатор",
  chancellor: "Канцлер",
  emperor: "Император",
};

export const RANK_COLOR: Record<RankId, string> = {
  resident: "#aab6c9",
  citizen: "#e3b54a",
  governor: "#57ddc4",
  senator: "#f2d790",
  chancellor: "#6fc3dd",
  emperor: "#e2604c",
};

export const fmtDate = (t: number) =>
  new Date(t).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });

export const fmtHyper = (n: number) => n.toLocaleString("ru-RU", { maximumFractionDigits: 0 });

const hashPin = (pin: string, salt: string): string => {
  let h = 2166136261;
  const s = salt + "::" + pin;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
};

const genHpn = (existing: string[]): string => {
  for (let i = 0; i < 50; i++) {
    const id = `HPN-${Math.floor(10000 + Math.random() * 89999)}`;
    if (!existing.includes(id)) return id;
  }
  return `HPN-${Date.now().toString().slice(-5)}`;
};

const uid = () => Math.random().toString(36).slice(2, 9);

const DAY = 86400000;

function seed(): EmpireData {
  const now = Date.now();
  return {
    citizens: [
      // Демо-гражданин: показывает, что будет после оформления гражданства.
      // PIN-хэш использует почту как соль — так же, как при настоящей регистрации.
      {
        id: "HPN-77777",
        name: "Орион Вест",
        email: "orion@vest.mail",
        pinHash: hashPin("1111", "orion@vest.mail"),
        status: "approved",
        createdAt: now - 32 * DAY,
        decidedAt: now - 31 * DAY,
        province: "aurora",
        rank: "citizen",
        light: 72,
        hyper: 1240,
        passportIssuedAt: now - 30 * DAY,
      },
      {
        id: "",
        name: "Астра Норд",
        email: "astra.nord@mail.com",
        pinHash: hashPin("4821", "astra.nord@mail.com"),
        status: "pending",
        createdAt: now - 2 * DAY,
        province: "borey",
        rank: "resident",
        light: 0,
        hyper: 0,
      },
      {
        id: "",
        name: "Кай Меридиан",
        email: "kai.meridian@mail.com",
        pinHash: hashPin("9034", "kai.meridian@mail.com"),
        status: "pending",
        createdAt: now - 1 * DAY,
        province: "helios",
        rank: "resident",
        light: 0,
        hyper: 0,
      },
    ],
    news: [
      {
        id: uid(),
        tag: "decree",
        title: "Эдикт №12: О неприкосновенности гербового кода",
        text: "Передача персонального ID третьим лицам приравнивается к нарушению Статьи IV Хартии. Виновные лишаются Уровня Света на 20 пунктов. Храните свой код как ключ от дома.",
        date: now - 3 * DAY,
        author: "Гиперион I",
      },
      {
        id: uid(),
        tag: "treasury",
        title: "Казначейство: итоги месяца",
        text: "Оборот HY вырос на 14%. Резерв Империи пополнен до 12,58 млн HY. Комиссия за внутренние переводы остаётся нулевой — по Статье V Хартии.",
        date: now - 6 * DAY,
        author: "Хранитель Казны",
      },
      {
        id: uid(),
        tag: "news",
        title: "Открыта регистрация на Великое Собрание №150",
        text: "Юбилейное собрание пройдёт в расширенном формате: отчёт Императора, награждение граждан с высшим Уровнем Света и голосование о новых провинциях.",
        date: now - 1 * DAY,
        author: "Канцелярия",
      },
    ],
    market: [
      { id: uid(), name: "Резиденция в Авроре", desc: "Цифровой адрес в столичном округе, престижный индекс, приоритет в собраниях.", price: 2500, category: "good", active: true, sold: 41 },
      { id: uid(), name: "Флаг Империи (цифровой)", desc: "Оригинал гербового знамени для аватаров и личных страниц. С сертификатом.", price: 120, category: "good", active: true, sold: 356 },
      { id: uid(), name: "Ускоритель добычи HY", desc: "Лицензия на повышенный معدل майнинга Hyper в Дельте Гелиос на 30 дней.", price: 800, category: "service", active: true, sold: 87 },
      { id: uid(), name: "Приём у Канцлера", desc: "Личная аудиенция: вопросы ранга, провинции или проекта. 30 минут, протокол прилагается.", price: 450, category: "service", active: true, sold: 12 },
      { id: uid(), name: "Гербовая печать рода", desc: "Персональный герб, внесённый в реестр Сената. Передаётся по наследству.", price: 1500, category: "good", active: true, sold: 23 },
      { id: uid(), name: "Курс Академии Авроры", desc: "«Основы порядка»: право, экономика HY, протокол собраний. Диплом Империи.", price: 300, category: "service", active: true, sold: 198 },
    ],
    mails: [
      {
        id: uid(),
        to: "orion@vest.mail",
        subject: "Ваше гражданство одобрено — Империя Гиперион",
        body: "Указом Императора вам присвоен государственный ID: HPN-77777. Войдите в государство, используя ID и ваш PIN-код, затем оформите паспорт гражданина.",
        date: now - 31 * DAY,
      },
    ],
    provinces: [],
    council: [
      { seat: "Канцлер Империи", citizenId: null },
      { seat: "Хранитель Казны", citizenId: null },
      { seat: "Адмирал Флота Нереид", citizenId: null },
      { seat: "Ректор Академии Авроры", citizenId: null },
      { seat: "Главный герольд", citizenId: null },
    ],
    treasury: { reserve: 12587670, rate: 142.8, issued: 8412330 },
    sessionId: null,
    cloudId: null,
    updatedAt: now,
  };
}

const LS_KEY = "hyperion_empire_v2";

function load(): EmpireData {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as EmpireData;
      // защита от устаревших/повреждённых реестров прошлых версий
      if (Array.isArray(parsed?.citizens) && parsed?.treasury && typeof parsed.treasury.rate === "number") {
        return {
          ...parsed,
          cloudId: typeof parsed.cloudId === "string" ? parsed.cloudId : null,
          updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now(),
        };
      }
    }
  } catch {
    /* повреждённые данные — начинаем заново */
  }
  return seed();
}

interface EmpireApi {
  data: EmpireData;
  me: Citizen | null;
  toasts: Toast[];
  notify: (msg: string, kind?: Toast["kind"]) => void;
  provinceName: (id: string) => string;
  // гражданин
  applyForCitizenship: (name: string, email: string, pin: string, province: string) => { ok: boolean; msg: string; appNo?: string };
  login: (id: string, pin: string) => { ok: boolean; msg: string };
  logout: () => void;
  issuePassport: (avatar?: string) => { ok: boolean; msg: string };
  buy: (itemId: string) => { ok: boolean; msg: string };
  earnHyper: (amount: number) => void;
  earnLight: (amount: number) => void;
  // император
  decideApplication: (citizenKey: string, approve: boolean, province: string, reason?: string) => void;
  updateCitizen: (id: string, patch: Partial<Citizen>) => void;
  grantHyper: (id: string, amount: number) => void;
  exile: (id: string) => void;
  addNews: (tag: NewsItem["tag"], title: string, text: string) => void;
  removeNews: (id: string) => void;
  addMarketItem: (name: string, desc: string, price: number, category: MarketItem["category"]) => void;
  toggleMarketItem: (id: string) => void;
  removeMarketItem: (id: string) => void;
  setTreasury: (patch: Partial<EmpireData["treasury"]>) => void;
  appoint: (seatIndex: number, citizenId: string | null) => void;
  addProvince: (name: string, capital: string, note: string) => void;
  changePin: (oldPin: string, newPin: string) => { ok: boolean; msg: string };
  coronate: (name: string, email: string, pin: string) => { ok: boolean; msg: string; id?: string };
  hasEmperor: boolean;
  resetState: () => void;
  // облачная синхронизация
  lastSync: number | null;
  syncBusy: boolean;
  syncErr: boolean;
  createCloudLink: () => Promise<{ ok: boolean; code?: string; msg: string }>;
  connectCloud: (code: string) => Promise<{ ok: boolean; msg: string }>;
  pushNow: () => Promise<void>;
  pullNow: () => Promise<void>;
  exportCode: () => string;
  importCode: (code: string) => { ok: boolean; msg: string };
}

const Ctx = createContext<EmpireApi | null>(null);

export function EmpireProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<EmpireData>(load);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(data));
    } catch {
      /* quota */
    }
  }, [data]);

  const notify = useCallback((msg: string, kind: Toast["kind"] = "gold") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-3), { id, msg, kind }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  // ── облачная синхронизация реестра (общий для всех устройств) ──
  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  });
  const dirty = useRef(false); // локальные изменения, не отправленные в облако
  const skipDirty = useRef(true); // игнор: первый рендер и приём из облака
  const remoteAtRef = useRef(0); // updatedAt последней известной облачной версии
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [syncBusy, setSyncBusy] = useState(false);
  const [syncErr, setSyncErr] = useState(false);

  useEffect(() => {
    if (skipDirty.current) {
      skipDirty.current = false;
      return;
    }
    dirty.current = true;
  }, [data]);

  const normalize = (d: Record<string, unknown>): EmpireData => ({
    ...(d as unknown as EmpireData),
    cloudId: typeof d.cloudId === "string" ? d.cloudId : null,
    updatedAt: typeof d.updatedAt === "number" ? d.updatedAt : Date.now(),
  });

  const doPush = useCallback(
    async (withToast = false) => {
      const d = dataRef.current;
      if (!d.cloudId) return;
      setSyncBusy(true);
      setSyncErr(false);
      const stamped: EmpireData = { ...d, updatedAt: Date.now() };
      const ok = await pushCloud(d.cloudId, stamped);
      setSyncBusy(false);
      if (ok) {
        remoteAtRef.current = stamped.updatedAt;
        dirty.current = false;
        setLastSync(stamped.updatedAt);
        if (withToast) notify("Реестр выгружен в облако Империи.", "hyper");
      } else {
        setSyncErr(true);
        if (withToast) notify("Облако недоступно — повторите позже.", "ember");
      }
    },
    [notify],
  );

  const doPull = useCallback(
    async (withToast = false) => {
      const d = dataRef.current;
      if (!d.cloudId) return;
      setSyncBusy(true);
      setSyncErr(false);
      const remote = await pullCloud(d.cloudId);
      setSyncBusy(false);
      if (!remote) {
        setSyncErr(true);
        if (withToast) notify("Облако недоступно — повторите позже.", "ember");
        return;
      }
      const norm = normalize(remote);
      if (norm.updatedAt > remoteAtRef.current) {
        remoteAtRef.current = norm.updatedAt;
        skipDirty.current = true;
        dirty.current = false;
        setData(norm);
        setLastSync(norm.updatedAt);
        if (withToast) notify("Реестр обновлён из облака Империи.", "hyper");
      } else {
        setLastSync(Date.now());
      }
    },
    [notify],
  );

  useEffect(() => {
    const tick = () => {
      const d = dataRef.current;
      if (!d.cloudId) return;
      if (dirty.current) void doPush();
      else void doPull();
    };
    tick();
    const id = window.setInterval(tick, 25000);
    const onVis = () => {
      if (document.hidden && dataRef.current.cloudId && dirty.current) void doPush();
    };
    const onUnload = () => {
      if (dataRef.current.cloudId && dirty.current) void doPush();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", onUnload);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", onUnload);
    };
  }, [doPush, doPull]);

  /** Создать облачный реестр Империи и получить код синхронизации. */
  const createCloudLink = useCallback(async (): Promise<{ ok: boolean; code?: string; msg: string }> => {
    const stamped: EmpireData = { ...dataRef.current, updatedAt: Date.now() };
    setSyncBusy(true);
    const code = await createCloud(stamped);
    setSyncBusy(false);
    if (!code) return { ok: false, msg: "Облако недоступно. Попробуйте ещё раз или используйте экспорт-код." };
    remoteAtRef.current = stamped.updatedAt;
    dirty.current = false;
    skipDirty.current = true;
    setData({ ...stamped, cloudId: code });
    setLastSync(stamped.updatedAt);
    setSyncErr(false);
    return { ok: true, code, msg: "Облачный реестр создан." };
  }, []);

  /** Подключить устройство к существующему реестру по коду. */
  const connectCloud = useCallback(
    async (codeRaw: string): Promise<{ ok: boolean; msg: string }> => {
      const code = codeRaw.trim();
      if (!/^\d{4,}$/.test(code)) return { ok: false, msg: "Код синхронизации — это число из облака." };
      setSyncBusy(true);
      const remote = await pullCloud(code);
      setSyncBusy(false);
      if (!remote) return { ok: false, msg: "Реестр с таким кодом в облаке не найден." };
      const norm = normalize(remote);
      remoteAtRef.current = norm.updatedAt;
      skipDirty.current = true;
      dirty.current = false;
      setData({ ...norm, cloudId: code });
      setLastSync(norm.updatedAt);
      setSyncErr(false);
      notify("Устройство подключено к реестру Империи.", "hyper");
      return { ok: true, msg: "Синхронизация установлена." };
    },
    [notify],
  );

  const pushNow = useCallback(async () => doPush(true), [doPush]);
  const pullNow = useCallback(async () => doPull(true), [doPull]);

  const exportCode = useCallback(() => encodeState(dataRef.current), []);

  const importCode = useCallback(
    (codeRaw: string): { ok: boolean; msg: string } => {
      const parsed = decodeState(codeRaw);
      if (!parsed || !Array.isArray((parsed as { citizens?: unknown }).citizens)) {
        return { ok: false, msg: "Код повреждён или не является реестром Империи." };
      }
      const norm = normalize(parsed);
      remoteAtRef.current = norm.updatedAt;
      skipDirty.current = true;
      dirty.current = false;
      setData(norm);
      notify("Реестр импортирован. Устройства с тем же кодом подхватят изменения.", "hyper");
      return { ok: true, msg: "Реестр импортирован." };
    },
    [notify],
  );

  // ── автоматическая синхронизация в реальном времени ──
  useEffect(() => {
    if (!data.cloudId) return;

    // автосохранение в облако при каждом изменении (с дебаунсом)
    const pushTimer = window.setTimeout(async () => {
      if (data.cloudId && dirty.current && !syncBusy) {
        await doPush(false);
      }
    }, 1500); // 1.5 сек дебаунс после последнего изменения

    // polling облака каждые 5 секунд
    const pollTimer = window.setInterval(async () => {
      if (!data.cloudId || syncBusy) return;
      await doPull(false);
    }, 5000);

    return () => {
      window.clearTimeout(pushTimer);
      window.clearInterval(pollTimer);
    };
  }, [data.cloudId, syncBusy, doPush, doPull]);

  const me = useMemo(
    () => data.citizens.find((c) => c.id === data.sessionId && c.status === "approved") ?? null,
    [data.citizens, data.sessionId],
  );

  const provinceName = useCallback(
    (id: string) => {
      const custom = data.provinces.find((p) => p.id === id);
      return custom?.name ?? id;
    },
    [data.provinces],
  );

  const applyForCitizenship = useCallback(
    (name: string, email: string, pin: string, province: string) => {
      const em = email.trim().toLowerCase();
      let res: { ok: boolean; msg: string; appNo?: string } = { ok: false, msg: "" };
      setData((prev) => {
        if (prev.citizens.some((c) => c.email.toLowerCase() === em && c.status !== "rejected")) {
          res = { ok: false, msg: "Заявка с этой почтой уже находится в реестре или одобрена." };
          return prev;
        }
        const appNo = `APP-${Math.floor(1000 + Math.random() * 9000)}`;
        const citizen: Citizen = {
          id: "",
          name: name.trim(),
          email: em,
          pinHash: hashPin(pin, em),
          status: "pending",
          createdAt: Date.now(),
          province,
          rank: "resident",
          light: 0,
          hyper: 0,
        };
        res = { ok: true, msg: "Заявка передана Императору.", appNo };
        return { ...prev, citizens: [...prev.citizens, citizen] };
      });
      return res;
    },
    [],
  );

  const login = useCallback((id: string, pin: string) => {
    let res = { ok: false, msg: "" };
    setData((prev) => {
      const c = prev.citizens.find((x) => x.id.toLowerCase() === id.trim().toLowerCase());
      if (!c) {
        res = { ok: false, msg: "Такой ID не значится в реестре Империи." };
        return prev;
      }
      if (c.status === "pending") {
        res = { ok: false, msg: "Ваша заявка ещё на рассмотрении у Императора." };
        return prev;
      }
      if (c.status === "rejected") {
        res = { ok: false, msg: `Заявка отклонена. Причина: ${c.rejectReason ?? "не указана"}.` };
        return prev;
      }
      if (c.status === "exiled") {
        res = { ok: false, msg: "Вы изгнаны из Империи указом Императора." };
        return prev;
      }
      if (c.pinHash !== hashPin(pin, c.email)) {
        res = { ok: false, msg: "Неверный PIN-код. Врата остаются закрытыми." };
        return prev;
      }
      res = { ok: true, msg: `Добро пожаловать, ${c.name}.` };
      return { ...prev, sessionId: c.id };
    });
    return res;
  }, []);

  const logout = useCallback(() => setData((p) => ({ ...p, sessionId: null })), []);

  /** Зачисление HYPER гражданину (работа, игры, крафт) — без участия резерва казны. */
  const earnHyper = useCallback((amount: number) => {
    setData((p) => {
      if (!p.sessionId || !amount) return p;
      return {
        ...p,
        citizens: p.citizens.map((c) => (c.id === p.sessionId ? { ...c, hyper: Math.max(0, c.hyper + amount) } : c)),
      };
    });
  }, []);

  const earnLight = useCallback((amount: number) => {
    setData((p) => {
      if (!p.sessionId || !amount) return p;
      return {
        ...p,
        citizens: p.citizens.map((c) =>
          c.id === p.sessionId ? { ...c, light: Math.min(100, Math.max(0, c.light + amount)) } : c,
        ),
      };
    });
  }, []);

  const issuePassport = useCallback((avatar?: string) => {
    let res = { ok: false, msg: "" };
    setData((prev) => {
      if (!prev.sessionId) return prev;
      const c = prev.citizens.find((x) => x.id === prev.sessionId);
      const expiry = c?.passportIssuedAt
        ? new Date(c.passportIssuedAt).setFullYear(new Date(c.passportIssuedAt).getFullYear() + PASSPORT_YEARS)
        : 0;
      const isRenew = !!c?.passportIssuedAt && Date.now() > expiry;
      if (!c || (c.passportIssuedAt && !isRenew)) {
        res = { ok: false, msg: "Паспорт уже оформлен." };
        return prev;
      }
      const now = Date.now();
      const citizens = prev.citizens.map((x) =>
        x.id === c.id
          ? {
              ...x,
              passportIssuedAt: now,
              rank: x.rank === "resident" ? ("citizen" as RankId) : x.rank,
              light: Math.min(100, x.light + 5),
              hyper: x.hyper + WELCOME_BONUS,
              avatar: avatar ?? x.avatar,
            }
          : x,
      );
      const mail: MailMsg = {
        id: uid(),
        to: c.email,
        subject: "Паспорт гражданина Империи оформлен",
        body: `Паспорт HPN-действителен 2 года. Начислен приветственный бонус ${WELCOME_BONUS} HY. Свет ведёт тебя. Порядок защищает. Равновесие хранит.`,
        date: now,
      };
      res = { ok: true, msg: `Паспорт оформлен. Бонус ${WELCOME_BONUS} HY зачислен.` };
      return {
        ...prev,
        citizens,
        mails: [mail, ...prev.mails],
        treasury: { ...prev.treasury, reserve: prev.treasury.reserve - WELCOME_BONUS },
      };
    });
    return res;
  }, []);

  const buy = useCallback((itemId: string) => {
    let res = { ok: false, msg: "" };
    setData((prev) => {
      if (!prev.sessionId) return prev;
      const item = prev.market.find((m) => m.id === itemId);
      const c = prev.citizens.find((x) => x.id === prev.sessionId);
      if (!item || !item.active || !c) return prev;
      if (!c.passportIssuedAt) {
        res = { ok: false, msg: "Покупки доступны только гражданам с паспортом." };
        return prev;
      }
      if (c.hyper < item.price) {
        res = { ok: false, msg: "Недостаточно HYPER на балансе." };
        return prev;
      }
      res = { ok: true, msg: `Куплено: ${item.name} за ${fmtHyper(item.price)} HY.` };
      return {
        ...prev,
        citizens: prev.citizens.map((x) =>
          x.id === c.id ? { ...x, hyper: x.hyper - item.price, light: Math.min(100, x.light + 1) } : x,
        ),
        market: prev.market.map((m) => (m.id === itemId ? { ...m, sold: m.sold + 1 } : m)),
        treasury: { ...prev.treasury, reserve: prev.treasury.reserve + item.price },
      };
    });
    return res;
  }, []);

  // ── действия Императора ─────────────────────────────
  const decideApplication = useCallback((citizenKey: string, approve: boolean, province: string, reason?: string) => {
    setData((prev) => {
      const c = prev.citizens.find((x) => (x.id || x.email) === citizenKey);
      if (!c || c.status !== "pending") return prev;
      const now = Date.now();
      if (!approve) {
        return {
          ...prev,
          citizens: prev.citizens.map((x) =>
            x === c ? { ...x, status: "rejected" as CitizenStatus, decidedAt: now, rejectReason: reason || "решение Императора" } : x,
          ),
          mails: [
            {
              id: uid(),
              to: c.email,
              subject: "Заявка на гражданство отклонена — Империя Гиперион",
              body: `Император отклонил вашу заявку. Причина: ${reason || "не указана"}. Вы можете подать новую заявку через 30 дней.`,
              date: now,
            },
            ...prev.mails,
          ],
        };
      }
      const id = genHpn(prev.citizens.map((x) => x.id).filter(Boolean));
      return {
        ...prev,
        citizens: prev.citizens.map((x) =>
          x === c ? { ...x, id, status: "approved" as CitizenStatus, decidedAt: now, province, rank: "resident" as RankId } : x,
        ),
        mails: [
          {
            id: uid(),
            to: c.email,
            subject: "Ваше гражданство одобрено — Империя Гиперион",
            body: `Указом Императора вам присвоен государственный ID: ${id}. Войдите в государство, используя ID и ваш PIN-код, затем оформите паспорт гражданина, чтобы открыть полный доступ.`,
            date: now,
          },
          ...prev.mails,
        ],
        treasury: { ...prev.treasury, issued: prev.treasury.issued + 1 },
      };
    });
  }, []);

  const updateCitizen = useCallback((id: string, patch: Partial<Citizen>) => {
    setData((p) => ({ ...p, citizens: p.citizens.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  }, []);

  const grantHyper = useCallback((id: string, amount: number) => {
    setData((p) => {
      const c = p.citizens.find((x) => x.id === id);
      if (!c) return p;
      return {
        ...p,
        citizens: p.citizens.map((x) => (x.id === id ? { ...x, hyper: Math.max(0, x.hyper + amount) } : x)),
        treasury: { ...p.treasury, reserve: p.treasury.reserve - amount },
      };
    });
  }, []);

  const exile = useCallback((id: string) => {
    setData((p) => ({
      ...p,
      citizens: p.citizens.map((c) => (c.id === id ? { ...c, status: "exiled" as CitizenStatus, decidedAt: Date.now() } : c)),
      council: p.council.map((s) => (s.citizenId === id ? { ...s, citizenId: null } : s)),
      sessionId: p.sessionId === id ? null : p.sessionId,
    }));
  }, []);

  const addNews = useCallback((tag: NewsItem["tag"], title: string, text: string) => {
    setData((p) => {
      const author = p.citizens.find((c) => c.id === p.sessionId)?.name ?? "Император";
      return {
        ...p,
        news: [{ id: uid(), tag, title, text, date: Date.now(), author }, ...p.news],
      };
    });
  }, []);

  const removeNews = useCallback((id: string) => {
    setData((p) => ({ ...p, news: p.news.filter((n) => n.id !== id) }));
  }, []);

  const addMarketItem = useCallback((name: string, desc: string, price: number, category: MarketItem["category"]) => {
    setData((p) => ({
      ...p,
      market: [{ id: uid(), name, desc, price, category, active: true, sold: 0 }, ...p.market],
    }));
  }, []);

  const toggleMarketItem = useCallback((id: string) => {
    setData((p) => ({ ...p, market: p.market.map((m) => (m.id === id ? { ...m, active: !m.active } : m)) }));
  }, []);

  const removeMarketItem = useCallback((id: string) => {
    setData((p) => ({ ...p, market: p.market.filter((m) => m.id !== id) }));
  }, []);

  const setTreasury = useCallback((patch: Partial<EmpireData["treasury"]>) => {
    setData((p) => ({ ...p, treasury: { ...p.treasury, ...patch } }));
  }, []);

  const appoint = useCallback((seatIndex: number, citizenId: string | null) => {
    setData((p) => {
      const council = p.council.map((s, i) => (i === seatIndex ? { ...s, citizenId } : s));
      const citizens = p.citizens.map((c) => {
        if (citizenId && c.id === citizenId && (c.rank === "citizen" || c.rank === "resident")) {
          return { ...c, rank: "senator" as RankId, light: Math.min(100, c.light + 10) };
        }
        return c;
      });
      return { ...p, council, citizens };
    });
  }, []);

  const addProvince = useCallback((name: string, capital: string, note: string) => {
    setData((p) => ({
      ...p,
      provinces: [...p.provinces, { id: `cp-${uid()}`, name, capital, note }],
    }));
  }, []);

  const changePin = useCallback((oldPin: string, newPin: string) => {
    let res = { ok: false, msg: "" };
    setData((p) => {
      if (!p.sessionId) return p;
      const c = p.citizens.find((x) => x.id === p.sessionId);
      if (!c) return p;
      if (c.pinHash !== hashPin(oldPin, c.email)) {
        res = { ok: false, msg: "Текущий PIN указан неверно." };
        return p;
      }
      res = { ok: true, msg: "PIN-код обновлён. Храните его в тайне." };
      return { ...p, citizens: p.citizens.map((x) => (x.id === c.id ? { ...x, pinHash: hashPin(newPin, c.email) } : x)) };
    });
    return res;
  }, []);

  /** Восшествие на престол: возможно, только пока трон вакантен. */
  const coronate = useCallback((name: string, email: string, pin: string) => {
    let res: { ok: boolean; msg: string; id?: string } = { ok: false, msg: "" };
    setData((prev) => {
      if (prev.citizens.some((c) => c.rank === "emperor")) {
        res = { ok: false, msg: "Трон уже занят. Войдите по государственному ID." };
        return prev;
      }
      const em = email.trim().toLowerCase();
      if (prev.citizens.some((c) => c.email.toLowerCase() === em && c.status === "approved")) {
        res = { ok: false, msg: "Эта почта уже числится за гражданином Империи." };
        return prev;
      }
      const now = Date.now();
      const id = "HPN-00001";
      const emperor: Citizen = {
        id,
        name: name.trim(),
        email: em,
        pinHash: hashPin(pin, em),
        status: "approved",
        createdAt: now,
        decidedAt: now,
        province: "aurora",
        rank: "emperor",
        light: 100,
        hyper: 1000000,
        passportIssuedAt: now,
      };
      const mail: MailMsg = {
        id: uid(),
        to: em,
        subject: "Трон Империи Гиперион занят — приветствуем, Государь",
        body: `Ваш государственный ID: ${id}. Печать Хартии передана вам. Управляйте реестром, казной и рынком с Трона Императора.`,
        date: now,
      };
      res = { ok: true, msg: `Коронация свершилась. Ваш ID: ${id}.`, id };
      return { ...prev, citizens: [...prev.citizens, emperor], sessionId: id, mails: [mail, ...prev.mails] };
    });
    return res;
  }, []);

  const hasEmperor = useMemo(() => data.citizens.some((c) => c.rank === "emperor"), [data.citizens]);

  const resetState = useCallback(() => {
    localStorage.removeItem(LS_KEY);
    setData(seed());
  }, []);

  const api: EmpireApi = {
    data,
    me,
    toasts,
    notify,
    provinceName,
    applyForCitizenship,
    login,
    logout,
    issuePassport,
    buy,
    earnHyper,
    earnLight,
    decideApplication,
    updateCitizen,
    grantHyper,
    exile,
    addNews,
    removeNews,
    addMarketItem,
    toggleMarketItem,
    removeMarketItem,
    setTreasury,
    appoint,
    addProvince,
    changePin,
    coronate,
    hasEmperor,
    resetState,
    lastSync,
    syncBusy,
    syncErr,
    createCloudLink,
    connectCloud,
    pushNow,
    pullNow,
    exportCode,
    importCode,
  };

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useEmpire(): EmpireApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useEmpire вне EmpireProvider");
  return ctx;
}

export function Toasts() {
  const { toasts } = useEmpire();
  const color = (k: Toast["kind"]) =>
    k === "gold" ? "border-gold/60 text-gold" : k === "hyper" ? "border-hyper/60 text-hyper" : "border-ember/60 text-ember";
  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[95] flex w-[320px] max-w-[88vw] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`border bg-abyss/95 px-4 py-3 font-mono text-[12px] leading-snug shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-sm ${color(t.kind)}`}
        >
          ✦ {t.msg}
        </div>
      ))}
    </div>
  );
}
