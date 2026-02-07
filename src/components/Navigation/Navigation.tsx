import React, { useState, useEffect, useCallback, useRef } from "react";
import { FiArrowUpRight, FiMenu, FiX } from "react-icons/fi";

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

  // Focus management: move focus into overlay on open, restore on close
  useEffect(() => {
    if (mobileOpen && firstLinkRef.current) {
      firstLinkRef.current.focus();
    } else if (!mobileOpen && menuButtonRef.current) {
      menuButtonRef.current.focus();
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
      <header className="fixed top-0 left-0 right-0 z-50">
        <nav
          className={`flex items-center justify-between px-6 sm:px-10 lg:px-16 py-4 sm:py-5 transition-all duration-500 ${
            scrolled && !mobileOpen
              ? "bg-nav-background backdrop-blur-xl border-b border-border"
              : "bg-transparent"
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
          </ul>

          {/* Spacer so desktop layout isn't affected */}
          <div className="md:hidden w-10" aria-hidden="true" />
        </nav>
      </header>

      {/* ─── Hamburger button (own stacking context, above overlay) ─── */}
      <button
        ref={menuButtonRef}
        aria-controls="mobile-nav-overlay"
        className="md:hidden fixed top-4 right-6 sm:right-10 z-[70] p-2 text-text-primary"
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((prev) => !prev)}
      >
        {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* ─── Mobile fullscreen overlay (sibling, not nested) ─── */}
      <div
        id="mobile-nav-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={`fixed inset-0 z-[60] bg-surface md:hidden transition-opacity duration-400 ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!mobileOpen}
      >
        <nav aria-label="Mobile navigation" className="flex flex-col items-center justify-center h-full px-6">
          <ul className="flex flex-col items-center gap-8">
            {navLinks.map((link, i) => (
              <li
                key={link.name}
                style={{
                  opacity: mobileOpen ? 1 : 0,
                  transform: mobileOpen ? "translateY(0)" : "translateY(24px)",
                  transition: `opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${0.15 + i * 0.06}s, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${0.15 + i * 0.06}s`,
                }}
              >
                <a
                  href={link.href}
                  ref={i === 0 ? firstLinkRef : undefined}
                  onClick={closeMenu}
                  className="font-display text-4xl sm:text-5xl font-800 text-text-primary tracking-tight hover:text-accent-lime transition-colors duration-200 uppercase"
                >
                  {link.name}
                </a>
              </li>
            ))}
            <li
              style={{
                opacity: mobileOpen ? 1 : 0,
                transform: mobileOpen ? "translateY(0)" : "translateY(24px)",
                transition: `opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.4s, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.4s`,
              }}
            >
              <a
                href="#contact"
                onClick={closeMenu}
                className="inline-flex items-center gap-2 font-body text-lg font-500 px-6 py-3 rounded-full border border-border text-text-primary hover:border-accent-lime hover:text-accent-lime transition-all duration-300"
                aria-label="Start a new project"
              >
                Start Project
                <FiArrowUpRight className="w-5 h-5" aria-hidden="true" />
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Navigation;
