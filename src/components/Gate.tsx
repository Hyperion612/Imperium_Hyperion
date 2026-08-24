import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { REGIONS } from "../lib/data";
import { useEmpire } from "../lib/state";
import Reveal from "./Reveal";
import { Corners } from "./SectionHead";
import Crest from "./Crest";
import Flag from "./Flag";
import Starfield from "./Starfield";
import SyncPanel from "./SyncPanel";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Gate() {
  const { applyForCitizenship, login, notify, me } = useEmpire();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<"apply" | "login">("apply");

  // заявка
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [province, setProvince] = useState(params.get("prov") ?? "aurora");
  const [oath, setOath] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<{ appNo: string; email: string } | null>(null);

  // вход
  const [loginId, setLoginId] = useState("");
  const [loginPin, setLoginPin] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [shake, setShake] = useState(0);

  const submitApply = (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Имя — не менее 2 символов";
    if (!EMAIL_RE.test(email.trim())) next.email = "Укажите действительную почту";
    if (!/^\d{4,6}$/.test(pin)) next.pin = "PIN — от 4 до 6 цифр";
    if (pin2 !== pin) next.pin2 = "PIN-коды не совпадают";
    if (!oath) next.oath = "Присяга обязательна";
    setErrors(next);
    if (Object.keys(next).length) {
      setShake((s) => s + 1);
      return;
    }
    const res = applyForCitizenship(name, email, pin, province);
    if (!res.ok) {
      setErrors({ email: res.msg });
      setShake((s) => s + 1);
      return;
    }
    setDone({ appNo: res.appNo ?? "APP-0000", email: email.trim() });
    notify("Заявка передана Императору. Ожидайте письма.", "hyper");
  };

  const submitLogin = (e: FormEvent) => {
    e.preventDefault();
    const res = login(loginId, loginPin);
    if (!res.ok) {
      setLoginErr(res.msg);
      setShake((s) => s + 1);
      return;
    }
    setLoginErr("");
    notify(res.msg, "gold");
    navigate("/imperium");
  };

  const tab = (active: boolean) =>
    `flex-1 border-b-2 px-4 py-3 font-mono text-[12px] font-bold tracking-[0.2em] uppercase transition-all duration-300 ${
      active ? "border-gold text-gold" : "border-line text-dim hover:text-mist"
    }`;

  return (
    <div className="relative flex min-h-screen items-center overflow-hidden bg-void px-4 py-14 sm:px-8">
      <Starfield density={0.9} />
      <div className="hud-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/4 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full blur-[160px]"
        style={{ background: "radial-gradient(circle, rgba(227,181,74,0.1), transparent 65%)" }}
      />

      <div className="relative mx-auto w-full max-w-lg">
        <Reveal>
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="flex items-center gap-4">
              <Crest className="h-12 w-12 text-gold" />
              <div className="w-[58px] border border-gold/30">
                <Flag className="h-9 w-[58px]" />
              </div>
            </div>
            <h1 className="font-display mt-5 text-[clamp(1.5rem,4vw,2.2rem)] font-extrabold tracking-wide text-ink uppercase">
              Врата Империи
            </h1>
            <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-mist">
              Гражданство — по заявке, которую лично рассматривает Император. Вход в государство — по уникальному
              государственному ID и PIN-коду.
            </p>
          </div>
        </Reveal>

        {done ? (
          <Reveal>
            <div className="relative border border-hyper/40 bg-panel p-8 text-center">
              <Corners className="text-hyper/50" />
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-hyper/50 text-hyper">
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M4 12.5l5 5L20 6.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <h2 className="font-display mt-4 text-xl font-bold text-ink">Заявка принята в реестр</h2>
              <p className="mt-2 font-mono text-[13px] tracking-[0.2em] text-gold">№ {done.appNo}</p>
              <p className="mt-4 text-[13px] leading-relaxed text-mist">
                Прошение передано Императору. Как только оно будет одобрено, на почту{" "}
                <span className="font-mono text-hyper">{done.email}</span> придёт письмо с вашим уникальным ID вида{" "}
                <span className="font-mono text-gold">HPN-XXXXX</span>. С ним и вашим PIN-кодом вы войдёте в государство.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  onClick={() => {
                    setDone(null);
                    setMode("login");
                  }}
                  className="border border-line px-5 py-2.5 font-mono text-[11px] tracking-[0.2em] text-mist uppercase transition-colors hover:border-gold/50 hover:text-gold"
                >
                  Уже есть ID — войти
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="border border-line px-5 py-2.5 font-mono text-[11px] tracking-[0.2em] text-mist uppercase transition-colors hover:border-gold/50 hover:text-gold"
                >
                  Вернуться к планете
                </button>
              </div>
            </div>
          </Reveal>
        ) : (
          <Reveal delay={100}>
            <div key={shake ? `s${shake}` : "s0"} className={`relative border border-line bg-panel/90 backdrop-blur-sm ${shake ? "animate-shake" : ""}`}>
              <div className="flex">
                <button className={tab(mode === "apply")} onClick={() => setMode("apply")}>
                  Заявка на гражданство
                </button>
                <button className={tab(mode === "login")} onClick={() => setMode("login")}>
                  Вход по ID
                </button>
              </div>

              {mode === "apply" ? (
                <form onSubmit={submitApply} className="p-6 sm:p-7" noValidate>
                  <label className="block">
                    <span className="mb-1.5 block font-mono text-[10px] tracking-[0.2em] text-mist uppercase">Имя (никнейм) *</span>
                    <input className={`field ${errors.name ? "field-error" : ""}`} value={name} maxLength={24} onChange={(e) => setName(e.target.value)} placeholder="Как вас будут звать в Империи" />
                    {errors.name && <span className="mt-1.5 block font-mono text-[11px] text-ember">▲ {errors.name}</span>}
                  </label>
                  <label className="mt-4 block">
                    <span className="mb-1.5 block font-mono text-[10px] tracking-[0.2em] text-mist uppercase">Электронная почта *</span>
                    <input className={`field ${errors.email ? "field-error" : ""}`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Сюда придёт решение Императора" />
                    {errors.email && <span className="mt-1.5 block font-mono text-[11px] text-ember">▲ {errors.email}</span>}
                  </label>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="mb-1.5 block font-mono text-[10px] tracking-[0.2em] text-mist uppercase">PIN-код *</span>
                      <input className={`field font-mono ${errors.pin ? "field-error" : ""}`} type="password" inputMode="numeric" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="4–6 цифр" />
                      {errors.pin && <span className="mt-1.5 block font-mono text-[11px] text-ember">▲ {errors.pin}</span>}
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block font-mono text-[10px] tracking-[0.2em] text-mist uppercase">Повтор PIN *</span>
                      <input className={`field font-mono ${errors.pin2 ? "field-error" : ""}`} type="password" inputMode="numeric" maxLength={6} value={pin2} onChange={(e) => setPin2(e.target.value.replace(/\D/g, ""))} placeholder="Ещё раз" />
                      {errors.pin2 && <span className="mt-1.5 block font-mono text-[11px] text-ember">▲ {errors.pin2}</span>}
                    </label>
                  </div>
                  <label className="mt-4 block">
                    <span className="mb-1.5 block font-mono text-[10px] tracking-[0.2em] text-mist uppercase">Желаемая провинция</span>
                    <select className="field" value={province} onChange={(e) => setProvince(e.target.value)}>
                      {REGIONS.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} · {r.capital}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={`mt-4 flex cursor-pointer items-start gap-3 border p-3.5 transition-colors ${oath ? "border-gold/50 bg-panel2" : "border-line bg-abyss"} ${errors.oath ? "field-error" : ""}`}>
                    <input type="checkbox" checked={oath} onChange={(e) => setOath(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#e3b54a]" />
                    <span className="text-[12px] leading-relaxed text-mist">
                      Клянусь хранить Порядок, подчиняться Хартии и беречь свой государственный ID в тайне.
                    </span>
                  </label>
                  {errors.oath && <span className="mt-1.5 block font-mono text-[11px] text-ember">▲ {errors.oath}</span>}
                  <button type="submit" className="clip-notch mt-6 w-full bg-gold px-6 py-3.5 font-mono text-[13px] font-bold tracking-[0.25em] text-[#171006] uppercase transition-all duration-300 hover:bg-goldsoft hover:shadow-[0_0_40px_rgba(227,181,74,0.35)] active:translate-y-0.5">
                    Подать прошение Императору ✦
                  </button>
                  <p className="mt-3 text-center font-mono text-[10px] tracking-[0.15em] text-dim uppercase">
                    Пошлина 0 HY · решение принимает лично Император
                  </p>
                </form>
              ) : (
                <form onSubmit={submitLogin} className="p-6 sm:p-7" noValidate>
                  <label className="block">
                    <span className="mb-1.5 block font-mono text-[10px] tracking-[0.2em] text-mist uppercase">Государственный ID</span>
                    <input className="field font-mono tracking-[0.15em]" value={loginId} onChange={(e) => setLoginId(e.target.value.toUpperCase())} placeholder="HPN-XXXXX" />
                  </label>
                  <label className="mt-4 block">
                    <span className="mb-1.5 block font-mono text-[10px] tracking-[0.2em] text-mist uppercase">PIN-код</span>
                    <input className="field font-mono" type="password" inputMode="numeric" maxLength={6} value={loginPin} onChange={(e) => setLoginPin(e.target.value.replace(/\D/g, ""))} placeholder="••••" />
                  </label>
                  {loginErr && <p className="mt-3 border border-ember/40 bg-ember/10 px-3 py-2 font-mono text-[11px] text-ember">▲ {loginErr}</p>}
                  <button type="submit" className="clip-notch mt-6 w-full bg-gold px-6 py-3.5 font-mono text-[13px] font-bold tracking-[0.25em] text-[#171006] uppercase transition-all duration-300 hover:bg-goldsoft hover:shadow-[0_0_40px_rgba(227,181,74,0.35)] active:translate-y-0.5">
                    Войти в государство
                  </button>
                  <div className="mt-5 border-t border-line pt-4">
                    <p className="font-mono text-[9px] tracking-[0.25em] text-dim uppercase">
                      Демо-версия гражданства — посмотрите, что будет после одобрения:
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 font-mono text-[10px]">
                      <button
                        type="button"
                        onClick={() => { setLoginId("HPN-77777"); setLoginPin("1111"); }}
                        className="border border-line px-2.5 py-1.5 text-mist transition-colors hover:border-hyper/50 hover:text-hyper"
                      >
                        Гражданин Орион Вест · HPN-77777 / PIN 1111
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </Reveal>
        )}

        {!done && (
          <Reveal delay={180}>
            <div className="mt-6">
              <SyncPanel />
            </div>
          </Reveal>
        )}

        {me && (
          <p className="mt-5 text-center font-mono text-[11px] tracking-[0.2em] text-hyper uppercase">
            Сессия активна: {me.name} ·{" "}
            <button className="text-gold underline-offset-4 hover:underline" onClick={() => navigate("/imperium")}>
              вернуться в государство →
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
