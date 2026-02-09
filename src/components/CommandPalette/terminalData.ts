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

export const BIO = [
  "Full-stack engineer building AI-powered data products for fintech.",
  "Specializing in RAG systems, agentic AI integrations, and production deployments across React, Python, and AWS — taking projects from architecture to deployment.",
] as const;

export const EXPERIENCE = [
  {
    role: "Full Stack Engineer",
    company: "Exante Data",
    period: "Current",
    description:
      "Building RAG-based search systems and automated reporting tools for institutional clients in financial analytics.",
  },
  {
    role: "Software Engineer",
    company: "MarketReader",
    period: "Previous",
    description:
      "Built real-time charting platforms and embeddable widget systems.",
  },
  {
    role: "Freelance",
    company: "Independent",
    period: "Ongoing",
    description:
      "Select freelance projects for clients who need reliable, polished web products.",
  },
] as const;

export const TECH_STACK = [
  { label: "Frontend", items: ["React", "TypeScript", "HighCharts", "Tailwind CSS"] },
  { label: "Backend", items: ["Python", "FastAPI", "Node.js", "PostgreSQL", "Supabase"] },
  { label: "AI / Data", items: ["RAG", "LLMs", "OpenAI API", "Vector DBs", "Embeddings", "MCP"] },
  { label: "Cloud & Tools", items: ["AWS", "Git", "CI/CD", "Docker"] },
] as const;

export const PROJECTS = [
  {
    name: "Exante Data AI Search",
    description: "RAG-based search for proprietary financial datasets",
    tags: ["React", "FastAPI", "PostgreSQL", "AWS", "RAG"],
    url: "https://ai.exantedata.com/",
  },
  {
    name: "MarketReader Dashboard",
    description: "Real-time interactive charting for financial data",
    tags: ["React", "TypeScript", "HighCharts", "Python"],
    url: "https://app.marketreader.com/",
  },
  {
    name: "radule.dev",
    description: "This portfolio site",
    tags: ["React", "TypeScript", "Tailwind CSS", "Vite"],
    url: "https://radule.dev",
    repo: "https://github.com/Radule6/portfolio",
  },
  {
    name: "Freelancer OS",
    description: "All-in-one platform for freelancers — invoicing, projects, clients",
    tags: ["Next.js", "Supabase", "Vercel"],
    status: "coming-soon" as const,
  },
] as const;
