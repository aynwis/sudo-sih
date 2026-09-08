import IntroScene from "./components/IntroScene";
import SiteNav from "./components/SiteNav";
import Home from "./pages/Home";
import "./styles/intro.css";

function App() {
  return (
    <>
      <SiteNav />
      <IntroScene />
      <Home />
      <footer className="bg-basalt text-bone-dim text-xs flex justify-between flex-wrap gap-2 px-6 py-6 border-t border-white/10">
        <span>MnSight — SIH 2026 · PS26009</span>
        <span>Single-state validation, honest scope</span>
      </footer>
    </>
  );
}

export default App;
