import { useRef, useState } from "react";
import { REGIONS } from "../lib/data";
import {
  PASSPORT_YEARS,
  RANK_COLOR,
  RANK_LABEL,
  fmtDate,
  fmtHyper,
  useEmpire,
  type Citizen,
  type RankId,
} from "../lib/state";
import { hashMatrix, usePrefersReducedMotion } from "../lib/hooks";
import Crest from "./Crest";
import Flag from "./Flag";
import { Fist, HyperCoin, SunIcon, YinYang } from "./Symbols";
import { Corners } from "./SectionHead";

const RANKS_LADDER: { id: RankId; note: string }[] = [
  { id: "resident", note: "Одобренный житель. Оформляет паспорт." },
  { id: "citizen", note: "Полноправный член Империи. Голос на собраниях." },
  { id: "governor", note: "Управляет провинцией по указу Императора." },
  { id: "senator", note: "Член Совета Империи, законотворчество." },
  { id: "chancellor", note: "Глава исполнительной власти под Императором." },
  { id: "emperor", note: "Гарант Хартии. Абсолютная власть по Статье I." },
];

function Qr({ seed }: { seed: string }) {
  const m = hashMatrix(seed, 17);
  const cell = 4.6;
  return (
    <svg width={17 * cell} height={17 * cell} viewBox={`0 0 ${17 * cell} ${17 * cell}`} aria-label="QR-верификация">
      <rect width={17 * cell} height={17 * cell} fill="#070b16" />
      {m.map((row, y) =>
        row.map((on, x) =>
          on ? <rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell - 0.7} height={cell - 0.7} fill="#c9d3e4" /> : null,
        ),
      )}
    </svg>
  );
}

function DetailModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-void/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-md border border-gold/40 bg-panel p-6 shadow-[0_30px_90px_rgba(0,0,0,0.7)]"
        onClick={(e) => e.stopPropagation()}
      >
        <Corners />
        <div className="flex items-center justify-between">
          <h4 className="font-display text-[15px] font-bold tracking-wide text-goldsoft uppercase">{title}</h4>
          <button onClick={onClose} className="font-mono text-mist transition-colors hover:text-gold" aria-label="Закрыть">
            [×]
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export default function PassportCard({ citizen }: { citizen: Citizen }) {
  const { data, provinceName } = useEmpire();
  const reduced = usePrefersReducedMotion();
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [modal, setModal] = useState<"rank" | "wallet" | "province" | null>(null);

  const frame = RANK_COLOR[citizen.rank];
  const region = REGIONS.find((r) => r.id === citizen.province);
  const custom = data.provinces.find((p) => p.id === citizen.province);
  const expiresIn = citizen.passportIssuedAt
    ? new Date(citizen.passportIssuedAt).setFullYear(new Date(citizen.passportIssuedAt).getFullYear() + PASSPORT_YEARS)
    : 0;
  const expired = Date.now() > expiresIn;
  const initials = citizen.name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const onMove = (e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el || reduced) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 8}deg)`;
  };
  const onLeave = () => {
    const el = cardRef.current;
    if (el) el.style.transform = "perspective(1000px)";
  };

  const clickCls = "cursor-pointer transition-all duration-200 hover:brightness-125";

  return (
    <>
      <div className="flex justify-center">
        <div
          ref={cardRef}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          className="relative w-full max-w-[640px] transition-transform duration-200 ease-out will-change-transform"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* горизонтальная карта, золотая рамка по рангу */}
          <div
            className="relative overflow-hidden border-2 p-5 shadow-[0_36px_90px_-30px_rgba(0,0,0,0.85)] sm:p-6"
            style={{
              borderColor: frame,
              boxShadow: `0 36px 90px -30px rgba(0,0,0,0.85), 0 0 44px -12px ${frame}66, inset 0 0 0 1px rgba(201,211,228,0.12)`,
              background:
                "linear-gradient(135deg, #0a0f22 0%, #0d1430 34%, #080c1c 62%, #0a1026 100%)",
            }}
          >
            <div className="holo-sweep" aria-hidden />
            {/* фоновые символы */}
            <div aria-hidden className="pointer-events-none absolute -right-8 -bottom-10 opacity-[0.06]" style={{ color: frame }}>
              <Fist className="h-56 w-56" />
            </div>
            <div aria-hidden className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 opacity-[0.07]" style={{ color: frame }}>
              <YinYang className="h-44 w-44" />
            </div>

            {/* верхняя строка */}
            <div className="relative flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-[54px] border border-[#c9d3e4]/30 sm:w-[62px]">
                  <Flag className="h-9 w-[54px] sm:h-10 sm:w-[62px]" alt="Флаг Империи Гиперион" />
                </div>
                <div>
                  <p className="font-mono text-[8px] tracking-[0.3em] text-[#aab6c9] uppercase">Imperium Hyperion</p>
                  <p className="font-display text-[13px] font-bold tracking-[0.14em] text-[#e9edf6] uppercase sm:text-[14px]">
                    Паспорт гражданина
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2" style={{ color: frame }}>
                <Fist className="h-7 w-7" />
                <YinYang className="h-7 w-7" />
              </div>
            </div>

            {/* основная сетка */}
            <div className="relative mt-4 flex gap-4 sm:gap-5">
              {/* аватар */}
              <div className="shrink-0">
                <div
                  className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-[3px] sm:h-24 sm:w-24"
                  style={{ borderColor: frame, boxShadow: `0 0 22px -4px ${frame}88` }}
                >
                  {citizen.avatar ? (
                    <img src={citizen.avatar} alt="Аватар гражданина" className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-display text-xl font-extrabold" style={{ color: frame }}>
                      {initials}
                    </span>
                  )}
                </div>
                <div className="mt-2 text-center font-mono text-[8px] tracking-[0.18em] text-[#aab6c9] uppercase">
                  ур. Света
                </div>
                <div className="mt-1 flex items-center justify-center gap-1">
                  <SunIcon className="h-3.5 w-3.5" />
                  <span className="font-mono text-[12px] font-bold tabular-nums" style={{ color: frame }}>
                    {citizen.light}
                  </span>
                </div>
              </div>

              {/* данные */}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-display truncate text-[clamp(1.05rem,2.6vw,1.5rem)] font-extrabold tracking-wide text-[#e9edf6] uppercase">
                    {citizen.name}
                  </p>
                </div>
                <p className="mt-0.5 font-mono text-[13px] font-bold tracking-[0.22em] text-[#c9d3e4]">{citizen.id}</p>

                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 font-mono text-[10px] sm:text-[11px]">
                  <button className={clickCls} onClick={() => setModal("rank")} title="Подробнее о ранговой системе">
                    <span className="block tracking-[0.2em] text-[#7f8ba3] uppercase">Ранг</span>
                    <span className="mt-0.5 block text-[13px] font-bold sm:text-[14px]" style={{ color: frame }}>
                      ◆ {RANK_LABEL[citizen.rank]}
                    </span>
                  </button>
                  <button className={`${clickCls} text-left`} onClick={() => setModal("province")} title="Подробнее о провинции">
                    <span className="block tracking-[0.2em] text-[#7f8ba3] uppercase">Провинция</span>
                    <span className="mt-0.5 block truncate text-[13px] font-bold text-[#e9edf6] sm:text-[14px]">
                      {region?.name ?? provinceName(citizen.province)}
                    </span>
                  </button>
                  <div>
                    <span className="block tracking-[0.2em] text-[#7f8ba3] uppercase">Регистрация</span>
                    <span className="mt-0.5 block text-[13px] text-[#c9d3e4] tabular-nums">
                      {citizen.passportIssuedAt ? fmtDate(citizen.passportIssuedAt) : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block tracking-[0.2em] text-[#7f8ba3] uppercase">Действителен</span>
                    <span className={`mt-0.5 block text-[13px] tabular-nums ${expired ? "font-bold text-ember" : "text-[#c9d3e4]"}`}>
                      {fmtDate(expiresIn)} {expired && "· истёк"}
                    </span>
                  </div>
                </div>

                {/* баланс */}
                <button
                  className={`${clickCls} mt-3 flex items-center gap-2 border px-3 py-1.5`}
                  style={{ borderColor: `${frame}55` }}
                  onClick={() => setModal("wallet")}
                  title="Открыть кошелёк"
                >
                  <span style={{ color: frame }}>
                    <HyperCoin className="h-4 w-4" />
                  </span>
                  <span className="font-mono text-[15px] font-bold text-[#e9edf6] tabular-nums">
                    {fmtHyper(citizen.hyper)} HY
                  </span>
                  <span className="font-mono text-[9px] tracking-[0.15em] text-[#7f8ba3] uppercase">кошелёк ›</span>
                </button>
              </div>

              {/* QR */}
              <div className="hidden shrink-0 flex-col items-center gap-2 sm:flex">
                <div className="border border-[#c9d3e4]/25 p-1">
                  <Qr seed={citizen.id + citizen.name} />
                </div>
                <span className="font-mono text-[8px] tracking-[0.2em] text-[#7f8ba3] uppercase">верификация</span>
              </div>
            </div>

            {/* слоган */}
            <div className="relative mt-4 flex items-center justify-between border-t pt-3" style={{ borderColor: `${frame}44` }}>
              <p className="font-mono text-[8.5px] tracking-[0.16em] text-[#aab6c9] uppercase sm:text-[9.5px]">
                Свет ведёт тебя · Порядок защищает · Равновесие хранит
              </p>
              <div className="flex items-center gap-1.5" style={{ color: frame }}>
                <Crest className="h-4 w-4" />
                <span className="font-mono text-[8px] tracking-[0.25em] uppercase">PIN-защита</span>
              </div>
            </div>

            {expired && (
              <div className="absolute inset-0 flex items-center justify-center bg-void/55 backdrop-blur-[1px]">
                <span className="-rotate-6 border-2 border-ember px-6 py-2 font-display text-lg font-extrabold tracking-[0.3em] text-ember uppercase">
                  Истёк · продлите
                </span>
              </div>
            )}
          </div>

          <p className="mt-3 text-center font-mono text-[10px] tracking-[0.2em] text-dim uppercase">
            Нажмите на ранг, провинцию или баланс — откроются подробности
          </p>
        </div>
      </div>

      {modal === "rank" && (
        <DetailModal title="Ранговая система" onClose={() => setModal(null)}>
          <ol className="space-y-2.5">
            {RANKS_LADDER.map((r, i) => (
              <li
                key={r.id}
                className={`flex items-start gap-3 border p-3 ${
                  r.id === citizen.rank ? "border-gold/60 bg-panel2" : "border-line/70"
                }`}
              >
                <span className="font-display text-sm font-extrabold" style={{ color: RANK_COLOR[r.id] }}>
                  {i + 1}
                </span>
                <div>
                  <p className="text-[13px] font-bold" style={{ color: RANK_COLOR[r.id] }}>
                    {RANK_LABEL[r.id]}
                  </p>
                  <p className="text-[12px] text-mist">{r.note}</p>
                </div>
                {r.id === citizen.rank && (
                  <span className="ml-auto shrink-0 font-mono text-[9px] tracking-[0.2em] text-gold uppercase">ваш ранг</span>
                )}
              </li>
            ))}
          </ol>
        </DetailModal>
      )}

      {modal === "wallet" && (
        <DetailModal title="Кошелёк HYPER" onClose={() => setModal(null)}>
          <div className="border border-line bg-abyss p-5 text-center">
            <p className="mx-auto flex items-center justify-center gap-2 font-mono text-[10px] tracking-[0.25em] text-dim uppercase">
              <span className="text-gold">
                <HyperCoin className="h-4 w-4" />
              </span>
              Текущий баланс
            </p>
            <p className="font-display mt-2 text-3xl font-extrabold text-gold tabular-nums">{fmtHyper(citizen.hyper)} HY</p>
            <p className="mt-1 font-mono text-[11px] text-mist">
              ≈ ${(citizen.hyper * data.treasury.rate).toLocaleString("ru-RU", { maximumFractionDigits: 0 })} · курс Казначейства
            </p>
          </div>
          <ul className="mt-4 space-y-2 font-mono text-[11px] text-mist">
            <li className="flex justify-between border-b border-line/60 pb-2">
              <span>Приветственный бонус</span>
              <span className="text-hyper">+500 HY</span>
            </li>
            <li className="flex justify-between border-b border-line/60 pb-2">
              <span>Комиссия Империи</span>
              <span className="text-hyper">0%</span>
            </li>
            <li className="flex justify-between">
              <span>Покупки на рынке</span>
              <span className="text-ink">вкладка «Рынок»</span>
            </li>
          </ul>
        </DetailModal>
      )}

      {modal === "province" && (
        <DetailModal title="Провинция приписки" onClose={() => setModal(null)}>
          {region ? (
            <>
              <p className="font-mono text-[10px] tracking-[0.25em] text-gold">{region.code}</p>
              <h5 className="font-display mt-1 text-lg font-bold text-ink">{region.name}</h5>
              <dl className="mt-3 space-y-2 font-mono text-[12px]">
                <div className="flex justify-between border-b border-line/60 pb-2">
                  <dt className="text-dim">Столица</dt>
                  <dd className="text-ink">{region.capital}</dd>
                </div>
                <div className="flex justify-between border-b border-line/60 pb-2">
                  <dt className="text-dim">Население</dt>
                  <dd className="text-ink">{region.population}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-dim">Промысел</dt>
                  <dd className="text-hyper">{region.industry}</dd>
                </div>
              </dl>
            </>
          ) : (
            <>
              <h5 className="font-display text-lg font-bold text-ink">{custom?.name ?? provinceName(citizen.province)}</h5>
              <p className="mt-2 text-[13px] text-mist">{custom?.note ?? "Новая провинция Империи."}</p>
              <p className="mt-3 font-mono text-[12px] text-dim">Столица: {custom?.capital ?? "—"}</p>
            </>
          )}
          <p className="mt-4 border-t border-line pt-3 font-mono text-[10px] tracking-[0.15em] text-dim uppercase">
            Перевод в другую провинцию — указом Императора
          </p>
        </DetailModal>
      )}
    </>
  );
}
