import React, { useEffect, useRef, useState, useCallback } from "react";
import { FiArrowUpRight, FiMail, FiCheck } from "react-icons/fi";
import { FiCopy } from "react-icons/fi";
import { FaLinkedin, FaGithub } from "react-icons/fa6";
import MagneticWrap from "../MagneticWrap/MagneticWrap";

// Hoisted outside component — static data (rendering-hoist-jsx)
const EMAIL = "hello@radule.dev";

const socials = [
  { name: "GitHub", icon: FaGithub, href: "https://github.com/Radule6" },
  { name: "LinkedIn", icon: FaLinkedin, href: "https://www.linkedin.com/in/marko-radulovic6/" },
] as const;

const CopyEmailButton: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(false);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const startTimers = useCallback(() => {
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    copiedTimerRef.current = setTimeout(() => {
      if (mountedRef.current) setCopied(false);
    }, 2000);
    toastTimerRef.current = setTimeout(() => {
      if (mountedRef.current) setToast(false);
    }, 2500);
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = EMAIL;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    if (!mountedRef.current) return;
    setCopied(true);
    setToast(true);
    startTimers();
  }, [startTimers]);

  return (
    <>
      <button
        onClick={handleCopy}
        className={`group flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full border transition-all duration-300 ${
          copied
            ? "border-accent-lime text-accent-lime"
            : "border-border text-text-secondary hover:border-border-hover hover:text-text-primary"
        }`}
        aria-label="Copy email to clipboard"
      >
        <span className="relative w-5 h-5">
          <FiCopy
            className={`absolute inset-0 w-5 h-5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              copied ? "opacity-0 scale-75 rotate-12" : "opacity-100 scale-100 rotate-0"
            }`}
          />
          <FiCheck
            className={`absolute inset-0 w-5 h-5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              copied ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-75 -rotate-12"
            }`}
          />
        </span>
      </button>

      {/* Toast notification */}
      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[90] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          toast
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-2.5 px-5 py-3 rounded-full bg-surface-raised border border-border shadow-lg shadow-black/20 backdrop-blur-sm">
          <FiCheck className="w-4 h-4 text-accent-lime" />
          <span className="font-body text-sm text-text-primary">
            Email copied to clipboard
          </span>
        </div>
      </div>
    </>
  );
};

const Contact: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const stagger = (delay: number) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(25px)",
    transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
  });

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative bg-surface px-6 sm:px-10 lg:px-16 py-20 sm:py-28 lg:py-36 overflow-hidden"
      aria-label="Contact"
    >
      {/* Noise texture */}
      <div className="hero-noise absolute inset-0 pointer-events-none z-[2]" aria-hidden="true" />

      {/* Grid lines */}
      <div className="hero-grid absolute inset-0 pointer-events-none" aria-hidden="true" />

      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-[0.03] blur-[160px] pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--gradient-start) 0%, var(--gradient-mid) 40%, transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-5xl">
        {/* Section label */}
        <div className="flex items-center gap-4 mb-4" style={stagger(0)}>
          <span className="font-body text-xs sm:text-sm tracking-[0.3em] uppercase text-text-muted">
            03
          </span>
          <div className="h-px w-12 bg-border" aria-hidden="true" />
          <span className="font-body text-xs sm:text-sm tracking-[0.3em] uppercase text-text-secondary">
            Get in Touch
          </span>
        </div>

        {/* Headline */}
        <h2
          className="font-display text-[11vw] sm:text-[7.5vw] lg:text-[5vw] font-800 leading-[1.05] tracking-[-0.03em] text-text-primary mb-6 sm:mb-8"
          style={stagger(0.1)}
        >
          Let&apos;s build<br /><span className="gradient-text">something</span><br />together
        </h2>

        <p
          className="font-body text-base sm:text-lg text-text-secondary max-w-lg leading-relaxed mb-10 sm:mb-14"
          style={stagger(0.2)}
        >
          Have a project in mind or want to discuss an opportunity? Drop me an email and I&apos;ll get back to you.
        </p>

        {/* Email CTA */}
        <div className="flex flex-wrap items-center gap-3" style={stagger(0.3)}>
          <MagneticWrap strength={0.2}>
            <a
              href={`mailto:${EMAIL}`}
              className="group inline-flex items-center gap-3 sm:gap-4 font-display text-lg sm:text-xl lg:text-2xl font-600 text-text-primary border border-border rounded-full px-6 sm:px-8 py-3 sm:py-4 hover:border-accent-lime hover:text-accent-lime transition-all duration-300"
            >
              <FiMail className="w-5 h-5 sm:w-6 sm:h-6" />
              {EMAIL}
              <FiArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
            </a>
          </MagneticWrap>
          <CopyEmailButton />
        </div>

        {/* Social links */}
        <div
          className="mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-border"
          style={stagger(0.4)}
        >
          <nav aria-label="Social links">
            <ul className="flex gap-4">
              {socials.map((social) => (
                <li key={social.name}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 font-body text-sm text-text-secondary hover:text-text-primary border border-border hover:border-border-hover rounded-full px-4 py-2 transition-all duration-300"
                    aria-label={`Visit ${social.name}`}
                  >
                    <social.icon className="w-4 h-4" />
                    {social.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
};

export default Contact;
