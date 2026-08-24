import { Component, useEffect, type ReactNode } from "react";
import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { EmpireProvider, Toasts } from "./lib/state";
import { LifeProvider } from "./lib/life";
import Landing from "./components/Landing";
import Gate from "./components/Gate";
import Dashboard from "./components/Dashboard";
import EmperorPanel from "./components/EmperorPanel";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/** Страж от белых экранов: любая ошибка рендера показывается явно. */
class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-void px-6">
          <div className="max-w-lg border border-ember/50 bg-panel p-10 text-center">
            <p className="font-mono text-[10px] tracking-[0.35em] text-ember uppercase">Сбой в ядре Империи</p>
            <h1 className="font-display mt-3 text-xl font-extrabold text-ink uppercase">Порядок временно нарушен</h1>
            <p className="mt-3 font-mono text-[12px] leading-relaxed break-all text-mist">{String(this.state.error)}</p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => {
                  this.setState({ error: null });
                  window.location.hash = "#/";
                  window.location.reload();
                }}
                className="bg-gold px-6 py-2.5 font-mono text-[11px] font-bold tracking-[0.2em] text-[#171006] uppercase"
              >
                Перезапустить ядро
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <EmpireProvider>
        <LifeProvider>
          <HashRouter>
            <ScrollToTop />
            <div className="relative min-h-screen bg-void font-body text-ink antialiased">
              <div className="noise-layer" aria-hidden />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/gate" element={<Gate />} />
                <Route path="/imperium" element={<Dashboard />} />
                <Route path="/emperor" element={<EmperorPanel />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <Toasts />
            </div>
          </HashRouter>
        </LifeProvider>
      </EmpireProvider>
    </ErrorBoundary>
  );
}
