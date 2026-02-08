import React, { useState, useEffect, useCallback, useRef } from "react";
import { FiArrowUpRight } from "react-icons/fi";
import ThemeToggle from "../ThemeToggle/ThemeToggle";

// Hoisted outside component — static data (rendering-hoist-jsx)
const navLinks = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Projects", href: "#projects" },
] as const;

const SCROLL_THRESHOLD = 50;

const Navigation: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const scrollRaf = useRef<number | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const onScroll = () => {
      if (scrollRaf.current != null) return;
      scrollRaf.current = requestAnimationFrame(() => {
        setScrolled(window.scrollY > SCROLL_THRESHOLD);
        scrollRaf.current = null;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollRaf.current != null) cancelAnimationFrame(scrollRaf.current);
    };
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    if (mobileOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  // Focus management: move focus into overlay on open
  useEffect(() => {
    if (mobileOpen && firstLinkRef.current) {
      firstLinkRef.current.focus();
    }
  }, [mobileOpen]);

  // Close on Escape + focus trap when menu is open
  useEffect(() => {
    if (!mobileOpen) return;
    const overlay = document.getElementById("mobile-nav-overlay");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        return;
      }
      if (e.key === "Tab" && overlay) {
        const focusable = overlay.querySelectorAll<HTMLElement>(
          'a[href], button, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const closeMenu = useCallback(() => setMobileOpen(false), []);

  return (
    <>
      {/* ─── Top bar ─── */}
      <header className="fixed top-0 left-0 right-0 z-[70]">
        <nav
          className={`flex items-center justify-between px-6 sm:px-10 lg:px-16 py-4 sm:py-5 border-b transition-[background-color,backdrop-filter,border-color] duration-500 ${
            scrolled && !mobileOpen
              ? "bg-nav-background backdrop-blur-xl border-border/20"
              : "bg-transparent border-transparent"
          }`}
          aria-label="Main navigation"
        >
          {/* Logo */}
          <a href="#home" className="relative z-[70]" aria-label="Go to homepage">
            <span className="font-display font-800 text-xl sm:text-2xl lg:text-3xl tracking-tight text-text-primary">
              RADULE
              <span className="gradient-text">.DEV</span>
            </span>
          </a>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-8 lg:gap-10">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className="relative group font-body text-sm lg:text-base font-500 tracking-wide uppercase text-text-secondary hover:text-text-primary transition-colors duration-300"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 h-px w-0 group-hover:w-full bg-accent-lime transition-all duration-300" aria-hidden="true" />
                </a>
              </li>
            ))}
            <li>
              <a
                href="#contact"
                className="group flex items-center gap-2 font-body text-sm lg:text-base font-500 tracking-wide px-5 py-2 rounded-full border border-border hover:border-accent-lime text-text-primary hover:text-accent-lime transition-all duration-300"
                aria-label="Start a new project"
              >
                Start Project
                <FiArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" aria-hidden="true" />
              </a>
            </li>
            <li>
              <ThemeToggle />
            </li>
          </ul>

          {/* ─── Hamburger button (inside nav for proper vertical alignment) ─── */}
          <button
            ref={menuButtonRef}
            aria-controls="mobile-nav-overlay"
            className="md:hidden relative z-[70] p-2 -mr-2 text-text-primary"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            <span className="relative block w-6 h-6">
              <span
                className={`absolute left-0 block w-6 h-[2px] bg-current transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  mobileOpen
                    ? "top-[11px] rotate-45"
                    : "top-[5px] rotate-0"
                }`}
              />
              <span
                className={`absolute left-0 top-[11px] block w-6 h-[2px] bg-current transition-opacity duration-200 ${
                  mobileOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 block w-6 h-[2px] bg-current transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  mobileOpen
                    ? "top-[11px] -rotate-45"
                    : "top-[17px] rotate-0"
                }`}
              />
            </span>
          </button>
        </nav>
      </header>

      {/* ─── Mobile fullscreen overlay ─── */}
      <div
        id="mobile-nav-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={`fixed inset-0 z-[60] bg-surface md:hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!mobileOpen}
      >
        {/* Decorative gradient orb in the background */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[400px] max-h-[400px] rounded-full bg-[radial-gradient(circle,rgba(89,255,206,0.08)_0%,rgba(183,255,3,0.04)_40%,transparent_70%)] blur-[80px] transition-all duration-700 ${
            mobileOpen ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
          aria-hidden="true"
        />

        <nav aria-label="Mobile navigation" className="relative flex flex-col items-center justify-center h-full px-6">
          <ul className="flex flex-col items-center gap-6 sm:gap-8">
            {navLinks.map((link, i) => (
              <li
                key={link.name}
                className="overflow-hidden"
                style={{
                  opacity: mobileOpen ? 1 : 0,
                  transform: mobileOpen ? "translateY(0)" : "translateY(32px)",
                  transition: `opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${0.12 + i * 0.07}s, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${0.12 + i * 0.07}s`,
                }}
              >
                <a
                  href={link.href}
                  ref={i === 0 ? firstLinkRef : undefined}
                  onClick={closeMenu}
                  className="block font-display text-2xl sm:text-3xl font-800 text-text-primary tracking-tight hover:text-accent-lime active:text-accent-lime transition-colors duration-200 uppercase"
                >
                  {link.name}
                </a>
              </li>
            ))}

            {/* Divider line */}
            <li
              aria-hidden="true"
              style={{
                opacity: mobileOpen ? 1 : 0,
                transform: mobileOpen ? "scaleX(1)" : "scaleX(0)",
                transition: `opacity 0.4s ease ${0.12 + navLinks.length * 0.07}s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${0.12 + navLinks.length * 0.07}s`,
              }}
            >
              <span className="block w-16 h-px bg-border" />
            </li>

            <li
              style={{
                opacity: mobileOpen ? 1 : 0,
                transform: mobileOpen ? "translateY(0)" : "translateY(32px)",
                transition: `opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${0.12 + (navLinks.length + 1) * 0.07}s, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${0.12 + (navLinks.length + 1) * 0.07}s`,
              }}
            >
              <a
                href="#contact"
                onClick={closeMenu}
                className="inline-flex items-center gap-2 font-body text-base sm:text-lg font-500 px-6 py-3 rounded-full border border-border text-text-primary hover:border-accent-lime hover:text-accent-lime active:border-accent-lime active:text-accent-lime transition-all duration-300"
                aria-label="Start a new project"
              >
                Start Project
                <FiArrowUpRight className="w-5 h-5" aria-hidden="true" />
              </a>
            </li>

            <li
              style={{
                opacity: mobileOpen ? 1 : 0,
                transform: mobileOpen ? "translateY(0)" : "translateY(32px)",
                transition: `opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${0.12 + (navLinks.length + 2) * 0.07}s, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${0.12 + (navLinks.length + 2) * 0.07}s`,
              }}
            >
              <ThemeToggle />
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Navigation;
