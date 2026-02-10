import type { ReactNode } from "react";
import type { TFunction } from "i18next";
import { PERSONAL, TECH_STACK, PROJECTS, THEME_STORAGE_KEY } from "./terminalData";
import AsciiAnimation, { BASKETBALL_FRAMES } from "./AsciiAnimation";

export interface TerminalCommandDef {
  name: string;
  aliases: string[];
  description: string;
  handler: (args: string[]) => ReactNode;
}

export function createTerminalCommands(t: TFunction<"terminal">): TerminalCommandDef[] {
  const bio = t("bio", { returnObjects: true }) as string[];
  const experience = t("experience", { returnObjects: true }) as Array<{
    role: string;
    company: string;
    period: string;
    description: string;
  }>;
  const projectDescriptions = t("projectDescriptions", { returnObjects: true }) as Record<string, string>;

  const commands: TerminalCommandDef[] = [
    {
      name: "help",
      aliases: ["?", "commands"],
      description: t("descriptions.help"),
      handler: () => (
        <div className="space-y-1">
          <p className="text-text-secondary mb-2">{t("helpHeading")}</p>
          <table className="text-sm">
            <tbody>
              {commands
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
      description: t("descriptions.about"),
      handler: () => (
        <div className="space-y-2">
          <p className="text-text-primary font-medium">
            {PERSONAL.name}{" "}
            <span className="text-text-muted">— {PERSONAL.title}</span>
          </p>
          <p className="text-text-muted">{PERSONAL.location}</p>
          {bio.map((line, i) => (
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
      description: t("descriptions.skills"),
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
      description: t("descriptions.projects"),
      handler: () => (
        <div className="space-y-3">
          {PROJECTS.map((p) => {
            const descKey = p.descKey as keyof typeof projectDescriptions;
            return (
              <div key={p.name}>
                <div className="flex items-center gap-2">
                  <span className="text-text-primary font-medium">{p.name}</span>
                  {"status" in p && p.status === "coming-soon" && (
                    <span className="text-[10px] tracking-wider uppercase text-text-muted px-1.5 py-0.5 rounded border border-border">
                      {t("soon")}
                    </span>
                  )}
                </div>
                <p className="text-text-muted text-xs mt-0.5">{projectDescriptions[descKey]}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {p.tags.map((tag) => (
                    <span key={tag} className="text-[10px] text-text-muted">
                      {tag}
                      {tag !== p.tags[p.tags.length - 1] && " ·"}
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
            );
          })}
        </div>
      ),
    },

    {
      name: "contact",
      aliases: ["email", "socials"],
      description: t("descriptions.contact"),
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
      description: t("descriptions.experience"),
      handler: () => (
        <div className="space-y-3">
          {experience.map((e, i) => (
            <div key={`${e.company}-${i}`}>
              <div className="flex items-center gap-2">
                <span className="text-text-primary font-medium">{e.role}</span>
                <span className="text-text-muted">{t("at")} {e.company}</span>
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
      description: t("descriptions.theme"),
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
            {t("themeSwitched", {
              mode: next,
              interpolation: { escapeValue: false },
            })
              .split(/<mode>|<\/mode>/)
              .map((part, i) =>
                i === 1 ? (
                  <span key={i} className="text-text-primary font-medium">{part}</span>
                ) : (
                  part
                )
              )}
          </p>
        );
      },
    },

    {
      name: "ball",
      aliases: ["dunk", "shoot", "basketball"],
      description: t("descriptions.ball"),
      handler: () => (
        <AsciiAnimation frames={BASKETBALL_FRAMES} interval={350} />
      ),
    },

    {
      name: "clear",
      aliases: ["cls", "reset"],
      description: t("descriptions.clear"),
      handler: () => null, // handled in TerminalMode
    },

    {
      name: "exit",
      aliases: ["quit", "close", "q"],
      description: t("descriptions.exit"),
      handler: () => null, // handled in TerminalMode
    },
  ];

  return commands;
}

/** Look up a command by name or alias */
export function findCommand(input: string, commands: TerminalCommandDef[]): TerminalCommandDef | null {
  const q = input.toLowerCase().replace(/^\//, "");
  return (
    commands.find(
      (c) => c.name === q || c.aliases.includes(q)
    ) ?? null
  );
}

/** Scored fuzzy filtering for terminal autocomplete */
export function filterTerminalCommands(query: string, commands: TerminalCommandDef[]): TerminalCommandDef[] {
  const q = query.toLowerCase().replace(/^\//, "").trim();
  if (!q) return [];

  return commands
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
export function unknownCommand(input: string, t: TFunction<"terminal">): ReactNode {
  const parts = t("unknownCommand", { input }).split(/<cmd>|<\/cmd>|<help>|<\/help>/);
  return (
    <p className="text-text-muted">
      {parts.map((part, i) =>
        i === 1 ? (
          <span key={i} className="text-text-secondary">{part}</span>
        ) : i === 3 ? (
          <span key={i} className="text-text-primary">{part}</span>
        ) : (
          part
        )
      )}
    </p>
  );
}
