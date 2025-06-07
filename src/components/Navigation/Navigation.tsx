// src/components/Navigation/Navigation.tsx

import React, { useState } from "react";
import { BiArrowToRight } from "react-icons/bi";
import { FiMenu, FiX } from "react-icons/fi";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Blog", href: "/blog" },
];

const Navigation: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header>
      <nav
        className="sticky top-0 w-full flex items-center justify-between px-10 py-6 backdrop-blur rounded-b-4xl bg-nav-background z-50"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 z-100" aria-label="Go to homepage">
          <span className="font-extrabold text-2xl md:text-4xl lg:text-5xl tracking-wide text-black font-display">
            RADULE.DEV
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <ul className="hidden md:flex items-center gap-6 md:gap-8 font-display font-medium">
          {navLinks.map((link) => (
            <li key={link.name}>
              <a
                href={link.href}
                className="relative group text-base md:text-lg lg:text-xl font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition"
              >
                <span className="block transition-opacity duration-500 group-hover:opacity-0">
                  {link.name}
                </span>
                <span className="gradient-text absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  {link.name}
                </span>
              </a>
            </li>
          ))}
          <li>
            <a
              href="/start-project"
              className="flex items-center text-base md:text-lg lg:text-xl gap-2 border-2 border-black rounded-full px-3 py-1"
              role="button"
              aria-label="Start a new project"
            >
              <BiArrowToRight
                className="align-middle relative -bottom-[1px]"
                aria-hidden="true"
              />
              Start Project
            </a>
          </li>
        </ul>

        {/* Hamburger Menu Button (Mobile) */}
        <button
          className="md:hidden p-2 z-100"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <FiX size={32} /> : <FiMenu size={32} />}
        </button>
        

        {/* Mobile Fullscreen Menu Overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center h-screen font-display">
            <ul className="flex flex-col gap-8 items-center">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-black text-4xl"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="/start-project"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 text-black text-4xl border-2 border-black rounded-full px-4 py-2"
                  role="button"
                  aria-label="Start a new project"
                >
                  <BiArrowToRight
                    className="align-middle relative -bottom-[1px]"
                    aria-hidden="true"
                  />
                  Start Project
                </a>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navigation;