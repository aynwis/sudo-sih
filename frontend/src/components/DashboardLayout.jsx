import { Outlet } from "react-router";
import IntroScene from "./IntroScene";
import SiteNav from "./SiteNav";
import "../styles/intro.css";

function DashboardLayout() {
  return (
    <>
      <SiteNav />
      <IntroScene />
      <Outlet />

      <footer className="bg-basalt text-bone-dim text-xs flex justify-between flex-wrap gap-2 px-6 py-6 border-t border-white/10">
        <span>MnSight — SIH 2026 · PS26009</span>
        <span>Single-state validation, honest scope</span>
      </footer>
    </>
  );
}

export default DashboardLayout;
