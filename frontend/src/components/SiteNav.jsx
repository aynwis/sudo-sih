import { useEffect, useRef, useState } from "react";

const LINKS = [
  { id: "map", label: "Satellite map" },
  { id: "depth", label: "Model" },
  { id: "ledger", label: "Verify" },
  { id: "dashboard", label: "Live dashboard", cta: true },
];

// Always-visible nav with a sliding pill that tracks whichever section is
// currently in view, instead of a static highlight.
export default function SiteNav() {
  const [activeId, setActiveId] = useState(null);
  const [pillStyle, setPillStyle] = useState({ opacity: 0 });
  const linkRefs = useRef({});
  const containerRef = useRef(null);

  useEffect(() => {
    const targets = LINKS.map((l) => document.getElementById(l.id)).filter(Boolean);
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = activeId ? linkRefs.current[activeId] : null;
    const container = containerRef.current;
    if (!el || !container) {
      setPillStyle((s) => ({ ...s, opacity: 0 }));
      return;
    }
    const containerRect = container.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    setPillStyle({
      opacity: 1,
      width: rect.width,
      transform: `translateX(${rect.left - containerRect.left}px)`,
    });
  }, [activeId]);

  return (
    <nav className="site-nav">
      <a href="#top" className="nav-mark">
        MnSight <em>/ PS26009</em>
      </a>
      <div className="nav-links" ref={containerRef}>
        <span className="nav-pill" style={pillStyle} />
        {LINKS.map((link) => (
          <a
            key={link.id}
            href={`#${link.id}`}
            ref={(el) => (linkRefs.current[link.id] = el)}
            className={`${link.cta ? "cta" : ""} ${activeId === link.id ? "active" : ""}`}
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
