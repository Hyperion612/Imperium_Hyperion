import { useEffect, useMemo, useState } from "react";
import { PROTOCOLS } from "../lib/data";
import { useCountUp, useInView } from "../lib/hooks";
import Reveal from "./Reveal";
import SectionHead, { Corners } from "./SectionHead";

function nextAssemblyDate(): Date {
  const now = new Date();
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 20, 0, 0));
  let add = (6 - d.getUTCDay() + 7) % 7;
  if (add === 0 && d.getTime() <= now.getTime()) add = 7;
  d.setUTCDate(d.getUTCDate() + add);
  return d;
}

const AGENDA = [
  "Отчёт Хранителя Казны: обращение HY за неделю",
  "Законопроект №347: маяки Архипелага Нереид",
  "Свободная трибуна: вопросы граждан к Канцлеру",
];

const POLL_BASE = [
  { label: "Дворец в Авроре", votes: 864 },
  { label: "Маяк Архипелага", votes: 612 },
  { label: "Цитадель Киммерии", votes: 391 },
];

function Countdown({ target }: { target: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  const seg = (v: number) => String(v).padStart(2, "0");
  const parts = [
    { v: seg(Math.floor(diff / 86400000)), l: "дней" },
    { v: seg(Math.floor(diff / 3600000) % 24), l: "часов" },
    { v: seg(Math.floor(diff / 60000) % 60), l: "минут" },
    { v: seg(Math.floor(diff / 1000) % 60), l: "секунд" },
  ];
  return (
    <div className="grid grid-cols-4 gap-2">
      {parts.map((p) => (
        <div key={p.l} className="border border-line bg-abyss py-3 text-center">
          <div className="font-mono text-[clamp(1.3rem,3vw,2rem)] font-bold text-gold tabular-nums">{p.v}</div>
          <div className="mt-1 font-mono text-[9px] tracking-[0.2em] text-dim uppercase">{p.l}</div>
        </div>
      ))}
    </div>
  );
}

export default function Assemblies() {
  const target = useMemo(() => nextAssemblyDate(), []);
  const [joined, setJoined] = useState(false);
  const [voted, setVoted] = useState<number | null>(null);
  const [openProtocol, setOpenProtocol] = useState<number | null>(PROTOCOLS[PROTOCOLS.length - 1].no);
  const [rsvpRef, rsvpInView] = useInView<HTMLDivElement>();

  const attendees = useCountUp(1842 + (joined ? 1 : 0), rsvpInView, 1400);
  const options = POLL_BASE.map((o, i) => ({ ...o, votes: o.votes + (voted === i ? 1 : 0) }));
  const totalVotes = options.reduce((s, o) => s + o.votes, 0);

  const dateStr = target.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });

  return (
    <section id="assemblies" className="relative border-t border-line bg-void px-5 py-24 sm:px-10 md:px-16 md:py-32">
      <div className="hud-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden />
      <div className="relative mx-auto max-w-7xl">
        <SectionHead
          index="§ 06"
          kicker="Народовластие"
          title="Великие Собрания"
          sub="Каждую субботу в 20:00 UTC Империя собирается на открытый форум: отчёты Казначейства, законопроекты, свободная трибуна. Голос гражданина равен голосу сенатора."
        />

        <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          {/* next assembly */}
          <Reveal>
            <div ref={rsvpRef} className="relative h-full border border-gold/30 bg-panel p-7 sm:p-8">
              <Corners />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-[11px] tracking-[0.3em] text-gold uppercase">Великое Собрание №149</p>
                <span className="flex items-center gap-2 border border-hyper/40 px-3 py-1 font-mono text-[10px] tracking-[0.2em] text-hyper uppercase">
                  <span className="inline-block h-1.5 w-1.5 animate-soft-pulse rounded-full bg-hyper" />
                  эфир открыт
                </span>
              </div>
              <h3 className="font-display mt-4 text-[clamp(1.4rem,2.6vw,2rem)] font-bold text-ink">
                Суббота, {dateStr} · 20:00 UTC
              </h3>
              <div className="mt-6">
                <Countdown target={target.getTime()} />
              </div>
              <p className="mt-6 mb-3 font-mono text-[10px] tracking-[0.25em] text-dim uppercase">Повестка</p>
              <ul className="space-y-2.5">
                {AGENDA.map((a, i) => (
                  <li key={a} className="flex items-start gap-3 text-[14px] text-mist">
                    <span className="mt-0.5 font-mono text-[11px] font-bold text-gold">{String(i + 1).padStart(2, "0")}</span>
                    {a}
                  </li>
                ))}
              </ul>
              <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
                <p className="font-mono text-[12px] text-mist">
                  Записалось: <span className="font-bold text-gold tabular-nums">{attendees}</span> граждан
                </p>
                <button
                  onClick={() => setJoined((j) => !j)}
                  className={`clip-notch px-6 py-3 font-mono text-[12px] font-bold tracking-[0.2em] uppercase transition-all duration-300 ${
                    joined
                      ? "border border-hyper/60 bg-hyper/10 text-hyper"
                      : "bg-gold text-[#171006] hover:bg-goldsoft hover:shadow-[0_0_34px_rgba(227,181,74,0.3)]"
                  }`}
                >
                  {joined ? "✓ Вы записаны" : "Участвовать"}
                </button>
              </div>
            </div>
          </Reveal>

          <div className="flex flex-col gap-6">
            {/* live poll */}
            <Reveal delay={80}>
              <div className="relative border border-line bg-panel p-6 sm:p-7">
                <p className="font-mono text-[10px] tracking-[0.3em] text-hyper uppercase">Идёт голосование · вопрос недели</p>
                <h4 className="font-display mt-2 text-[15px] font-semibold text-ink">
                  Где Императору провести летнюю резиденцию?
                </h4>
                <div className="mt-5 space-y-3">
                  {options.map((o, i) => {
                    const pct = Math.round((o.votes / totalVotes) * 100);
                    const isSel = voted === i;
                    return (
                      <button
                        key={o.label}
                        onClick={() => setVoted(i)}
                        disabled={voted !== null}
                        className={`relative block w-full overflow-hidden border p-3 text-left transition-all duration-300 ${
                          isSel ? "border-gold" : voted === null ? "border-line hover:border-gold/50" : "border-line opacity-70"
                        }`}
                      >
                        <span
                          className={`absolute inset-y-0 left-0 transition-all duration-700 ${isSel ? "bg-gold/15" : "bg-line/40"}`}
                          style={{ width: `${pct}%` }}
                          aria-hidden
                        />
                        <span className="relative flex items-center justify-between font-mono text-[12px]">
                          <span className={isSel ? "font-bold text-gold" : "text-mist"}>
                            {isSel && "✦ "}
                            {o.label}
                          </span>
                          <span className="text-ink tabular-nums">{pct}%</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-4 font-mono text-[10px] tracking-[0.2em] text-dim uppercase">
                  {voted === null ? "Один голос на гражданина · нажмите, чтобы отдать" : `Голос учтён · всего ${totalVotes.toLocaleString("ru-RU")} голосов`}
                </p>
              </div>
            </Reveal>

            {/* protocols */}
            <Reveal delay={140}>
              <div className="relative border border-line bg-panel p-6 sm:p-7">
                <p className="font-mono text-[10px] tracking-[0.3em] text-gold uppercase">Протоколы прошедших собраний</p>
                <div className="mt-4 divide-y divide-line/70">
                  {PROTOCOLS.map((pr) => {
                    const open = openProtocol === pr.no;
                    return (
                      <div key={pr.no}>
                        <button
                          onClick={() => setOpenProtocol(open ? null : pr.no)}
                          className="flex w-full items-center gap-3 py-3 text-left"
                          aria-expanded={open}
                        >
                          <span className="font-mono text-[11px] font-bold text-gold">№{pr.no}</span>
                          <span className={`flex-1 text-[13px] font-semibold transition-colors ${open ? "text-goldsoft" : "text-ink"}`}>
                            {pr.topic}
                          </span>
                          <span className="font-mono text-[10px] text-dim">{pr.date}</span>
                          <span className={`font-mono text-gold transition-transform duration-300 ${open ? "rotate-90" : ""}`}>›</span>
                        </button>
                        <div className={`grid transition-all duration-400 ease-out ${open ? "grid-rows-[1fr] pb-3" : "grid-rows-[0fr]"}`}>
                          <p className="overflow-hidden text-[12px] leading-relaxed text-mist">{pr.result}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
