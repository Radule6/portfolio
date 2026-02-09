import type { ReactNode } from "react";
import { PERSONAL, BIO, EXPERIENCE, TECH_STACK, PROJECTS, THEME_STORAGE_KEY } from "./terminalData";
import AsciiAnimation, { BASKETBALL_FRAMES } from "./AsciiAnimation";

export interface TerminalCommandDef {
  name: string;
  aliases: string[];
  description: string;
  handler: (args: string[]) => ReactNode;
}

/** All terminal commands (order matters for `help` display) */
export const terminalCommands: TerminalCommandDef[] = [
  {
    name: "help",
    aliases: ["?", "commands"],
    description: "Show available commands",
    handler: () => (
      <div className="space-y-1">
        <p className="text-text-secondary mb-2">Available commands:</p>
        <table className="text-sm">
          <tbody>
            {terminalCommands
              .filter((c) => c.name !== "help")
              .map((c) => (
                <tr key={c.name}>
                  <td className="pr-6 text-text-primary font-medium">{c.name}</td>
                  <td className="text-text-muted">{c.description}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    ),
  },

  {
    name: "about",
    aliases: ["whoami", "bio"],
    description: "Who I am and what I do",
    handler: () => (
      <div className="space-y-2">
        <p className="text-text-primary font-medium">
          {PERSONAL.name}{" "}
          <span className="text-text-muted">— {PERSONAL.title}</span>
        </p>
        <p className="text-text-muted">{PERSONAL.location}</p>
        {BIO.map((line, i) => (
          <p key={i} className="text-text-secondary leading-relaxed">
            {line}
          </p>
        ))}
      </div>
    ),
  },

  {
    name: "skills",
    aliases: ["stack", "tech"],
    description: "Tech stack and tools",
    handler: () => (
      <div className="space-y-3">
        {TECH_STACK.map((group) => (
          <div key={group.label}>
            <span className="gradient-text text-xs font-bold uppercase tracking-[0.15em]">
              {group.label}
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {group.items.map((item) => (
                <span
                  key={item}
                  className="text-xs px-2 py-0.5 rounded border border-border text-text-secondary"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    ),
  },

  {
    name: "projects",
    aliases: ["portfolio"],
    description: "Things I've built",
    handler: () => (
      <div className="space-y-3">
        {PROJECTS.map((p) => (
          <div key={p.name}>
            <div className="flex items-center gap-2">
              <span className="text-text-primary font-medium">{p.name}</span>
              {"status" in p && p.status === "coming-soon" && (
                <span className="text-[10px] tracking-wider uppercase text-text-muted px-1.5 py-0.5 rounded border border-border">
                  soon
                </span>
              )}
            </div>
            <p className="text-text-muted text-xs mt-0.5">{p.description}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {p.tags.map((t) => (
                <span key={t} className="text-[10px] text-text-muted">
                  {t}
                  {t !== p.tags[p.tags.length - 1] && " ·"}
                </span>
              ))}
            </div>
            {"url" in p && p.url && (
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent-lime hover:underline mt-0.5 inline-block"
              >
                {p.url.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        ))}
      </div>
    ),
  },

  {
    name: "contact",
    aliases: ["email", "socials"],
    description: "How to reach me",
    handler: () => (
      <div className="space-y-2">
        <div>
          <span className="text-text-muted text-xs uppercase tracking-wider">Email</span>
          <div>
            <a
              href={`mailto:${PERSONAL.email}`}
              className="text-accent-lime hover:underline"
            >
              {PERSONAL.email}
            </a>
          </div>
        </div>
        <div>
          <span className="text-text-muted text-xs uppercase tracking-wider">GitHub</span>
          <div>
            <a
              href={PERSONAL.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-text-primary hover:underline"
            >
              {PERSONAL.github.replace("https://", "")}
            </a>
          </div>
        </div>
        <div>
          <span className="text-text-muted text-xs uppercase tracking-wider">LinkedIn</span>
          <div>
            <a
              href={PERSONAL.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-text-primary hover:underline"
            >
              {PERSONAL.linkedin.replace("https://www.", "")}
            </a>
          </div>
        </div>
      </div>
    ),
  },

  {
    name: "experience",
    aliases: ["work", "career", "exp"],
    description: "Work experience",
    handler: () => (
      <div className="space-y-3">
        {EXPERIENCE.map((e, i) => (
          <div key={`${e.company}-${i}`}>
            <div className="flex items-center gap-2">
              <span className="text-text-primary font-medium">{e.role}</span>
              <span className="text-text-muted">at {e.company}</span>
              <span className="text-[10px] tracking-wider uppercase text-text-muted px-1.5 py-0.5 rounded border border-border">
                {e.period}
              </span>
            </div>
            <p className="text-text-secondary text-xs mt-0.5 leading-relaxed">
              {e.description}
            </p>
          </div>
        ))}
      </div>
    ),
  },

  {
    name: "theme",
    aliases: [],
    description: "Toggle or set theme (dark/light)",
    handler: (args) => {
      const current = document.documentElement.getAttribute("data-theme");
      let next: string;

      if (args[0] === "dark" || args[0] === "light") {
        next = args[0];
      } else {
        next = current === "light" ? "dark" : "light";
      }

      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem(THEME_STORAGE_KEY, next);

      return (
        <p className="text-text-secondary">
          Switched to <span className="text-text-primary font-medium">{next}</span> mode.
        </p>
      );
    },
  },

  {
    name: "ball",
    aliases: ["dunk", "shoot", "basketball"],
    description: "Watch me shoot",
    handler: () => (
      <AsciiAnimation frames={BASKETBALL_FRAMES} interval={350} />
    ),
  },

  {
    name: "clear",
    aliases: ["cls", "reset"],
    description: "Clear terminal",
    handler: () => null, // handled in TerminalMode
  },

  {
    name: "exit",
    aliases: ["quit", "close", "q"],
    description: "Close terminal",
    handler: () => null, // handled in TerminalMode
  },
];

/** Look up a command by name or alias */
export function findCommand(input: string): TerminalCommandDef | null {
  const q = input.toLowerCase().replace(/^\//, "");
  return (
    terminalCommands.find(
      (c) => c.name === q || c.aliases.includes(q)
    ) ?? null
  );
}

/** Scored fuzzy filtering for terminal autocomplete */
export function filterTerminalCommands(query: string): TerminalCommandDef[] {
  const q = query.toLowerCase().replace(/^\//, "").trim();
  if (!q) return [];

  return terminalCommands
    .map((cmd) => {
      let score = 0;

      // Match against name
      if (cmd.name === q) score += 100;
      else if (cmd.name.startsWith(q)) score += 60;
      else if (cmd.name.includes(q)) score += 30;

      // Match against aliases
      for (const alias of cmd.aliases) {
        if (alias === q) score += 50;
        else if (alias.startsWith(q)) score += 25;
        else if (alias.includes(q)) score += 10;
      }

      // Match against description
      if (cmd.description.toLowerCase().includes(q)) score += 5;

      return { cmd, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ cmd }) => cmd);
}

/** Response for unknown commands */
export function unknownCommand(input: string): ReactNode {
  return (
    <p className="text-text-muted">
      Command not found:{" "}
      <span className="text-text-secondary">{input}</span>.{" "}
      Type <span className="text-text-primary">help</span> to see available commands.
    </p>
  );
}
