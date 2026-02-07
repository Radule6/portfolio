import React, { useCallback, useEffect, useRef, useState } from "react";
import { FiExternalLink, FiGithub, FiX } from "react-icons/fi";

interface Project {
  title: string;
  description: string;
  tags: string[];
  color: string;
  status?: "coming-soon";
  image?: string;
  liveUrl?: string;
  repoUrl?: string;
  company?: string;
  role?: string;
}

const projects: Project[] = [
  {
    title: "Exante Data AI Search",
    description:
      "Built the RAG-based search system that lets institutional clients query proprietary financial datasets using natural language. Own full-stack development across the React frontend, Python/FastAPI backend, PostgreSQL, and AWS infrastructure.",
    tags: ["React", "FastAPI", "PostgreSQL", "AWS", "RAG"],
    color: "#59FFCE",
    company: "Exante Data",
    role: "Full Stack Engineer",
    image: "/projects/exante-data.png",
    liveUrl: "https://ai.exantedata.com/",
  },
  {
    title: "MarketReader Dashboard",
    description:
      "Built the platform's interactive charting system from scratch, visualizing thousands of financial data points in real-time. Owned end-to-end development of the embeddable widget system that expanded platform reach to external sites.",
    tags: ["React", "TypeScript", "HighCharts", "Python"],
    color: "#B7FF03",
    company: "MarketReader",
    role: "Software Engineer",
    image: "/projects/marketreader.png",
    liveUrl: "https://app.marketreader.com/",
  },
  {
    title: "radule.dev",
    description:
      "The site you're looking at. Custom portfolio built from scratch with a focus on performance, animation, and accessibility. Deployed via GitHub Actions CI/CD pipeline.",
    tags: ["React", "TypeScript", "Tailwind CSS", "Vite"],
    color: "#59FFCE",
    image: "/projects/radule-dev.png",
    liveUrl: "https://radule.dev",
    repoUrl: "https://github.com/Radule6/web-portfolio",
  },
  {
    title: "Freelancer OS",
    description:
      "An all-in-one platform for independent professionals — invoicing, project management, and client workflows in a single place. Built to replace the patchwork of tools freelancers juggle daily.",
    tags: ["Next.js", "Supabase", "Vercel"],
    color: "#FFFF00",
    status: "coming-soon" as const,
  },
];

// Hoisted outside component — static data never changes (rerender-derived-state)
const featured = projects.filter((p) => p.image);
const upcoming = projects.filter((p) => p.status === "coming-soon");

