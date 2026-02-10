export const THEME_STORAGE_KEY = "radule-theme";

export const PERSONAL = {
  name: "Marko Radulovic",
  title: "Full-Stack Engineer",
  location: "Zagreb, Croatia (Remote)",
  email: "hello@radule.dev",
  github: "https://github.com/Radule6",
  linkedin: "https://www.linkedin.com/in/marko-radulovic6/",
  site: "https://radule.dev",
  sourceRepo: "https://github.com/Radule6/portfolio",
} as const;

export const TECH_STACK = [
  { label: "Frontend", items: ["React", "TypeScript", "HighCharts", "Tailwind CSS"] },
  { label: "Backend", items: ["Python", "FastAPI", "Node.js", "PostgreSQL", "Supabase"] },
  { label: "AI / Data", items: ["RAG", "LLMs", "OpenAI API", "Vector DBs", "Embeddings", "MCP"] },
  { label: "Cloud & Tools", items: ["AWS", "Git", "CI/CD", "Docker"] },
] as const;

export const PROJECTS = [
  {
    name: "Exante Data AI Search",
    descKey: "exante",
    tags: ["React", "FastAPI", "PostgreSQL", "AWS", "RAG"],
    url: "https://ai.exantedata.com/",
  },
  {
    name: "MarketReader Dashboard",
    descKey: "marketreader",
    tags: ["React", "TypeScript", "HighCharts", "Python"],
    url: "https://app.marketreader.com/",
  },
  {
    name: "radule.dev",
    descKey: "raduledev",
    tags: ["React", "TypeScript", "Tailwind CSS", "Vite"],
    url: "https://radule.dev",
    repo: "https://github.com/Radule6/portfolio",
  },
  {
    name: "Freelancer OS",
    descKey: "freelanceros",
    tags: ["Next.js", "Supabase", "Vercel"],
    status: "coming-soon" as const,
  },
] as const;
