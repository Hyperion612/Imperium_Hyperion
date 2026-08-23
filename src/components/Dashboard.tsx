import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import {
  PASSPORT_YEARS,
  RANK_COLOR,
  RANK_LABEL,
  fmtDate,
  fmtHyper,
  useEmpire,
} from "../lib/state";
import { usePrefersReducedMotion } from "../lib/hooks";
import PassportCard from "./PassportCard";
import Market from "./Market";
import NewsFeed from "./NewsFeed";
import Economy from "./Economy";
import Ranks from "./Ranks";
import Assemblies from "./Assemblies";
import Community from "./Community";
import Constitution from "./Constitution";
import { Corners } from "./SectionHead";
import Crest from "./Crest";
import Flag from "./Flag";
import { HyperCoin, LockIcon, SunIcon } from "./Symbols";

const TABS = [
  { id: "passport", label: "Паспорт" },
  { id: "market", label: "Рынок" },
  { id: "news", label: "Вестник" },
  { id: "treasury", label: "Казна" },
  { id: "ranks", label: "Ранги" },
  { id: "assemblies", label: "Собрания" },
  { id: "community", label: "Сообщество" },
  { id: "charter", label: "Хартия" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function LockPanel({ onGoPassport }: { onGoPassport: () => void }) {
  return (
    <div className="flex min-h-[420px] items-center justify-center border border-dashed border-line bg-panel/40 p-8">
      <div className="max-w-md text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center border border-gold/40 text-gold">
          <LockIcon className="h-8 w-8" />
        </span>
        <h3 className="font-display mt-5 text-lg font-bold tracking-wide text-ink uppercase">Территория закрыта</h3>
        <p className="mt-3 text-[13.5px] leading-relaxed text-mist">
          По Статье VII Хартии полный доступ к экономике, рангам и собраниям открывается только гражданам, оформившим
          паспорт Империи. Ваш ID уже действует — остался один шаг.
        </p>
        <button
          onClick={onGoPassport}
          className="clip-notch mt-6 bg-gold px-7 py-3 font-mono text-[12px] font-bold tracking-[0.22em] text-[#171006] uppercase transition-all duration-300 hover:bg-goldsoft hover:shadow-[0_0_36px_rgba(227,181,74,0.35)]"
        >
          Оформить паспорт →
        </button>
      </div>
    </div>
  );
}

function PassportIssue({ onIssued }: { onIssued: () => void }) {
  const { issuePassport, notify } = useEmpire();
  const reduced = usePrefersReducedMotion();
  const [avatar, setAvatar] = useState<string | undefined>();
  const [oath, setOath] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 400 * 1024) {
      setErr("Аватар слишком велик — до 400 КБ");
      return;
    }
    setErr("");
    const reader = new FileReader();
    reader.onload = () => setAvatar(String(reader.result));
    reader.readAsDataURL(f);
  };

  const issue = () => {
    if (!oath) {
      setErr("Принесите присягу, чтобы отчеканить паспорт");
      return;
    }
    const res = issuePassport(avatar);
    if (!res.ok) {
      setErr(res.msg);
      return;
    }
    notify(res.msg, "hyper");
    if (!reduced) {
      confetti({ particleCount: 160, spread: 80, origin: { y: 0.5 }, colors: ["#e3b54a", "#f2d790", "#57ddc4"] });
    }
    onIssued();
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="relative border border-gold/35 bg-panel p-7 sm:p-9">
        <Corners />
        <div className="flex items-center gap-4">
          <Crest className="h-11 w-11 text-gold" />
          <div>
            <h3 className="font-display text-lg font-bold tracking-wide text-ink uppercase">Чеканка паспорта</h3>
            <p className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase">Форма H-01 · срок действия {PASSPORT_YEARS} года</p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={() => fileRef.current?.click()}
            className="group relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-line2 transition-colors hover:border-gold"
            title="Загрузить аватар"
          >
            {avatar ? (
              <img src={avatar} alt="Аватар" className="h-full w-full object-cover" />
            ) : (
              <svg viewBox="0 0 48 48" className="h-9 w-9 text-dim transition-colors group-hover:text-gold" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="24" cy="18" r="8" />
                <path d="M8 42c2-9 9-13 16-13s14 4 16 13" />
              </svg>
            )}
          </button>
          <div>
            <p className="text-[13px] font-bold text-ink">Аватар — по желанию</p>
            <p className="mt-1 text-[12px] leading-relaxed text-mist">
              Круглая рамка с золотым ободом появится на паспорте автоматически. Без фото будут отчеканены инициалы.
            </p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
          </div>
        </div>

        <label className={`mt-6 flex cursor-pointer items-start gap-3 border p-4 transition-colors ${oath ? "border-gold/50 bg-panel2" : "border-line bg-abyss"}`}>
          <input type="checkbox" checked={oath} onChange={(e) => setOath(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#e3b54a]" />
          <span className="text-[12.5px] leading-relaxed text-mist">
            Клянусь: Свет ведёт меня, Порядок защищает меня, Равновесие хранит меня. Обязуюсь продлевать паспорт каждые{" "}
            {PASSPORT_YEARS} года и хранить PIN в тайне.
          </span>
        </label>
        {err && <p className="mt-3 font-mono text-[11px] text-ember">▲ {err}</p>}

        <button
          onClick={issue}
          className="clip-notch mt-6 w-full bg-gold px-6 py-3.5 font-mono text-[13px] font-bold tracking-[0.25em] text-[#171006] uppercase transition-all duration-300 hover:bg-goldsoft hover:shadow-[0_0_40px_rgba(227,181,74,0.35)] active:translate-y-0.5"
        >
          Отчеканить паспорт ✦
        </button>
        <p className="mt-3 text-center font-mono text-[10px] tracking-[0.18em] text-dim uppercase">
          Приветственный бонус: 500 HY на кошелёк
        </p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { me, logout, issuePassport, notify } = useEmpire();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>("passport");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tab]);

  if (!me) return <Navigate to="/gate" replace />;

  const locked = !me.passportIssuedAt;
  const expiry = me.passportIssuedAt
    ? new Date(me.passportIssuedAt).setFullYear(new Date(me.passportIssuedAt).getFullYear() + PASSPORT_YEARS)
    : 0;
  const expired = !!me.passportIssuedAt && Date.now() > expiry;
  const rankColor = RANK_COLOR[me.rank];

  const renew = () => {
    const res = issuePassport();
    notify(res.ok ? "Паспорт продлён ещё на 2 года. Бонус 500 HY." : res.msg, res.ok ? "hyper" : "ember");
  };

  return (
    <div className="relative min-h-screen bg-void">
      {/* шапка гражданина */}
      <header className="sticky top-0 z-40 border-b border-line bg-abyss/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="w-[44px] border border-gold/30">
              <Flag className="h-7 w-[44px]" />
            </div>
            <div>
              <p className="font-display text-[13px] font-bold leading-tight text-ink">{me.name}</p>
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase" style={{ color: rankColor }}>
                {me.id} · {RANK_LABEL[me.rank]}
              </p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-4 font-mono text-[11px]">
            <span className="hidden items-center gap-1.5 text-gold sm:flex" title="Уровень Света">
              <SunIcon className="h-3.5 w-3.5" /> {me.light}
            </span>
            <span className="flex items-center gap-1.5 text-hyper" title="Баланс HYPER">
              <HyperCoin className="h-3.5 w-3.5" /> {fmtHyper(me.hyper)} HY
            </span>
            {me.rank === "emperor" && (
              <button
                onClick={() => navigate("/emperor")}
                className="border border-ember/50 px-3 py-1.5 text-[10px] tracking-[0.2em] text-ember uppercase transition-colors hover:bg-ember/10"
              >
                Трон →
              </button>
            )}
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="border border-line px-3 py-1.5 text-[10px] tracking-[0.2em] text-mist uppercase transition-colors hover:border-ember/50 hover:text-ember"
            >
              Выйти
            </button>
          </div>
        </div>
        {/* вкладки */}
        <div className="mx-auto max-w-7xl overflow-x-auto px-5 sm:px-8">
          <div className="flex gap-1 pb-0">
            {TABS.map((t) => {
              const activeTab = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`relative shrink-0 px-4 py-3 font-mono text-[11px] font-bold tracking-[0.18em] uppercase transition-all duration-300 ${
                    activeTab ? "text-gold" : "text-dim hover:text-mist"
                  }`}
                >
                  {locked && t.id !== "passport" && t.id !== "charter" && (
                    <LockIcon className="mr-1.5 inline h-3 w-3 opacity-70" />
                  )}
                  {t.label}
                  <span
                    aria-hidden
                    className={`absolute inset-x-2 bottom-0 h-[2px] bg-gradient-to-r from-gold to-hyper transition-transform duration-300 ${
                      activeTab ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        {tab === "passport" && (
          <div>
            {me.passportIssuedAt ? (
              <>
                {expired && (
                  <div className="mx-auto mb-6 flex max-w-[640px] items-center justify-between gap-4 border border-ember/50 bg-ember/10 px-5 py-3.5">
                    <p className="font-mono text-[11px] tracking-[0.15em] text-ember uppercase">
                      Паспорт истёк {fmtDate(expiry)} — доступ приостановлен
                    </p>
                    <button
                      onClick={renew}
                      className="shrink-0 bg-ember px-4 py-2 font-mono text-[11px] font-bold tracking-[0.15em] text-[#1a0d0a] uppercase transition-all hover:brightness-110"
                    >
                      Продлить
                    </button>
                  </div>
                )}
                <PassportCard citizen={me} />
              </>
            ) : (
              <PassportIssue onIssued={() => setTab("passport")} />
            )}
          </div>
        )}

        {tab !== "passport" && locked && tab !== "charter" ? (
          <LockPanel onGoPassport={() => setTab("passport")} />
        ) : (
          <>
            {tab === "market" && <Market locked={false} />}
            {tab === "news" && <NewsFeed />}
            {tab === "charter" && <div className="-mx-5 sm:-mx-8">{<Constitution />}</div>}
          </>
        )}
      </main>

      {/* полноразмерные секции вне контейнера */}
      {tab === "treasury" && !locked && <Economy />}
      {tab === "ranks" && !locked && <Ranks />}
      {tab === "assemblies" && !locked && <Assemblies />}
      {tab === "community" && !locked && <Community />}
    </div>
  );
}
