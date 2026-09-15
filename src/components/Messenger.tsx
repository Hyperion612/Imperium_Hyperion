import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmpire } from "../lib/state";
import { Corners } from "./SectionHead";
import Crest from "./Crest";
import Flag from "./Flag";

const MESSENGER_URL = "https://hyperion612.github.io/Messenger_Imperium-Link/";

export default function Messenger() {
  const { me } = useEmpire();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!me) return;
    const timer = window.setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          window.clearInterval(timer);
          window.location.href = MESSENGER_URL;
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [me]);

  if (!me) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-void px-4">
        <div className="max-w-md border border-ember/40 bg-panel p-10 text-center">
          <Crest className="mx-auto h-12 w-12 text-ember" />
          <h1 className="font-display mt-4 text-xl font-extrabold tracking-wide text-ink uppercase">
            Доступ только для граждан
          </h1>
          <p className="mt-3 text-[13px] leading-relaxed text-mist">
            Мессенджер Империи доступен только гражданам с оформленным паспортом.
          </p>
          <button
            onClick={() => navigate("/gate")}
            className="clip-notch mt-6 bg-gold px-6 py-3 font-mono text-[12px] font-bold tracking-[0.2em] text-[#171006] uppercase"
          >
            Войти в государство
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-void">
      <div className="hud-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full blur-[150px]"
        style={{ background: "radial-gradient(circle, rgba(87,221,196,0.08), transparent 65%)" }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-5 py-16">
        <div className="w-full">
          {/* Заголовок */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-4">
              <Crest className="h-12 w-12 text-gold" />
              <div className="w-[70px] border border-gold/40">
                <Flag className="h-11 w-[70px]" />
              </div>
            </div>
            <h1 className="font-display mt-6 text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold tracking-wide text-ink uppercase">
              Империум Линк
            </h1>
            <p className="mt-2 font-mono text-[11px] tracking-[0.3em] text-hyper uppercase">
              Государственный мессенджер Империи Гиперион
            </p>
          </div>

          {/* Карточка перехода */}
          <div className="relative border border-hyper/30 bg-panel p-8">
            <Corners className="text-hyper/50" />

            <div className="grid gap-6 md:grid-cols-[1fr_auto]">
              <div>
                <p className="font-mono text-[10px] tracking-[0.3em] text-dim uppercase">
                  Гражданин
                </p>
                <p className="mt-1 text-[15px] font-bold text-ink">{me.name}</p>
                <p className="font-mono text-[11px] text-hyper">{me.id}</p>

                <div className="mt-5 grid grid-cols-2 gap-3 font-mono text-[11px]">
                  <div className="border border-line bg-abyss px-3 py-2">
                    <p className="text-[9px] tracking-[0.2em] text-dim uppercase">Ранг</p>
                    <p className="mt-0.5 font-bold text-gold">{me.rank.toUpperCase()}</p>
                  </div>
                  <div className="border border-line bg-abyss px-3 py-2">
                    <p className="text-[9px] tracking-[0.2em] text-dim uppercase">Свет</p>
                    <p className="mt-0.5 font-bold text-gold">{me.light}</p>
                  </div>
                  <div className="border border-line bg-abyss px-3 py-2">
                    <p className="text-[9px] tracking-[0.2em] text-dim uppercase">HYPER</p>
                    <p className="mt-0.5 font-bold text-hyper">{me.hyper.toLocaleString("ru-RU")}</p>
                  </div>
                  <div className="border border-line bg-abyss px-3 py-2">
                    <p className="text-[9px] tracking-[0.2em] text-dim uppercase">Провинция</p>
                    <p className="mt-0.5 truncate font-bold text-ink">{me.province.toUpperCase()}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center gap-4">
                <div className="relative flex h-24 w-24 items-center justify-center border-2 border-hyper/50">
                  <span className="font-display text-3xl font-extrabold text-hyper tabular-nums">
                    {countdown}
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-0 animate-soft-pulse border border-hyper/30"
                  />
                </div>
                <p className="font-mono text-[10px] tracking-[0.2em] text-dim uppercase">
                  Переход через
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-line pt-5">
              <p className="text-[13px] leading-relaxed text-mist">
                Мессенджер Империи — официальное средство связи цифрового государства.
                Киберпанк и имперский неоклассицизм: личные чаты, групповые каналы,
                голосовые сообщения, переводы HYPER, админ-панель для сенаторов.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={MESSENGER_URL}
                  className="clip-notch bg-hyper px-6 py-3 font-mono text-[12px] font-bold tracking-[0.2em] text-[#04211c] uppercase transition-all hover:brightness-110"
                >
                  Открыть мессенджер →
                </a>
                <button
                  onClick={() => navigate("/imperium")}
                  className="border border-line px-6 py-3 font-mono text-[11px] tracking-[0.18em] text-mist uppercase transition-colors hover:border-gold/60 hover:text-gold"
                >
                  Вернуться в государство
                </button>
              </div>
            </div>
          </div>

          {/* Возможности мессенджера */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { t: "Личные чаты", d: "Приватные беседы 1-на-1 с шифрованием" },
              { t: "Групповые каналы", d: "До 1000 участников, модерация" },
              { t: "Голосовые", d: "Запись и волновой плеер" },
              { t: "Переводы HYPER", d: "Через Казначейство Империи" },
              { t: "ИИ-ОКО", d: "Автомодерация запрещённых слов" },
              { t: "Админ-панель", d: "Для сенаторов и Императора" },
            ].map((f) => (
              <div key={f.t} className="border border-line bg-panel/60 p-4">
                <p className="font-mono text-[11px] font-bold tracking-[0.15em] text-gold uppercase">
                  {f.t}
                </p>
                <p className="mt-1 text-[12px] text-mist">{f.d}</p>
              </div>
            ))}
          </div>

          {/* Данные для входа */}
          <div className="mt-6 border border-dashed border-line bg-panel/30 p-5">
            <p className="font-mono text-[10px] tracking-[0.3em] text-dim uppercase">
              Демо-вход в мессенджер
            </p>
            <div className="mt-3 flex flex-wrap gap-4 font-mono text-[12px]">
              <div>
                <span className="text-dim">Гиперион-ID: </span>
                <span className="text-hyper">HIT-77777</span>
              </div>
              <div>
                <span className="text-dim">Пароль: </span>
                <span className="text-hyper">hyperion</span>
              </div>
              <div>
                <span className="text-dim">Ранг: </span>
                <span className="text-gold">СЕНАТОР</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
