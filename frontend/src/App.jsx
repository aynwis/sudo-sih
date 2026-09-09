import IntroScene from "./components/IntroScene";
import SiteNav from "./components/SiteNav";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import "./styles/intro.css";

function AppLayout({ children }) {
  return (
    <>
      <SiteNav />
      {children}
      <footer className="bg-basalt text-bone-dim text-xs flex justify-between flex-wrap gap-2 px-6 py-6 border-t border-white/10">
        <span>MnSight — SIH 2026 · PS26009</span>
        <span>Single-state validation, honest scope</span>
      </footer>
    </>
  );
}

function Dashboard() {
  return (
    <AppLayout>
      <IntroScene />
      <Home />
    </AppLayout>
  );
}

function App() {
  const page = window.location.pathname === "/" ? <Dashboard /> : <AppLayout><NotFound /></AppLayout>;
  return page;
}

export default App;
