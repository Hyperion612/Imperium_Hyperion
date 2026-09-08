import { useState, type FormEvent } from "react";
import { REGIONS } from "../lib/data";
import {
  RANK_LABEL,
  fmtDate,
  fmtHyper,
  useEmpire,
  type Citizen,
  type RankId,
} from "../lib/state";
import { Corners } from "./SectionHead";
import Crest from "./Crest";
import Starfield from "./Starfield";
import { CrownIcon } from "./Symbols";
import SyncPanel from "./SyncPanel";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Врата Трона: коронация, если трон вакантен; вход по ID, если занят. */
function ThroneGate() {
  const { hasEmperor, coronate, login, notify } = useEmpire();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [id, setId] = useState("");
  const [loginPin, setLoginPin] = useState("");
  const [err, setErr] = useState("");
  const [shake, setShake] = useState(0);

  const fail = (msg: string) => {
    setErr(msg);
    setShake((s) => s + 1);
  };

  const submitCoronate = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return fail("Укажите имя Государя — не менее 2 символов.");
    if (!EMAIL_RE.test(email.trim())) return fail("Укажите действительную почту.");
    if (!/^\d{4,6}$/.test(pin)) return fail("PIN — от 4 до 6 цифр.");
    if (pin !== pin2) return fail("PIN-коды не совпадают.");
    const res = coronate(name, email, pin);
    if (!res.ok) return fail(res.msg);
    notify(res.msg, "gold");
  };

  const submitLogin = (e: FormEvent) => {
    e.preventDefault();
    const res = login(id, loginPin);
    if (!res.ok) return fail(res.msg);
    notify(res.msg, "gold");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-void px-4 py-14">
      <Starfield density={0.8} />
      <div className="hud-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full blur-[150px]"
        style={{ background: "radial-gradient(circle, rgba(226,96,76,0.12), transparent 65%)" }}
      />
      <div className="relative w-full max-w-md">
        <div className="mb-7 flex flex-col items-center text-center">
          <CrownIcon className="h-14 w-14 text-ember" />
          <h1 className="font-display mt-4 text-[clamp(1.4rem,4vw,2rem)] font-extrabold tracking-wide text-ink uppercase">
            Трон Империи
          </h1>
          <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-mist">
            {hasEmperor
              ? "Трон занят. Вход — по государственному ID Императора и PIN-коду."
              : "Трон вакантен. Статья I Хартии ждёт гаранта: совершите восшествие."}
          </p>
        </div>

        <div key={shake ? `t${shake}` : "t0"} className={`relative border border-ember/35 bg-panel/92 p-7 backdrop-blur-sm ${shake ? "animate-shake" : ""}`}>
          <Corners className="text-ember/50" />
          {hasEmperor ? (
            <form onSubmit={submitLogin} noValidate>
              <p className="font-mono text-[10px] tracking-[0.3em] text-ember uppercase">Вход Государя</p>
              <label className="mt-4 block">
                <span className="mb-1.5 block font-mono text-[10px] tracking-[0.2em] text-mist uppercase">Государственный ID</span>
                <input className="field font-mono tracking-[0.15em]" value={id} onChange={(e) => setId(e.target.value.toUpperCase())} placeholder="HPN-XXXXX" />
              </label>
              <label className="mt-4 block">
                <span className="mb-1.5 block font-mono text-[10px] tracking-[0.2em] text-mist uppercase">PIN-код</span>
                <input className="field font-mono" type="password" inputMode="numeric" maxLength={6} value={loginPin} onChange={(e) => setLoginPin(e.target.value.replace(/\D/g, ""))} placeholder="••••" />
              </label>
              {err && <p className="mt-3 border border-ember/40 bg-ember/10 px-3 py-2 font-mono text-[11px] text-ember">▲ {err}</p>}
              <button type="submit" className="clip-notch mt-5 w-full bg-ember px-6 py-3.5 font-mono text-[13px] font-bold tracking-[0.25em] text-[#1c0a06] uppercase transition-all duration-300 hover:brightness-110 hover:shadow-[0_0_40px_rgba(226,96,76,0.35)] active:translate-y-0.5">
                Взойти на Трон
              </button>
            </form>
          ) : (
            <form onSubmit={submitCoronate} noValidate>
              <p className="font-mono text-[10px] tracking-[0.3em] text-gold uppercase">Коронация · первое восшествие</p>
              <label className="mt-4 block">
                <span className="mb-1.5 block font-mono text-[10px] tracking-[0.2em] text-mist uppercase">Имя Государя</span>
                <input className="field" value={name} maxLength={24} onChange={(e) => setName(e.target.value)} placeholder="Как вас назовёт летопись" />
              </label>
              <label className="mt-4 block">
                <span className="mb-1.5 block font-mono text-[10px] tracking-[0.2em] text-mist uppercase">Почта</span>
                <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Для указов и уведомлений" />
              </label>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1.5 block font-mono text-[10px] tracking-[0.2em] text-mist uppercase">PIN-код</span>
                  <input className="field font-mono" type="password" inputMode="numeric" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="4–6 цифр" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block font-mono text-[10px] tracking-[0.2em] text-mist uppercase">Повтор PIN</span>
                  <input className="field font-mono" type="password" inputMode="numeric" maxLength={6} value={pin2} onChange={(e) => setPin2(e.target.value.replace(/\D/g, ""))} placeholder="Ещё раз" />
                </label>
              </div>
              {err && <p className="mt-3 border border-ember/40 bg-ember/10 px-3 py-2 font-mono text-[11px] text-ember">▲ {err}</p>}
              <button type="submit" className="clip-notch mt-5 w-full bg-gold px-6 py-3.5 font-mono text-[13px] font-bold tracking-[0.25em] text-[#171006] uppercase transition-all duration-300 hover:bg-goldsoft hover:shadow-[0_0_40px_rgba(227,181,74,0.35)] active:translate-y-0.5">
                Принять Корону ✦
              </button>
              <p className="mt-3 text-center font-mono text-[9px] tracking-[0.2em] text-dim uppercase">
                Трон можно занять лишь однажды — пока он вакантен
              </p>
            </form>
          )}
        </div>

        <div className="mt-5 flex items-center justify-center gap-3">
          <Crest className="h-5 w-5 text-gold/70" />
          <p className="font-mono text-[10px] tracking-[0.2em] text-dim uppercase">Dum Ordo — Imperium</p>
        </div>
      </div>
    </div>
  );
}

