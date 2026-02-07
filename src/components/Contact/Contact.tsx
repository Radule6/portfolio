import React, { useEffect, useRef, useState } from "react";
import { FiArrowUpRight, FiMail } from "react-icons/fi";
import { FaLinkedin, FaGithub } from "react-icons/fa6";

// Hoisted outside component — static data (rendering-hoist-jsx)
const socials = [
  { name: "GitHub", icon: FaGithub, href: "https://github.com/Radule6" },
  { name: "LinkedIn", icon: FaLinkedin, href: "https://www.linkedin.com/in/marko-radulovic6/" },
] as const;

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
        style={{ background: "radial-gradient(circle, #59FFCE 0%, #B7FF03 40%, transparent 70%)" }}
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
          className="font-display text-4xl sm:text-6xl lg:text-8xl font-extrabold tracking-tight text-text-primary leading-[0.95] mb-6 sm:mb-8"
          style={stagger(0.1)}
        >
          Let's build
          <br />
          <span className="gradient-text">something</span>
          <br />
          together
        </h2>

        <p
          className="font-body text-base sm:text-lg text-text-secondary max-w-lg leading-relaxed mb-10 sm:mb-14"
          style={stagger(0.2)}
        >
          Have a project in mind or want to discuss an opportunity? Drop me an
          email and I'll get back to you.
        </p>

        {/* Email CTA */}
        <div style={stagger(0.3)}>
          <a
            href="mailto:hello@radule.dev"
            className="group inline-flex items-center gap-3 sm:gap-4 font-display text-lg sm:text-xl lg:text-2xl font-semibold text-text-primary border border-border rounded-full px-6 sm:px-8 py-3 sm:py-4 hover:border-accent-lime hover:text-accent-lime transition-all duration-300"
          >
            <FiMail className="w-5 h-5 sm:w-6 sm:h-6" />
            hello@radule.dev
            <FiArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
          </a>
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
