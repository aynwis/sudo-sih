import { BrowserRouter, Route, Routes } from "react-router";
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
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route
          path="*"
          element={
            <AppLayout>
              <NotFound />
            </AppLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
