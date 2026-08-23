import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

declare global {
  interface Window {
    __HYPERION_BOOT__?: boolean;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);

// Сообщаем прелоадеру, что ядро запущено, и плавно убираем его
window.__HYPERION_BOOT__ = true;
const boot = document.getElementById("hyperion-boot");
if (boot) {
  boot.style.transition = "opacity 0.6s ease";
  boot.style.opacity = "0";
  window.setTimeout(() => boot.remove(), 650);
}
