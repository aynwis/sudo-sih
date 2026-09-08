import IntroScene from "./components/IntroScene";
import Home from "./pages/Home";

function App() {
  return (
    <>
      <IntroScene />
      <Home />
      <footer className="bg-slate-950 text-slate-500 text-xs flex justify-between flex-wrap gap-2 px-6 py-6 border-t border-slate-800">
        <span>MnSight — SIH 2026 · PS26009</span>
        <span>Single-state validation, honest scope</span>
      </footer>
    </>
  );
}

export default App;
