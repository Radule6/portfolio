import type { TFunction } from "i18next";
import i18n from "../../i18n";
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

export function createCategoryLabels(t: TFunction<"commands">): Record<CommandCategory, string> {
  return {
    navigate: t("categories.navigate"),
    action: t("categories.action"),
    social: t("categories.social"),
    "easter-egg": t("categories.easter-egg"),
  };
}

export function createCommands(t: TFunction<"commands">): Command[] {
  return [
    // ── Navigation ──
    {
      id: "home",
      name: "Go home",
      description: t("descriptions.home"),
      keywords: ["home", "top", "hero", "start", "beginning"],
      category: "navigate",
      action: () => scrollTo("#home"),
    },
    {
      id: "about",
      name: "About me",
      description: t("descriptions.about"),
      keywords: ["about", "bio", "me", "info", "skills", "stack"],
      category: "navigate",
      action: () => scrollTo("#about"),
    },
    {
      id: "projects",
      name: "View projects",
      description: t("descriptions.projects"),
      keywords: ["projects", "work", "portfolio", "showcase", "built"],
      category: "navigate",
      action: () => scrollTo("#projects"),
    },
    {
      id: "contact",
      name: "Get in touch",
      description: t("descriptions.contact"),
      keywords: ["contact", "email", "reach", "hire", "message"],
      category: "navigate",
      action: () => scrollTo("#contact"),
    },

    // ── Actions ──
    {
      id: "theme",
      name: "Toggle theme",
      description: t("descriptions.theme"),
      keywords: ["theme", "dark", "light", "mode", "toggle", "switch", "color"],
      category: "action",
      stayOpen: true,
      feedback: t("feedback.theme"),
      action: toggleTheme,
    },
    {
      id: "copy-email",
      name: "Copy email",
      description: t("descriptions.copy-email"),
      keywords: ["copy", "email", "clipboard", "address"],
      category: "action",
      stayOpen: true,
      feedback: t("feedback.copyEmail"),
      action: copyEmail,
    },
    {
      id: "lang-en",
      name: "Switch to English",
      description: t("descriptions.lang-en"),
      keywords: ["english", "en", "language", "lang", "engleski", "englisch"],
      category: "action",
      action: () => { i18n.changeLanguage("en"); },
    },
    {
      id: "lang-hr",
      name: "Switch to Croatian",
      description: t("descriptions.lang-hr"),
      keywords: ["croatian", "hr", "hrvatski", "language", "lang", "kroatisch"],
      category: "action",
      action: () => { i18n.changeLanguage("hr"); },
    },
    {
      id: "lang-de",
      name: "Switch to German",
      description: t("descriptions.lang-de"),
      keywords: ["german", "de", "deutsch", "language", "lang", "njemački"],
      category: "action",
      action: () => { i18n.changeLanguage("de"); },
    },

    // ── Social ──
    {
      id: "github",
      name: "Open GitHub",
      description: t("descriptions.github"),
      keywords: ["github", "gh", "code", "repos", "source"],
      category: "social",
      action: () => { window.open("https://github.com/Radule6", "_blank", "noopener,noreferrer"); },
    },
    {
      id: "linkedin",
      name: "Open LinkedIn",
      description: t("descriptions.linkedin"),
      keywords: ["linkedin", "connect", "network", "professional"],
      category: "social",
      action: () => { window.open("https://www.linkedin.com/in/marko-radulovic6/", "_blank", "noopener,noreferrer"); },
    },

    // ── Easter eggs ──
    {
      id: "source",
      name: "View source code",
      description: t("descriptions.source"),
      keywords: ["source", "code", "repo", "repository", "how"],
      category: "easter-egg",
      action: () => { window.open("https://github.com/Radule6/portfolio", "_blank", "noopener,noreferrer"); },
    },
    {
      id: "terminal",
      name: "Open terminal",
      description: t("descriptions.terminal"),
      keywords: ["terminal", "console", "shell", "cli", "bash", "cmd", "hack"],
      category: "easter-egg",
      stayOpen: true,
      action: () => {},
    },
  ];
}

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