const EMPERIOR_TABS = [
  { id: "apps", label: "Заявки" },
  { id: "people", label: "Население" },
  { id: "news", label: "Вестник" },
  { id: "market", label: "Рынок" },
  { id: "treasury", label: "Казна" },
  { id: "council", label: "Правительство" },
  { id: "lands", label: "Территории" },
  { id: "mail", label: "Почта" },
  { id: "security", label: "Безопасность" },
] as const;

type ETab = (typeof EMPERIOR_TABS)[number]["id"];

const lbl = "mb-1.5 block font-mono text-[10px] tracking-[0.2em] text-mist uppercase";
const btnGold =
  "bg-gold px-4 py-2 font-mono text-[11px] font-bold tracking-[0.15em] text-[#171006] uppercase transition-all hover:bg-goldsoft disabled:opacity-40";
const btnGhost =
  "border border-line px-4 py-2 font-mono text-[11px] tracking-[0.15em] text-mist uppercase transition-colors hover:border-gold/50 hover:text-gold";

function ApplicationsTab() {
  const { data, decideApplication, notify } = useEmpire();
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [provSel, setProvSel] = useState<Record<string, string>>({});
  const pending = data.citizens.filter((c) => c.status === "pending");
  const provinces = [...REGIONS.map((r) => ({ id: r.id, name: r.name })), ...data.provinces.map((p) => ({ id: p.id, name: p.name }))];

  return (
    <div>
      <p className="font-mono text-[11px] tracking-[0.2em] text-dim uppercase">
        Прошений в ожидании: <span className="text-gold">{pending.length}</span>
      </p>
      <div className="mt-4 space-y-4">
        {pending.map((c) => {
          const key = c.id || c.email;
          return (
            <div key={key} className="relative border border-line bg-panel p-5">
              <Corners className="text-line2" />
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <h4 className="font-display text-[15px] font-bold text-ink">{c.name}</h4>
                <span className="font-mono text-[11px] text-mist">{c.email}</span>
                <span className="ml-auto font-mono text-[10px] text-dim">подано {fmtDate(c.createdAt)}</span>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">
                <label className="block">
                  <span className={lbl}>Назначить провинцию</span>
                  <select
                    className="field"
                    value={provSel[key] ?? c.province}
                    onChange={(e) => setProvSel((p) => ({ ...p, [key]: e.target.value }))}
                  >
                    {provinces.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className={`${btnGold} clip-notch`}
                  onClick={() => {
                    decideApplication(key, true, provSel[key] ?? c.province);
                    notify(`${c.name}: гражданство даровано, ID выслан на почту.`, "gold");
                  }}
                >
                  ✓ Даровать гражданство
                </button>
                <div className="flex gap-2">
                  <input
                    className="field !w-44"
                    placeholder="Причина отказа"
                    value={reasons[key] ?? ""}
                    onChange={(e) => setReasons((r) => ({ ...r, [key]: e.target.value }))}
                  />
                  <button
                    className="border border-ember/50 px-4 py-2 font-mono text-[11px] tracking-[0.15em] text-ember uppercase transition-colors hover:bg-ember/10"
                    onClick={() => {
                      decideApplication(key, false, provSel[key] ?? c.province, reasons[key]);
                      notify(`${c.name}: заявка отклонена, письмо отправлено.`, "ember");
                    }}
                  >
                    Отклонить
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {pending.length === 0 && (
          <p className="border border-dashed border-line p-10 text-center font-mono text-[12px] tracking-[0.2em] text-dim uppercase">
            Новых прошений нет — Империя в порядке
          </p>
        )}
      </div>
    </div>
  );
}

function PeopleTab() {
  const { data, updateCitizen, grantHyper, exile, notify } = useEmpire();
  const [grants, setGrants] = useState<Record<string, string>>({});
  const [confirmExile, setConfirmExile] = useState<string | null>(null);
  const people = data.citizens.filter((c) => c.rank !== "emperor");
  const provinces = [...REGIONS.map((r) => ({ id: r.id, name: r.name })), ...data.provinces.map((p) => ({ id: p.id, name: p.name }))];
  const ranks: RankId[] = ["resident", "citizen", "governor", "senator", "chancellor"];

  const statusLabel = (c: Citizen) =>
    c.status === "exiled" ? (
      <span className="font-mono text-[10px] tracking-[0.15em] text-ember uppercase">изгнан</span>
    ) : c.passportIssuedAt ? (
      <span className="font-mono text-[10px] tracking-[0.15em] text-hyper uppercase">паспорт · {fmtDate(c.passportIssuedAt)}</span>
    ) : (
      <span className="font-mono text-[10px] tracking-[0.15em] text-dim uppercase">без паспорта</span>
    );

  return (
    <div className="space-y-4">
      {people.map((c) => (
        <div key={c.id || c.email} className={`relative border bg-panel p-5 ${c.status === "exiled" ? "border-ember/40 opacity-70" : "border-line"}`}>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="min-w-0">
              <p className="font-display text-[14px] font-bold text-ink">
                {c.name} <span className="ml-1 font-mono text-[10px] font-normal text-dim">{c.id || "ID не присвоен"}</span>
              </p>
              <p className="font-mono text-[10px] text-mist">{c.email}</p>
            </div>
            <div className="ml-auto flex items-center gap-2 font-mono text-[11px]">
              <span className="text-hyper">{fmtHyper(c.hyper)} HY</span>
              <span className="text-gold">☀ {c.light}</span>
              {statusLabel(c)}
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <label className="block">
              <span className={lbl}>Ранг</span>
              <select
                className="field"
                value={c.rank}
                disabled={c.status === "exiled"}
                onChange={(e) => {
                  updateCitizen(c.id, { rank: e.target.value as RankId });
                  notify(`${c.name}: ранг — ${RANK_LABEL[e.target.value as RankId]}.`, "gold");
                }}
              >
                {ranks.map((r) => (
                  <option key={r} value={r}>
                    {RANK_LABEL[r]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={lbl}>Провинция</span>
              <select
                className="field"
                value={c.province}
                disabled={c.status === "exiled"}
                onChange={(e) => updateCitizen(c.id, { province: e.target.value })}
              >
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={lbl}>Уровень Света · {c.light}</span>
              <input
                type="range"
                min={0}
                max={100}
                value={c.light}
                disabled={c.status === "exiled"}
                onChange={(e) => updateCitizen(c.id, { light: Number(e.target.value) })}
                className="mt-2.5 w-full accent-[#e3b54a]"
              />
            </label>
            <div>
              <span className={lbl}>Казначейская выплата</span>
              <div className="flex gap-2">
                <input
                  className="field font-mono"
                  type="number"
                  placeholder="HY"
                  value={grants[c.id] ?? ""}
                  onChange={(e) => setGrants((g) => ({ ...g, [c.id]: e.target.value }))}
                />
                <button
                  className={btnGhost}
                  onClick={() => {
                    const amt = Number(grants[c.id] ?? 0);
                    if (amt) {
                      grantHyper(c.id, amt);
                      notify(`${c.name}: начислено ${fmtHyper(amt)} HY из казны.`, "hyper");
                    }
                  }}
                >
                  Выдать
                </button>
              </div>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            {c.status === "exiled" ? (
              <button className={btnGhost} onClick={() => updateCitizen(c.id, { status: "approved", decidedAt: Date.now() })}>
                Вернуть из изгнания
              </button>
            ) : confirmExile === c.id ? (
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] tracking-[0.15em] text-ember uppercase">Точно изгнать?</span>
                <button
                  className="border border-ember px-3 py-1.5 font-mono text-[10px] tracking-[0.15em] text-ember uppercase hover:bg-ember/10"
                  onClick={() => {
                    exile(c.id);
                    setConfirmExile(null);
                    notify(`${c.name} изгнан(а) указом Императора.`, "ember");
                  }}
                >
                  Да, изгнать
                </button>
                <button className={btnGhost} onClick={() => setConfirmExile(null)}>
                  Отмена
                </button>
              </div>
            ) : (
              <button
                className="font-mono text-[10px] tracking-[0.15em] text-dim uppercase transition-colors hover:text-ember"
                onClick={() => setConfirmExile(c.id)}
              >
                [ изгнать из Империи ]
              </button>
            )}
          </div>
        </div>
      ))}
      {people.length === 0 && (
        <p className="border border-dashed border-line p-10 text-center font-mono text-[12px] tracking-[0.2em] text-dim uppercase">
          В реестре пока только Император
        </p>
      )}
    </div>
  );
}

function NewsTab() {
  const { data, addNews, removeNews, notify } = useEmpire();
  const [tag, setTag] = useState<"decree" | "news" | "treasury">("news");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  const publish = () => {
    if (title.trim().length < 4 || text.trim().length < 10) {
      notify("Заполните заголовок и текст полностью.", "ember");
      return;
    }
    addNews(tag, title.trim(), text.trim());
    setTitle("");
    setText("");
    notify("Обращение опубликовано в Вестнике.", "gold");
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <div className="relative h-fit border border-line bg-panel p-6">
        <Corners />
        <p className="font-mono text-[10px] tracking-[0.3em] text-gold uppercase">Новое обращение</p>
        <label className="mt-4 block">
          <span className={lbl}>Тип</span>
          <select className="field" value={tag} onChange={(e) => setTag(e.target.value as typeof tag)}>
            <option value="news">Новость Империи</option>
            <option value="decree">Эдикт Императора</option>
            <option value="treasury">Отчёт Казначейства</option>
          </select>
        </label>
        <label className="mt-3 block">
          <span className={lbl}>Заголовок</span>
          <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="О чём возвестить?" />
        </label>
        <label className="mt-3 block">
          <span className={lbl}>Текст</span>
          <textarea className="field min-h-28 resize-y" value={text} onChange={(e) => setText(e.target.value)} placeholder="Слово Императора…" />
        </label>
        <button className={`${btnGold} clip-notch mt-4 w-full py-3`} onClick={publish}>
          Опубликовать ✦
        </button>
      </div>
      <div className="space-y-3">
        {data.news.map((n) => (
          <div key={n.id} className="group flex items-start gap-4 border border-line bg-panel p-4">
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[9px] tracking-[0.2em] text-gold uppercase">
                {n.tag === "decree" ? "Эдикт" : n.tag === "treasury" ? "Казначейство" : "Новость"} · {fmtDate(n.date)}
              </p>
              <h4 className="mt-1 text-[14px] font-bold text-ink">{n.title}</h4>
              <p className="mt-1 line-clamp-2 text-[12px] text-mist">{n.text}</p>
            </div>
            <button
              className="shrink-0 font-mono text-[10px] text-dim uppercase transition-colors hover:text-ember"
              onClick={() => removeNews(n.id)}
            >
              [удалить]
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function MarketTab() {
  const { data, addMarketItem, toggleMarketItem, removeMarketItem, notify } = useEmpire();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<"good" | "service">("good");

  const add = () => {
    const p = Number(price.replace(",", "."));
    if (name.trim().length < 3 || desc.trim().length < 5 || !(p > 0)) {
      notify("Название, описание и цена обязательны.", "ember");
      return;
    }
    addMarketItem(name.trim(), desc.trim(), p, category);
    setName("");
    setDesc("");
    setPrice("");
    notify("Лот выставлен на рынок Империи.", "hyper");
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <div className="relative h-fit border border-line bg-panel p-6">
        <Corners />
        <p className="font-mono text-[10px] tracking-[0.3em] text-hyper uppercase">Новый лот</p>
        <label className="mt-4 block">
          <span className={lbl}>Название</span>
          <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Резиденция, услуга, артефакт…" />
        </label>
        <label className="mt-3 block">
          <span className={lbl}>Описание</span>
          <textarea className="field min-h-24 resize-y" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Что получит гражданин?" />
        </label>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="block">
            <span className={lbl}>Цена, HY</span>
            <input className="field font-mono" type="number" min="1" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="500" />
          </label>
          <label className="block">
            <span className={lbl}>Категория</span>
            <select className="field" value={category} onChange={(e) => setCategory(e.target.value as "good" | "service")}>
              <option value="good">Товар</option>
              <option value="service">Услуга</option>
            </select>
          </label>
        </div>
        <button className={`${btnGold} clip-notch mt-4 w-full py-3`} onClick={add}>
          Выставить на рынок
        </button>
      </div>
      <div className="space-y-3">
        {data.market.map((m) => (
          <div key={m.id} className={`flex flex-wrap items-center gap-4 border bg-panel p-4 ${m.active ? "border-line" : "border-line opacity-55"}`}>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-bold text-ink">
                {m.name}{" "}
                <span className="ml-1 font-mono text-[9px] tracking-[0.2em] text-dim uppercase">
                  {m.category === "good" ? "товар" : "услуга"} · продано {m.sold}
                </span>
              </p>
              <p className="mt-0.5 truncate text-[12px] text-mist">{m.desc}</p>
            </div>
            <span className="font-mono text-[13px] font-bold text-gold tabular-nums">{fmtHyper(m.price)} HY</span>
            <button
              className={`border px-3 py-1.5 font-mono text-[10px] tracking-[0.15em] uppercase transition-colors ${
                m.active ? "border-hyper/50 text-hyper hover:bg-hyper/10" : "border-line text-dim hover:text-mist"
              }`}
              onClick={() => toggleMarketItem(m.id)}
            >
              {m.active ? "В продаже" : "Снят"}
            </button>
            <button className="font-mono text-[10px] text-dim uppercase transition-colors hover:text-ember" onClick={() => removeMarketItem(m.id)}>
              [удалить]
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TreasuryTab() {
  const { data, setTreasury, notify } = useEmpire();
  const [reserve, setReserve] = useState(String(data.treasury.reserve));
  const [rate, setRate] = useState(String(data.treasury.rate));
  const [issued, setIssued] = useState(String(data.treasury.issued));
  const approved = data.citizens.filter((c) => c.status === "approved").length;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="relative h-fit border border-line bg-panel p-6">
        <Corners />
        <p className="font-mono text-[10px] tracking-[0.3em] text-gold uppercase">Управление казной</p>
        <div className="mt-4 grid grid-cols-1 gap-3">
          <label className="block">
            <span className={lbl}>Резерв Империи, HY</span>
            <input className="field font-mono" value={reserve} onChange={(e) => setReserve(e.target.value)} />
          </label>
          <label className="block">
            <span className={lbl}>Курс HY / USD</span>
            <input className="field font-mono" value={rate} onChange={(e) => setRate(e.target.value)} />
          </label>
          <label className="block">
            <span className={lbl}>В обращении, HY</span>
            <input className="field font-mono" value={issued} onChange={(e) => setIssued(e.target.value)} />
          </label>
        </div>
        <button
          className={`${btnGold} clip-notch mt-5 w-full py-3`}
          onClick={() => {
            setTreasury({ reserve: Number(reserve) || 0, rate: Number(rate.replace(",", ".")) || 1, issued: Number(issued) || 0 });
            notify("Казначейские книги обновлены.", "gold");
          }}
        >
          Скрепить печатью
        </button>
        <p className="mt-3 font-mono text-[9px] tracking-[0.2em] text-dim uppercase">
          Хартия, ст. V: предел эмиссии — 21 000 000 HY
        </p>
      </div>
      <div className="grid content-start gap-4 sm:grid-cols-2">
        {[
          { l: "Резерв Империи", v: `${fmtHyper(data.treasury.reserve)} HY` },
          { l: "Курс Казначейства", v: `$${data.treasury.rate.toFixed(2)}` },
          { l: "В обращении", v: `${fmtHyper(data.treasury.issued)} HY` },
          { l: "Граждан в реестре", v: String(approved) },
        ].map((s) => (
          <div key={s.l} className="border border-line bg-panel p-5">
            <p className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase">{s.l}</p>
            <p className="font-display mt-2 text-xl font-bold text-gold tabular-nums">{s.v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CouncilTab() {
  const { data, appoint, notify } = useEmpire();
  const candidates = data.citizens.filter((c) => c.status === "approved" && c.rank !== "emperor" && c.passportIssuedAt);
  return (
    <div className="space-y-3">
      <p className="font-mono text-[11px] tracking-[0.2em] text-dim uppercase">
        Назначенные автоматически получают ранг Сенатора и +10 к Уровню Света.
      </p>
      {data.council.map((seat, i) => {
        const holder = data.citizens.find((c) => c.id === seat.citizenId);
        return (
          <div key={seat.seat} className="flex flex-wrap items-center gap-4 border border-line bg-panel p-4">
            <div className="min-w-0 flex-1">
              <p className="font-display text-[13px] font-bold tracking-wide text-goldsoft uppercase">{seat.seat}</p>
              <p className="mt-0.5 font-mono text-[11px] text-mist">
                {holder ? `${holder.name} · ${holder.id}` : "кафедра свободна"}
              </p>
            </div>
            <select
              className="field !w-56"
              value={seat.citizenId ?? ""}
              onChange={(e) => {
                appoint(i, e.target.value || null);
                notify(e.target.value ? "Назначение скреплено печатью." : "Кафедра освобождена.", "gold");
              }}
            >
              <option value="">— свободно —</option>
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({RANK_LABEL[c.rank]})
                </option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
}

function LandsTab() {
  const { data, addProvince, notify } = useEmpire();
  const [name, setName] = useState("");
  const [capital, setCapital] = useState("");
  const [note, setNote] = useState("");
  const popOf = (id: string) => data.citizens.filter((c) => c.province === id && c.status === "approved").length;

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <div className="relative h-fit border border-line bg-panel p-6">
        <Corners />
        <p className="font-mono text-[10px] tracking-[0.3em] text-hyper uppercase">Новая провинция</p>
        <label className="mt-4 block">
          <span className={lbl}>Название</span>
          <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Например: Предел Зари" />
        </label>
        <label className="mt-3 block">
          <span className={lbl}>Столица</span>
          <input className="field" value={capital} onChange={(e) => setCapital(e.target.value)} placeholder="Город-столица" />
        </label>
        <label className="mt-3 block">
          <span className={lbl}>Промысел / описание</span>
          <input className="field" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Чем славится провинция" />
        </label>
        <button
          className={`${btnGold} clip-notch mt-4 w-full py-3`}
          onClick={() => {
            if (name.trim().length < 3) {
              notify("Дайте провинции имя.", "ember");
              return;
            }
            addProvince(name.trim(), capital.trim() || "—", note.trim());
            setName("");
            setCapital("");
            setNote("");
            notify("Провинция внесена в гербовую карту.", "gold");
          }}
        >
          Основать провинцию
        </button>
      </div>
      <div className="space-y-3">
        {REGIONS.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center gap-4 border border-line bg-panel p-4">
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-bold text-ink">{r.name}</p>
              <p className="font-mono text-[10px] tracking-[0.15em] text-dim uppercase">
                {r.code} · {r.capital} · {r.industry}
              </p>
            </div>
            <span className="font-mono text-[11px] text-hyper">резидентов: {popOf(r.id)}</span>
          </div>
        ))}
        {data.provinces.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center gap-4 border border-gold/35 bg-panel p-4">
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-bold text-goldsoft">{p.name} <span className="font-mono text-[9px] text-dim uppercase">· новая провинция</span></p>
              <p className="font-mono text-[10px] tracking-[0.15em] text-dim uppercase">столица: {p.capital} · {p.note}</p>
            </div>
            <span className="font-mono text-[11px] text-hyper">резидентов: {popOf(p.id)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MailTab() {
  const { data } = useEmpire();
  return (
    <div className="space-y-3">
      <p className="font-mono text-[11px] tracking-[0.2em] text-dim uppercase">
        Журнал уведомлений, отправленных подданным (электронная почта Империи).
      </p>
      {data.mails.map((m) => (
        <div key={m.id} className="border border-line bg-panel p-4">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <p className="font-mono text-[11px] font-bold text-hyper">{m.to}</p>
            <span className="ml-auto font-mono text-[10px] text-dim">{fmtDate(m.date)}</span>
          </div>
          <p className="mt-1.5 text-[13px] font-bold text-ink">{m.subject}</p>
          <p className="mt-1 text-[12px] leading-relaxed text-mist">{m.body}</p>
        </div>
      ))}
    </div>
  );
}

function SecurityTab() {
  const { changePin, notify, resetState, data } = useEmpire();
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [newPin2, setNewPin2] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  const save = () => {
    if (!/^\d{4,6}$/.test(newPin) || newPin !== newPin2) {
      notify("Новый PIN — 4–6 цифр, подтверждения должны совпадать.", "ember");
      return;
    }
    const res = changePin(oldPin, newPin);
    notify(res.msg, res.ok ? "gold" : "ember");
    if (res.ok) {
      setOldPin("");
      setNewPin("");
      setNewPin2("");
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-2">
      <div className="relative h-fit border border-line bg-panel p-6">
        <Corners />
        <p className="font-mono text-[10px] tracking-[0.3em] text-gold uppercase">Смена PIN Императора</p>
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className={lbl}>Текущий PIN</span>
            <input className="field font-mono" type="password" inputMode="numeric" value={oldPin} onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ""))} />
          </label>
          <label className="block">
            <span className={lbl}>Новый PIN (4–6 цифр)</span>
            <input className="field font-mono" type="password" inputMode="numeric" value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))} />
          </label>
          <label className="block">
            <span className={lbl}>Повторите новый PIN</span>
            <input className="field font-mono" type="password" inputMode="numeric" value={newPin2} onChange={(e) => setNewPin2(e.target.value.replace(/\D/g, ""))} />
          </label>
        </div>
        <button className={`${btnGold} clip-notch mt-5 w-full py-3`} onClick={save}>
          Обновить PIN
        </button>
      </div>
      <div className="relative h-fit border border-ember/40 bg-panel p-6">
        <p className="font-mono text-[10px] tracking-[0.3em] text-ember uppercase">Опасная зона</p>
        <p className="mt-3 text-[13px] leading-relaxed text-mist">
          Полная перезапись реестра Империи: граждане, казна, рынок и вестник вернутся к исходному состоянию.
        </p>
        {confirmReset ? (
          <div className="mt-4 flex gap-2">
            <button
              className="border border-ember bg-ember/15 px-4 py-2 font-mono text-[11px] font-bold tracking-[0.15em] text-ember uppercase"
              onClick={() => {
                resetState();
                setConfirmReset(false);
                notify("Реестр Империи переписан заново.", "ember");
              }}
            >
              Да, переписать реестр
            </button>
            <button className={btnGhost} onClick={() => setConfirmReset(false)}>
              Отмена
            </button>
          </div>
        ) : (
          <button
            className="mt-4 border border-ember/50 px-4 py-2 font-mono text-[11px] tracking-[0.15em] text-ember uppercase transition-colors hover:bg-ember/10"
            onClick={() => setConfirmReset(true)}
          >
            Переписать реестр Империи
          </button>
        )}
        {data.cloudId && (
          <p className="mt-4 border-t border-line pt-3 font-mono text-[9.5px] leading-relaxed tracking-[0.12em] text-dim uppercase">
            Внимание: перезапись отключит это устройство от облачного реестра ({data.cloudId}). Другие устройства
            останутся синхронизированы.
          </p>
        )}
      </div>

      <div className="mt-8">
        <SyncPanel />
      </div>
      </div>
    </div>
  );
}

export default function EmperorPanel() {
  const { me, data } = useEmpire();
  const [tab, setTab] = useState<ETab>("apps");
  const pendingCount = data.citizens.filter((c) => c.status === "pending").length;

  if (!me || me.rank !== "emperor") return <ThroneGate />;

  return (
    <div className="relative min-h-screen bg-void">
      <div className="scan-band" aria-hidden />
      <header className="sticky top-0 z-40 border-b border-ember/25 bg-abyss/92 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-5 py-3.5 sm:px-8">
          <Crest className="h-10 w-10 text-ember" />
          <div>
            <h1 className="font-display text-[15px] font-extrabold leading-tight tracking-wide text-ink uppercase">
              Трон Императора
            </h1>
            <p className="font-mono text-[9px] tracking-[0.3em] text-ember uppercase">Пульт абсолютной власти · {me.name}</p>
          </div>
          <div className="ml-auto flex items-center gap-3 font-mono text-[11px] text-mist">
            <span className="hidden items-center gap-2 sm:flex">
              заявок на рассмотрении: <b className="text-gold">{pendingCount}</b>
              {pendingCount > 0 && <span className="inline-block h-1.5 w-1.5 animate-soft-pulse rounded-full bg-gold" />}
            </span>
          </div>
        </div>
        <div className="mx-auto max-w-7xl overflow-x-auto px-5 sm:px-8">
          <div className="flex gap-1">
            {EMPERIOR_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative shrink-0 px-3.5 py-3 font-mono text-[10.5px] font-bold tracking-[0.16em] uppercase transition-all ${
                  tab === t.id ? "text-ember" : "text-dim hover:text-mist"
                }`}
              >
                {t.label}
                <span
                  aria-hidden
                  className={`absolute inset-x-2 bottom-0 h-[2px] bg-gradient-to-r from-ember to-gold transition-transform duration-300 ${
                    tab === t.id ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        {tab === "apps" && <ApplicationsTab />}
        {tab === "people" && <PeopleTab />}
        {tab === "news" && <NewsTab />}
        {tab === "market" && <MarketTab />}
        {tab === "treasury" && <TreasuryTab />}
        {tab === "council" && <CouncilTab />}
        {tab === "lands" && <LandsTab />}
        {tab === "mail" && <MailTab />}
        {tab === "security" && <SecurityTab />}
      </main>
    </div>
  );
}