const Projects: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [modalProject, setModalProject] = useState<Project | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Lock body scroll + close on Escape
  useEffect(() => {
    if (!modalProject) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalProject(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [modalProject]);

  const closeModal = useCallback(() => setModalProject(null), []);

  const stagger = (idx: number, extra = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(30px)",
    transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 + idx * 0.12 + extra}s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 + idx * 0.12 + extra}s`,
  });

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative bg-surface px-6 sm:px-10 lg:px-16 py-20 sm:py-28 lg:py-36"
      aria-label="Selected projects"
    >
      {/* Section header */}
      <div className="mb-16 sm:mb-20 lg:mb-28">
        <div className="flex items-center gap-4 mb-4" style={stagger(0)}>
          <span className="font-body text-xs sm:text-sm tracking-[0.3em] uppercase text-text-muted">
            02
          </span>
          <div className="h-px w-12 bg-border" aria-hidden="true" />
          <span className="font-body text-xs sm:text-sm tracking-[0.3em] uppercase text-text-secondary">
            Selected Work
          </span>
        </div>
        <h2
          className="font-display text-4xl sm:text-5xl lg:text-7xl font-800 tracking-tight text-text-primary"
          style={stagger(0, 0.05)}
        >
          Projects
        </h2>
      </div>

      {/* ─── Featured project rows ─── */}
      <div className="flex flex-col gap-6 sm:gap-8">
        {featured.map((project, idx) => {
          const isReversed = idx % 2 !== 0;

          return (
            <article
              key={project.title}
              className="group relative rounded-2xl border border-border bg-surface-raised overflow-hidden"
              style={stagger(idx, 0.15)}
            >
              {/* Top accent line */}
              <div
                className="absolute top-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-700 ease-out z-10"
                style={{ background: `linear-gradient(to right, ${project.color}, transparent)` }}
                aria-hidden="true"
              />

              {/* Corner glow */}
              <div
                className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-0 group-hover:opacity-[0.06] blur-[80px] transition-opacity duration-500 pointer-events-none"
                style={{ background: project.color }}
                aria-hidden="true"
              />

              {/* Layout: stacked on mobile, side-by-side on lg */}
              <div className={`flex flex-col ${isReversed ? "lg:flex-row-reverse" : "lg:flex-row"}`}>
                {/* ── Text side ── */}
                <div className="relative z-10 flex flex-col justify-between p-6 sm:p-8 lg:p-10 lg:w-[45%] lg:min-h-[320px]">
                  {/* Badge */}
                  {project.company && (
                    <div className="mb-6">
                      <span className="font-body text-[10px] tracking-[0.2em] uppercase whitespace-nowrap px-3 py-1 rounded-full border border-border bg-surface-hover text-text-secondary">
                        {project.role} · {project.company}
                      </span>
                    </div>
                  )}

                  <div className="flex-1 flex flex-col">
                    {/* Number */}
                    <span
                      className="font-body text-5xl sm:text-6xl font-800 leading-none mb-4"
                      style={{ color: project.color, opacity: 0.10, fontVariantNumeric: "lining-nums tabular-nums" }}
                      aria-hidden="true"
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>

                    <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-700 text-text-primary mb-3 tracking-tight">
                      {project.title}
                    </h3>

                    <p className="font-body text-sm sm:text-base text-text-secondary leading-relaxed mb-6 max-w-lg">
                      {project.description}
                    </p>
                  </div>

                  {/* Tags + Links pinned to bottom */}
                  <div>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="font-body text-xs tracking-wide px-3 py-1 rounded-full border border-border text-text-muted"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 font-body text-xs sm:text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
                          aria-label={project.company ? `View ${project.company} product` : `View live site for ${project.title}`}
                        >
                          <FiExternalLink className="w-3.5 h-3.5" />
                          {project.company ? "View Product" : "Live"}
                        </a>
                      )}
                      {project.repoUrl && (
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 font-body text-xs sm:text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
                          aria-label={`View source code for ${project.title}`}
                        >
                          <FiGithub className="w-3.5 h-3.5" />
                          Source
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Image side ── */}
                {project.image && (
                  <div className="lg:w-[55%] relative">
                    <button
                      type="button"
                      onClick={() => setModalProject(project)}
                      className="block w-full h-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-lime"
                      aria-label={`View full screenshot of ${project.title}`}
                    >
                      <div className="relative overflow-hidden h-full">
                        <img
                          src={project.image}
                          alt={`Screenshot of ${project.title}`}
                          className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                        {/* Gradient fade into text side */}
                        <div
                          className={`absolute inset-0 pointer-events-none hidden lg:block ${
                            isReversed
                              ? "bg-gradient-to-l from-surface-raised/80 via-transparent to-transparent"
                              : "bg-gradient-to-r from-surface-raised/80 via-transparent to-transparent"
                          }`}
                          aria-hidden="true"
                        />
                        {/* Bottom fade */}
                        <div
                          className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-surface-raised to-transparent pointer-events-none lg:hidden"
                          aria-hidden="true"
                        />
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* ─── Coming soon cards ─── */}
      {upcoming.length > 0 && (
        <div className="mt-6 sm:mt-8 flex flex-col gap-6 sm:gap-8">
          {upcoming.map((project, idx) => (
            <article
              key={project.title}
              className="group relative rounded-2xl border border-border bg-surface-raised overflow-hidden"
              style={stagger(featured.length + idx, 0.15)}
            >
              {/* Top accent line */}
              <div
                className="absolute top-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-700 ease-out z-10"
                style={{ background: `linear-gradient(to right, ${project.color}, transparent)` }}
                aria-hidden="true"
              />

              {/* Corner glow */}
              <div
                className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-0 group-hover:opacity-[0.06] blur-[80px] transition-opacity duration-500 pointer-events-none"
                style={{ background: project.color }}
                aria-hidden="true"
              />

              <div className="flex flex-col lg:flex-row">
                {/* Text side — same structure as featured cards */}
                <div className="relative z-10 flex flex-col justify-between p-6 sm:p-8 lg:p-10 lg:w-[45%]">
                  <div className="mb-6">
                    <span className="font-body text-[10px] tracking-[0.2em] uppercase whitespace-nowrap px-3 py-1 rounded-full border border-border bg-surface-hover text-text-muted">
                      Coming Soon
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col">
                    <span
                      className="font-body text-5xl sm:text-6xl font-800 leading-none mb-4"
                      style={{ color: project.color, opacity: 0.10, fontVariantNumeric: "lining-nums tabular-nums" }}
                      aria-hidden="true"
                    >
                      {String(featured.length + idx + 1).padStart(2, "0")}
                    </span>

                    <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-700 text-text-primary mb-3 tracking-tight">
                      {project.title}
                    </h3>

                    <p className="font-body text-sm sm:text-base text-text-secondary leading-relaxed mb-6 max-w-lg">
                      {project.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-body text-xs tracking-wide px-3 py-1 rounded-full border border-border text-text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Placeholder visual — dashed outline with "In Development" */}
                <div className="lg:w-[55%] relative p-6 sm:p-8 lg:p-10 flex items-center justify-center">
                  <div className="w-full aspect-video rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: `${project.color}10`, border: `1px solid ${project.color}20` }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={project.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                      </svg>
                    </div>
                    <span className="font-body text-xs tracking-[0.2em] uppercase text-text-muted">
                      In Development
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ─── Image modal ─── */}
      {modalProject && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`Screenshot of ${modalProject.title}`}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-surface/90 backdrop-blur-sm"
            onClick={closeModal}
            aria-hidden="true"
          />

          {/* Modal content */}
          <div className="relative z-10 w-full max-w-5xl">
            {/* Close button */}
            <button
              type="button"
              onClick={closeModal}
              className="absolute -top-12 right-0 p-2 text-text-muted hover:text-text-primary transition-colors duration-200"
              aria-label="Close modal"
            >
              <FiX className="w-6 h-6" />
            </button>

            {/* Image */}
            <div className="rounded-xl overflow-hidden border border-border">
              <img
                src={modalProject.image}
                alt={`Screenshot of ${modalProject.title}`}
                className="w-full h-auto block"
              />
            </div>

            {/* Footer: title + link */}
            <div className="flex items-center justify-between mt-4">
              <span className="font-display text-lg sm:text-xl font-700 text-text-primary tracking-tight">
                {modalProject.title}
              </span>
              {modalProject.liveUrl && (
                <a
                  href={modalProject.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-body text-sm text-text-secondary hover:text-accent-lime transition-colors duration-200"
                >
                  <FiExternalLink className="w-4 h-4" />
                  {modalProject.company ? "View Product" : "Visit Site"}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Projects;
