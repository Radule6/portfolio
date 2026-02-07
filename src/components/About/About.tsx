import React, { useEffect, useRef, useState } from "react";

// Hoisted outside component — static data (rendering-hoist-jsx)
const techStack = [
  {
    label: "Frontend",
    items: ["React", "TypeScript", "HighCharts", "Tailwind CSS"],
  },
  {
    label: "Backend",
    items: ["Python", "FastAPI", "Node.js", "PostgreSQL", "Supabase"],
  },
  {
    label: "AI / Data",
    items: ["RAG", "LLMs", "OpenAI API", "Vector DBs", "Embeddings", "MCP"],
  },
  {
    label: "Cloud & Tools",
    items: ["AWS", "Git", "CI/CD", "Docker"],
  },
] as const;

const About: React.FC = () => {
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

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative bg-surface px-6 sm:px-10 lg:px-16 py-20 sm:py-28 lg:py-36"
      aria-label="About me"
    >
      {/* Section header */}
      <div
        className="flex items-center gap-4 mb-4"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0s",
        }}
      >
        <span className="font-body text-xs sm:text-sm tracking-[0.3em] uppercase text-text-muted">
          01
        </span>
        <div className="h-px w-12 bg-border" aria-hidden="true" />
        <span className="font-body text-xs sm:text-sm tracking-[0.3em] uppercase text-text-secondary">
          About
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        {/* Left column: narrative */}
        <div>
          <h2
            className="font-display text-4xl sm:text-5xl lg:text-7xl font-800 tracking-tight text-text-primary mb-8 sm:mb-10"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(30px)",
              transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s",
            }}
          >
            About Me
          </h2>

          <p
            className="font-body text-base sm:text-lg text-text-secondary leading-relaxed mb-5"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s",
            }}
          >
            I'm a full-stack engineer building AI-powered data products for
            fintech. I specialize in RAG systems, agentic AI integrations, and
            production deployments across React, Python, and AWS — taking
            projects from architecture to deployment.
          </p>

          <p
            className="font-body text-base sm:text-lg text-text-secondary leading-relaxed"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s",
            }}
          >
            Currently at Exante Data, I build RAG-based search systems and
            automated reporting tools for institutional clients in financial
            analytics. Previously, I built real-time charting platforms and
            embeddable widget systems at MarketReader. Outside of my day job, I
            take on select freelance projects for clients who need reliable,
            polished web products.
          </p>
        </div>

        {/* Right column: tech stack */}
        <div
          className="flex flex-col gap-8"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.35s",
          }}
        >
          {techStack.map((group, groupIdx) => (
            <div
              key={group.label}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(15px)",
                transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${0.4 + groupIdx * 0.08}s`,
              }}
            >
              <span className="font-body text-[11px] tracking-[0.3em] uppercase text-text-muted mb-3 block">
                {group.label}
              </span>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="font-body text-xs tracking-wide px-3 py-1.5 rounded-full border border-border text-text-secondary"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
