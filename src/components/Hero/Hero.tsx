"use client";


import React, { useEffect, useRef, useState } from "react";
import { FiArrowDown } from "react-icons/fi";
import MagneticWrap from "../MagneticWrap/MagneticWrap";

const LERP_FACTOR = 0.04;
const FADE_DISTANCE = 600;
const PARALLAX_FACTOR = 0.25;

const Hero: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const mousePos = useRef({ x: 0.5, y: 0.5 });
  const orbPos = useRef({ x: 0.5, y: 0.5 });
  const rafId = useRef<number>(0);

  // Scroll tracking
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Smooth mouse-following orb with lerp — handler stored in ref to avoid
  // re-attaching the listener on every render (advanced-event-handler-refs)
  const handleMouseMoveRef = useRef((e: MouseEvent) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    mousePos.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  });

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const handler = handleMouseMoveRef.current;
    el.addEventListener("mousemove", handler);

    const animate = () => {
      orbPos.current.x += (mousePos.current.x - orbPos.current.x) * LERP_FACTOR;
      orbPos.current.y += (mousePos.current.y - orbPos.current.y) * LERP_FACTOR;

      if (orbRef.current) {
        orbRef.current.style.transform = `translate(${orbPos.current.x * 100 - 50}%, ${orbPos.current.y * 100 - 50}%)`;
      }
      rafId.current = requestAnimationFrame(animate);
    };
    rafId.current = requestAnimationFrame(animate);

    return () => {
      el.removeEventListener("mousemove", handler);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  const scrollFade = Math.max(0, 1 - scrollY / FADE_DISTANCE);
  const scrollPush = scrollY * PARALLAX_FACTOR;

  return (
    <section
      id="home"
      ref={sectionRef}
      className="hero-section relative min-h-screen flex flex-col overflow-hidden bg-surface"
      aria-label="Hero introduction"
    >
      {/* ═══ Noise texture overlay ═══ */}
      <div className="hero-noise absolute inset-0 pointer-events-none z-[2]" aria-hidden="true" />

      {/* ═══ Grid lines background ═══ */}
      <div className="hero-grid absolute inset-0 pointer-events-none" aria-hidden="true" />

      {/* ═══ Cursor-following gradient orb ═══ */}
      <div
        ref={orbRef}
        className="hero-orb absolute pointer-events-none z-[1]"
        style={{ left: "50%", top: "50%" }}
        aria-hidden="true"
      />

      {/* ═══ Content container ═══ */}
      <div
        className="relative z-10 w-full flex-1"
        style={{
          opacity: scrollFade,
          transform: `translateY(${-scrollPush}px)`,
        }}
      >
        {/* ─── Centered hero content ─── */}
        <div className="flex flex-col items-center justify-center min-h-screen px-6 sm:px-10 lg:px-16">
          <div className="max-w-[900px] mx-auto text-center">
            {/* Name + role label */}
            <div className="hero-stagger-1 flex items-center justify-center gap-3 mb-8 sm:mb-10">
              <div className="h-px w-8 sm:w-12 bg-accent-lime/40" aria-hidden="true" />
              <span className="font-body text-xs sm:text-sm tracking-[0.3em] uppercase text-text-secondary">
                Marko Radulovic · Full-Stack Engineer · Zagreb, Croatia · Remote
              </span>
              <div className="h-px w-8 sm:w-12 bg-accent-lime/40" aria-hidden="true" />
            </div>

            {/* Main headline */}
            <h1 className="hero-stagger-4 font-display text-[11vw] sm:text-[7.5vw] lg:text-[5vw] font-800 leading-[1.05] tracking-[-0.03em] text-text-primary mb-6 sm:mb-8">
              I build <span className="gradient-text">AI‑powered</span> web applications
            </h1>

            {/* Description */}
            <p className="hero-stagger-5 font-body text-base sm:text-lg lg:text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto mb-10 sm:mb-14">
              Full-stack engineer specializing in RAG systems, agentic AI, and data-driven products — from React frontends to Python backends and AWS infrastructure.
            </p>

            {/* CTAs */}
            <div className="hero-stagger-6 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-8 sm:mb-10">
              <MagneticWrap strength={0.25}>
                <a
                  href="#contact"
                  className="group inline-flex items-center gap-2.5 font-body text-sm sm:text-base font-500 tracking-wide gradient-bg text-surface rounded-full px-7 py-3 hover:opacity-90 transition-opacity duration-300"
                >
                  Let&apos;s work together
                  <span className="w-1.5 h-1.5 rounded-full bg-surface/30" aria-hidden="true" />
                </a>
              </MagneticWrap>
              <MagneticWrap strength={0.25}>
                <a
                  href="#projects"
                  className="group inline-flex items-center gap-2.5 font-body text-sm sm:text-base font-500 tracking-wide text-text-primary border border-border rounded-full px-7 py-3 hover:border-accent-lime hover:text-accent-lime transition-all duration-300"
                >
                  View projects
                </a>
              </MagneticWrap>
            </div>

            {/* Availability badge */}
            <div className="hero-stagger-6 flex items-center justify-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-60 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-green" />
              </span>
              <span className="font-body text-xs sm:text-sm tracking-[0.15em] uppercase text-text-secondary">
                Available for projects
              </span>
            </div>
          </div>
        </div>

        {/* ─── Scroll indicator ─── */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 hero-stagger-6">
          <a
            href="#projects"
            className="group flex flex-col items-center gap-2"
            aria-label="Scroll to projects"
          >
            <div className="hero-scroll-arrow w-10 h-10 rounded-full border border-border group-hover:border-accent-lime flex items-center justify-center transition-all duration-300">
              <FiArrowDown className="w-4 h-4 text-text-muted group-hover:text-accent-lime transition-colors duration-300" />
            </div>
          </a>
        </div>

      </div>
    </section>
  );
};

export default Hero;
