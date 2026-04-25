import { PERSONAL, THEME_STORAGE_KEY } from "./terminalData";

export type CommandCategory = "navigate" | "action" | "social" | "easter-egg";

export interface Command {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  category: CommandCategory;
  shortcut?: string;
  /** When true, palette stays open after execution and shows `feedback` inline */
  stayOpen?: boolean;
  /** Inline feedback text shown after execution (only used when stayOpen is true) */
  feedback?: string;
  action: () => void | Promise<void>;
}

const EMAIL = PERSONAL.email;

function scrollTo(selector: string) {
  document.querySelector(selector)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem(THEME_STORAGE_KEY, next);
}

async function copyEmail(): Promise<void> {
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
}

export const CATEGORY_LABELS: Record<CommandCategory, string> = {
  navigate: "Navigation",
  action: "Actions",
  social: "Social",
  "easter-egg": "???",
};

export const COMMANDS: Command[] = [
  // ── Navigation ──
  {
    id: "home",
    name: "Go home",
    description: "Scroll to the top",
    keywords: ["home", "top", "hero", "start", "beginning"],
    category: "navigate",
    action: () => scrollTo("#home"),
  },
  {
    id: "about",
    name: "About me",
    description: "Who I am and what I do",
    keywords: ["about", "bio", "me", "info", "skills", "stack"],
    category: "navigate",
    action: () => scrollTo("#about"),
  },
  {
    id: "projects",
    name: "View projects",
    description: "See what I've built",
    keywords: ["projects", "work", "portfolio", "showcase", "built"],
    category: "navigate",
    action: () => scrollTo("#projects"),
  },
  {
    id: "contact",
    name: "Get in touch",
    description: "Reach out to me",
    keywords: ["contact", "email", "reach", "hire", "message"],
    category: "navigate",
    action: () => scrollTo("#contact"),
  },

  // ── Actions ──
  {
    id: "theme",
    name: "Toggle theme",
    description: "Switch between dark and light mode",
    keywords: ["theme", "dark", "light", "mode", "toggle", "switch", "color"],
    category: "action",
    stayOpen: true,
    feedback: "Theme switched",
    action: toggleTheme,
  },
  {
    id: "copy-email",
    name: "Copy email",
    description: "Copy hello@radule.dev to clipboard",
    keywords: ["copy", "email", "clipboard", "address"],
    category: "action",
    stayOpen: true,
    feedback: "Copied!",
    action: copyEmail,
  },

  // ── Social ──
  {
    id: "github",
    name: "Open GitHub",
    description: "github.com/Radule6",
    keywords: ["github", "gh", "code", "repos", "source"],
    category: "social",
    action: () => { window.open("https://github.com/Radule6", "_blank", "noopener,noreferrer"); },
  },
  {
    id: "linkedin",
    name: "Open LinkedIn",
    description: "linkedin.com/in/marko-radulovic6",
    keywords: ["linkedin", "connect", "network", "professional"],
    category: "social",
    action: () => { window.open("https://www.linkedin.com/in/marko-radulovic6/", "_blank", "noopener,noreferrer"); },
  },

  // ── Easter eggs ──
  {
    id: "source",
    name: "View source code",
    description: "See how this site was built",
    keywords: ["source", "code", "repo", "repository", "how"],
    category: "easter-egg",
    action: () => { window.open("https://github.com/Radule6/portfolio", "_blank", "noopener,noreferrer"); },
  },
  {
    id: "terminal",
    name: "Open terminal",
    description: "Interactive terminal to explore this site",
    keywords: ["terminal", "console", "shell", "cli", "bash", "cmd", "hack"],
    category: "easter-egg",
    stayOpen: true,
    action: () => {},
  },
];

/** Simple scored filtering — no external deps needed for ~10 commands */
export function filterCommands(query: string, commands: Command[]): Command[] {
  const q = query.toLowerCase().trim();
  if (!q) return commands;

  return commands
    .map((cmd) => {
      let score = 0;
      const name = cmd.name.toLowerCase();

      if (name === q) score += 100;
      else if (name.startsWith(q)) score += 60;
      else if (name.includes(q)) score += 30;

      for (const kw of cmd.keywords) {
        if (kw === q) score += 50;
        else if (kw.startsWith(q)) score += 25;
        else if (kw.includes(q)) score += 10;
      }

      if (cmd.description.toLowerCase().includes(q)) score += 5;

      return { cmd, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ cmd }) => cmd);
}
