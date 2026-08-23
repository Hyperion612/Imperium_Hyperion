import { useEffect } from "react";
import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { EmpireProvider, Toasts } from "./lib/state";
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

export default function App() {
  return (
    <EmpireProvider>
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
    </EmpireProvider>
  );
}
