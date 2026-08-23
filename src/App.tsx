import { useState } from "react";
import Nav from "./components/Nav";
import PlanetIntro from "./components/PlanetIntro";
import Constitution from "./components/Constitution";
import Passport from "./components/Passport";
import Economy from "./components/Economy";
import Ranks from "./components/Ranks";
import Assemblies from "./components/Assemblies";
import Community from "./components/Community";
import Footer from "./components/Footer";

export default function App() {
  const [preferredRegion, setPreferredRegion] = useState("aurora");

  return (
    <div className="relative min-h-screen bg-void font-body text-ink antialiased">
      <div className="noise-layer" aria-hidden />
      <Nav />
      <main>
        <PlanetIntro onSettle={setPreferredRegion} />
        <Constitution />
        <Passport preferredRegion={preferredRegion} />
        <Economy />
        <Ranks />
        <Assemblies />
        <Community />
      </main>
      <Footer />
    </div>
  );
}
